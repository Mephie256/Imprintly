import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Get the current user from Clerk
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('🔄 Syncing user with Supabase:', user.id)

    const supabase = createSupabaseServerClient()

    const userData = {
      clerk_user_id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      first_name: user.firstName,
      last_name: user.lastName,
      full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatar_url: user.imageUrl,
      subscription_tier: 'free' as const,
      usage_count: 0,
      preferences: {},
    }

    console.log('📝 User data to sync:', userData)

    // Try to upsert user in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', user.id)
      .single()

    let dbUser
    if (existingUser) {
      // Update existing user
      console.log('👤 Updating existing user...')
      const { data, error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: userData.full_name,
          avatar_url: userData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating user:', error)
        throw error
      }
      dbUser = data
    } else {
      // Create new user
      console.log('✨ Creating new user...')
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating user:', error)
        throw error
      }
      dbUser = data
    }

    console.log('✅ User synced successfully:', dbUser.id)

    return NextResponse.json({
      success: true,
      user: dbUser,
      message: 'User synced successfully with Supabase',
    })
  } catch (error) {
    console.error('❌ Error in sync-user API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
