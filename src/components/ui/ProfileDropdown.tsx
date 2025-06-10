'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useUserProfile } from '@/contexts/UserContext'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, CreditCard, HelpCircle, LogOut } from 'lucide-react'

export default function ProfileDropdown() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { userProfile } = useUserProfile()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    signOut()
    setIsOpen(false)
  }

  const userInitials = (
    userProfile?.first_name?.[0] ||
    user?.firstName?.[0] ||
    'U'
  ).toUpperCase()

  const userName =
    userProfile?.full_name ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'User'

  const userEmail =
    userProfile?.email || user?.emailAddresses?.[0]?.emailAddress || ''

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Picture Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="group relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
        {userProfile?.avatar_url || user?.imageUrl ? (
          <Image
            src={userProfile?.avatar_url || user?.imageUrl || ''}
            alt={userName}
            width={64}
            height={64}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg rounded-full">
            {userInitials}
          </div>
        )}

        {/* Online Status Indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900 shadow-lg">
          <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute right-0 top-full mt-2 w-72 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
            {/* User Info Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {userProfile?.avatar_url || user?.imageUrl ? (
                    <Image
                      src={userProfile?.avatar_url || user?.imageUrl || ''}
                      alt={userName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/30"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-emerald-400/30">
                      {userInitials}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-base truncate">
                    {userName}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">{userEmail}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5"></div>
                    <span className="text-emerald-400 text-xs font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {/* Account Settings */}
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    Profile Settings
                  </div>
                  <div className="text-gray-400 text-xs">
                    Manage your account
                  </div>
                </div>
              </Link>

              {/* Billing */}
              <Link
                href="/dashboard/billing"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    Billing & Plans
                  </div>
                  <div className="text-gray-400 text-xs">
                    Manage subscription
                  </div>
                </div>
              </Link>

              {/* Support */}
              <Link
                href="/support"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    Help & Support
                  </div>
                  <div className="text-gray-400 text-xs">Get assistance</div>
                </div>
              </Link>

              {/* Divider */}
              <div className="my-2 border-t border-white/10"></div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200 group">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <LogOut className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Sign Out</div>
                  <div className="text-gray-400 text-xs">End your session</div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
