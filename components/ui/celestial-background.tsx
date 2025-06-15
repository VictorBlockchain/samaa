"use client"

import { motion } from "framer-motion"

interface CelestialBackgroundProps {
  className?: string
  intensity?: "light" | "medium" | "heavy"
  showOverlay?: boolean
}

export function CelestialBackground({ 
  className = "", 
  intensity = "medium",
  showOverlay = true 
}: CelestialBackgroundProps) {
  
  // Different intensities for different contexts
  const starCounts = {
    light: 12,
    medium: 20,
    heavy: 30
  }
  
  const starCount = starCounts[intensity]

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Beautiful celestial gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-blue-500/20" />
      
      {/* Floating celestial elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(starCount)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
              y: [0, -150, -300],
              x: [0, Math.sin(i) * 80, Math.sin(i) * 160],
            }}
            transition={{
              duration: 6 + i * 0.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
            className="absolute"
            style={{
              left: `${5 + i * 4}%`,
              top: `${10 + (i % 5) * 20}%`,
            }}
          >
            <div className={`rounded-full ${
              i % 4 === 0 ? 'w-3 h-3 bg-indigo-300/60' : 
              i % 4 === 1 ? 'w-2 h-2 bg-purple-300/60' : 
              i % 4 === 2 ? 'w-2 h-2 bg-blue-300/60' :
              'w-1 h-1 bg-indigo-400/80'
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Subtle geometric Islamic patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-16 w-40 h-40 border border-indigo-200 rounded-full"></div>
        <div className="absolute bottom-40 right-20 w-32 h-32 border border-purple-200 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-blue-200 transform rotate-45"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-indigo-200 transform rotate-12"></div>
      </div>

      {/* Optional overlay for content readability */}
      {showOverlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10" />
      )}
    </div>
  )
}
