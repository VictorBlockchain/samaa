"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { useVoice, islamicVoiceCommands } from "@/app/hooks/use-voice"
interface VoiceButtonProps {
  onCommand?: (command: string, transcript: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function VoiceButton({ onCommand, className = "", size = "md" }: VoiceButtonProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  const voiceCommands = {
    ...islamicVoiceCommands,
    help: (transcript: string) => {
      speak(
        "Available commands: Go to profile, show prayer times, search, navigate to matches, or say Assalam Alaikum for a greeting.",
      )
    },
    ...(onCommand && { custom: onCommand }),
  }

  const { isListening, isSupported, transcript, confidence, error, startListening, stopListening, speak, speakArabic } =
    useVoice(voiceCommands)

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
      setShowTranscript(false)
    } else {
      startListening()
      setShowTranscript(true)
      // Auto-hide transcript after 15 seconds
      setTimeout(() => setShowTranscript(false), 15000)
    }
  }

  if (!isSupported) {
    return null // Don't render if voice is not supported
  }

  return (
    <div className="relative">
      {/* Voice Button */}
      <motion.button
        onClick={handleVoiceToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          ${sizeClasses[size]}
          ${className}
          relative overflow-hidden rounded-full
          bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400
          shadow-lg border-2 border-white/20
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
          transition-all duration-300
        `}
        disabled={!isSupported}
      >
        {/* Animated background for listening state */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-white/20 rounded-full"
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center h-full">
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <Mic className={`${iconSizes[size]} text-white`} />
            </motion.div>
          ) : (
            <MicOff className={`${iconSizes[size]} text-white`} />
          )}
        </div>

        {/* Pulse effect when listening */}
        {isListening && (
          <motion.div
            animate={{
              scale: [1, 2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
            className="absolute inset-0 bg-indigo-400 rounded-full"
          />
        )}
      </motion.button>

      {/* Transcript Display */}
      <AnimatePresence>
        {showTranscript && (isListening || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 min-w-48 max-w-64 p-3 rounded-2xl bg-white/95 border-indigo-100/50 backdrop-blur-sm border shadow-lg"
          >
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/95" />

            <div className="text-center">
              {isListening ? (
                <div>
                  <div className="text-sm font-medium text-indigo-600 mb-1 font-queensides">Listening...</div>
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                        className="w-1 h-1 rounded-full bg-indigo-500"
                      />
                    ))}
                  </div>
                </div>
              ) : transcript ? (
                <div>
                  <div className="text-sm font-medium text-green-600 mb-1 font-queensides">Heard:</div>
                  <div className="text-base text-slate-700 font-queensides">"{transcript}"</div>
                  {confidence > 0 && (
                    <div className="text-sm mt-1 text-slate-500 font-queensides">
                      Confidence: {Math.round(confidence * 100)}%
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 min-w-48 p-2 rounded-xl bg-red-50/90 border-red-200/50 text-red-700 backdrop-blur-sm border text-sm text-center font-queensides"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Quick voice commands component for help
export function VoiceCommands() {
  const commands = [
    "Say 'Assalam Alaikum' for greeting",
    "Go to profile / matches / messages",
    "Show prayer times",
    "Search for [something]",
    "Help - for available commands",
  ]

  return (
    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/30">
      <div className="flex items-center space-x-2 mb-3">
        <Volume2 className="w-4 h-4 text-indigo-600" />
        <h3 className="font-medium text-base text-slate-700 font-queensides">Voice Commands</h3>
      </div>
      <ul className="space-y-1">
        {commands.map((command, index) => (
          <li key={index} className="text-sm text-slate-600 font-queensides">
            • {command}
          </li>
        ))}
      </ul>
    </div>
  )
}
