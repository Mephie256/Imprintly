'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Plus, FolderOpen, User } from 'lucide-react'
import { motion } from 'framer-motion'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  route: string
  isActive?: boolean
}

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      route: '/dashboard',
      isActive: pathname === '/dashboard',
    },
    {
      icon: Plus,
      label: 'Create',
      route: '/create',
      isActive: pathname === '/create',
    },
    {
      icon: FolderOpen,
      label: 'Projects',
      route: '/dashboard/projects',
      isActive: pathname === '/dashboard/projects',
    },
    {
      icon: User,
      label: 'Profile',
      route: '/profile',
      isActive: pathname === '/profile',
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-insets">
      <div className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.route}
                href={item.route}
                className="relative flex flex-col items-center justify-center p-2 min-w-[60px] touch-target">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center justify-center transition-all duration-200 ${
                    item.isActive ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                  
                  {/* Active indicator */}
                  {item.isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-1 w-8 h-1 bg-emerald-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <div className={`p-2 rounded-xl transition-all duration-200 ${
                    item.isActive 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Label */}
                  <span className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                    item.isActive ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
