'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import {
  useUserProfile,
  useUsageLimits,
  useHasPremiumAccess,
} from '@/contexts/UserContext'
import Link from 'next/link'
import UpgradeModal from '@/components/ui/UpgradeModal'
import {
  ArrowLeft,
  Crown,
  CreditCard,
  Calendar,
  TrendingUp,
  Download,
  AlertCircle,
  LayoutDashboard,
  Plus,
  FolderOpen,
  User,
} from 'lucide-react'

// Types for billing history
interface BillingHistoryItem {
  id: string
  date: string
  amount: string
  status: string
  invoice: string
  invoice_url?: string
}

export default function BillingPage() {
  const { user } = useUser()
  const { userProfile, updateUserProfile } = useUserProfile()
  const { currentUsage, currentLimit } = useUsageLimits()
  const hasPremiumAccess = useHasPremiumAccess()
  const [activeTab, setActiveTab] = useState('overview')
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Billing history state
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Real data from user profile
  const subscriptionTier = userProfile?.subscription_tier || 'free'
  const subscriptionStatus = userProfile?.subscription_status || 'inactive'
  const isActive = subscriptionStatus === 'active'

  const currentPlan =
    subscriptionTier === 'monthly' && isActive
      ? 'Monthly Pro'
      : subscriptionTier === 'yearly' && isActive
      ? 'Yearly Pro'
      : 'Free'

  const monthlyPrice =
    subscriptionTier === 'monthly'
      ? '$10.00'
      : subscriptionTier === 'yearly'
      ? '$2.50'
      : '$0.00'

  const nextBillingDate = userProfile?.subscription_current_period_end
    ? new Date(userProfile.subscription_current_period_end).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : 'N/A'

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  }

  // Fetch billing history
  const fetchBillingHistory = async () => {
    if (!user || !userProfile?.stripe_customer_id) {
      setBillingHistory([])
      return
    }

    setIsLoadingHistory(true)
    setHistoryError(null)

    try {
      const response = await fetch('/api/stripe/billing-history')

      if (!response.ok) {
        if (response.status === 404) {
          // No billing history found - this is normal for free users
          setBillingHistory([])
          return
        }
        throw new Error('Failed to fetch billing history')
      }

      const data = await response.json()
      setBillingHistory(data.history || [])
    } catch (error) {
      console.error('Error fetching billing history:', error)
      setHistoryError('Failed to load billing history')
      setBillingHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Load billing history when component mounts or when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchBillingHistory()
    }
  }, [activeTab, user, userProfile?.stripe_customer_id])

  // Upgrade to Pro function - now uses Stripe
  const handleUpgradeToPro = async (planType: 'monthly' | 'yearly') => {
    if (!user) return

    setIsUpgrading(true)
    try {
      const { redirectToCheckout } = await import('@/lib/payment-service')
      await redirectToCheckout(planType)
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert('Failed to start checkout. Please try again.')
      setIsUpgrading(false)
    }
  }

  // Manage billing function - opens Stripe billing portal
  const handleManageBilling = async () => {
    try {
      const { redirectToBillingPortal } = await import('@/lib/payment-service')
      await redirectToBillingPortal()
    } catch (error) {
      console.error('Error opening billing portal:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  // Downgrade function
  const handleDowngrade = async () => {
    if (!user) return

    if (
      confirm(
        'Are you sure you want to downgrade to the Free plan? You will lose access to premium features.'
      )
    ) {
      setIsUpgrading(true)
      try {
        // Import the updateSubscriptionTier function
        const { updateSubscriptionTier } = await import('@/lib/user-service')

        // Update subscription in Supabase
        const success = await updateSubscriptionTier(user.id, 'free')

        if (success) {
          // Update local user profile
          if (updateUserProfile) {
            await updateUserProfile({
              subscription_tier: 'free',
            })
          }

          alert('Successfully downgraded to Free plan.')
        } else {
          alert('Downgrade failed. Please try again.')
        }
      } catch (error) {
        console.error('Downgrade failed:', error)
        alert('Downgrade failed. Please try again.')
      } finally {
        setIsUpgrading(false)
      }
    }
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-around py-2 px-4">
          <Link
            href="/dashboard"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Dashboard</span>
          </Link>
          <Link
            href="/create"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <Plus className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Create</span>
          </Link>
          <Link
            href="/dashboard/projects"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <FolderOpen className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Projects</span>
          </Link>
          <Link
            href="/dashboard/billing"
            className="flex flex-col items-center p-2 text-emerald-400">
            <User className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Account</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg md:rounded-xl flex items-center justify-center">
                <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Billing & Subscription 💳
              </h1>
            </div>
            <p className="text-gray-400 text-sm">
              Manage your subscription and billing information
            </p>
          </div>

          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg md:rounded-xl transition-all duration-200 text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium hidden md:inline">
              Back to Dashboard
            </span>
            <span className="font-medium md:hidden">Back</span>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-1 md:p-2 border border-white/10 mb-6 md:mb-8">
          <div className="flex space-x-1 md:space-x-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'plans', label: 'Plans', icon: Crown },
              { id: 'history', label: 'Billing History', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <tab.icon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === 'history' ? 'History' : tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div {...fadeInUp} className="space-y-6 md:space-y-8">
            {/* Current Plan Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Current Plan
                </h2>
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    currentPlan === 'Free'
                      ? 'bg-gray-600/50 text-gray-300 border border-gray-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                  {currentPlan}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <p className="text-gray-400 text-sm mb-2">Plan Type</p>
                  <p className="text-white font-bold text-xl">{currentPlan}</p>
                  {subscriptionTier === 'yearly' && (
                    <p className="text-emerald-400 text-sm mt-1">Save 75%!</p>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <p className="text-gray-400 text-sm mb-2">
                    {subscriptionTier === 'yearly'
                      ? 'Monthly Equivalent'
                      : 'Monthly Cost'}
                  </p>
                  <p className="text-white font-bold text-xl">{monthlyPrice}</p>
                  {subscriptionTier === 'yearly' && (
                    <p className="text-gray-400 text-sm mt-1">($30/year)</p>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <p className="text-gray-400 text-sm mb-2">
                    Next Billing Date
                  </p>
                  <p className="text-white font-bold text-xl">
                    {nextBillingDate}
                  </p>
                  {subscriptionStatus &&
                    subscriptionStatus !== 'active' &&
                    subscriptionStatus !== 'inactive' && (
                      <p className="text-yellow-400 text-sm mt-1 capitalize">
                        {subscriptionStatus}
                      </p>
                    )}
                </div>
              </div>

              {currentPlan === 'Free' ? (
                <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-emerald-400 font-medium">
                        Upgrade to Pro
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Unlock unlimited text-behind effects and premium
                        features
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      disabled={isUpgrading}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      {isUpgrading ? 'Processing...' : 'Upgrade Now'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-blue-400 font-medium">
                        Manage Subscription
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Update payment methods, view invoices, or cancel
                        subscription
                      </p>
                    </div>
                    <button
                      onClick={handleManageBilling}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                      Manage Billing
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                Usage Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-emerald-400">
                      {currentUsage}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {currentUsage}
                  </p>
                  <p className="text-gray-400 text-sm">Images Created</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-400">
                      {currentLimit}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {currentLimit}
                  </p>
                  <p className="text-gray-400 text-sm">Monthly Limit</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-400">
                      {hasPremiumAccess
                        ? '∞'
                        : Math.max(0, currentLimit - currentUsage)}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {hasPremiumAccess
                      ? 'Unlimited'
                      : Math.max(0, currentLimit - currentUsage)}
                  </p>
                  <p className="text-gray-400 text-sm">Remaining</p>
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Usage Progress</span>
                  <span className="text-sm text-gray-400">
                    {hasPremiumAccess
                      ? 'Unlimited'
                      : `${currentUsage}/${currentLimit} per month`}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      hasPremiumAccess
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500 w-full'
                        : currentUsage >= currentLimit
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-blue-500'
                    }`}
                    style={{
                      width: hasPremiumAccess
                        ? '100%'
                        : `${Math.min(
                            (currentUsage / currentLimit) * 100,
                            100
                          )}%`,
                    }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <motion.div
            {...fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="text-3xl font-bold mb-4">
                  $0<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300 mb-6">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    3 text-behind effects
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Basic fonts
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Standard support
                  </li>
                </ul>
                <button
                  onClick={currentPlan !== 'Free' ? handleDowngrade : undefined}
                  disabled={currentPlan === 'Free' || isUpgrading}
                  className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 ${
                    currentPlan === 'Free'
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-500 text-white disabled:bg-gray-700 disabled:cursor-not-allowed'
                  }`}>
                  {currentPlan === 'Free'
                    ? 'Current Plan'
                    : isUpgrading
                    ? 'Processing...'
                    : 'Downgrade'}
                </button>
              </div>
            </div>

            {/* Monthly Plan */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 rounded-xl p-6 border-2 border-emerald-500/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2 text-emerald-400">
                  Monthly Pro
                </h3>
                <div className="text-3xl font-bold mb-4">
                  $10<span className="text-lg text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-300 mb-6">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unlimited text-behind effects
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Premium fonts & effects
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <button
                  onClick={
                    currentPlan !== 'Monthly Pro'
                      ? () => handleUpgradeToPro('monthly')
                      : undefined
                  }
                  disabled={currentPlan === 'Monthly Pro' || isUpgrading}
                  className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 ${
                    currentPlan === 'Monthly Pro'
                      ? 'bg-emerald-600 text-white cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-800 disabled:cursor-not-allowed'
                  }`}>
                  {currentPlan === 'Monthly Pro'
                    ? 'Current Plan'
                    : isUpgrading
                    ? 'Processing...'
                    : 'Upgrade to Pro'}
                </button>
              </div>
            </div>

            {/* Yearly Plan */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Yearly Pro</h3>
                <div className="text-3xl font-bold mb-2">
                  $30<span className="text-lg text-gray-400">/year</span>
                </div>
                <div className="text-emerald-400 text-sm mb-4">
                  Save $90/year
                </div>
                <ul className="space-y-3 text-sm text-gray-300 mb-6">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Everything in Monthly Pro
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    75% cost savings
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-emerald-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Early access to features
                  </li>
                </ul>
                <button
                  onClick={() => handleUpgradeToPro('yearly')}
                  disabled={isUpgrading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors duration-200">
                  {isUpgrading ? 'Processing...' : 'Upgrade to Yearly'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'history' && (
          <motion.div
            {...fadeInUp}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Billing History</h2>
              <p className="text-gray-400 text-sm mt-1">
                View and download your past invoices
              </p>
            </div>

            {/* Loading State */}
            {isLoadingHistory && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading billing history...</p>
              </div>
            )}

            {/* Error State */}
            {historyError && (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-2">
                  Failed to load billing history
                </p>
                <p className="text-gray-400 text-sm mb-4">{historyError}</p>
                <button
                  onClick={fetchBillingHistory}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingHistory &&
              !historyError &&
              billingHistory.length === 0 && (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No billing history yet</p>
                  <p className="text-gray-500 text-sm">
                    {currentPlan === 'Free'
                      ? 'Upgrade to a paid plan to see your billing history here'
                      : 'Your invoices and payment history will appear here'}
                  </p>
                </div>
              )}

            {/* Billing History Table */}
            {!isLoadingHistory &&
              !historyError &&
              billingHistory.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {billingHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {item.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {item.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.status === 'paid'
                                  ? 'bg-emerald-600 text-white'
                                  : item.status === 'pending'
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {item.invoice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.invoice_url ? (
                              <a
                                href={item.invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </motion.div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <motion.div {...fadeInUp} className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  Add Payment Method
                </button>
              </div>

              {currentPlan === 'Free' ? (
                <div className="text-center py-8">
                  <svg
                    className="w-16 h-16 text-gray-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <p className="text-gray-400">
                    No payment methods required for free plan
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Upgrade to Pro to add payment methods
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">
                          VISA
                        </span>
                      </div>
                      <div>
                        <p className="text-white">•••• •••• •••• 4242</p>
                        <p className="text-gray-400 text-sm">Expires 12/25</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-white transition-colors duration-200">
                        Edit
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors duration-200">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Beautiful Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
