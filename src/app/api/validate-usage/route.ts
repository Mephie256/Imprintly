import { NextRequest, NextResponse } from 'next/server'
import {
  validateUsagePermissions,
  validateRequestSecurity,
} from '@/lib/usage-security'

/**
 * Secure endpoint to validate if user can create new images
 * This should be called BEFORE any image processing begins
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate request security
    if (!validateRequestSecurity(request)) {
      console.warn('🚫 Security validation failed for usage check')
      return NextResponse.json(
        { error: 'Request validation failed' },
        { status: 403 }
      )
    }

    // 2. Comprehensive usage validation
    const validation = await validateUsagePermissions(request, true)

    if (!validation.success) {
      console.warn('🚫 Usage validation failed:', validation.error)

      // Return detailed error information for limit reached
      if (validation.statusCode === 403 && validation.userProfile) {
        return NextResponse.json(
          {
            canCreate: false,
            error: validation.error,
            current_usage:
              validation.userProfile.current_usage ||
              validation.userProfile.usage_count,
            limit: validation.userProfile.limit,
            subscription_tier: validation.userProfile.subscription_tier,
          },
          { status: 200 } // Return 200 but with canCreate: false
        )
      }

      return NextResponse.json(
        {
          canCreate: false,
          error: validation.error,
        },
        { status: validation.statusCode || 403 }
      )
    }

    // 3. Calculate usage information
    const limits = {
      free: 6,
      monthly: 1000,
      yearly: 10000,
    }

    const userTier = validation.userProfile?.subscription_tier || 'free'
    const currentLimit = limits[userTier as keyof typeof limits] || limits.free
    const currentUsage = validation.userProfile?.usage_count || 0
    const remaining = currentLimit - currentUsage
    const isPremium = userTier !== 'free'

    console.log('✅ Usage validation successful:', {
      userId: validation.userId,
      tier: userTier,
      usage: currentUsage,
      limit: currentLimit,
      remaining,
    })

    return NextResponse.json({
      canCreate: true,
      usage_info: {
        current_usage: currentUsage,
        limit: currentLimit,
        remaining,
        subscription_tier: userTier,
        is_premium: isPremium,
      },
    })
  } catch (error) {
    console.error('Error in validate-usage API:', error)
    return NextResponse.json(
      {
        canCreate: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for checking usage status
 */
export async function GET(request: NextRequest) {
  try {
    // Validate request security
    if (!validateRequestSecurity(request)) {
      return NextResponse.json(
        { error: 'Request validation failed' },
        { status: 403 }
      )
    }

    // Get usage validation without requiring usage check
    const validation = await validateUsagePermissions(request, false)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.statusCode || 403 }
      )
    }

    // Return current usage status
    const limits = {
      free: 6,
      monthly: 1000,
      yearly: 10000,
    }

    const userTier = validation.userProfile?.subscription_tier || 'free'
    const currentLimit = limits[userTier as keyof typeof limits] || limits.free
    const currentUsage = validation.userProfile?.usage_count || 0
    const remaining = currentLimit - currentUsage
    const isPremium = userTier !== 'free'

    return NextResponse.json({
      usage_info: {
        current_usage: currentUsage,
        limit: currentLimit,
        remaining,
        subscription_tier: userTier,
        is_premium: isPremium,
        can_create: remaining > 0 || isPremium,
      },
    })
  } catch (error) {
    console.error('Error in GET validate-usage API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
