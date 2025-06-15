"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CelestialBackground } from "@/components/ui/celestial-background"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show content after initial delay
    const contentTimer = setTimeout(() => setShowContent(true), 300)

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 1000)
          return 100
        }
        return prev + 2.5
      })
    }, 90)

    return () => {
      clearInterval(timer)
      clearTimeout(contentTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center z-50 overflow-hidden">
      <CelestialBackground intensity="heavy" showOverlay={false} />

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-16"
          >
            {/* Enhanced logo container with celestial theme */}
            <div className="relative">
              {/* Middle celestial ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute -inset-8 rounded-full bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-blue-300/30"
              />

              {/* Main logo container with sky gradient */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="relative w-56 h-56 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-blue-500 flex items-center justify-center shadow-2xl border-4 border-white/60"
              >
                <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-white/40">
                  <img
                    src="/images/romantic-muslim-couple-splash.jpg"
                    alt="Romantic Muslim couple under Arabian night sky"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Inner celestial sparkle effect */}
                <motion.div
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-6 rounded-full border-2 border-white/40"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent font-qurova"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Samaa
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced progress section with celestial theme */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="relative w-80 mb-10"
          >
            {/* Progress container with sky gradient */}
            <div className="relative h-4 bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-100 rounded-full overflow-hidden shadow-inner border border-indigo-200/60">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 rounded-full shadow-lg relative overflow-hidden"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Enhanced shimmer effect */}
                <motion.div
                  animate={{ x: [-120, 480] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                />
              </motion.div>

              {/* Progress glow with celestial colors */}
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-sm opacity-60"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
