import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/custom-login(.*)',
  '/auth/custom-signup(.*)',
  '/auth/login(.*)',
  '/auth/get-started(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)',
])

const isUsageProtectedRoute = createRouteMatcher([
  '/api/increment-usage',
  '/api/validate-usage',
  '/api/save-project',
])

export default clerkMiddleware((auth, req) => {
  // Apply authentication protection
  if (!isPublicRoute(req)) {
    auth.protect()
  }

  // Additional security for usage-related APIs
  if (isUsageProtectedRoute(req)) {
    // Rate limiting check
    const userAgent = req.headers.get('user-agent') || ''
    const origin = req.headers.get('origin')

    // Block suspicious requests
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      console.warn('🚫 Blocked bot request to protected API:', req.url)
      return NextResponse.json(
        { error: 'Automated requests not allowed' },
        { status: 403 }
      )
    }

    // In production, validate origin
    if (process.env.NODE_ENV === 'production' && origin) {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'https://your-domain.com', // Replace with your actual domain
      ].filter(Boolean)

      if (!allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        console.warn('🚫 Blocked request from unauthorized origin:', origin)
        return NextResponse.json(
          { error: 'Unauthorized origin' },
          { status: 403 }
        )
      }
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
