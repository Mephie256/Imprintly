import Stripe from 'stripe'

// Allow development without Stripe keys for now
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    '⚠️  STRIPE_SECRET_KEY not set - using placeholder for development'
  )
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
})

// Pricing configuration - safe for build time
export const PRICING_PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
    price: 10,
    interval: 'month' as const,
    name: 'Monthly Pro',
    description: 'Unlimited generations, premium features',
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder',
    price: 30,
    interval: 'year' as const,
    name: 'Yearly Pro',
    description: 'Unlimited generations, premium features - Save $90/year',
  },
} as const

export type PlanType = keyof typeof PRICING_PLANS

// Helper function to create checkout session
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
      allow_promotion_codes: true,
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Helper function to create billing portal session
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw error
  }
}

// Helper function to get customer by email
export async function getCustomerByEmail(email: string) {
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    })

    return customers.data[0] || null
  } catch (error) {
    console.error('Error getting customer by email:', error)
    return null
  }
}

// Helper function to get customer invoices
export async function getCustomerInvoices(customerId: string, limit = 50) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      expand: ['data.subscription'],
    })

    return invoices.data
  } catch (error) {
    console.error('Error getting customer invoices:', error)
    return []
  }
}

// Helper function to format invoice for display
export function formatInvoiceForDisplay(invoice: any) {
  return {
    id: invoice.id,
    date: new Date(invoice.created * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
    status: invoice.status || 'unknown',
    invoice: invoice.number || invoice.id,
    invoice_url: invoice.hosted_invoice_url,
    description: invoice.description || 'Subscription payment',
  }
}

// Helper function to get subscription by customer ID
export async function getSubscriptionByCustomerId(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    })

    return subscriptions.data[0] || null
  } catch (error) {
    console.error('Error getting subscription by customer ID:', error)
    return null
  }
}

// Helper function to cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Helper function to verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    throw error
  }
}
