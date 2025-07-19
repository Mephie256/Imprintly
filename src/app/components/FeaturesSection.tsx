'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface FeaturesSectionProps {
  staggerContainer: any
  fadeInUp: any
  primaryFeatures: { name: string; description: string; icon: string }[]
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  staggerContainer,
  fadeInUp,
  primaryFeatures,
}) => {
  return (
    <motion.section
      id="features"
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      className="py-12 sm:py-16 bg-gradient-to-b from-gray-900/50 to-gray-900/80 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 backdrop-blur-sm text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-xl mb-6 border border-emerald-500/20">
          <svg
            className="w-3 h-3 mr-1.5"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Powerful Features
        </motion.div>

        <motion.h2
          variants={fadeInUp}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3 sm:mb-4 px-2 sm:px-0">
          Everything you need to{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            create.
          </span>
        </motion.h2>

        <motion.p
          variants={fadeInUp}
          className="text-sm sm:text-base leading-5 sm:leading-6 text-gray-300 mb-6 sm:mb-10 max-w-2xl mx-auto font-medium px-4 sm:px-0">
          Imprintify offers a comprehensive suite of powerful features designed
          for simplicity, creativity, and professional results.
        </motion.p>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto px-4 sm:px-0">
          {primaryFeatures.map((feature, index) => (
            <motion.div
              variants={fadeInUp}
              key={feature.name}
              whileHover={{
                scale: 1.03,
                y: -4,
                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon Container */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 group-hover:from-emerald-400 group-hover:to-emerald-500 mb-4 shadow-lg transition-all duration-300">
                <Image
                  src={feature.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="filter brightness-0 invert transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold leading-5 text-white mb-2 group-hover:text-emerald-100 transition-colors duration-300">
                  {feature.name}
                </h3>
                <p className="text-sm leading-5 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default FeaturesSection
