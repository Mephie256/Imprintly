'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { LayoutDashboard, X, Menu, Zap } from 'lucide-react'
import MobileMenu from './MobileMenu'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <motion.section
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="py-4 lg:py-8 px-4 md:px-6  fixed w-full z-50 safe-area-insets">
      <div className="container max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 border bg-black/90 border-white/20 rounded-full p-2 px-4 md:pr-2 items-center">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link href="/" className="flex items-center space-x-2 md:space-x-3">
              <Image
                src="https://i.ibb.co/0RYBCCPp/imageedit-3-7315062423.png"
                alt="Imprintly Logo"
                width={28}
                height={28}
                priority
                className="rounded-lg md:w-8 md:h-8"
              />
              <span className="text-lg md:text-xl font-bold text-white">
                Imprintly
              </span>
            </Link>
          </motion.div>

          {/* Center Navigation - Hidden on mobile */}
          <div className="lg:flex justify-center items-center hidden">
            <nav className="flex gap-6 font-medium">
              <Link
                href="#features"
                className="text-gray-300 hover:text-white transition-colors duration-200">
                <motion.span whileHover={{ scale: 1.05 }}>Features</motion.span>
              </Link>
              <Link
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors duration-200">
                <motion.span whileHover={{ scale: 1.05 }}>Pricing</motion.span>
              </Link>
            </nav>
          </div>

          {/* Right side - CTA and Auth */}
          <div className="flex justify-end gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-white focus:outline-none p-2 touch-target">
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <SignedOut>
              {/* Login button - hidden on mobile */}
              <Link
                href="/auth/custom-login"
                className="hidden md:inline-flex items-center text-gray-300 hover:text-white transition-colors duration-200 font-medium px-4 py-2 rounded-full border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10">
                <motion.span whileHover={{ scale: 1.05 }}>Log In</motion.span>
              </Link>

              {/* Main CTA Button - Responsive */}
              <Link
                href="/auth/custom-signup"
                className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2 md:py-2.5 px-3 md:px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-400/20 touch-target hidden md:inline-flex items-center">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-1 md:space-x-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm md:text-base">
                    Try Imprintly Now
                  </span>
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2 md:py-2.5 px-3 md:px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-400/20 touch-target hidden md:inline-flex items-center">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-1 md:space-x-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      'w-8 h-8 md:w-9 md:h-9 rounded-full shadow-lg border border-emerald-400/20',
                    userButtonPopoverCard: 'shadow-xl border border-gray-200',
                    userButtonPopoverActionButton: 'hover:bg-emerald-50',
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      )}
    </motion.section>
  )
}

export default Navbar
