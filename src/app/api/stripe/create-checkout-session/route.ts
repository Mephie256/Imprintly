import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createCheckoutSession, PRICING_PLANS, PlanType } from '@/lib/stripe'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planType } = body as { planType: PlanType }

    if (!planType || !PRICING_PLANS[planType]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // Check if Stripe is properly configured
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.includes('placeholder') ||
      process.env.STRIPE_SECRET_KEY.includes('here')
    ) {
      return NextResponse.json(
        {
          error:
            'Stripe not configured. Please set up your Stripe keys in .env.local',
          setup_required: true,
        },
        { status: 400 }
      )
    }

    const plan = PRICING_PLANS[planType]

    // Check if price IDs are properly configured
    if (
      !plan.priceId ||
      plan.priceId.includes('placeholder') ||
      plan.priceId.includes('here') ||
      plan.priceId.startsWith('prod_') // Product ID instead of Price ID
    ) {
      return NextResponse.json(
        {
          error: `${planType} plan not configured. Please set up Price IDs (not Product IDs) in .env.local`,
          setup_required: true,
          hint: 'Go to Stripe Dashboard > Products > Click your product > Copy the PRICE ID (starts with price_)',
        },
        { status: 400 }
      )
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const { sessionId, url } = await createCheckoutSession({
      priceId: plan.priceId,
      userId,
      userEmail: user.emailAddresses[0].emailAddress,
      successUrl: `${baseUrl}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard?canceled=true`,
    })

    return NextResponse.json({
      sessionId,
      url,
      planType,
      planName: plan.name,
      price: plan.price,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
