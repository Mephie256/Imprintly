import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sync session API called')

    // Get the authenticated user
    const user = await currentUser()
    if (!user) {
      console.log('❌ No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('👤 Authenticated user:', userId)

    // Parse the request body to get session ID
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    console.log('🔍 Fetching session:', sessionId)

    // Fetch the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    console.log('📋 Session data:', {
      id: session.id,
      status: session.status,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata
    })

    if (session.status !== 'complete') {
      return NextResponse.json({ 
        error: 'Session not completed', 
        status: session.status 
      }, { status: 400 })
    }

    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id

    if (!customerId) {
      return NextResponse.json({ error: 'No customer ID found' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Check if user exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (!existingUser) {
      console.log('👤 User not found, creating user record...')
      
      // Create user record
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: user.emailAddresses[0]?.emailAddress || '',
          first_name: user.firstName,
          last_name: user.lastName,
          full_name: user.fullName,
          avatar_url: user.imageUrl,
          stripe_customer_id: customerId,
          subscription_status: 'active',
          subscription_tier: 'monthly', // Default, will be updated below
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user', details: createError.message },
          { status: 500 }
        )
      }

      console.log('✅ User created:', newUser)
    } else {
      // Update existing user with Stripe customer ID
      const { error: updateError } = await supabase
        .from('users')
        .update({
          stripe_customer_id: customerId,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', userId)

      if (updateError) {
        console.error('❌ Error updating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user', details: updateError.message },
          { status: 500 }
        )
      }

      console.log('✅ User updated with customer ID')
    }

    // If there's a subscription, get its details
    if (session.subscription) {
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription.id

      console.log('🔍 Fetching subscription details:', subscriptionId)
      
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      // Determine subscription tier based on price
      const priceId = subscription.items.data[0]?.price.id
      let subscriptionTier: 'monthly' | 'yearly' = 'monthly'

      if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
        subscriptionTier = 'yearly'
      }

      console.log('📋 Subscription details:', {
        id: subscription.id,
        status: subscription.status,
        tier: subscriptionTier,
        priceId
      })

      // Update user with subscription details
      const { data: updatedUser, error: subUpdateError } = await supabase
        .from('users')
        .update({
          subscription_id: subscription.id,
          subscription_status: subscription.status,
          subscription_tier: subscriptionTier,
          subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          subscription_cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', userId)
        .select()
        .single()

      if (subUpdateError) {
        console.error('❌ Error updating subscription:', subUpdateError)
        return NextResponse.json(
          { error: 'Failed to update subscription', details: subUpdateError.message },
          { status: 500 }
        )
      }

      console.log('✅ Subscription synced successfully')
      return NextResponse.json({
        success: true,
        message: 'Session and subscription synced successfully',
        user: updatedUser,
      })
    }

    // Get updated user data
    const { data: finalUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    console.log('✅ Session synced successfully')
    return NextResponse.json({
      success: true,
      message: 'Session synced successfully',
      user: finalUser,
    })

  } catch (error) {
    console.error('❌ Sync session error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
