import { NextRequest, NextResponse } from 'next/server'
import {
  validateUsagePermissions,
  secureIncrementUsage,
  validateRequestSecurity,
} from '@/lib/usage-security'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request security (origin, headers, etc.)
    if (!validateRequestSecurity(request)) {
      console.warn('🚫 Security validation failed for usage increment')
      return NextResponse.json(
        { error: 'Request validation failed' },
        { status: 403 }
      )
    }

    // 2. Comprehensive usage validation
    const validation = await validateUsagePermissions(request, true)

    if (!validation.success) {
      console.warn('🚫 Usage validation failed:', validation.error)
      return NextResponse.json(
        {
          error: validation.error,
          ...(validation.userProfile && {
            current_usage: validation.userProfile.current_usage,
            limit: validation.userProfile.limit,
          }),
        },
        { status: validation.statusCode || 403 }
      )
    }

    // 3. Secure increment with race condition protection
    const incrementResult = await secureIncrementUsage(validation.userId!)

    if (!incrementResult.success) {
      console.warn('🚫 Secure increment failed:', incrementResult.error)
      return NextResponse.json(
        { error: incrementResult.error },
        { status: 403 }
      )
    }

    // 4. Calculate remaining usage
    const limits = {
      free: 3,
      monthly: 1000,
      yearly: 10000,
    }

    const userTier = validation.userProfile?.subscription_tier || 'free'
    const currentLimit = limits[userTier as keyof typeof limits] || limits.free
    const remaining = currentLimit - incrementResult.newUsageCount!

    console.log('✅ Usage incremented securely:', {
      userId: validation.userId,
      newCount: incrementResult.newUsageCount,
      remaining,
    })

    return NextResponse.json({
      success: true,
      usage_count: incrementResult.newUsageCount,
      remaining,
      limit: currentLimit,
    })
  } catch (error) {
    console.error('Error in increment-usage API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
