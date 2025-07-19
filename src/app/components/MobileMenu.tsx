import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

interface MobileMenuProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({ setIsOpen }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="md:hidden mt-3 py-3 bg-gray-800/90 backdrop-blur-md shadow-lg rounded-xl mx-4 border border-white/10">
      <Link
        href="#features"
        className="block px-4 py-3 text-sm hover:bg-gray-700/70 transition-colors touch-target"
        onClick={() => setIsOpen(false)}>
        <motion.span whileHover={{ scale: 1.05 }}>Features</motion.span>
      </Link>
      <Link
        href="#pricing"
        className="block px-4 py-3 text-sm hover:bg-gray-700/70 transition-colors touch-target"
        onClick={() => setIsOpen(false)}>
        <motion.span whileHover={{ scale: 1.05 }}>Pricing</motion.span>
      </Link>

      <SignedOut>
        <Link
          href="/auth/custom-login"
          className="block px-4 py-3 text-sm hover:bg-gray-700/70 transition-colors touch-target"
          onClick={() => setIsOpen(false)}>
          <motion.span whileHover={{ scale: 1.05 }}>Log In</motion.span>
        </Link>
        <Link
          href="/auth/custom-signup"
          className="block px-4 py-3 text-sm text-emerald-400 hover:bg-gray-700/70 transition-colors font-semibold touch-target"
          onClick={() => setIsOpen(false)}>
          <motion.span whileHover={{ scale: 1.05 }}>Get Started</motion.span>
        </Link>
      </SignedOut>

      <SignedIn>
        <div className="px-4 py-2">
          <Link
            href="/dashboard"
            className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-400/20 flex items-center w-full"
            onClick={() => setIsOpen(false)}>
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center w-full">
              <svg
                className="w-4 h-4 mr-3"
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
              Go to Dashboard
              <svg
                className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200"
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
        </div>
        <div className="px-4 py-2 mt-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  'w-10 h-10 rounded-xl shadow-lg border-2 border-emerald-400/20',
                userButtonPopoverCard: 'shadow-2xl border border-gray-200',
                userButtonPopoverActionButton: 'hover:bg-emerald-50',
              },
            }}
          />
        </div>
      </SignedIn>
    </motion.div>
  )
}

export default MobileMenu
