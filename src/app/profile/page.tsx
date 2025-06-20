'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Calendar,
  Shield,
  Bell,
  Palette,
  Download,
  Crown,
} from 'lucide-react'
import { useUserProfile, useHasPremiumAccess } from '@/contexts/UserContext'
import { isPremiumUser, getPlanDisplayName } from '@/lib/payment-service'

export default function ProfileSettings() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { userProfile, loading, refreshUserProfile } = useUserProfile()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    preferences: {
      highQuality: true,
    },
  })

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoaded, router])

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        bio: userProfile?.preferences?.bio || '',
        notifications: {
          email: userProfile?.preferences?.email_notifications ?? true,
          push: userProfile?.preferences?.push_notifications ?? true,
          marketing: userProfile?.preferences?.marketing_notifications ?? false,
        },
        preferences: {
          highQuality: userProfile?.preferences?.high_quality_exports ?? true,
        },
      })
    }
  }, [user, userProfile])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Update Clerk profile
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // Update user profile in database
      const { updateUserProfile } = await import('@/lib/user-service')
      await updateUserProfile(user.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        bio: formData.bio,
        email_notifications: formData.notifications.email,
        push_notifications: formData.notifications.push,
        marketing_notifications: formData.notifications.marketing,

        high_quality_exports: formData.preferences.highQuality,
      })

      await refreshUserProfile()
      alert('✅ Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('❌ Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background flex items-center justify-center">
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">
            Loading profile...
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'account', label: 'Account', icon: Shield },
  ]

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-white/20"></div>
              <h1 className="text-2xl font-bold text-white">
                Profile Settings
              </h1>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-800 disabled:to-emerald-900 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              {/* Profile Summary */}
              <div className="text-center mb-8">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover border-2 border-emerald-500/50"
                  />
                </div>
                <h3 className="text-white font-semibold text-lg">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-400 text-sm">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                  isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status)
                    ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status) && (
                    <Crown className="w-3 h-3" />
                  )}
                  {getPlanDisplayName(userProfile?.subscription_tier, userProfile?.subscription_status)} Plan
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                        activeTab === tab.id
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-6">
                      Profile Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 !text-gray-300">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 !text-gray-300">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 !text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed here. Use your account settings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 !text-gray-300">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Notification Preferences
                    </h2>
                    <p className="text-gray-400">
                      Choose how you want to be notified about updates and
                      activities.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'email',
                        label: 'Email Notifications',
                        description: 'Receive notifications via email',
                      },
                      {
                        key: 'push',
                        label: 'Push Notifications',
                        description: 'Receive browser push notifications',
                      },
                      {
                        key: 'marketing',
                        label: 'Marketing Updates',
                        description:
                          'Receive updates about new features and promotions',
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <h3 className="text-white font-medium">
                            {item.label}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              formData.notifications[
                                item.key as keyof typeof formData.notifications
                              ]
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                notifications: {
                                  ...formData.notifications,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      App Preferences
                    </h2>
                    <p className="text-gray-400">
                      Customize your app experience and default settings.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'highQuality',
                        label: 'High Quality Exports',
                        description:
                          'Export images in the highest quality (may be slower)',
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <h3 className="text-white font-medium">
                            {item.label}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              formData.preferences[
                                item.key as keyof typeof formData.preferences
                              ]
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                preferences: {
                                  ...formData.preferences,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Account Settings
                    </h2>
                    <p className="text-gray-400">
                      Manage your account security and subscription.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-6 rounded-xl border transition-all duration-300 ${
                      isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status)
                        ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-yellow-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status)
                              ? 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20'
                              : 'bg-gray-500/20'
                          }`}>
                            {isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status) ? (
                              <Crown className="w-6 h-6 text-yellow-400" />
                            ) : (
                              <User className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-medium flex items-center gap-2">
                              Subscription Plan
                              {isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status) && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                            </h3>
                            <p className={`text-sm ${
                              isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status)
                                ? 'text-yellow-400'
                                : 'text-gray-400'
                            }`}>
                              Current plan: {getPlanDisplayName(userProfile?.subscription_tier, userProfile?.subscription_status)}
                              {isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status) && (
                                <span className="ml-2 text-xs">• Unlimited Access</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/dashboard/billing"
                          className={`px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 font-medium ${
                            isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status)
                              ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}>
                          {isPremiumUser(userProfile?.subscription_tier, userProfile?.subscription_status) ? (
                            <>
                              <Crown className="w-4 h-4" />
                              Manage
                            </>
                          ) : (
                            <>
                              <Crown className="w-4 h-4" />
                              Upgrade
                            </>
                          )}
                        </Link>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">
                            Account Security
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Manage your password and security settings
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                          Security Settings
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-red-400 font-medium">
                            Delete Account
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
