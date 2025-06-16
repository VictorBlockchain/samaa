"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Heart } from "lucide-react"

interface RandomMatchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RandomMatchModal({ isOpen, onClose }: RandomMatchModalProps) {

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Celestial Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-blue-500/40 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Simple Message Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arabic-inspired corner decorations */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl z-20"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl z-20"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl z-20"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl z-20"></div>

            {/* Geometric pattern overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-indigo-300/30 rounded-full opacity-20 z-10"></div>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full z-10"></div>
            <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-indigo-300/20 rounded-full z-10"></div>
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 z-30 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 border border-indigo-200/50"
            >
              <X className="w-5 h-5 text-slate-600" />
            </motion.button>

            {/* Simple Message Content */}
            <div className="relative p-8 text-center z-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-indigo-200/50"
              >
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-2xl font-bold text-slate-800 font-qurova mb-4"
              >
                Let Fate Decide
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-slate-600 font-queensides text-lg leading-relaxed mb-8"
              >
                We'll show you a random match based on your settings
              </motion.p>

              {/* Decorative divider */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex items-center justify-center mb-8"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                  <div className="w-4 h-4 border border-indigo-400/60 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                </div>
              </motion.div>

              {/* Coming Soon Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 font-qurova"
                >
                  Coming Soon
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
