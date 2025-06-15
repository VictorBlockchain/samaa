"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HeartIcon } from "@/components/ui/heart-icon"
import { X, Smartphone } from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"

export function DesktopHero() {
  const [isVisible, setIsVisible] = useState(false)
  const [showMobilePopup, setShowMobilePopup] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [activeSecondTab, setActiveSecondTab] = useState(0)
  const [hasSecondTabBeenClicked, setHasSecondTabBeenClicked] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      id: 0,
      icon: "💎",
      title: "No Monthly Fees",
      price: "$0",
      priceSubtext: "Forever",
      description:
        "While others charge $30-50/month, Samaa is completely free. No buying likes, no premium features, no hidden costs.",
      color: "indigo",
    },
    {
      id: 1,
      icon: "💬",
      title: "Real Conversations",
      description: "No mindless swiping. Start meaningful conversations with your potential life partner from day one.",
      color: "purple",
    },
    {
      id: 2,
      icon: "👛",
      title: "Financial Transparency",
      description: "Dowry wallets and purses eliminate money worries. See financial intentions upfront, the halal way.",
      color: "blue",
    },
    {
      id: 3,
      icon: "🚀",
      title: "The Future of Islamic Marriage",
      description:
        "Blockchain-powered, Web3-native platform that respects Islamic values while embracing tomorrow's technology.",
      color: "indigo",
    },
  ]

  const secondFeatures = [
    {
      id: 0,
      icon: "🪙",
      title: "Samaa Token",
      description:
        "Our native cryptocurrency that powers the entire ecosystem. Earn tokens through engagement and use them across all platform features.",
      color: "indigo",
    },
    {
      id: 1,
      icon: "💰",
      title: "Dowry Wallets",
      description:
        "Transparent digital wallets for managing dowry arrangements. Built on blockchain for complete transparency and Islamic compliance.",
      color: "purple",
    },
    {
      id: 2,
      icon: "👛",
      title: "Purses",
      description:
        "Personal digital purses for everyday transactions. Manage your Samaa tokens securely with Islamic finance principles.",
      color: "blue",
    },
    {
      id: 3,
      icon: "🛍️",
      title: "Shop",
      description:
        "Create your own shop to sell items and accept payments in Samaa tokens. Build your halal business within our community.",
      color: "green",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: {
        border: "border-indigo-300/20 hover:border-indigo-400/40",
        bg: "from-indigo-50/5 to-purple-50/5",
        iconBg: "from-indigo-400/80 to-purple-500/80",
        iconBorder: "border-indigo-300/30",
        text: "text-indigo-600",
        divider: "via-indigo-300/30",
        dots: "bg-indigo-400/60",
        dotBorder: "border-indigo-400/40",
        dotCenter: "bg-indigo-500/70",
      },
      purple: {
        border: "border-purple-300/20 hover:border-purple-400/40",
        bg: "from-purple-50/5 to-indigo-50/5",
        iconBg: "from-purple-400/80 to-indigo-500/80",
        iconBorder: "border-purple-300/30",
        text: "text-purple-600",
        divider: "via-purple-300/30",
        dots: "bg-purple-400/60",
        dotBorder: "border-purple-400/40",
        dotCenter: "bg-purple-500/70",
      },
      blue: {
        border: "border-blue-300/20 hover:border-blue-400/40",
        bg: "from-blue-50/5 to-indigo-50/5",
        iconBg: "from-blue-400/80 to-indigo-500/80",
        iconBorder: "border-blue-300/30",
        text: "text-blue-600",
        divider: "via-blue-300/30",
        dots: "bg-blue-400/60",
        dotBorder: "border-blue-400/40",
        dotCenter: "bg-blue-500/70",
      },
      green: {
        border: "border-green-300/20 hover:border-green-400/40",
        bg: "from-green-50/5 to-emerald-50/5",
        iconBg: "from-green-400/80 to-emerald-500/80",
        iconBorder: "border-green-300/30",
        text: "text-green-600",
        divider: "via-green-300/30",
        dots: "bg-green-400/60",
        dotBorder: "border-green-400/40",
        dotCenter: "bg-green-500/70",
      },
    }
    return colors[color as keyof typeof colors] || colors.indigo
  }

  return (
    <div className="relative min-h-screen pt-24 overflow-hidden">      
      <div className="relative z-10 px-6">
        <div className="max-w-2xl mx-auto" style={{ marginTop: "70px" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center mt-12"
          >
            <div className="relative flex items-center justify-center">
              {/* Circular Image with Border */}
              <div className="relative w-64 h-64 rounded-full border-4 border-gradient-to-r from-indigo-400 via-purple-500 to-blue-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full border-2 border-white/50 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                  <img
                    src="/images/futuristic-muslim-couple-hero.jpg"
                    alt="Futuristic Muslim couple in romantic embrace with Islamic cityscape and crescent moon"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Text Below Circle */}
            <div className="mt-8">
              <h1 className="text-6xl font-bold text-slate-800 font-dattermatter text-center leading-tight">
                Match Made in Heaven
              </h1>
            </div>
          </motion.div>

          {/* Arabic-Inspired Beautiful Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-center mt-12 mb-12"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
            <div className="mx-8 flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
              <div className="w-6 h-6 border-2 border-indigo-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
          </motion.div>

          {/* Tagline Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
            className="relative group mb-12"
          >
            <div className="relative rounded-3xl p-8 border border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white/5">
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-300/40 rounded-tl-xl"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-indigo-300/40 rounded-tr-xl"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-indigo-300/40 rounded-bl-xl"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-300/40 rounded-br-xl"></div>

              <div className="relative z-10 text-center">
                <p className="text-2xl text-slate-600 font-queensides leading-relaxed">
                  Samaa is the marriage site for
                  <br />
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-3xl">
                    Muslim futurists
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="grid grid-cols-4 gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-3xl border border-indigo-200/20">
              {features.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(index)}
                  className={`relative p-6 rounded-2xl transition-all duration-300 ${
                    activeTab === index
                      ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <div className="text-sm font-queensides text-slate-600 leading-tight">{feature.title}</div>
                  {activeTab === index && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-3 h-3 bg-indigo-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Active Feature Card */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative group mb-12"
          >
            <div
              className={`relative rounded-3xl p-12 border-2 ${getColorClasses(features[activeTab].color).border} transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white/5`}
            >
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-2xl"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-400/60 rounded-tr-2xl"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-400/60 rounded-bl-2xl"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-indigo-400/60 rounded-br-2xl"></div>

              <div className="relative z-10 text-center">
                {features[activeTab].price && (
                  <div className="mb-6">
                    <div
                      className={`text-6xl font-bold ${getColorClasses(features[activeTab].color).text} font-queensides`}
                    >
                      {features[activeTab].price}
                    </div>
                    <div className={`text-lg ${getColorClasses(features[activeTab].color).text} font-queensides`}>
                      {features[activeTab].priceSubtext}
                    </div>
                  </div>
                )}

                <h3 className="text-4xl font-bold text-slate-800 mb-6 font-queensides">{features[activeTab].title}</h3>
                <p className="text-slate-600 font-queensides leading-relaxed text-xl max-w-3xl mx-auto">
                  {features[activeTab].description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
            className="mt-12 space-y-6"
          >
            {/* Connect Wallet Button - Opens Mobile Popup */}
            <button
              onClick={() => setShowMobilePopup(true)}
              className="relative w-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-8 px-12 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm overflow-hidden group"
            >
              <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-2xl"></div>
              <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-2xl"></div>
              <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-2xl"></div>
              <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-2xl"></div>

              <div className="relative z-10 flex items-center justify-center space-x-4">
                <HeartIcon className="w-8 h-8 text-white" />
                <span className="text-2xl font-queensides tracking-wide">Connect Wallet</span>
              </div>
            </button>
          </motion.div>

          {/* Islamic-Inspired Closing Divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 2.2, duration: 1, ease: "easeOut" }}
            className="flex items-center justify-center mt-16 mb-12"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
            <div className="mx-12 flex items-center space-x-6">
              <div className="w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
              <div className="relative w-12 h-12 border-2 border-indigo-400/60 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400/70 rounded-full"></div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-400/70 to-purple-400/70"></div>
                <div className="w-6 h-2 bg-gradient-to-r from-purple-400/60 to-indigo-400/60"></div>
                <div className="w-2 h-8 bg-gradient-to-b from-purple-400/70 to-indigo-400/70"></div>
              </div>
              <div className="relative w-12 h-12 border-2 border-purple-400/60 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"></div>
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-400/70 rounded-full"></div>
              </div>
              <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
          </motion.div>

          {/* Final blessing text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <p className="text-xl text-slate-500 font-queensides italic">
              "And among His signs is that He created for you mates from among yourselves"
            </p>
            <p className="text-lg text-slate-400 font-queensides mt-2">- Quran 30:21</p>
          </motion.div>
        </div>
      </div>

      {/* Mobile Popup Modal */}
      <AnimatePresence>
        {showMobilePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowMobilePopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200/50 overflow-hidden max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Islamic corner decorations */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-indigo-300/40 rounded-tl-xl"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-300/40 rounded-tr-xl"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-300/40 rounded-bl-xl"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-indigo-300/40 rounded-br-xl"></div>

              {/* Close button */}
              <button
                onClick={() => setShowMobilePopup(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Content */}
              <div className="p-12 text-center">
                {/* Mobile icon */}
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-indigo-600" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-queensides">Best Experience on Mobile</h2>

                {/* Description */}
                <p className="text-lg text-slate-600 mb-8 font-queensides leading-relaxed">
                  Samaa is designed for mobile-first Islamic matrimony. For the best experience with wallet connections,
                  messaging, and all features, please visit us on your mobile device.
                </p>

                {/* Features list */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-slate-600 font-queensides">Seamless wallet integration</span>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-600 font-queensides">Optimized messaging experience</span>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-slate-600 font-queensides">Touch-friendly Islamic features</span>
                  </div>
                </div>

                {/* QR Code placeholder */}
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200/30 flex items-center justify-center">
                  <div className="text-4xl">📱</div>
                </div>

                <p className="text-sm text-slate-500 font-queensides">
                  Scan with your phone or visit samaa.app on mobile
                </p>

                {/* Islamic divider */}
                <div className="flex items-center justify-center mt-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
                  <div className="mx-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400/60 rounded-full"></div>
                    <div className="w-3 h-3 border border-purple-400/40 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-indigo-500/70 rounded-full"></div>
                    </div>
                    <div className="w-2 h-2 bg-purple-400/60 rounded-full"></div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
