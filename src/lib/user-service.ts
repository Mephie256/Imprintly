import {
  createSupabaseServerClient,
  createSupabaseBrowserClient,
} from './supabase'
import { User } from '@clerk/nextjs/server'

export interface UserProfile {
  id: string
  clerk_user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'monthly' | 'yearly'
  subscription_status?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  subscription_current_period_start?: string | null
  subscription_current_period_end?: string | null
  usage_count: number
  preferences: Record<string, any> | null
  created_at: string
  updated_at: string
}

/**
 * Synchronizes a Clerk user with Supabase database
 * This should be called whenever a user signs up or their profile is updated
 */
export async function syncUserWithSupabase(
  clerkUser: User | any
): Promise<UserProfile | null> {
  try {
    const supabase = createSupabaseBrowserClient() // Use browser client for frontend

    // Debug: Log the user object to see what properties are available
    console.log('🔄 Syncing user:', clerkUser.id)
    console.log('Clerk user object:', JSON.stringify(clerkUser, null, 2))

    // Extract user data safely from Clerk user object
    const firstName = clerkUser.firstName || clerkUser.first_name || null
    const lastName = clerkUser.lastName || clerkUser.last_name || null
    const fullName =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || null

    const userData = {
      clerk_user_id: clerkUser.id,
      email:
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        clerkUser.email_addresses?.[0]?.email_address ||
        '',
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      avatar_url: clerkUser.imageUrl || clerkUser.image_url || null,
      updated_at: new Date().toISOString(),
    }

    console.log('User data to sync:', userData)

    // Check if user exists using maybeSingle to avoid errors
    console.log('👀 Checking if user exists...')
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUser.id)
      .maybeSingle() // This won't throw error if no rows found

    if (checkError) {
      console.error('❌ Error checking for existing user:', checkError)
      return null
    }

    if (existingUser) {
      console.log('✅ User already exists, updating...')
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('clerk_user_id', clerkUser.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating user in Supabase:', error)
        return null
      }

      console.log('✅ User updated successfully')
      return data
    } else {
      console.log('👤 Creating new user...')
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          subscription_tier: 'free',
          usage_count: 0,
          preferences: {},
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating user in Supabase:', error)
        console.log('💡 Check RLS policies and database permissions')
        return null
      }

      console.log('✅ User created successfully:', data.id)
      return data
    }
  } catch (error) {
    console.error('Error syncing user with Supabase:', error)
    return null
  }
}

/**
 * Gets user profile from Supabase using Clerk user ID
 */
export async function getUserProfile(
  clerkUserId: string
): Promise<UserProfile | null> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Updates user preferences
 */
export async function updateUserPreferences(
  clerkUserId: string,
  preferences: Record<string, any>
): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase
      .from('users')
      .update({ preferences })
      .eq('clerk_user_id', clerkUserId)

    if (error) {
      console.error('Error updating user preferences:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating preferences:', error)
    return false
  }
}

/**
 * Increments user usage count
 */
export async function incrementUsageCount(
  clerkUserId: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    // Get current usage count
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('usage_count')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (fetchError || !user) {
      console.error('Error fetching user for usage count:', fetchError)
      return false
    }

    // Increment usage count
    const { error } = await supabase
      .from('users')
      .update({ usage_count: user.usage_count + 1 })
      .eq('clerk_user_id', clerkUserId)

    if (error) {
      console.error('Error incrementing usage count:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error incrementing usage count:', error)
    return false
  }
}

/**
 * Updates user subscription tier
 */
export async function updateSubscriptionTier(
  clerkUserId: string,
  tier: 'free' | 'monthly' | 'yearly'
): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase
      .from('users')
      .update({ subscription_tier: tier })
      .eq('clerk_user_id', clerkUserId)

    if (error) {
      console.error('Error updating subscription tier:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating subscription tier:', error)
    return false
  }
}

/**
 * Updates user profile information
 */
export async function updateUserProfile(
  clerkUserId: string,
  updates: Partial<{
    first_name: string
    last_name: string
    bio: string
    email_notifications: boolean
    push_notifications: boolean
    marketing_notifications: boolean

    high_quality_exports: boolean
  }>
): Promise<UserProfile | null> {
  try {
    console.log('🔄 Updating user profile:', clerkUserId, updates)
    const supabase = createSupabaseBrowserClient()

    // Build the update object with only the fields that exist in the users table
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Add basic profile fields
    if (updates.first_name !== undefined)
      updateData.first_name = updates.first_name
    if (updates.last_name !== undefined)
      updateData.last_name = updates.last_name

    // Update full_name if first or last name changed
    if (updates.first_name !== undefined || updates.last_name !== undefined) {
      const firstName = updates.first_name || ''
      const lastName = updates.last_name || ''
      updateData.full_name =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : firstName || lastName || null
    }

    // Store other settings in preferences object
    const preferences: any = {}
    if (updates.bio !== undefined) preferences.bio = updates.bio
    if (updates.email_notifications !== undefined)
      preferences.email_notifications = updates.email_notifications
    if (updates.push_notifications !== undefined)
      preferences.push_notifications = updates.push_notifications
    if (updates.marketing_notifications !== undefined)
      preferences.marketing_notifications = updates.marketing_notifications

    if (updates.high_quality_exports !== undefined)
      preferences.high_quality_exports = updates.high_quality_exports

    // If we have preferences to update, merge with existing preferences
    if (Object.keys(preferences).length > 0) {
      // Get current preferences first
      const { data: currentUser } = await supabase
        .from('users')
        .select('preferences')
        .eq('clerk_user_id', clerkUserId)
        .single()

      updateData.preferences = {
        ...(currentUser?.preferences || {}),
        ...preferences,
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating user profile:', error)
      return null
    }

    console.log('✅ User profile updated successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error in updateUserProfile:', error)
    return null
  }
}
