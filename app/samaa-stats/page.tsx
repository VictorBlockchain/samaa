"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Heart, Wallet, TrendingUp, Shield, Star, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function SamaaStatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalWomen: 0,
    totalMen: 0,
    totalMarriages: 0,
    dowryWalletsMinted: 0,
    purseWalletsMinted: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load stats from Supabase
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { StatsService } = await import('@/lib/database')
      const platformStats = await StatsService.getPlatformStats()
      setStats(platformStats)
    } catch (error) {
      console.error('Error loading stats:', error)
      // Keep default stats (all 0) if error
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Women Registered",
      value: stats.totalWomen.toLocaleString(),
      icon: Users,
      color: "from-pink-400 to-rose-500",
      bgColor: "from-pink-50 to-rose-50",
      description: "Female members on platform"
    },
    {
      title: "Men Registered",
      value: stats.totalMen.toLocaleString(),
      icon: Users,
      color: "from-blue-400 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      description: "Male members on platform"
    },
    {
      title: "Successful Marriages",
      value: stats.totalMarriages.toLocaleString(),
      icon: Heart,
      color: "from-green-400 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      description: "Couples who found love"
    },
    {
      title: "Dowry Wallets Minted",
      value: stats.dowryWalletsMinted.toLocaleString(),
      icon: Wallet,
      color: "from-purple-400 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      description: "Smart NFT dowry wallets created"
    },
    {
      title: "Purse Wallets Minted",
      value: stats.purseWalletsMinted.toLocaleString(),
      icon: Wallet,
      color: "from-amber-400 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      description: "Smart NFT purse wallets created"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        <CelestialBackground intensity="medium" />
        <div className="relative z-10 text-center">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-queensides">Loading platform statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      
      {/* Header */}
      <div className="relative z-10 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-indigo-200/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-queensides">Back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800 font-qurova">Samaa Stats</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-indigo-200/50">
              <TrendingUp className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 font-qurova mb-4">Platform Transparency</h2>
            <p className="text-slate-600 font-queensides text-lg leading-relaxed max-w-2xl mx-auto">
              Current platform statistics as we prepare to launch our Muslim community platform
            </p>
          </motion.div>

          {/* Arabic-inspired divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                className={`relative rounded-2xl p-6 border border-indigo-200/50 overflow-hidden backdrop-blur-sm bg-gradient-to-br ${stat.bgColor} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* Arabic corner decorations */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-indigo-400/40 rounded-tl-lg"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-purple-400/40 rounded-br-lg"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Sparkles className="w-5 h-5 text-indigo-400/60" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 font-qurova mb-2">{stat.title}</h3>
                  <p className="text-3xl font-bold text-slate-900 font-qurova mb-2">{stat.value}</p>
                  <p className="text-sm text-slate-600 font-queensides">{stat.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Transparency Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="relative rounded-2xl p-8 border border-green-200/50 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-green-50/80 to-emerald-50/60 text-center"
          >
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-green-400/40 rounded-tl-xl"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-emerald-400/40 rounded-tr-xl"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-emerald-400/40 rounded-bl-xl"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-green-400/40 rounded-br-xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-700 font-qurova mb-4">Our Commitment to Transparency</h3>
              <p className="text-green-600 font-queensides text-lg leading-relaxed max-w-2xl mx-auto">
                We believe in complete transparency with our community. These statistics show the current state of our platform as we prepare for launch. All data will be updated in real-time as our community grows, and all wallet transactions will be secured and verifiable on the Solana blockchain.
              </p>
            </div>
          </motion.div>

          {/* Last Updated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-slate-500 font-queensides">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
