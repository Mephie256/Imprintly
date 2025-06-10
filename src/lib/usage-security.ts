import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export interface UsageValidationResult {
  success: boolean
  userId?: string
  userProfile?: any
  error?: string
  statusCode?: number
}

/**
 * Comprehensive usage validation with security checks
 * This function validates user authentication, subscription status, and usage limits
 */
export async function validateUsagePermissions(
  request: NextRequest,
  requireUsageCheck: boolean = true
): Promise<UsageValidationResult> {
  try {
    // 1. Authentication Check
    const { userId } = await auth()

    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      }
    }

    // 2. Rate Limiting Check (basic implementation)
    const userAgent = request.headers.get('user-agent') || ''
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check for suspicious patterns
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      return {
        success: false,
        error: 'Automated requests not allowed',
        statusCode: 403,
      }
    }

    // 3. Database Connection Check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      // In development mode, allow with mock data
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          userId,
          userProfile: {
            subscription_tier: 'free',
            usage_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }
      }

      return {
        success: false,
        error: 'Service temporarily unavailable',
        statusCode: 503,
      }
    }

    const supabase = createSupabaseServerClient()

    // 4. User Profile Validation
    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select(
        'id, clerk_user_id, subscription_tier, subscription_status, usage_count, created_at, updated_at'
      )
      .eq('clerk_user_id', userId)
      .single()

    if (fetchError || !userProfile) {
      return {
        success: false,
        error: 'User profile not found',
        statusCode: 404,
      }
    }

    // 5. Account Status Validation
    const accountAge =
      new Date().getTime() - new Date(userProfile.created_at).getTime()
    const isNewAccount = accountAge < 60000 // Less than 1 minute old

    if (isNewAccount && userProfile.usage_count > 1) {
      // Suspicious: new account with high usage
      return {
        success: false,
        error: 'Account verification required',
        statusCode: 403,
      }
    }

    // 6. Usage Limit Validation (if required)
    if (requireUsageCheck) {
      const limits = {
        free: 3,
        monthly: 1000,
        yearly: 10000,
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

      console.log('🔍 Server Usage Validation:', {
        subscriptionTier,
        subscriptionStatus,
        hasPremiumAccess,
        currentUsage,
        currentLimit,
      })

      // Premium users with active subscriptions bypass usage limits
      if (!hasPremiumAccess && currentUsage >= currentLimit) {
        return {
          success: false,
          error: 'Usage limit exceeded',
          statusCode: 403,
          userProfile: {
            ...userProfile,
            current_usage: currentUsage,
            limit: currentLimit,
          },
        }
      }

      // Check for usage anomalies
      const lastUpdate = new Date(userProfile.updated_at).getTime()
      const timeSinceLastUpdate = new Date().getTime() - lastUpdate

      // If user is making requests too frequently (less than 10 seconds apart)
      if (timeSinceLastUpdate < 10000 && currentUsage > 0) {
        return {
          success: false,
          error: 'Please wait before creating another image',
          statusCode: 429,
        }
      }
    }

    return {
      success: true,
      userId,
      userProfile,
    }
  } catch (error) {
    console.error('Usage validation error:', error)
    return {
      success: false,
      error: 'Internal security validation error',
      statusCode: 500,
    }
  }
}

/**
 * Secure usage increment with double-checking
 */
export async function secureIncrementUsage(userId: string): Promise<{
  success: boolean
  newUsageCount?: number
  error?: string
}> {
  try {
    const supabase = createSupabaseServerClient()

    // Use a transaction-like approach with optimistic locking
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('usage_count, subscription_tier, subscription_status, updated_at')
      .eq('clerk_user_id', userId)
      .single()

    if (fetchError || !currentUser) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Double-check limits before incrementing
    const limits = {
      free: 3,
      monthly: 1000,
      yearly: 10000,
    }

    const subscriptionTier = currentUser.subscription_tier || 'free'
    const subscriptionStatus = currentUser.subscription_status || 'inactive'

    // Check if user has active premium subscription
    const hasPremiumAccess =
      (subscriptionTier === 'monthly' || subscriptionTier === 'yearly') &&
      subscriptionStatus === 'active'

    const currentLimit =
      limits[subscriptionTier as keyof typeof limits] || limits.free
    const currentUsage = currentUser.usage_count || 0

    // Premium users with active subscriptions bypass usage limits
    if (!hasPremiumAccess && currentUsage >= currentLimit) {
      return {
        success: false,
        error: 'Usage limit exceeded',
      }
    }

    // Increment with timestamp check to prevent race conditions
    const newUsageCount = currentUsage + 1
    const now = new Date().toISOString()

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        usage_count: newUsageCount,
        updated_at: now,
      })
      .eq('clerk_user_id', userId)
      .eq('updated_at', currentUser.updated_at) // Optimistic locking
      .select('usage_count')
      .single()

    if (updateError) {
      // If update failed due to concurrent modification, retry once
      console.warn('Concurrent usage update detected, retrying...')
      return secureIncrementUsage(userId)
    }

    return {
      success: true,
      newUsageCount: updatedUser.usage_count,
    }
  } catch (error) {
    console.error('Secure increment error:', error)
    return {
      success: false,
      error: 'Failed to update usage',
    }
  }
}

/**
 * Validates request origin and headers for additional security
 */
export function validateRequestSecurity(request: NextRequest): boolean {
  try {
    // Check for required headers
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const userAgent = request.headers.get('user-agent')

    // In production, validate origin
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'https://your-domain.com', // Replace with your actual domain
      ].filter(Boolean)

      if (
        origin &&
        !allowedOrigins.some((allowed) => origin.startsWith(allowed))
      ) {
        console.warn('Suspicious origin detected:', origin)
        return false
      }
    }

    // Check for suspicious user agents
    const suspiciousPatterns = [
      'curl',
      'wget',
      'python',
      'postman',
      'insomnia',
      'httpie',
    ]

    if (
      userAgent &&
      suspiciousPatterns.some((pattern) =>
        userAgent.toLowerCase().includes(pattern)
      )
    ) {
      console.warn('Suspicious user agent detected:', userAgent)
      return false
    }

    return true
  } catch (error) {
    console.error('Request security validation error:', error)
    return false
  }
}
