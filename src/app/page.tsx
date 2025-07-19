'use client'

import { motion } from 'framer-motion'

// Import components
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import FeaturesSection from './components/FeaturesSection'
import CallToActionSection from './components/CallToActionSection'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'

/**
 * @constant primaryFeatures
 * @description Defines the key features of the application with their names, descriptions, and placeholder icons.
 * These features are displayed in the Features section of the landing page.
 */
const primaryFeatures = [
  {
    name: 'Intuitive Editor',
    description: 'Easily add and style text with our user-friendly interface.',
    icon: '/window.svg', // Placeholder icon for the editor feature
  },
  {
    name: 'Vast Font Library',
    description: 'Access hundreds of Google Fonts to match your brand.',
    icon: '/globe.svg', // Placeholder icon for the font library feature
  },
  {
    name: 'Instant Preview',
    description: 'See your changes live, ensuring pixel-perfect results.',
    icon: '/vercel.svg', // Placeholder icon for the instant preview feature
  },
  {
    name: 'High-Res Exports',
    description:
      'Download your creations in PNG or JPG, ready for any platform.',
    icon: '/file.svg', // Placeholder icon for high-resolution exports
  },
]

/**
 * @constant stats
 * @description Defines key statistics about the application, such as supported fonts, effects created, and happy users.
 * These statistics are displayed in the Stats section of the landing page.
 */
const stats = [
  { id: 1, name: 'Effects Created', value: '25K+' },
  { id: 2, name: 'Fonts Supported', value: '800+' },
  { id: 3, name: 'Happy Users', value: '10K+' },
]

/**
 * @constant fadeInUp
 * @description Framer Motion variant for a fade-in and slide-up animation effect.
 * Used for individual elements to appear smoothly on scroll or load.
 */
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  },
}

/**
 * @constant staggerContainer
 * @description Framer Motion variant for staggering child animations.
 * Used to create a sequential reveal effect for groups of elements.
 */
const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

/**
 * @function LandingPageV2
 * @description The main landing page component for the Imprintly application.
 * This component orchestrates various sections of the page, including navigation, hero, stats, features, call to action, pricing, and footer.
 * It utilizes Framer Motion for animations and organizes content into reusable components for better maintainability.
 */
const LandingPageV2 = () => {
  return (
    <div className="bg-gray-900 text-gray-300 min-h-screen relative modern-background">
      {/* Navigation Section: Displays the main navigation bar with links and mobile menu toggle. */}
      <Navbar />

      {/* Main Content Area: Contains all primary sections of the landing page. */}
      <main className="flex-grow pt-16 sm:pt-20 safe-area-insets">
        {/* Hero Section: Features the main headline, call-to-action buttons, and image comparison. */}
        <HeroSection staggerContainer={staggerContainer} fadeInUp={fadeInUp} />

        {/* Statistics Section: Showcases key metrics and achievements of the application. */}
        <StatsSection
          staggerContainer={staggerContainer}
          fadeInUp={fadeInUp}
          stats={stats}
        />

        {/* Features Section: Highlights the core functionalities and benefits of Imprintly. */}
        <FeaturesSection
          staggerContainer={staggerContainer}
          fadeInUp={fadeInUp}
          primaryFeatures={primaryFeatures}
        />

        {/* Call to Action Section: Encourages users to start creating with a compelling message. */}
        <CallToActionSection fadeInUp={fadeInUp} />

        {/* Pricing Section: Details the different subscription plans available to users. */}
        <PricingSection
          staggerContainer={staggerContainer}
          fadeInUp={fadeInUp}
        />
      </main>

      {/* Footer Section: Contains copyright information and navigation links. */}
      <Footer />
    </div>
  )
}

export default LandingPageV2
