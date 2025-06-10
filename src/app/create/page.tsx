'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import TextBehindCreator from '@/components/TextBehindCreator'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function CreatePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoaded, router])

  if (!isLoaded) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background flex items-center justify-center">
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
        <TextBehindCreator />
      </div>
    </ErrorBoundary>
  )
}
