'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

interface CallToActionSectionProps {
  fadeInUp: any
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  fadeInUp,
}) => {
  return (
    <motion.section
      variants={fadeInUp} // Single element animation
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.5 }}
      className="bg-gray-900/50 py-10 sm:py-14">
      <div className="container mx-auto px-6 text-center">
        <SignedOut>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
            Content Creation{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-6 text-gray-300 font-medium">
            Stop wrestling with complex software. Start creating beautiful
            visuals with Imprintify today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/custom-signup"
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-base transition-all duration-200 shadow-xl hover:shadow-2xl border border-emerald-400/20">
              <motion.span
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center">
                Get Started Free
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </Link>
            <Link
              href="#features"
              className="group text-base font-semibold leading-6 text-white hover:text-emerald-300 transition-colors duration-200">
              <motion.span whileHover={{ scale: 1.05 }}>
                Learn more
                <span
                  className="ml-2 group-hover:translate-x-1 inline-block transition-transform duration-200"
                  aria-hidden="true">
                  →
                </span>
              </motion.span>
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
            Ready to{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              Create?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-6 text-gray-300 font-medium">
            Your dashboard is waiting. Jump back in and continue creating
            amazing visuals with all your favorite tools.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-base transition-all duration-200 shadow-xl hover:shadow-2xl border border-emerald-400/20">
              <motion.span
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Open Dashboard
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </Link>
            <Link
              href="#pricing"
              className="group text-base font-semibold leading-6 text-white hover:text-emerald-300 transition-colors duration-200">
              <motion.span whileHover={{ scale: 1.05 }}>
                Upgrade Plan
                <span
                  className="ml-2 group-hover:translate-x-1 inline-block transition-transform duration-200"
                  aria-hidden="true">
                  →
                </span>
              </motion.span>
            </Link>
          </div>
        </SignedIn>
      </div>
    </motion.section>
  )
}

export default CallToActionSection
