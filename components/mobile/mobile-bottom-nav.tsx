"use client"

import React from "react"
import { Heart, Search, ShoppingBag, User, Wallet, Home } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter, usePathname } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState } from "react"
import { RandomMatchModal } from "@/components/mobile/random-match-modal"

interface MobileBottomNavProps {
  currentTab: string
  setCurrentTab: (tab: string) => void
}

export function MobileBottomNav({ currentTab, setCurrentTab }: MobileBottomNavProps) {
  const [showMatchModal, setShowMatchModal] = useState(false)

  const tabs = [
    { id: "suitors", icon: Search, label: "Suitors" },
    { id: "shop", icon: ShoppingBag, label: "Shop" },
    { id: "home", icon: Heart, label: "Home" },
    { id: "wallet", icon: Wallet, label: "Wallet" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const pathname = usePathname()
  const isOnHomePage = pathname === "/"

  // Haptic feedback function
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50) // Light haptic feedback
    }
  }

  const handleTabClick = (tabId: string) => {
    triggerHaptic()

    // Handle center button (home/heart) logic
    if (tabId === "home") {
      if (isOnHomePage) {
        // User is on home page, show random match modal
        setShowMatchModal(true)
      } else {
        // User is not on home page, take them to home
        router.push("/")
      }
      return
    }

    // Handle navigation for other specific tabs
    if (tabId === "profile") {
      if (connected && publicKey) {
        // Use the actual connected wallet address
        router.push(`/profile/${publicKey.toString()}`)
      } else {
        // If not connected, redirect to profile setup
        router.push("/profile-setup")
      }
    } else if (tabId === "suitors") {
      router.push("/explore")
    } else if (tabId === "shop") {
      router.push("/shop")
    } else if (tabId === "wallet") {
      router.push("/wallet")
    } else {
      setCurrentTab(tabId)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Enhanced top divider */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-200/60 to-transparent" />

      {/* Enhanced curved background with glassmorphism */}
      <div className="relative h-24">
        <div className="absolute inset-x-0 top-0 h-24 bg-white/80 backdrop-blur-2xl border-white/30 rounded-t-[2.5rem] shadow-2xl border-t border-l border-r border-indigo-100/50" />

        {/* Enhanced navigation items */}
        <div className="absolute bottom-0 inset-x-0 h-24 px-6 flex items-center justify-between">
          {tabs.map((tab, index) => {
            const isCenter = index === 2 // Home tab
            const isActive = currentTab === tab.id || (isCenter && isOnHomePage)

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                whileHover={{ scale: isCenter ? 1 : 1.1 }}
                whileTap={{ scale: isCenter ? 1 : 0.95 }}
                className={`flex flex-col items-center justify-center transition-all duration-300 focus-ring ${
                  isCenter ? "relative -mt-6" : ""
                }`}
              >
                {isCenter ? (
                  <motion.div
                    animate={{
                      scale: isActive ? 1 : 0.9,
                      rotate: isActive ? 0 : -5,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`absolute -top-9 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-400 to-purple-500"
                        : "bg-gradient-to-r from-indigo-100 to-purple-200"
                    }`}
                  >
                    {/* Show Heart when on home page, Home when not on home page */}
                    {React.createElement(isOnHomePage ? Heart : Home, {
                      className: `w-7 h-7 ${isActive ? "text-white" : "text-indigo-500"}`,
                    })}

                    {/* Enhanced pulse effect - always visible on center button */}
                    {tab.id === "home" && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute inset-0 rounded-full bg-indigo-400 mx-[0p]"
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ y: -3 }}
                    className={`p-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? "text-pink-600 bg-gradient-to-r from-pink-100 to-pink-200 shadow-lg scale-110"
                        : "text-pink-400 hover:text-pink-500 hover:bg-pink-50"
                    }`}
                  >
                    <tab.icon className="w-6 h-6 relative z-10" />

                    {/* Active state background animation */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-200 to-rose-200"
                        animate={{ scale: [0, 1] }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                )}

                <motion.span
                  animate={{
                    color: isActive ? "#4f46e5" : "#c7d2fe",
                    y: isActive && !isCenter ? -2 : 0,
                    scale: isActive && !isCenter ? 1.05 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`text-xs mt-2 font-semibold transition-all duration-300 ${isCenter ? "opacity-0" : ""}`}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Random Match Modal */}
      {showMatchModal && <RandomMatchModal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} />}
    </div>
  )
}
