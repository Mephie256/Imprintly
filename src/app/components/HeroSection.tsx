'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import PlayIcon from './PlayIcon'
import SlidingImageCarousel from './SlidingImageCarousel'

interface HeroSectionProps {
  staggerContainer: any
  fadeInUp: any
}

const HeroSection: React.FC<HeroSectionProps> = ({
  staggerContainer,
  fadeInUp,
}) => {
  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        variants={fadeInUp}
        className="inline-flex items-center bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 backdrop-blur-sm text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl mb-6 border border-emerald-500/20 shadow-lg">
        <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
        New! Enhanced Font Rendering Engine
      </motion.div>

      <motion.h1
        variants={fadeInUp}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
        Text Behind Effects,{' '}
        <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
          Made Easy.
        </span>
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed font-medium px-2 sm:px-0">
        Create stunning text-behind-subject effects. Place text behind your
        foreground subjects for professional visuals that stand out with our
        intuitive editor.
      </motion.p>
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
        {/* Buttons for signed-out users */}
        <SignedOut>
          <motion.a
            href="/auth/custom-signup"
            className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-base transition-all duration-200 w-full sm:w-auto shadow-xl hover:shadow-2xl border border-emerald-400/20"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}>
            <span className="relative z-10 flex items-center justify-center">
              Start Creating Free
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
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          </motion.a>

          <motion.a
            href="#features"
            className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl text-base transition-all duration-200 flex items-center justify-center w-full sm:w-auto border border-white/20 hover:border-white/30"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}>
            <PlayIcon />
            <span className="ml-2">Watch Demo</span>
          </motion.a>
        </SignedOut>

        {/* Buttons for signed-in users */}
        <SignedIn>
          <motion.a
            href="/dashboard"
            className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-base transition-all duration-200 w-full sm:w-auto shadow-xl hover:shadow-2xl border border-emerald-400/20"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}>
            <span className="relative z-10 flex items-center justify-center">
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
              Go to Dashboard
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
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          </motion.a>

          <motion.a
            href="#features"
            className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl text-base transition-all duration-200 flex items-center justify-center w-full sm:w-auto border border-white/20 hover:border-white/30"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}>
            <PlayIcon />
            <span className="ml-2">Explore Features</span>
          </motion.a>
        </SignedIn>
      </motion.div>
      <motion.h2
        variants={fadeInUp}
        className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-3 sm:mb-4 px-2 sm:px-0">
        See The Magic
      </motion.h2>
      <motion.p
        variants={fadeInUp}
        className="text-sm sm:text-base leading-6 sm:leading-7 text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto font-medium px-4 sm:px-0">
        Create stunning text-behind-subject effects in just a few clicks. See
        how text placed behind your subject creates professional depth.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center max-w-5xl mx-auto px-4 sm:px-0">
        <motion.div
          variants={fadeInUp}
          className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-bold text-white">Before</h3>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="aspect-video rounded-xl relative overflow-hidden shadow-xl">
            <Image
              src="https://i.ibb.co/dwcN6zg0/macos-sierra-glacier-mountains-snow-covered-alpenglow-5120x2880-6420.jpg"
              alt="Original Image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
          <p className="text-gray-400 mt-3 text-center text-sm">
            Plain image without text behind effect
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="group relative bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
            <h3 className="text-lg font-bold text-emerald-400">
              After Imprintify
            </h3>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="aspect-video rounded-xl relative overflow-hidden shadow-xl">
            <Image
              src="https://i.ibb.co/LX0fnS4G/DENIS-3.png"
              alt="Image with Text Overlay"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
          <p className="text-emerald-300 mt-3 text-center text-sm">
            Professional text behind effect added
          </p>
        </motion.div>
      </div>

      <motion.p
        variants={fadeInUp}
        className="text-xs text-gray-500 mt-8 italic">
        Illustrative example. Actual results depend on your creativity and
        chosen assets!
      </motion.p>

      {/* Sliding Image Carousel */}
      <motion.div variants={fadeInUp} className="mt-16">
        <SlidingImageCarousel />
      </motion.div>
    </motion.section>
  )
}

export default HeroSection
