import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getCustomerByEmail, getSubscriptionByCustomerId } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user email from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if (!user.emailAddresses[0]?.emailAddress) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    const userEmail = user.emailAddresses[0].emailAddress
    
    // Get Stripe customer
    const customer = await getCustomerByEmail(userEmail)
    
    if (!customer) {
      // No Stripe customer found - user is free tier
      await updateUserSubscription(userId, {
        subscription_tier: 'free',
        subscription_status: 'inactive',
        stripe_customer_id: null,
        stripe_subscription_id: null,
      })
      
      return NextResponse.json({
        success: true,
        subscription_tier: 'free',
        subscription_status: 'inactive',
        message: 'No active subscription found'
      })
    }

    // Get active subscription
    const subscription = await getSubscriptionByCustomerId(customer.id)
    
    if (!subscription || subscription.status !== 'active') {
      // Customer exists but no active subscription
      await updateUserSubscription(userId, {
        subscription_tier: 'free',
        subscription_status: subscription?.status || 'inactive',
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription?.id || null,
      })
      
      return NextResponse.json({
        success: true,
        subscription_tier: 'free',
        subscription_status: subscription?.status || 'inactive',
        message: 'No active subscription found'
      })
    }

    // Determine subscription tier based on price
    const priceId = subscription.items.data[0]?.price.id
    let subscriptionTier: 'monthly' | 'yearly' = 'monthly'

    if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      subscriptionTier = 'yearly'
    }

    // Update user with active subscription
    await updateUserSubscription(userId, {
      subscription_tier: subscriptionTier,
      subscription_status: subscription.status,
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    return NextResponse.json({
      success: true,
      subscription_tier: subscriptionTier,
      subscription_status: subscription.status,
      message: 'Subscription synced successfully'
    })

  } catch (error) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}

async function updateUserSubscription(userId: string, updates: any) {
  const supabase = createSupabaseServerClient()
  
  const { error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }

  console.log('✅ User subscription updated:', userId, updates)
}
