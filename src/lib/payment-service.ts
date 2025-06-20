import { PlanType } from '@/lib/stripe'

export interface PaymentSession {
  sessionId: string
  url: string
  planType: PlanType
  planName: string
  price: number
}

export interface BillingPortalSession {
  url: string
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createPaymentSession(planType: PlanType): Promise<PaymentSession> {
  try {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planType }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment session')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating payment session:', error)
    throw error
  }
}

/**
 * Create a Stripe billing portal session for subscription management
 */
export async function createBillingSession(): Promise<BillingPortalSession> {
  try {
    const response = await fetch('/api/stripe/create-billing-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create billing session')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating billing session:', error)
    throw error
  }
}

/**
 * Redirect to Stripe checkout
 */
export async function redirectToCheckout(planType: PlanType): Promise<void> {
  try {
    const session = await createPaymentSession(planType)

    if (session.url) {
      window.location.href = session.url
    } else {
      throw new Error('No checkout URL received')
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

/**
 * Redirect to Stripe billing portal
 */
export async function redirectToBillingPortal(): Promise<void> {
  try {
    const session = await createBillingSession()

    if (session.url) {
      window.location.href = session.url
    } else {
      throw new Error('No billing portal URL received')
    }
  } catch (error) {
    console.error('Error redirecting to billing portal:', error)
    throw error
  }
}

/**
 * Get pricing information
 */
export function getPricingInfo() {
  return {
    monthly: {
      price: 10,
      interval: 'month',
      name: 'Monthly Pro',
      description: 'Unlimited generations, premium features',
      features: [
        'Unlimited text-behind effects',
        'Premium templates',
        'High-quality exports',
        'Priority support',
        'Advanced customization',
      ],
    },
    yearly: {
      price: 30,
      interval: 'year',
      name: 'Yearly Pro',
      description: 'Unlimited generations, premium features - Save $90/year',
      savings: 90,
      monthlyEquivalent: 2.5,
      features: [
        'Everything in Monthly Pro',
        'Save $90 per year',
        'Priority feature access',
        'Dedicated support',
        'Advanced analytics',
      ],
    },
    free: {
      price: 0,
      interval: 'forever',
      name: 'Free Tier',
      description: 'Perfect for trying out the platform',
      features: [
        '3 text-behind effects',
        'Basic templates',
        'Standard quality exports',
        'Community support',
      ],
      limitations: [
        'Limited to 3 generations',
        'Basic templates only',
        'Standard quality',
      ],
    },
  }
}

/**
 * Check if user has active subscription
 */
export function hasActiveSubscription(
  subscriptionTier: string,
  subscriptionStatus?: string
): boolean {
  return (
    (subscriptionTier === 'monthly' || subscriptionTier === 'yearly') &&
    subscriptionStatus === 'active'
  )
}

/**
 * Get subscription display name
 */
export function getSubscriptionDisplayName(subscriptionTier: string): string {
  switch (subscriptionTier) {
    case 'monthly':
      return 'Monthly Pro'
    case 'yearly':
      return 'Yearly Pro'
    case 'free':
    default:
      return 'Free Tier'
  }
}

/**
 * Check if user has premium access (Pro plan)
 */
export function isPremiumUser(
  subscriptionTier?: string | null,
  subscriptionStatus?: string | null
): boolean {
  return (
    (subscriptionTier === 'monthly' || subscriptionTier === 'yearly') &&
    subscriptionStatus === 'active'
  )
}

/**
 * Get plan display name for UI
 */
export function getPlanDisplayName(
  subscriptionTier?: string | null,
  subscriptionStatus?: string | null
): string {
  return isPremiumUser(subscriptionTier, subscriptionStatus) ? 'PRO' : 'FREE'
}

/**
 * Get plan styling information for consistent UI
 */
export function getPlanStyling(
  subscriptionTier?: string | null,
  subscriptionStatus?: string | null
) {
  const isActivePro = isPremiumUser(subscriptionTier, subscriptionStatus)

  if (isActivePro) {
    return {
      color: 'text-yellow-400',
      bgColor: 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20',
      borderColor: 'border-yellow-500/30',
      badgeColor: 'text-yellow-400',
      badgeBg: 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20',
      badgeBorder: 'border-yellow-500/30',
      isPro: true,
    }
  }

  return {
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    badgeColor: 'text-gray-400',
    badgeBg: 'bg-gray-500/20',
    badgeBorder: 'border-gray-500/30',
    isPro: false,
  }
}

/**
 * Calculate savings for yearly plan
 */
export function calculateYearlySavings(): number {
  const monthlyPrice = 10
  const yearlyPrice = 30
  const monthlyYearlyTotal = monthlyPrice * 12
  return monthlyYearlyTotal - yearlyPrice
}

/**
 * Format price for display
 */
export function formatPrice(price: number, interval?: string): string {
  const formatted = `$${price}`
  if (interval) {
    return `${formatted}/${interval}`
  }
  return formatted
}

/**
 * Get next billing date
 */
export function getNextBillingDate(
  currentPeriodEnd: string | null
): string | null {
  if (!currentPeriodEnd) return null

  try {
    const date = new Date(currentPeriodEnd)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    console.error('Error formatting billing date:', error)
    return null
  }
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isSubscriptionExpiringSoon(
  currentPeriodEnd: string | null
): boolean {
  if (!currentPeriodEnd) return false

  try {
    const endDate = new Date(currentPeriodEnd)
    const now = new Date()
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  } catch (error) {
    console.error('Error checking subscription expiry:', error)
    return false
  }
}
