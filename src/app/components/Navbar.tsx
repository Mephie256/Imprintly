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
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="py-4 px-6 bg-gray-900/80 backdrop-blur-xl shadow-lg fixed w-full z-50 border-b border-gray-800/30 rounded-b-2xl">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="https://i.ibb.co/0RYBCCPp/imageedit-3-7315062423.png"
              alt="Imprintly Logo"
              width={32}
              height={32}
              priority
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-white">Imprintly</span>
          </Link>
        </motion.div>

        {/* Center Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link
            href="#features"
            className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
            <motion.span whileHover={{ scale: 1.05 }}>Features</motion.span>
          </Link>
          <Link
            href="#pricing"
            className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
            <motion.span whileHover={{ scale: 1.05 }}>Pricing</motion.span>
          </Link>
        </div>

        {/* Right side - CTA and Auth */}
        <div className="flex items-center space-x-4">
          <SignedOut>
            {/* Login button - hidden on mobile */}
            <Link
              href="/auth/custom-login"
              className="hidden md:block text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              <motion.span whileHover={{ scale: 1.05 }}>Log In</motion.span>
            </Link>

            {/* Main CTA Button */}
            <Link
              href="/auth/custom-signup"
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-400/20">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Try Imprintly Now</span>
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-400/20">
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </motion.span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    'w-9 h-9 rounded-xl shadow-lg border border-emerald-400/20',
                  userButtonPopoverCard: 'shadow-xl border border-gray-200',
                  userButtonPopoverActionButton: 'hover:bg-emerald-50',
                },
              }}
            />
          </SignedIn>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2">
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      )}
    </motion.nav>
  )
}

export default Navbar
