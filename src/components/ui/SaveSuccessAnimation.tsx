'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Cloud, Sparkles, ArrowRight } from 'lucide-react'

interface SaveSuccessAnimationProps {
  isVisible: boolean
  onComplete: () => void
  projectTitle?: string
  imageUrl?: string
}

export default function SaveSuccessAnimation({ 
  isVisible, 
  onComplete, 
  projectTitle = "Your Project",
  imageUrl 
}: SaveSuccessAnimationProps) {
  const [stage, setStage] = useState<'uploading' | 'success' | 'complete'>('uploading')

  useEffect(() => {
    if (isVisible) {
      setStage('uploading')
      
      // Simulate upload progress
      const timer1 = setTimeout(() => {
        setStage('success')
      }, 1500)

      const timer2 = setTimeout(() => {
        setStage('complete')
      }, 3000)

      const timer3 = setTimeout(() => {
        onComplete()
      }, 4500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative max-w-md w-full mx-4"
        >
          {/* Main Card */}
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 rounded-full blur-3xl"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8">
              
              {/* Stage 1: Uploading */}
              <AnimatePresence mode="wait">
                {stage === 'uploading' && (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                  >
                    {/* Animated Cloud Icon */}
                    <div className="relative mb-6">
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
                      >
                        <Cloud className="w-10 h-10 text-white" />
                      </motion.div>
                      
                      {/* Floating Particles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -30, 0],
                            x: [0, Math.sin(i) * 20, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                          }}
                          className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                          style={{
                            left: `${50 + Math.cos(i * 60) * 30}%`,
                            top: `${50 + Math.sin(i * 60) * 30}%`,
                          }}
                        />
                      ))}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      Uploading to Cloud
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Saving your masterpiece to secure cloud storage...
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      />
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full"
                      />
                      Processing your image...
                    </div>
                  </motion.div>
                )}

                {/* Stage 2: Success */}
                {stage === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    {/* Success Icon with Burst Effect */}
                    <div className="relative mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring", 
                          duration: 0.6,
                          delay: 0.2
                        }}
                        className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg relative"
                      >
                        <CheckCircle className="w-10 h-10 text-white" />
                        
                        {/* Burst Effect */}
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ 
                              scale: [0, 1, 0],
                              opacity: [1, 1, 0],
                              x: Math.cos(i * 45 * Math.PI / 180) * 40,
                              y: Math.sin(i * 45 * Math.PI / 180) * 40,
                            }}
                            transition={{
                              duration: 0.8,
                              delay: 0.3,
                              ease: "easeOut"
                            }}
                            className="absolute w-3 h-3 bg-emerald-400 rounded-full"
                          />
                        ))}
                      </motion.div>

                      {/* Sparkles */}
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            duration: 1.5,
                            delay: 0.5 + i * 0.1,
                            ease: "easeInOut"
                          }}
                          className="absolute"
                          style={{
                            left: `${50 + Math.cos(i * 30) * 60}%`,
                            top: `${50 + Math.sin(i * 30) * 60}%`,
                          }}
                        >
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                      ))}
                    </div>

                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-bold text-white mb-2"
                    >
                      🎉 Success!
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-gray-300 mb-4"
                    >
                      <span className="font-semibold text-emerald-400">"{projectTitle}"</span> has been saved to your dashboard
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center justify-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-full px-4 py-2 border border-emerald-500/20"
                    >
                      <Cloud className="w-4 h-4" />
                      Safely stored in cloud
                    </motion.div>
                  </motion.div>
                )}

                {/* Stage 3: Complete */}
                {stage === 'complete' && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center"
                  >
                    <div className="mb-6">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      Ready to View!
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Redirecting to your dashboard...
                    </p>

                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="flex items-center justify-center gap-2 text-emerald-400"
                    >
                      <span>Taking you to dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
