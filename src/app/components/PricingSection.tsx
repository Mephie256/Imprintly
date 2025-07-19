'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import CheckIcon from './CheckIcon'

interface PricingSectionProps {
  staggerContainer: any
  fadeInUp: any
}

const PricingSection: React.FC<PricingSectionProps> = ({
  staggerContainer,
  fadeInUp,
}) => {
  return (
    <motion.section
      id="pricing"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      className="bg-gradient-to-b from-gray-900/80 to-gray-900/50 py-12 sm:py-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 backdrop-blur-sm text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl mb-6 border border-emerald-500/20">
          <svg
            className="w-3 h-3 mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          Transparent Pricing
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 sm:mb-4 px-2 sm:px-0">
          Simple,{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            Transparent
          </span>{' '}
          Pricing
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-sm sm:text-base leading-5 sm:leading-6 text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto font-medium px-4 sm:px-0">
          Choose the plan that works best for you. No hidden fees, no surprises.
          Start free and upgrade when you're ready.
        </motion.p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto px-4 sm:px-0">
          {/* Free Plan */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Free Tier</h3>
              <div className="mb-3">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-gray-400 text-sm ml-1">/forever</span>
              </div>
              <p className="text-gray-400 mb-6 text-sm">
                Perfect for trying out the platform
              </p>

              <ul className="space-y-3 text-gray-300 mb-8 text-left">
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2 text-sm">
                    6 text-behind effects per month
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2 text-sm">
                    Basic font library access
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2 text-sm">Standard text styling</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-2 text-sm">Standard support</span>
                </li>
              </ul>

              <Link
                href="/auth/custom-signup"
                className="block w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                <motion.span whileHover={{ scale: 1.02 }}>
                  Get Started Free
                </motion.span>
              </Link>
            </div>
          </motion.div>

          {/* Monthly Plan */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.05, y: -8 }}
            className="relative bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-emerald-500/50 hover:border-emerald-400/70 transition-all duration-300 transform scale-105 z-10">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold uppercase py-2 px-6 rounded-full shadow-lg">
                Most Popular
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-400/10 rounded-3xl"></div>

            <div className="relative z-10 text-center pt-4">
              <h3 className="text-3xl font-bold text-emerald-400 mb-2">
                Monthly
              </h3>
              <div className="mb-4">
                <span className="text-6xl font-black text-white">$10</span>
                <span className="text-emerald-300 text-xl ml-1">/month</span>
              </div>
              <p className="text-emerald-200 mb-8">Billed monthly</p>

              <ul className="space-y-4 text-gray-200 mb-10 text-left">
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">
                    Unlimited text-behind effects
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">
                    Full font library access
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">
                    Advanced text styling & effects
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">Priority support</span>
                </li>
              </ul>

              <Link
                href="/auth/custom-login"
                className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl">
                <motion.span whileHover={{ scale: 1.02 }}>
                  Subscribe Now
                </motion.span>
              </Link>
            </div>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold uppercase py-2 px-4 rounded-full inline-block mb-4">
              Best Value
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-400 mb-2">Yearly</h3>
              <div className="mb-2">
                <span className="text-5xl font-black text-white">$30</span>
                <span className="text-gray-400 text-lg ml-1">/year</span>
              </div>
              <div className="mb-8">
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold py-1 px-3 rounded-full">
                  Save $90 per year
                </span>
              </div>

              <ul className="space-y-4 text-gray-300 mb-10 text-left">
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">
                    Unlimited text-behind effects
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">
                    Full font library access
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">
                    Advanced text styling & effects
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  <span className="ml-3 text-base">Priority support</span>
                </li>
              </ul>

              <Link
                href="/auth/custom-login"
                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
                <motion.span whileHover={{ scale: 1.02 }}>
                  Subscribe Yearly
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default PricingSection
