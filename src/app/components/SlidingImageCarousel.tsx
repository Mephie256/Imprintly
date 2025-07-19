'use client'

import { motion, useAnimation } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const SlidingImageCarousel = () => {
  // Array of images from the slider folder
  const images = [
    '/slider/imprintly-1752780430047.png',
    '/slider/imprintly-1752857409951.png',
    '/slider/imprintly-1752858017950.png',
    '/slider/imprintly-1752859296672.png',
    '/slider/imprintly-1752859841412.jpeg',
    '/slider/imprintly-1752861638799.png',
    '/slider/imprintly-1752861856508.jpeg',
    '/slider/imprintly-1752862049136.png',
    '/slider/imprintly-1752862281617.png',
  ]

  // Triple the images array for seamless infinite loop
  const duplicatedImages = [...images, ...images, ...images]

  // Animation controls
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)

  // Calculate the width needed for one complete set of images (responsive)
  const imageWidth = 280 // Base width for mobile, will be overridden by CSS
  const singleSetWidth = images.length * imageWidth

  useEffect(() => {
    const startAnimation = async () => {
      if (!isHovered) {
        // Start from the beginning of the second set to create seamless loop
        await controls.set({ x: 0 })

        // Animate to the end of the second set
        await controls.start({
          x: -singleSetWidth,
          transition: {
            duration: 180, // 3 minutes for smooth snail-like movement
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        })
      }
    }

    startAnimation()
  }, [controls, isHovered, singleSetWidth])

  const handleMouseEnter = () => {
    setIsHovered(true)
    controls.stop()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div className="relative w-full overflow-hidden py-6 sm:py-8">
      {/* Section Title */}
      <div className="text-center mb-6 sm:mb-8 px-4 sm:px-0">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
          Created with{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            Imprintify
          </span>
        </h3>
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-2 sm:px-0">
          See what our users have created with our text-behind-object effects
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden group">
        {/* Pause Indicator */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            Paused
          </motion.div>
        )}
        {/* Left Gradient Overlay */}
        <div className="absolute left-0 top-0 w-16 sm:w-32 md:w-48 lg:w-64 h-full bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />

        {/* Right Gradient Overlay */}
        <div className="absolute right-0 top-0 w-16 sm:w-32 md:w-48 lg:w-64 h-full bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />

        {/* Sliding Images Container */}
        <motion.div
          className="flex gap-3 sm:gap-4 md:gap-6 h-full"
          animate={controls}
          style={{
            width: `${duplicatedImages.length * imageWidth}px`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          {duplicatedImages.map((image, index) => (
            <motion.div
              key={`${image}-${index}`}
              className="relative flex-shrink-0 h-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
              style={{
                width: 'clamp(200px, 25vw, 320px)', // Responsive width
                minWidth: '200px',
                maxWidth: '320px',
              }}
              whileHover={{
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 },
              }}>
              <Image
                src={image}
                alt={`Imprintify creation ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300"
                sizes="320px"
                priority={index < 6} // Prioritize first set of images for performance
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                <div className="p-4 text-center">
                  <p className="text-white text-sm font-medium">
                    Text Behind Effect
                  </p>
                  <p className="text-emerald-400 text-xs">
                    Created with Imprintify
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Text */}
      <div className="text-center mt-6 sm:mt-8 px-4 sm:px-0">
        <p className="text-gray-400 text-xs sm:text-sm">
          Join thousands of creators making stunning visuals
        </p>
      </div>
    </div>
  )
}

export default SlidingImageCarousel
