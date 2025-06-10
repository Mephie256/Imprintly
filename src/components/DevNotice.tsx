'use client'

import { useState, useEffect } from 'react'

export default function DevNotice() {
  const [showNotice, setShowNotice] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('your_supabase')
    
    // Check if notice was previously dismissed
    const dismissed = localStorage.getItem('dev-notice-dismissed')
    
    if (!isSupabaseConfigured && !dismissed) {
      setShowNotice(true)
    }
  }, [])
// Explain the code here
  const dismissNotice = () => {
    setIsDismissed(true)
    setShowNotice(false)
    localStorage.setItem('dev-notice-dismissed', 'true')
  }

  if (!showNotice || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Development Mode</p>
            <p className="text-sm opacity-90">
              Supabase is not configured. Using mock data for development. 
              <a 
                href="/CLERK_SUPABASE_SETUP.md" 
                target="_blank" 
                className="underline hover:no-underline ml-1"
              >
                View setup guide
              </a>
            </p>
          </div>
        </div>
        <button
          onClick={dismissNotice}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss notice"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
