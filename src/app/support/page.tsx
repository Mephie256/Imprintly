'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  HelpCircle,
  Book,
  Zap,
  CheckCircle,
  Clock,
  Users,
  Star,
  Send,
  ExternalLink,
  LayoutDashboard,
  Plus,
  FolderOpen,
} from 'lucide-react'

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  })

  const categories = [
    { id: 'general', label: 'General Support', icon: HelpCircle },
    { id: 'billing', label: 'Billing & Plans', icon: Zap },
    { id: 'technical', label: 'Technical Issues', icon: MessageCircle },
    { id: 'feature', label: 'Feature Request', icon: Star },
  ]

  const faqs = [
    {
      question: 'How do I create text-behind effects?',
      answer:
        'Simply upload an image, add your text, and our AI will automatically create the text-behind-object effect. You can customize fonts, colors, and positioning.',
    },
    {
      question: 'What file formats are supported?',
      answer:
        'We support JPG, PNG, and WebP image formats. For best results, use high-resolution images with clear subjects.',
    },
    {
      question: 'How many effects can I create on the free plan?',
      answer:
        'The free plan includes 3 text-behind effects total. Upgrade to Pro for unlimited effects and premium features.',
    },
    {
      question: 'Can I download my creations in high quality?',
      answer:
        'Yes! Pro users can download in 4K resolution. Free users get standard quality downloads.',
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Create mailto link with form data
    const subject = encodeURIComponent(
      `[${formData.category.toUpperCase()}] ${formData.subject}`
    )
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Category: ${formData.category}

Message:
${formData.message}
    `)

    window.location.href = `mailto:denisincredible8@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-around py-2 px-4">
          <Link
            href="/dashboard"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Dashboard</span>
          </Link>
          <Link
            href="/create"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <Plus className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Create</span>
          </Link>
          <Link
            href="/dashboard/projects"
            className="flex flex-col items-center p-2 text-gray-400 hover:text-white">
            <FolderOpen className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Projects</span>
          </Link>
          <Link
            href="/support"
            className="flex flex-col items-center p-2 text-emerald-400">
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Support</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6 space-y-4 md:space-y-0">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-all duration-200 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 hover:border-emerald-500/30">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>

              {/* App Logo */}
              <Link
                href="/"
                className="inline-flex items-center space-x-3 group">
                <div className="relative">
                  <Image
                    src="https://i.ibb.co/0RYBCCPp/imageedit-3-7315062423.png"
                    alt="Imprintly Logo"
                    width={32}
                    height={32}
                    className="transition-transform duration-200 group-hover:scale-110"
                    priority
                  />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  Imprintly Support
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help & Support
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get the support you need to create amazing text-behind effects.
              We're here to help!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-emerald-400" />
                  Contact Support
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      What can we help you with?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const Icon = category.icon
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setFormData((prev) => ({
                                ...prev,
                                category: category.id,
                              }))
                            }}
                            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                              selectedCategory === category.id
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
                            }`}>
                            <Icon className="w-5 h-5 mb-2" />
                            <div className="font-medium text-sm">
                              {category.label}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                      placeholder="Please describe your issue or question in detail..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    Send Message
                  </button>
                </form>

                {/* Direct Contact Info */}
                <div className="mt-8 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Direct Contact
                  </h3>
                  <p className="text-gray-300 mb-3">
                    You can also reach us directly at:
                  </p>
                  <a
                    href="mailto:denisincredible8@gmail.com"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-200">
                    denisincredible8@gmail.com
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6">
              {/* Response Time */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Response Time
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">
                      General: 24-48 hours
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">
                      Technical: 12-24 hours
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">
                      Billing: 6-12 hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Book className="w-5 h-5 text-emerald-400" />
                  Quick Links
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/create"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-sm">
                    → Create Text Effects
                  </Link>
                  <Link
                    href="/dashboard/billing"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-sm">
                    → Billing & Plans
                  </Link>
                  <Link
                    href="/profile"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-sm">
                    → Profile Settings
                  </Link>
                  <Link
                    href="/"
                    className="block text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-sm">
                    → Back to Home
                  </Link>
                </div>
              </div>

              {/* Community */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Community
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Join our community for tips, tricks, and inspiration!
                </p>
                <div className="space-y-2">
                  <div className="text-gray-400 text-xs">Coming soon...</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
