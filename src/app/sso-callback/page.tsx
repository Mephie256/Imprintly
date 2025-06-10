'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function SSOCallback() {
  useEffect(() => {
    console.log('🔄 SSO Callback page loaded')
    console.log('Current URL:', window.location.href)
    console.log(
      'URL params:',
      new URLSearchParams(window.location.search).toString()
    )
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing sign in...
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you to your dashboard.
        </p>
      </div>
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  )
}
