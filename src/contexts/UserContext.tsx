'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  getUserProfile,
  syncUserWithSupabase,
  UserProfile,
} from '@/lib/user-service'
import { getSecureHeaders, performSecurityCheck } from '@/lib/client-security'

interface UserContextType {
  userProfile: UserProfile | null
  loading: boolean
  refreshUserProfile: () => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => void
  incrementUsage: () => Promise<boolean>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUserProfile = async () => {
    if (!user) {
      setUserProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
        console.warn('Supabase not configured. Using mock user profile.')
        // Create a mock user profile for development
        const firstName = user.firstName || null
        const lastName = user.lastName || null
        const fullName =
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || null

        const mockProfile: UserProfile = {
          id: 'mock-id',
          clerk_user_id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          avatar_url: user.imageUrl || null,
          subscription_tier: 'free',
          usage_count: 0, // Explicitly set to 0 for new users
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        setUserProfile(mockProfile)
        setLoading(false)
        return
      }

      // First try to get existing profile
      let profile = await getUserProfile(user.id)

      // If no profile exists, sync with Clerk data (with timeout)
      if (!profile) {
        console.log('No profile found, syncing with Clerk...')
        try {
          // Add timeout to prevent hanging
          const syncPromise = syncUserWithSupabase(user)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sync timeout')), 5000)
          )
          profile = (await Promise.race([syncPromise, timeoutPromise])) as any
        } catch (syncError) {
          console.warn(
            'Sync failed or timed out, using mock profile:',
            syncError
          )
          // Fall back to mock profile if sync fails
          const firstName = user.firstName || ''
          const lastName = user.lastName || ''
          const fullName = `${firstName} ${lastName}`.trim() || 'User'

          profile = {
            id: 'temp-' + user.id,
            clerk_user_id: user.id,
            email: user.emailAddresses?.[0]?.emailAddress || '',
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            avatar_url: user.imageUrl || null,
            subscription_tier: 'free',
            usage_count: 0,
            preferences: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
      }

      setUserProfile(profile)
    } catch (error) {
      console.error('Error refreshing user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates })
    }
  }

  const incrementUsage = async (): Promise<boolean> => {
    if (!user || !userProfile) return false

    try {
      // Perform security check before making request
      const isSecure = await performSecurityCheck()
      if (!isSecure) {
        console.warn('🚫 Security check failed for usage increment')
        return false
      }

      const response = await fetch('/api/increment-usage', {
        method: 'POST',
        headers: getSecureHeaders(),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Usage incremented successfully:', result)

        // Update the local state with server response
        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                usage_count: result.usage_count,
                updated_at: new Date().toISOString(),
              }
            : null
        )
        return true
      } else {
        const errorData = await response.json()
        console.warn('⚠️ Usage increment failed:', errorData.error)
        return false
      }
    } catch (error) {
      console.error('Error incrementing usage:', error)
      // For development without Supabase, just increment locally
      if (userProfile && process.env.NODE_ENV === 'development') {
        setUserProfile({
          ...userProfile,
          usage_count: userProfile.usage_count + 1,
          updated_at: new Date().toISOString(),
        })
        return true
      }
      return false
    }
  }

  // Load user profile when Clerk user is available
  useEffect(() => {
    if (isLoaded) {
      refreshUserProfile()
    }
  }, [user, isLoaded])

  const value: UserContextType = {
    userProfile,
    loading,
    refreshUserProfile,
    updateUserProfile,
    incrementUsage,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserProfile() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProvider')
  }
  return context
}

// Hook to check if user has premium access
export function useHasPremiumAccess() {
  const { userProfile } = useUserProfile()

  if (!userProfile) return false

  const subscriptionTier = userProfile.subscription_tier || 'free'
  const subscriptionStatus = userProfile.subscription_status || 'inactive'

  const hasPremiumAccess =
    (subscriptionTier === 'monthly' || subscriptionTier === 'yearly') &&
    subscriptionStatus === 'active'

  console.log('🔍 Premium Access Debug:', {
    subscriptionTier,
    subscriptionStatus,
    hasPremiumAccess,
  })

  return hasPremiumAccess
}

// Hook to check usage limits
export function useUsageLimits() {
  const { userProfile, incrementUsage, loading } = useUserProfile()

  const limits = {
    free: 6,
    monthly: 1000,
    yearly: 10000,
  }

  // If profile is still loading, return safe defaults
  if (loading || !userProfile) {
    return {
      currentLimit: 6,
      currentUsage: 0,
      remainingUsage: 6,
      hasReachedLimit: false, // Important: Don't block while loading
      usagePercentage: 0,
      incrementUsage,
    }
  }

  const subscriptionTier = userProfile.subscription_tier || 'free'
  const subscriptionStatus = userProfile.subscription_status || 'inactive'

  // Check if user has active premium subscription
  const hasPremiumAccess =
    (subscriptionTier === 'monthly' || subscriptionTier === 'yearly') &&
    subscriptionStatus === 'active'

  const currentLimit =
    limits[subscriptionTier as keyof typeof limits] || limits.free
  const currentUsage = userProfile.usage_count || 0
  const remainingUsage = Math.max(0, currentLimit - currentUsage)

  // Premium users never reach limit, free users check actual usage
  const hasReachedLimit = hasPremiumAccess
    ? false
    : currentUsage >= currentLimit

  console.log('🔍 Usage Limits Debug:', {
    subscriptionTier,
    subscriptionStatus,
    hasPremiumAccess,
    currentUsage,
    currentLimit,
    hasReachedLimit,
  })

  return {
    currentLimit,
    currentUsage,
    remainingUsage,
    hasReachedLimit,
    usagePercentage: (currentUsage / currentLimit) * 100,
    incrementUsage,
  }
}
