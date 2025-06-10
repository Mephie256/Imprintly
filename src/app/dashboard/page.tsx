'use client'

import { useUser } from '@clerk/nextjs'
import {
  useUserProfile,
  useUsageLimits,
  useHasPremiumAccess,
} from '@/contexts/UserContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUserProjects,
  createProject,
  downloadProject,
} from '@/lib/project-service'
import { Project } from '@/lib/project-service'
import Link from 'next/link'
import Image from 'next/image'
import ClientOnly from '@/components/ClientOnly'
import ProfileDropdown from '@/components/ui/ProfileDropdown'
import UpgradeModal from '@/components/ui/UpgradeModal'
import {
  Crown,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Images,
  FolderOpen,
  TrendingUp,
  User,
  Clock,
  Download,
  ChevronRight,
  Calendar,
  Bolt,
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const { userProfile, loading, refreshUserProfile } = useUserProfile()
  const {
    currentUsage,
    remainingUsage,
    hasReachedLimit,
    usagePercentage,
    currentLimit,
  } = useUsageLimits()
  const hasPremiumAccess = useHasPremiumAccess()

  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Get plan-specific information with Pro styling
  const getPlanInfo = () => {
    const tier = userProfile?.subscription_tier || 'free'
    const status = userProfile?.subscription_status || 'inactive'
    const isActivePro =
      (tier === 'monthly' || tier === 'yearly') && status === 'active'

    switch (tier) {
      case 'yearly':
        return {
          name: 'Yearly Pro',
          displayName: isActivePro ? 'Pro' : 'Yearly Pro',
          color: 'text-yellow-400',
          bgColor: 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20',
          borderColor: 'border-yellow-500/30',
          badgeColor: 'text-yellow-400',
          badgeBg: 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20',
          badgeBorder: 'border-yellow-500/30',
          limit: 10000,
          isUnlimited: true,
          isPro: isActivePro,
        }
      case 'monthly':
        return {
          name: 'Monthly Pro',
          displayName: isActivePro ? 'Pro' : 'Monthly Pro',
          color: 'text-yellow-400',
          bgColor: 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20',
          borderColor: 'border-yellow-500/30',
          badgeColor: 'text-yellow-400',
          badgeBg: 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20',
          badgeBorder: 'border-yellow-500/30',
          limit: 1000,
          isUnlimited: true,
          isPro: isActivePro,
        }
      default:
        return {
          name: 'Free',
          displayName: 'Free',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          badgeColor: 'text-gray-400',
          badgeBg: 'bg-gray-500/20',
          badgeBorder: 'border-gray-500/30',
          limit: 3,
          isUnlimited: false,
          isPro: false,
        }
    }
  }

  const planInfo = getPlanInfo()

  // Load user projects
  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  // Refresh projects when returning to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        console.log('🔄 Dashboard focused, refreshing projects...')
        loadProjects()
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('🔄 Dashboard visible, refreshing projects...')
        loadProjects()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  const loadProjects = async () => {
    if (!user) return

    setLoadingProjects(true)
    try {
      const userProjects = await getUserProjects(user.id)
      console.log('📊 Loaded projects:', userProjects.length)

      // Debug: Check actual image URLs
      userProjects.forEach((project, index) => {
        console.log(`🔍 Project ${index + 1} URL:`, project.image_url)
        if (project.image_url && project.image_url.includes('cloudinary')) {
          const url = new URL(project.image_url)
          console.log(`🌐 Hostname: ${url.hostname}`)
        }
      })

      setProjects(userProjects)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleCreateProject = async () => {
    if (!user || hasReachedLimit) return

    try {
      const newProject = await createProject(user.id, {
        title: `New Project ${projects.length + 1}`,
        description: 'A new image overlay project',
        image_url: 'https://via.placeholder.com/800x600',
        overlay_config: {
          text: 'Sample Text',
          fontSize: 48,
          color: '#ffffff',
          position: { x: 50, y: 50 },
        },
      })

      if (newProject) {
        setProjects([newProject, ...projects])
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleDownloadProject = async (project: Project) => {
    try {
      console.log('📥 Downloading project:', project.title)
      const success = await downloadProject(project)

      if (success) {
        console.log('✅ Download completed successfully')
      } else {
        alert('❌ Download failed. Please try again.')
      }
    } catch (error) {
      console.error('❌ Download error:', error)
      alert(
        'Download failed: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      )
    }
  }

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

  // Sync subscription status with Stripe
  const handleSyncSubscription = async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      const response = await fetch('/api/sync-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Subscription synced:', result)

        // Refresh user profile to get updated data
        if (refreshUserProfile) {
          await refreshUserProfile()
        }

        alert(`✅ Subscription synced! Status: ${result.subscription_tier}`)
      } else {
        const error = await response.json()
        console.error('❌ Sync failed:', error)
        alert('❌ Failed to sync subscription. Please try again.')
      }
    } catch (error) {
      console.error('❌ Sync error:', error)
      alert('❌ Failed to sync subscription. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background flex items-center justify-center">
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">
            Loading your dashboard...
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Preparing your workspace
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
      <div className="relative z-10 flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 min-h-screen">
          <div className="p-6">
            {/* App Logo */}
            <Link
              href="/"
              className="inline-flex items-center space-x-3 group mb-8">
              <div className="relative">
                <Image
                  src="https://i.ibb.co/0RYBCCPp/imageedit-3-7315062423.png"
                  alt="Imprintly Logo"
                  width={40}
                  height={40}
                  className="transition-transform duration-200 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  Imprintly
                </span>
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                MAIN MENU
              </div>

              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                href="/create"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create</span>
              </Link>

              <Link
                href="/dashboard/projects"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200">
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium">Projects</span>
              </Link>

              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-8">
                OTHERS
              </div>

              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered')
                  loadProjects()
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 w-full text-left">
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Refresh Projects</span>
              </button>

              {/* Sync Subscription Button - For Testing */}
              <button
                onClick={handleSyncSubscription}
                disabled={isSyncing}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed">
                <div className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`}>
                  {isSyncing ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Crown className="w-5 h-5" />
                  )}
                </div>
                <span className="font-medium">
                  {isSyncing ? 'Syncing...' : 'Sync Subscription'}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {/* Header - Enhanced with Profile */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Welcome back,{' '}
                  {userProfile?.first_name || user?.firstName || 'Creator'}! 👋
                </h1>
                <p className="text-gray-400 text-sm">
                  Here's what's happening with your projects today.
                </p>
              </div>

              {/* Right Side - Usage Indicator and Profile */}
              <div className="flex items-center space-x-4">
                {/* Refresh Button */}
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered')
                    loadProjects()
                  }}
                  disabled={loadingProjects}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 disabled:cursor-not-allowed"
                  title="Refresh Projects">
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loadingProjects ? 'animate-spin' : ''
                    }`}
                  />
                </button>
                {/* Circular Usage Indicator */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center relative overflow-hidden">
                    {/* Progress Ring */}
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          (currentUsage / currentLimit) * 283
                        } 283`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Content */}
                    <div className="text-center z-10">
                      <div className="text-sm font-bold text-white">
                        {Math.round((currentUsage / currentLimit) * 100)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {currentUsage}/{currentLimit}
                      </div>
                    </div>
                  </div>

                  {/* Usage Label */}
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
                    <div className="text-xs text-gray-400 text-center">
                      Usage
                    </div>
                  </div>
                </div>

                {/* Profile Dropdown */}
                <ClientOnly>
                  <ProfileDropdown />
                </ClientOnly>
              </div>
            </div>

            {/* Stats Cards - Template Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Images Created */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Images className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-md">
                    {planInfo.isUnlimited
                      ? 'Unlimited'
                      : `${currentUsage}/${currentLimit}`}
                  </div>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {currentUsage.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  Images Created{' '}
                  {planInfo.isUnlimited
                    ? '(Unlimited)'
                    : `(${currentLimit} limit)`}
                </div>
              </div>

              {/* Total Projects */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-blue-400 text-xs font-medium bg-blue-500/10 px-2 py-1 rounded-md">
                    +{projects.length}%
                  </div>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {projects.length.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Total Projects</div>
              </div>

              {/* Remaining Usage */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-purple-400 text-xs font-medium bg-purple-500/10 px-2 py-1 rounded-md">
                    {planInfo.isUnlimited
                      ? '∞'
                      : `${Math.round(usagePercentage)}%`}
                  </div>
                </div>
                <div className="text-xl font-bold text-white mb-1">
                  {planInfo.isUnlimited ? '∞' : remainingUsage.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  {planInfo.isUnlimited ? 'Unlimited Usage' : 'Remaining'}
                </div>
              </div>

              {/* Plan Status - Pro Styling */}
              <div
                className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 ${planInfo.borderColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 ${planInfo.bgColor} rounded-lg flex items-center justify-center`}>
                    {planInfo.isPro ? (
                      <Crown className={`w-4 h-4 ${planInfo.color}`} />
                    ) : (
                      <User className={`w-4 h-4 ${planInfo.color}`} />
                    )}
                  </div>

                  {/* Beautiful Pro Badge */}
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${planInfo.badgeBg} ${planInfo.badgeColor} border ${planInfo.badgeBorder}`}>
                    {planInfo.isPro && <Crown className="w-3 h-3" />}
                    <span>{planInfo.displayName}</span>
                  </div>
                </div>

                <div className="text-xl font-bold text-white mb-1">
                  {planInfo.isPro ? (
                    <div className="flex items-center gap-2">
                      <span>{planInfo.name.toUpperCase()}</span>
                      <Crown className="w-5 h-5 text-yellow-400" />
                    </div>
                  ) : (
                    planInfo.name.toUpperCase()
                  )}
                </div>

                <div className="text-xs text-gray-400">
                  Current Plan •{' '}
                  {planInfo.isUnlimited
                    ? 'Unlimited'
                    : `${currentLimit} images`}
                </div>
              </div>
            </div>

            {/* Overview Section - Inspired by Music App Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Main Overview Card - Like the "Blinding Lights" card */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Creative Overview
                    </h3>
                    <p className="text-gray-400">
                      Your creative journey this month
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 bg-white/5 px-3 py-2 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>This month</span>
                  </div>
                </div>

                {/* Mini Stats - Like the numbered cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300">
                    <div className="text-3xl font-bold text-emerald-400 mb-2">
                      {currentUsage}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Images Created
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs text-emerald-400 font-medium">
                        {currentUsage === 0
                          ? 'Ready to create'
                          : currentUsage === 1
                          ? 'Great start! 🚀'
                          : currentUsage === 2
                          ? 'Building momentum! ⚡'
                          : currentUsage >= 3 && planInfo.isUnlimited
                          ? 'Pro creator! 🔥'
                          : currentUsage >= 3
                          ? 'Limit reached'
                          : `+${Math.round(
                              (currentUsage / Math.max(currentUsage, 1)) * 100
                            )}% active`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {projects.length}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Total Projects
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs text-blue-400 font-medium">
                        {projects.length === 0
                          ? 'Start creating'
                          : projects.length === 1
                          ? 'First project! 🎨'
                          : projects.length <= 3
                          ? 'Growing portfolio'
                          : projects.length <= 10
                          ? 'Active creator! 💪'
                          : 'Portfolio master! 🏆'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 text-center hover:bg-white/10 transition-all duration-300">
                    <div
                      className={`text-3xl font-bold mb-2 ${
                        planInfo.isPro ? 'text-yellow-400' : 'text-purple-400'
                      }`}>
                      {planInfo.isUnlimited ? '∞' : remainingUsage}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {planInfo.isUnlimited ? 'Unlimited' : 'Remaining'}
                    </div>
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          planInfo.isPro ? 'bg-yellow-400' : 'bg-purple-400'
                        }`}></div>
                      <span
                        className={`text-xs font-medium flex items-center gap-1 ${
                          planInfo.isPro ? 'text-yellow-400' : 'text-purple-400'
                        }`}>
                        {planInfo.isPro && <Crown className="w-3 h-3" />}
                        {planInfo.isUnlimited
                          ? `${planInfo.displayName} Plan`
                          : `${Math.round(usagePercentage)}% used`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Progress - Enhanced */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-semibold">
                      Usage Progress
                    </span>
                    <span className="text-gray-400 text-sm">
                      {planInfo.isUnlimited
                        ? `${currentUsage} images created`
                        : `${Math.round(usagePercentage)}% of ${currentLimit}`}
                    </span>
                  </div>
                  {planInfo.isUnlimited ? (
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-500 ease-out relative animate-pulse">
                        <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                        {/* Pro crown indicator */}
                        <div className="absolute left-2 top-0 h-3 flex items-center">
                          <Crown className="w-2 h-2 text-yellow-900" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ease-out relative ${
                          usagePercentage >= 80
                            ? 'bg-gradient-to-r from-red-500 to-red-400'
                            : usagePercentage >= 60
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        }`}
                        style={{
                          width: `${Math.min(usagePercentage, 100)}%`,
                        }}>
                        <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Card - Like the "Intentions" card */}
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bolt className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Quick Actions
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Start creating amazing visuals
                  </p>
                </div>

                <div className="space-y-4">
                  <Link
                    href={hasReachedLimit ? '#' : '/create'}
                    className={`block w-full p-4 rounded-2xl transition-all duration-300 ${
                      hasReachedLimit
                        ? 'bg-gray-800/50 cursor-not-allowed border border-gray-600'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 hover:scale-105'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            hasReachedLimit ? 'bg-gray-600' : 'bg-emerald-500'
                          }`}>
                          <Images className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div
                            className={`font-semibold text-lg ${
                              hasReachedLimit ? 'text-gray-400' : 'text-white'
                            }`}>
                            {hasReachedLimit
                              ? 'Limit Reached'
                              : 'Text Behind Effect'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {hasReachedLimit
                              ? 'Upgrade to continue'
                              : 'Create stunning visuals'}
                          </div>
                        </div>
                      </div>
                      {!hasReachedLimit && (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </Link>

                  {!hasPremiumAccess && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      disabled={isUpgrading}
                      className="w-full p-4 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 flex items-center justify-center">
                            {isUpgrading ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                              <Crown className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-white text-lg">
                              {isUpgrading ? 'Processing...' : 'Upgrade to Pro'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {isUpgrading
                                ? 'Please wait...'
                                : 'Unlock all features'}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Projects Section - Enhanced */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Recent Projects
                  </h2>
                  <p className="text-gray-400">Your latest creative works</p>
                </div>
                <Link
                  href="/dashboard/projects"
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl transition-all duration-300 flex items-center space-x-2 border border-white/20 hover:border-white/30">
                  <span>View all</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {loadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10">
                      <div className="aspect-video bg-gray-700/50 animate-pulse"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-700/50 rounded animate-pulse w-2/3 mb-4"></div>
                        <div className="h-3 bg-gray-700/50 rounded animate-pulse w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.slice(0, 6).map((project) => (
                    <div
                      key={project.id}
                      className="group bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
                      <div className="aspect-video bg-gray-700 relative overflow-hidden">
                        <Image
                          src={
                            project.image_url &&
                            (project.image_url.startsWith('http') ||
                              project.image_url.startsWith('data:') ||
                              project.image_url.startsWith('blob:'))
                              ? project.image_url
                              : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkF1dG8tU2F2ZWQgUHJvamVjdDwvdGV4dD48L3N2Zz4='
                          }
                          alt={project.title}
                          fill
                          className="object-cover"
                          onError={() => {
                            console.error(
                              '❌ Image failed to load:',
                              project.image_url
                            )
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Download Button */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleDownloadProject(project)}
                            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors shadow-lg"
                            title={
                              project.image_url &&
                              (project.image_url.startsWith('blob:') ||
                                !project.image_url.startsWith('http'))
                                ? 'Auto-saved project - Re-upload image to download'
                                : 'Download Image'
                            }>
                            <Download className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        {/* Auto-saved indicator */}
                        {project.image_url &&
                          (project.image_url.startsWith('blob:') ||
                            !project.image_url.startsWith('http')) && (
                            <div className="absolute top-4 left-4 bg-yellow-500/90 text-yellow-900 px-2 py-1 rounded-md text-xs font-medium">
                              Auto-saved
                            </div>
                          )}
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-white mb-2 text-xl">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(
                                project.updated_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-emerald-400 font-medium">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl border border-white/10">
                  <div className="w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <FolderOpen className="w-16 h-16 text-gray-400" />
                    {/* Decorative dots */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full opacity-60"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-40"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    No projects yet
                  </h3>
                  <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
                    Start your creative journey by creating your first project.
                    Choose from templates or start from scratch.
                  </p>
                  <Link
                    href="/create"
                    className={`inline-flex items-center px-10 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                      hasReachedLimit
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}>
                    <Images className="w-5 h-5 mr-2" />
                    {hasReachedLimit
                      ? 'Usage Limit Reached - Upgrade to Continue'
                      : 'Create Text Behind Effect'}
                  </Link>
                </div>
              )}
            </div>

            {/* Professional Footer */}
            <div className="text-center py-12 border-t border-white/10">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to create something amazing?
                </h3>
                <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                  Join thousands of creators who use Imprintify to bring their
                  ideas to life with professional text-behind-subject effects.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/create"
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Start Creating
                  </Link>
                  <Link
                    href="/dashboard/projects"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold transition-all duration-200 border border-white/20 hover:border-white/30">
                    View Projects
                  </Link>
                </div>
              </div>

              <div className="flex justify-center space-x-8 text-sm text-gray-400">
                <Link
                  href="/"
                  className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
                <Link
                  href="/about"
                  className="hover:text-emerald-400 transition-colors">
                  About
                </Link>
                <Link
                  href="/pricing"
                  className="hover:text-emerald-400 transition-colors">
                  Pricing
                </Link>
                <Link
                  href="/support"
                  className="hover:text-emerald-400 transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
