import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyWebhookSignature } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder_for_build'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 })
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const userId = session.metadata?.userId
    const customerId = session.customer as string

    if (!userId) {
      console.error('No userId found in checkout session metadata')
      return
    }

    const supabase = createSupabaseServerClient()

    // Update user with Stripe customer ID and subscription status
    const { error } = await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Error updating user after checkout:', error)
    } else {
      console.log('✅ User updated after successful checkout:', userId)
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('No userId found in subscription metadata')
      return
    }

    // Determine subscription tier based on price
    const priceId = subscription.items.data[0]?.price.id
    let subscriptionTier: 'monthly' | 'yearly' = 'monthly'

    if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      subscriptionTier = 'yearly'
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscription_tier: subscriptionTier,
        subscription_status: subscription.status,
        subscription_current_period_start: (subscription as any).current_period_start
          ? new Date((subscription as any).current_period_start * 1000).toISOString()
          : null,
        subscription_current_period_end: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Error updating user subscription:', error)
    } else {
      console.log('✅ Subscription created for user:', userId)
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('No userId found in subscription metadata')
      return
    }

    // Determine subscription tier based on price
    const priceId = subscription.items.data[0]?.price.id
    let subscriptionTier: 'monthly' | 'yearly' = 'monthly'

    if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      subscriptionTier = 'yearly'
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('users')
      .update({
        subscription_tier: subscriptionTier,
        subscription_status: subscription.status,
        subscription_current_period_start: (subscription as any).current_period_start
          ? new Date((subscription as any).current_period_start * 1000).toISOString()
          : null,
        subscription_current_period_end: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log('✅ Subscription updated for user:', userId)
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('No userId found in subscription metadata')
      return
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Error updating user after subscription deletion:', error)
    } else {
      console.log('✅ Subscription canceled for user:', userId)
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('✅ Payment succeeded for invoice:', invoice.id)
    // You can add additional logic here like sending confirmation emails
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('❌ Payment failed for invoice:', invoice.id)
    // You can add additional logic here like sending payment failure emails
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}
