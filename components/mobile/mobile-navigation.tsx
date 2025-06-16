"use client"

import { useState, useEffect } from "react"
import { Menu, X, Bell, Settings, Clock } from "lucide-react"
import { WalletButton } from "@/components/wallet/wallet-button"
import { motion, AnimatePresence } from "framer-motion"
import { usePrayerTimes } from "@/app/hooks/use-prayer-times"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showNav, setShowNav] = useState(true)
  const { connected, disconnect } = useWallet()
  const { nextPrayer, timeToNext, isLoading: prayerLoading } = usePrayerTimes()
  const router = useRouter()

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

            {connected && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => router.push('/notifications')}
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
                  onClick={() => router.push('/settings')}
                  className="p-3 rounded-2xl glass-button focus-ring relative overflow-hidden group"
                >
                  <Settings className="w-5 h-5 text-indigo-600 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </>
            )}

            {!connected && <WalletButton />}

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

      {/* Enhanced Mobile Menu Slide-out */}
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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto"
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
              <div className="relative">
                {/* Navigation Header */}
                <div className="px-6 py-4 border-b border-indigo-100/30">
                  <h2 className="text-lg font-bold text-slate-800 font-qurova">Navigation</h2>
                  <p className="text-sm text-slate-600 font-queensides">Explore Samaa features</p>
                </div>

                {/* Information Section */}
                <div className="px-6 py-3">
                  <h3 className="text-sm font-semibold text-slate-600 font-queensides uppercase tracking-wide">Information</h3>
                </div>
                <div className="pb-2">
                  {[
                    { title: "About Us", icon: "ℹ️", category: "info", href: "/about" },
                    { title: "SAMAA Token", icon: "🪙", category: "info", href: "/samaa-token" },
                    { title: "Why Web3/Crypto", icon: "🚀", category: "info", href: "/why-web3" },
                    { title: "Dowry/Purse Wallets", icon: "💰", category: "info", href: "/wallet-guide" },
                    { title: "Get Started w/Crypto", icon: "🎓", category: "info", href: "/crypto-guide" },
                    { title: "Support Center", icon: "💬", category: "info", href: "/support" },
                  ].map((item, index) => (
                    <motion.button
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="flex items-center space-x-4 py-3 px-6 hover:bg-indigo-50/50 transition-all duration-200 group w-full text-left"
                      onClick={() => {
                        router.push(item.href)
                        setIsOpen(false)
                      }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-slate-700 font-queensides group-hover:text-indigo-600 transition-colors duration-200">
                          {item.title}
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ))}
                </div>

                {/* Legal Section */}
                <div className="px-6 py-3 border-t border-indigo-100/30">
                  <h3 className="text-sm font-semibold text-slate-600 font-queensides uppercase tracking-wide">Legal</h3>
                </div>
                <div className="pb-2">
                  {[
                    { title: "User Agreement", icon: "📋", href: "/terms" },
                    { title: "Privacy Policy", icon: "🔒", href: "/privacy" },
                  ].map((item, index) => (
                    <motion.button
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 6) * 0.1, duration: 0.4 }}
                      className="flex items-center space-x-4 py-3 px-6 hover:bg-indigo-50/50 transition-all duration-200 group w-full text-left"
                      onClick={() => {
                        router.push(item.href)
                        setIsOpen(false)
                      }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-slate-700 font-queensides group-hover:text-indigo-600 transition-colors duration-200">
                          {item.title}
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ))}
                </div>

                {/* Account Section - Only show if connected */}
                {connected && (
                  <>
                    <div className="px-6 py-3 border-t border-indigo-100/30">
                      <h3 className="text-sm font-semibold text-slate-600 font-queensides uppercase tracking-wide">Account</h3>
                    </div>
                    <div className="pb-2">
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="flex items-center space-x-4 py-3 px-6 hover:bg-red-50/50 transition-all duration-200 group w-full text-left"
                        onClick={() => {
                          disconnect()
                          setIsOpen(false)
                        }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <span className="text-lg">🔌</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-slate-700 font-queensides group-hover:text-red-600 transition-colors duration-200">
                            Disconnect Wallet
                          </span>
                        </div>
                        <svg
                          className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </motion.button>
                    </div>
                  </>
                )}

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
