"use client"

import { motion, useScroll } from "framer-motion"
import { useRef, useState } from "react"
import { WalletButton } from "@/components/wallet/wallet-button"
import { useWallet } from "@solana/wallet-adapter-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { User, Camera, Heart, Search } from "lucide-react"
import { useRouter } from "next/navigation"

export function MobileHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })
  const router = useRouter()

  const [activeTab, setActiveTab] = useState(0)
  const [activeSecondTab, setActiveSecondTab] = useState(0)
  const [hasSecondTabBeenClicked, setHasSecondTabBeenClicked] = useState(false)

  // Add these state variables after the existing useState declarations:
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileSetupStep, setProfileSetupStep] = useState(0)

  const { connected, publicKey } = useWallet()

  const features = [
    {
      id: 0,
      icon: "💎",
      title: "No Monthly Fees",
      price: "$0",
      priceSubtext: "Forever",
      description:
        "We want connections, marriage & families. No monthly fees, no hidden costs. Just pure love.",
      color: "indigo",
    },
    {
      id: 1,
      icon: "💬",
      title: "Real Connections",
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
        "Our native cryptocurrency that powers the entire ecosystem. Accept payments, build your business, and more.",
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
        "Muslima's can create a purse to showcase their crypto financial independence.",
      color: "blue",
    },
    {
      id: 3,
      icon: "🛍️",
      title: "Shop",
      description:
        "Create your own shop to sell items and accept payments in Samaa tokens or solana. Build your halal business within our community.",
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

  // Add pull-to-refresh handler:
  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  return (
    <div ref={containerRef} className="min-h-screen relative">
      <div className="relative z-10 min-h-screen">
        {connected ? (
          // Logged in version - Profile Setup
          <>
            {/* Profile Setup Header - Full Width Edge to Edge */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
              <div className="flex items-center justify-center p-4">
                <div className="text-center pt-3">
                  <h1 className="text-xl font-bold text-slate-800 font-qurova">Welcome to Samaa</h1>
                  <p className="text-sm text-slate-600 font-queensides">Let's set up your profile</p>
                </div>
              </div>
            </div>

            {/* Content with padding */}
            <div className="p-4 pb-32">
              <div className="max-w-lg mx-auto">

                {/* Profile Setup Flow */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Welcome Message */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-4xl">✨</span>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-4">
                      Wallet Connected!
                    </h2>

                    {/* Wallet Address Card */}
                    <div className="bg-white/60 backdrop-blur-sm border border-indigo-200/50 rounded-xl p-4 mb-4 shadow-sm">
                      <div className="text-center">
                        <p className="text-xs text-slate-500 font-queensides mb-1">Your Wallet Address</p>
                        <p className="text-lg font-bold text-slate-800 font-mono tracking-wider">
                          {publicKey ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-6)}` : 'Wallet Address'}
                        </p>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-green-600 font-queensides font-medium">Connected</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Setup Instructions */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-xl p-4 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 font-qurova mb-2">Ready to Find Your Match?</h3>
                        <p className="text-slate-700 font-queensides leading-relaxed">
                          Click the <span className="font-semibold text-indigo-600">profile icon</span> in the bottom menu to set up your profile and start connecting
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* New to Crypto Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="relative rounded-2xl p-6 border border-indigo-200/50 hover:border-indigo-300/60 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white/90 to-indigo-50/80 backdrop-blur-sm shadow-lg mb-6"
                  >
                    {/* Arabic-inspired corner decorations */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-indigo-300/40 rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-indigo-300/40 rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-indigo-300/40 rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-indigo-300/40 rounded-br-lg"></div>

                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 to-purple-50/10 opacity-50"></div>

                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">🚀</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 font-qurova">New to Crypto?</h3>
                      </div>

                      <div className="space-y-3 text-slate-600 font-queensides">
                        <p className="leading-relaxed">
                          You just logged in the <span className="font-semibold text-indigo-600">Web3 way</span> - no emails or passwords needed, just your wallet address.
                        </p>

                        <p className="leading-relaxed">
                          Your wallet address can receive <span className="font-semibold text-purple-600">Solana</span> or <span className="font-semibold text-indigo-600">SAMAA tokens</span> from anyone, anywhere in the world.
                        </p>
                      </div>

                      {/* Crypto Benefits */}
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white text-sm">🔐</span>
                            </div>
                            <p className="text-sm font-queensides text-slate-700 font-semibold">Secure</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white text-sm">🌍</span>
                            </div>
                            <p className="text-sm font-queensides text-slate-700 font-semibold">Global</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white text-sm">⚡</span>
                            </div>
                            <p className="text-sm font-queensides text-slate-700 font-semibold">Fast</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white text-sm">🔓</span>
                            </div>
                            <p className="text-sm font-queensides text-slate-700 font-semibold">No Passwords</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center decorative element */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-indigo-400/30 rounded-full opacity-50"></div>
                  </motion.div>
                
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          // Original hero content for non-logged in users
          <div className="p-4 pb-32 pt-24">
            <div className="max-w-lg mx-auto" style={{ marginTop: "21px" }}>
            {/* Keep all the existing hero content here */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
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
              <div className="mt-6">
                <h1 className="text-4xl font-bold text-slate-800 font-dattermatter text-center leading-tight">
                  Match Made in Heaven
                </h1>
              </div>
            </motion.div>

            {/* Arabic-Inspired Beautiful Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center mt-8 mb-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
              <div className="mx-6 flex items-center space-x-2">
                {/* Arabic geometric pattern */}
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                <div className="w-4 h-4 border-2 border-indigo-400 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                </div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
            </motion.div>

            {/* Tagline Section - Transparent Card with Arabic Borders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
              className="relative group mb-8"
            >
              <div className="relative rounded-2xl p-6 border border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white/5">
                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-indigo-300/40 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-indigo-300/40 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-indigo-300/40 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-indigo-300/40 rounded-br-lg"></div>

                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 text-center">
                  <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                    Samaa is the marriage for
                    <br />
                    <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-xl">
                      Muslim futurists
                    </span>
                  </p>
                </div>

                {/* Center decorative element */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-indigo-400/30 rounded-full opacity-50"></div>
              </div>
            </motion.div>

            {/* Feature Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveTab(index)
                    }}
                    className={`relative p-3 rounded-xl transition-all duration-300 ${
                      activeTab === index
                        ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                        : "hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className="text-2xl mb-1">{feature.icon}</div>
                    <div className="text-xs font-queensides text-slate-600 leading-tight">
                      {feature.title.split(" ").slice(0, 2).join(" ")}
                    </div>
                    {activeTab === index && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
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
              className="relative group mb-8"
            >
              <div
                className={`relative rounded-2xl p-8 border-2 ${getColorClasses(features[activeTab].color).border} transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white/5`}
              >
                {/* Arabic corner decorations */}
                <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-indigo-300/30 rounded-full opacity-20"></div>
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>
                <div className="relative z-10 text-center">
                  {/* Price Display (only for first feature) */}
                  {features[activeTab].price && (
                    <div className="mb-4">
                      <div
                        className={`text-4xl font-bold ${getColorClasses(features[activeTab].color).text} font-queensides`}
                      >
                        {features[activeTab].price}
                      </div>
                      <div className={`text-sm ${getColorClasses(features[activeTab].color).text} font-queensides`}>
                        {features[activeTab].priceSubtext}
                      </div>
                    </div>
                  )}

                  {/* Animated Dots (only for conversation feature) */}
                  {features[activeTab].id === 1 && (
                    <div className="flex justify-center space-x-1.5 mb-3">
                      <div className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse"></div>
                      <div
                        className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  )}

                  {/* Wallet Icons (only for financial feature) */}
                  {features[activeTab].id === 2 && (
                    <div className="flex justify-center space-x-2 mb-3">
                      <div className="w-6 h-4 bg-blue-100/50 rounded border border-blue-300/40 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-0.5 h-0.5 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="w-6 h-4 bg-indigo-100/50 rounded border border-indigo-300/40 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-0.5 h-0.5 bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-slate-800 mb-4 font-queensides">
                    {features[activeTab].title}
                  </h3>
                  <p className="text-slate-600 font-queensides leading-relaxed text-base">
                    {features[activeTab].description}
                  </p>

                  {/* Trust Indicators (only for future feature) */}
                  {features[activeTab].id === 3 && (
                    <div className="flex justify-center space-x-4 text-sm mt-6">
                      <div className="flex items-center space-x-2 text-indigo-600">
                        <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                        <span className="font-queensides">Blockchain Secured</span>
                      </div>
                      <div className="flex items-center space-x-2 text-purple-600">
                        <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
                        <span className="font-queensides">Islamic Values</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arabic-Inspired Card Divider */}
                <div className="flex items-center justify-center mt-5">
                  <div
                    className={`flex-1 h-px bg-gradient-to-r from-transparent ${getColorClasses(features[activeTab].color).divider} to-transparent`}
                  ></div>
                  <div className="mx-4 flex items-center space-x-1">
                    <div className={`w-1 h-1 ${getColorClasses(features[activeTab].color).dots} rounded-full`}></div>
                    <div
                      className={`w-2 h-2 border ${getColorClasses(features[activeTab].color).dotBorder} rounded-full flex items-center justify-center`}
                    >
                      <div
                        className={`w-0.5 h-0.5 ${getColorClasses(features[activeTab].color).dotCenter} rounded-full`}
                      ></div>
                    </div>
                    <div className={`w-1 h-1 ${getColorClasses(features[activeTab].color).dots} rounded-full`}></div>
                  </div>
                  <div
                    className={`flex-1 h-px bg-gradient-to-r from-transparent ${getColorClasses(features[activeTab].color).divider} to-transparent`}
                  ></div>
                </div>
              </div>
            </motion.div>

            {/* Elegant Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center my-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent"></div>
              <div className="mx-8 flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                <div className="w-6 h-6 border-2 border-indigo-400/50 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"></div>
                </div>
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-400/60 to-purple-400/60"></div>
                <div className="w-6 h-6 border-2 border-purple-400/50 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"></div>
                </div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent"></div>
            </motion.div>

            {/* Powered by Crypto Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              className="relative group mb-8"
            >
              <div className="relative rounded-2xl p-6 border-2 border-gradient-to-r from-indigo-300/30 via-purple-300/30 to-blue-300/30 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                {/* Crypto-themed corner decorations */}
                <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-indigo-400/70 rounded-tl-lg"></div>
                <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-purple-400/70 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-purple-400/70 rounded-bl-lg"></div>
                <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-indigo-400/70 rounded-br-lg"></div>

                {/* Blockchain pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-3 h-3 border border-indigo-400/40 transform rotate-45"></div>
                  <div className="absolute top-6 right-6 w-2 h-2 bg-purple-400/30 rounded-full"></div>
                  <div className="absolute bottom-4 left-6 w-2 h-2 bg-indigo-400/30 rounded-full"></div>
                  <div className="absolute bottom-6 right-4 w-3 h-3 border border-purple-400/40 transform rotate-45"></div>
                </div>

                <div className="relative z-10 text-center">
                  {/* Crypto Icons */}

                  <h3 className="text-xl font-bold text-slate-800 mb-3 font-queensides">Powered by Crypto</h3>

                  {/* Trust badges */}
                </div>

                {/* Final decorative divider */}
                <div className="flex items-center justify-center mt-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
                  <div className="mx-4 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400/50 rounded-full transform rotate-45"></div>
                    <div className="w-2 h-2 border border-indigo-400/40 rounded-full flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-gradient-to-r from-indigo-500/70 to-purple-500/70 rounded-full"></div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full transform rotate-45"></div>
                    <div className="w-1 h-1 bg-purple-400/60 rounded-full"></div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
                </div>
              </div>
            </motion.div>

            {/* Second Feature Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-purple-200/20">
                {secondFeatures.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveSecondTab(index)
                      setHasSecondTabBeenClicked(true)
                    }}
                    className={`relative p-3 rounded-xl transition-all duration-300 ${
                      activeSecondTab === index
                        ? "bg-gradient-to-br from-purple-400/20 to-indigo-400/20 border border-purple-300/40 shadow-lg"
                        : "hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className="text-2xl mb-1">{feature.icon}</div>
                    <div className="text-xs font-queensides font-bold text-slate-700 leading-tight">
                      {feature.title.split(" ").slice(0, 2).join(" ")}
                    </div>
                    {activeSecondTab === index && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-purple-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Active Second Feature Card */}
            {hasSecondTabBeenClicked && (
              <motion.div
                key={activeSecondTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative group mb-8"
              >
                <div
                  className={`relative rounded-2xl p-8 border-2 ${getColorClasses(secondFeatures[activeSecondTab].color).border} transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white/5`}
                >
                  {/* Arabic corner decorations */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-purple-400/60 rounded-tl-xl"></div>
                  <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-xl"></div>
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-xl"></div>
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-purple-400/60 rounded-br-xl"></div>

                  {/* Geometric pattern overlay */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-purple-300/30 rounded-full opacity-20"></div>
                  <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>
                  <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-purple-300/20 rounded-full"></div>

                  <div className="relative z-10 text-center">
                    {/* Token Icons (only for Samaa Token) */}
                    {secondFeatures[activeSecondTab].id === 0 && (
                      <div className="flex justify-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full border border-indigo-300/40 flex items-center justify-center">
                          <div className="text-sm">🪙</div>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full border border-purple-300/40 flex items-center justify-center">
                          <div className="text-sm">💎</div>
                        </div>
                      </div>
                    )}

                    {/* Wallet Animation (for Dowry Wallets) */}
                    {secondFeatures[activeSecondTab].id === 1 && (
                      <div className="flex justify-center space-x-3 mb-4">
                        <div className="w-10 h-6 bg-purple-100/50 rounded border border-purple-300/40 flex items-center justify-center backdrop-blur-sm">
                          <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        </div>
                        <div className="w-10 h-6 bg-indigo-100/50 rounded border border-indigo-300/40 flex items-center justify-center backdrop-blur-sm">
                          <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                        </div>
                      </div>
                    )}

                    {/* Shop Icons (for Shop feature) */}
                    {secondFeatures[activeSecondTab].id === 3 && (
                      <div className="flex justify-center space-x-2 mb-4">
                        <div className="w-6 h-6 bg-green-100/50 rounded border border-green-300/40 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-xs">🏪</div>
                        </div>
                        <div className="w-6 h-6 bg-emerald-100/50 rounded border border-emerald-300/40 flex items-center justify-center backdrop-blur-sm">
                          <div className="text-xs">💳</div>
                        </div>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-slate-800 mb-4 font-queensides">
                      {secondFeatures[activeSecondTab].title}
                    </h3>
                    <p className="text-slate-600 font-queensides leading-relaxed text-base">
                      {secondFeatures[activeSecondTab].description}
                    </p>

                    {/* Feature-specific indicators */}
                    {secondFeatures[activeSecondTab].id === 0 && (
                      <div className="flex justify-center space-x-4 text-sm mt-6">
                        <div className="flex items-center space-x-2 text-indigo-600">
                          <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                          <span className="font-queensides">Native Token</span>
                        </div>
                        <div className="flex items-center space-x-2 text-purple-600">
                          <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
                          <span className="font-queensides">Earn & Spend</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arabic-Inspired Card Divider */}
                  <div className="flex items-center justify-center mt-5">
                    <div
                      className={`flex-1 h-px bg-gradient-to-r from-transparent ${getColorClasses(secondFeatures[activeSecondTab].color).divider} to-transparent`}
                    ></div>
                    <div className="mx-4 flex items-center space-x-1">
                      <div
                        className={`w-1 h-1 ${getColorClasses(secondFeatures[activeSecondTab].color).dots} rounded-full`}
                      ></div>
                      <div
                        className={`w-2 h-2 border ${getColorClasses(secondFeatures[activeSecondTab].color).dotBorder} rounded-full flex items-center justify-center`}
                      >
                        <div
                          className={`w-0.5 h-0.5 ${getColorClasses(secondFeatures[activeSecondTab].color).dotCenter} rounded-full`}
                        ></div>
                      </div>
                      <div
                        className={`w-1 h-1 ${getColorClasses(secondFeatures[activeSecondTab].color).dots} rounded-full`}
                      ></div>
                    </div>
                    <div
                      className={`flex-1 h-px bg-gradient-to-r from-transparent ${getColorClasses(secondFeatures[activeSecondTab].color).divider} to-transparent`}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
              className="mt-8 space-y-4"
            >
              {/* Connect Wallet Button */}
              <div className="relative w-full">
                <WalletButton className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm overflow-hidden group" />

                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-xl pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-xl pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-xl pointer-events-none"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute top-4 left-4 w-3 h-3 border border-white/40 transform rotate-45"></div>
                  <div className="absolute top-6 right-6 w-2 h-2 bg-white/30 rounded-full"></div>
                  <div className="absolute bottom-4 left-6 w-2 h-2 bg-white/30 rounded-full"></div>
                  <div className="absolute bottom-6 right-4 w-3 h-3 border border-white/40 transform rotate-45"></div>
                </div>

                {/* Golden ratio inspired divider */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 pointer-events-none">
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-white/50 rounded-full"></div>
                  </div>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                </div>
              </div>

              {/* Get Started with Crypto Button */}
              <button
                onClick={() => router.push("/crypto-guide")}
                className="relative w-full bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-slate-800 font-bold py-5 px-7 rounded-2xl border-2 border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm overflow-hidden group"
              >
                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-purple-300/50 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-indigo-300/50 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-indigo-300/50 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-purple-300/50 rounded-br-lg"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="absolute top-3 left-3 w-2 h-2 border border-purple-300/40 transform rotate-45"></div>
                  <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-indigo-300/30 rounded-full"></div>
                  <div className="absolute bottom-3 left-5 w-1.5 h-1.5 bg-purple-300/30 rounded-full"></div>
                  <div className="absolute bottom-5 right-3 w-2 h-2 border border-indigo-300/40 transform rotate-45"></div>
                </div>

                <div className="relative z-10 flex items-center justify-center space-x-3">
                  <div className="text-2xl">🚀</div>
                  <span className="text-lg font-queensides tracking-wide">Get Started with Crypto</span>
                </div>

                {/* Subtle decorative divider */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
                  <div className="w-0.5 h-0.5 bg-purple-400/40 rounded-full"></div>
                  <div className="w-1 h-1 border border-indigo-300/30 rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-indigo-400/40 rounded-full"></div>
                </div>
              </button>

              {/* Support Center Button */}
              <button
                onClick={() => router.push("/support")}
                className="relative w-full bg-gradient-to-br from-blue-50 to-slate-50 hover:from-blue-100 hover:to-slate-100 text-slate-800 font-bold py-5 px-7 rounded-2xl border-2 border-blue-200/50 hover:border-blue-300/70 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm overflow-hidden group"
              >
                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-blue-300/50 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-slate-300/50 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-slate-300/50 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-blue-300/50 rounded-br-lg"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="absolute top-3 left-3 w-2 h-2 border border-blue-300/40 transform rotate-45"></div>
                  <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-slate-300/30 rounded-full"></div>
                  <div className="absolute bottom-3 left-5 w-1.5 h-1.5 bg-blue-300/30 rounded-full"></div>
                  <div className="absolute bottom-5 right-3 w-2 h-2 border border-slate-300/40 transform rotate-45"></div>
                </div>

                <div className="relative z-10 flex items-center justify-center space-x-3">
                  <div className="text-2xl">💬</div>
                  <span className="text-lg font-queensides tracking-wide">Support Center</span>
                </div>

                {/* Subtle decorative divider */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
                  <div className="w-0.5 h-0.5 bg-blue-400/40 rounded-full"></div>
                  <div className="w-1 h-1 border border-slate-300/30 rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-slate-400/40 rounded-full"></div>
                </div>
              </button>
            </motion.div>

            {/* Islamic-Inspired Closing Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 2.2, duration: 1, ease: "easeOut" }}
              className="flex items-center justify-center mt-12 mb-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
              <div className="mx-8 flex items-center space-x-4">
                {/* Star and crescent motif */}
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                <div className="relative w-8 h-8 border-2 border-indigo-400/60 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400/70 rounded-full"></div>
                </div>
                {/* Central geometric pattern */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-400/70 to-purple-400/70"></div>
                  <div className="w-4 h-1 bg-gradient-to-r from-purple-400/60 to-indigo-400/60"></div>
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-400/70 to-indigo-400/70"></div>
                </div>
                {/* Mirror star and crescent */}
                <div className="relative w-8 h-8 border-2 border-purple-400/60 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"></div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-400/70 rounded-full"></div>
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
            </motion.div>

            {/* Final blessing text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.8, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <p className="text-base text-slate-500 font-queensides italic">
                "And among His signs is that He created for you mates from among yourselves"
              </p>
              <p className="text-sm text-slate-400 font-queensides mt-1">- Quran 30:21</p>
            </motion.div>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
