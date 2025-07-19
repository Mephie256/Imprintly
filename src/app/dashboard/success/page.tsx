'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserContext'
import { CheckCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile, refreshUserProfile } = useUserProfile()
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id')
    setSessionId(sessionIdParam)

    // Sync subscription and refresh user profile with retries
    const syncAndRefresh = async () => {
      const maxRetries = 5
      const retryDelay = 2000 // 2 seconds

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Sync attempt ${attempt}/${maxRetries}`)

          // First, try to sync using the session ID if available
          if (sessionId) {
            console.log('🔍 Syncing with session ID:', sessionId)
            const sessionResponse = await fetch('/api/sync-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId }),
            })

            if (sessionResponse.ok) {
              const sessionResult = await sessionResponse.json()
              console.log('✅ Session synced:', sessionResult)
            } else {
              console.warn(`⚠️ Session sync failed (attempt ${attempt})`)
            }
          }

          // Then, manually sync subscription with Stripe
          const response = await fetch('/api/sync-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const result = await response.json()
            console.log('✅ Subscription synced:', result)
          } else {
            console.warn(`⚠️ Subscription sync failed (attempt ${attempt})`)
          }

          // Then refresh user profile
          if (refreshUserProfile) {
            await refreshUserProfile()
          }

          // Check if user now has subscription
          if (userProfile?.subscription_status === 'active') {
            console.log('✅ Subscription confirmed active!')
            setIsLoading(false)
            return
          }

          // If not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            console.log(`⏳ Waiting ${retryDelay}ms before retry...`)
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
          }
        } catch (error) {
          console.error(`❌ Sync attempt ${attempt} failed:`, error)

          // If not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
          }
        }
      }

      // Final attempt to refresh profile even if sync failed
      try {
        if (refreshUserProfile) {
          await refreshUserProfile()
        }
      } catch (error) {
        console.error('❌ Final profile refresh failed:', error)
      }

      setIsLoading(false)
    }

    // Add a small delay to ensure Stripe has processed
    setTimeout(syncAndRefresh, 1000)
  }, [searchParams, refreshUserProfile])

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background flex items-center justify-center">
        <div className="relative z-10 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Processing your subscription...
          </h1>
          <p className="text-gray-400">
            Please wait while we set up your Pro account
          </p>
        </div>
      </div>
    )
  }

  const isPro =
    (userProfile?.subscription_tier === 'monthly' ||
      userProfile?.subscription_tier === 'yearly') &&
    userProfile?.subscription_status === 'active'

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-6">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 relative">
              <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">
              🎉 Welcome to Pro!
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-4 md:mb-6">
              Your subscription has been activated successfully
            </p>

            {isPro && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-emerald-400 mb-2">
                  {userProfile?.subscription_tier === 'yearly'
                    ? 'Yearly Pro'
                    : 'Monthly Pro'}{' '}
                  Plan Active
                </h2>
                <p className="text-gray-300">
                  You now have unlimited access to all premium features
                  including:
                </p>
                <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center text-gray-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
                    Unlimited text-behind effects
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
                    Premium fonts and templates
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
                    High-quality exports
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
                    Priority support
                  </li>
                </ul>
              </div>
            )}

            {/* Debug info for troubleshooting */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-xs">
                <h4 className="text-emerald-400 font-semibold mb-2">
                  Debug Info:
                </h4>
                <p>Session ID: {sessionId}</p>
                <p>
                  Subscription Tier: {userProfile?.subscription_tier || 'none'}
                </p>
                <p>
                  Subscription Status:{' '}
                  {userProfile?.subscription_status || 'none'}
                </p>
                <p>
                  Stripe Customer ID:{' '}
                  {userProfile?.stripe_customer_id || 'none'}
                </p>
                <p>Is Pro: {isPro ? 'Yes' : 'No'}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700">
                    Refresh Page
                  </button>
                  {sessionId && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/sync-session', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sessionId }),
                          })
                          const result = await response.json()
                          console.log('Manual sync result:', result)
                          if (refreshUserProfile) {
                            await refreshUserProfile()
                          }
                          alert(
                            result.success
                              ? 'Sync successful!'
                              : 'Sync failed: ' + result.error
                          )
                        } catch (error) {
                          console.error('Manual sync error:', error)
                          alert('Sync failed: ' + error)
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Manual Sync
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg group">
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Creating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-200 border border-white/20 font-semibold text-lg">
                Go to Dashboard
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-4">
                Need help getting started?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <Link
                  href="/dashboard/billing"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Manage Billing
                </Link>
                <Link
                  href="/support"
                  className="text-blue-400 hover:text-blue-300 transition-colors">
                  Contact Support
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="text-purple-400 hover:text-purple-300 transition-colors">
                  View Projects
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Session Info (for debugging) */}
          {process.env.NODE_ENV === 'development' && sessionId && (
            <motion.div
              variants={fadeInUp}
              className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-500">
                Debug: Session ID: {sessionId}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background flex items-center justify-center">
          <div className="relative z-10 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-gray-400">
              Please wait while we load your success page
            </p>
          </div>
        </div>
      }>
      <SuccessPageContent />
    </Suspense>
  )
}
