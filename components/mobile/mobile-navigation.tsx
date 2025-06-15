"use client"

import { useState, useEffect } from "react"
import { Menu, X, Bell, Settings, Clock } from "lucide-react"
import { WalletButton } from "@/components/wallet/wallet-button"
import { motion, AnimatePresence } from "framer-motion"
import { usePrayerTimes } from "@/app/hooks/use-prayer-times"
import { VoiceButton } from "@/components/ui/voice-button"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showNav, setShowNav] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // This would come from your auth context in a real app
  const { nextPrayer, timeToNext, isLoading: prayerLoading } = usePrayerTimes()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false)
      } else {
        setShowNav(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <>
      <motion.nav
        animate={{
          y: showNav ? 0 : -100,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 left-0 right-0 z-40 glass-nav border-b border-indigo-100/30"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center">
            <span className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight font-qurova">
              Samaa
            </span>
          </motion.div>

          <div className="flex items-center space-x-3">
            {/* Prayer Time Indicator */}
            {!prayerLoading && nextPrayer && timeToNext && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
              >
                <Clock className="w-4 h-4 text-indigo-600" />
                <div className="text-sm font-queensides">
                  <span className="font-medium text-indigo-700">{nextPrayer}</span>
                  <span className="text-indigo-500 ml-1">in {timeToNext}</span>
                </div>
              </motion.div>
            )}

            {isLoggedIn && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-2xl glass-button focus-ring relative overflow-hidden group"
                >
                  <Bell className="w-5 h-5 text-indigo-600 relative z-10" />
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-2xl glass-button focus-ring relative overflow-hidden group"
                >
                  <Settings className="w-5 h-5 text-indigo-600 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>

                {/* Voice Button */}
                <VoiceButton size="sm" />
              </>
            )}

            {!isLoggedIn && <WalletButton />}

            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-2xl glass-button focus-ring relative overflow-hidden group"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                {isOpen ? <X className="w-5 h-5 text-indigo-600" /> : <Menu className="w-5 h-5 text-indigo-600" />}
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30"
          >
            {/* Beautiful celestial backdrop */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-blue-500/40 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-24 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
              style={{
                border: "2px solid transparent",
                backgroundImage:
                  "linear-gradient(white, white), linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.3))",
                backgroundOrigin: "border-box",
                backgroundClip: "content-box, border-box",
              }}
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 pointer-events-none" />

              {/* Inner border glow */}
              <div className="absolute inset-0 rounded-3xl border border-indigo-100/30 pointer-events-none" />
              <div className="relative p-8 space-y-2">
                {[
                  { title: "How It Works", icon: "🔄" },
                  { title: "Success Stories", icon: "💕" },
                  { title: "Safety & Privacy", icon: "🛡️" },
                  { title: "Islamic Guidelines", icon: "☪️" },
                ].map((item, index) => (
                  <motion.a
                    key={item.title}
                    href="#"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex items-center space-x-4 py-4 px-6 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 font-medium text-slate-700 hover:text-indigo-600 focus-ring group font-qurova"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="relative">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </span>
                      {/* Subtle glow effect on hover */}
                      <div className="absolute inset-0 bg-indigo-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 blur-sm" />
                    </div>
                    <span className="font-medium tracking-wide text-lg font-qurova">{item.title}</span>
                    <motion.div
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ x: 4 }}
                    >
                      <svg
                        className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </motion.a>
                ))}

                {/* Beautiful footer with celestial touch */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="mt-8 pt-6 border-t border-indigo-100/50"
                >
                  <div className="text-center">
                    <p className="text-base text-slate-500 font-qurova mb-2">سماء - Where hearts meet heaven</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" />
                      <div
                        className="w-1 h-1 bg-purple-300 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      />
                      <div
                        className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
