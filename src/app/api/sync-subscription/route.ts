import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sync subscription API called')

    // Get the authenticated user
    const user = await currentUser()
    if (!user) {
      console.log('❌ No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    console.log('👤 Authenticated user:', userId)

    // Parse the request body (optional - for manual sync calls)
    let body = {}
    try {
      body = await request.json()
      console.log('📦 Request body:', body)
    } catch (e) {
      console.log('📦 No request body provided, will refresh from database')
    }

    const supabase = createSupabaseServerClient()

    // If no specific subscription data provided, fetch from Stripe and sync
    if (!body || Object.keys(body).length === 0) {
      console.log('🔄 Fetching subscription data from Stripe and syncing')

      // First get user from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', userId)
        .single()

      if (userError) {
        console.error('❌ Supabase error:', userError)
        return NextResponse.json(
          { error: 'Failed to get user profile', details: userError.message },
          { status: 500 }
        )
      }

      if (!userData) {
        console.log('❌ User not found in database')
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // If user has a Stripe customer ID, fetch their subscription
      if (userData.stripe_customer_id) {
        try {
          console.log(
            '🔍 Fetching subscriptions for customer:',
            userData.stripe_customer_id
          )

          const subscriptions = await stripe.subscriptions.list({
            customer: userData.stripe_customer_id,
            status: 'all',
            limit: 1,
          })

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0]
            console.log(
              '📋 Found subscription:',
              subscription.id,
              'status:',
              subscription.status
            )

            // Determine subscription tier based on price
            const priceId = subscription.items.data[0]?.price.id
            let subscriptionTier: 'monthly' | 'yearly' = 'monthly'

            if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
              subscriptionTier = 'yearly'
            }

            // Update user with latest subscription data
            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update({
                subscription_id: subscription.id,
                subscription_status: subscription.status,
                subscription_tier: subscriptionTier,
                subscription_current_period_start: new Date(
                  subscription.current_period_start * 1000
                ).toISOString(),
                subscription_current_period_end: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
                subscription_cancel_at_period_end:
                  subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
              })
              .eq('clerk_user_id', userId)
              .select()
              .single()

            if (updateError) {
              console.error('❌ Error updating subscription:', updateError)
              return NextResponse.json(
                {
                  error: 'Failed to update subscription',
                  details: updateError.message,
                },
                { status: 500 }
              )
            }

            console.log('✅ Subscription synced from Stripe successfully')
            return NextResponse.json({
              success: true,
              message: 'Subscription synced from Stripe successfully',
              user: updatedUser,
            })
          } else {
            console.log('ℹ️ No active subscriptions found for customer')
          }
        } catch (stripeError) {
          console.error('❌ Stripe API error:', stripeError)
          // Continue with database refresh if Stripe fails
        }
      }

      console.log('✅ User profile refreshed from database')
      return NextResponse.json({
        success: true,
        message: 'User profile refreshed successfully',
        user: userData,
      })
    }

    // Handle manual subscription sync with provided data
    const {
      subscriptionId,
      customerId,
      status,
      planType,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd = false,
    } = body

    // Update user subscription in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        subscription_id: subscriptionId,
        subscription_status: status,
        subscription_tier: planType || 'free',
        subscription_current_period_start: currentPeriodStart
          ? new Date(currentPeriodStart * 1000).toISOString()
          : null,
        subscription_current_period_end: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        subscription_cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ Subscription synced successfully:', data[0])

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      user: data[0],
    })
  } catch (error) {
    console.error('❌ Sync subscription error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Get subscription status API called')

    // Get the authenticated user
    const user = await currentUser()
    if (!user) {
      console.log('❌ No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    console.log('👤 Authenticated user:', userId)

    const supabase = createSupabaseServerClient()

    // Get user subscription from Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to get subscription', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ Subscription status retrieved:', {
      subscriptionId: data.subscription_id,
      status: data.subscription_status,
      planType: data.subscription_tier,
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: data.subscription_id,
        customerId: data.stripe_customer_id,
        status: data.subscription_status,
        planType: data.subscription_tier,
        currentPeriodStart: data.subscription_current_period_start,
        currentPeriodEnd: data.subscription_current_period_end,
      },
    })
  } catch (error) {
    console.error('❌ Get subscription error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
