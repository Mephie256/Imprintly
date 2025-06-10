'use client'

import { useState } from 'react'
import { X, Check, Zap, Crown, Star, Loader2 } from 'lucide-react'
import { redirectToCheckout, getPricingInfo } from '@/lib/payment-service'
import { PlanType } from '@/lib/stripe'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [isAnnual, setIsAnnual] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null)

  const pricingInfo = getPricingInfo()

  const handleUpgrade = async (planType: PlanType) => {
    setIsLoading(true)
    setLoadingPlan(planType)

    try {
      await redirectToCheckout(planType)
    } catch (error) {
      console.error('Error upgrading:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
      setLoadingPlan(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              Choose your plan
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg">
              Choose the plan that works best for you. No hidden fees, no
              surprises.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm font-medium ${
                !isAnnual ? 'text-white' : 'text-gray-400'
              }`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-all duration-200 ${
                isAnnual ? 'bg-emerald-600' : 'bg-gray-600'
              }`}>
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                isAnnual ? 'text-white' : 'text-gray-400'
              }`}>
              Annual
            </span>
            {isAnnual && (
              <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium">
                <Star className="w-3 h-3 inline mr-1" />
                SAVE $90
              </div>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="px-8 pb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-1">$0</div>
                <p className="text-gray-400 text-sm">Forever free</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    3 text-behind effects total
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    Basic font library access
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">Standard text styling</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">Standard support</span>
                </div>
              </div>

              <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-medium border border-white/20">
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border-2 border-emerald-500/50 relative overflow-hidden">
              {/* Most Popular Badge */}
              <div className="absolute top-0 right-6 bg-emerald-500 text-white px-4 py-1 rounded-b-lg text-xs font-bold">
                MOST POPULAR
              </div>

              <div className="text-center mb-6 mt-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {isAnnual ? 'Yearly' : 'Monthly'}
                </h3>
                <div className="text-4xl font-bold text-white mb-1">
                  ${isAnnual ? '30' : '10'}
                  <span className="text-lg text-gray-300">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                {isAnnual && (
                  <p className="text-emerald-300 text-sm">Save $90 per year</p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white">
                    Unlimited text-behind effects
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white">Full font library access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white">
                    Advanced text styling & effects
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white">Priority support</span>
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(isAnnual ? 'yearly' : 'monthly')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl group">
                <div className="flex items-center justify-center gap-2">
                  {isLoading &&
                  loadingPlan === (isAnnual ? 'yearly' : 'monthly') ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  )}
                  {isLoading &&
                  loadingPlan === (isAnnual ? 'yearly' : 'monthly')
                    ? 'Processing...'
                    : isAnnual
                    ? 'Subscribe Yearly'
                    : 'Subscribe Monthly'}
                </div>
              </button>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="mt-12 bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 text-center">
              Why upgrade to Pro?
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">
                  Unlimited Power
                </h4>
                <p className="text-gray-400 text-sm">
                  Create as many text-behind effects as you want without limits
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">
                  Premium Quality
                </h4>
                <p className="text-gray-400 text-sm">
                  Download in 4K resolution with no watermarks for professional
                  use
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">
                  Advanced Features
                </h4>
                <p className="text-gray-400 text-sm">
                  Access all fonts, effects, and get priority customer support
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              ✨ 30-day money-back guarantee • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
