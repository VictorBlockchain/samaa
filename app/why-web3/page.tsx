"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Shield, Zap, Globe, Coins, Lock, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function WhyWeb3Page() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Why Web3 & Crypto?</h1>
              <p className="text-sm text-slate-600 font-queensides">The future of digital relationships</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-8 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
              {/* Arabic-inspired corner decorations */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200/50"
                >
                  <Zap className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  The Web3 Revolution
                </h2>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                  Web3 and cryptocurrency represent a fundamental shift toward 
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    decentralized, user-owned digital experiences
                  </span>. 
                  Here's why this matters for your marriage journey.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {[
              {
                icon: Shield,
                title: "True Ownership",
                description: "Your dowry and purse wallets are truly yours. No company can freeze, seize, or control your assets.",
                color: "blue",
                highlight: "Own your wealth"
              },
              {
                icon: Lock,
                title: "Enhanced Privacy",
                description: "Blockchain technology provides superior privacy and security compared to traditional banking systems.",
                color: "green",
                highlight: "Private by design"
              },
              {
                icon: Globe,
                title: "Global Access",
                description: "Send and receive value instantly across borders without traditional banking limitations or fees.",
                color: "purple",
                highlight: "Borderless money"
              },
              {
                icon: TrendingUp,
                title: "Financial Growth",
                description: "Crypto assets have historically provided better long-term growth than traditional savings accounts.",
                color: "amber",
                highlight: "Wealth building"
              },
              {
                icon: Zap,
                title: "Instant Transactions",
                description: "Transfer value in seconds, not days. Perfect for modern relationships and quick financial decisions.",
                color: "indigo",
                highlight: "Lightning fast"
              },
              {
                icon: Coins,
                title: "Lower Costs",
                description: "Eliminate middlemen and reduce transaction fees. More of your money stays with you and your family.",
                color: "emerald",
                highlight: "Save on fees"
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="relative group"
              >
                <div className="relative rounded-2xl p-6 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                  <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-lg"></div>
                  <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg"></div>
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg"></div>
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50 mr-4">
                          <benefit.icon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-800 font-qurova">{benefit.title}</h4>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-queensides">
                            {benefit.highlight}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 font-queensides text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Islamic Perspective */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-green-300/20 hover:border-green-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-green-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-emerald-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-emerald-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-green-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Islamic Perspective</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/30">
                    <h4 className="font-semibold text-green-700 font-queensides mb-2">Halal Finance</h4>
                    <p className="text-slate-600 font-queensides text-sm">
                      Cryptocurrency aligns with Islamic principles of avoiding riba (interest) and promoting 
                      direct peer-to-peer transactions without intermediary exploitation.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-xl p-4 border border-emerald-200/30">
                    <h4 className="font-semibold text-emerald-700 font-queensides mb-2">Financial Justice</h4>
                    <p className="text-slate-600 font-queensides text-sm">
                      Web3 promotes financial inclusion and removes barriers that traditional banking 
                      systems often impose on Muslim communities worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="relative group"
          >
            <div className="relative rounded-2xl p-6 border-2 border-amber-300/20 hover:border-amber-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-orange-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-orange-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg"></div>

              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Ready to Start?</h3>
                <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                  Don't worry if this seems overwhelming. We've designed Samaa to make Web3 accessible 
                  for everyone, regardless of technical experience.
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2 text-amber-600">
                    <div className="w-2 h-2 bg-amber-500/70 rounded-full"></div>
                    <span className="font-queensides">Beginner Friendly</span>
                  </div>
                  <div className="flex items-center space-x-2 text-orange-600">
                    <div className="w-2 h-2 bg-orange-500/70 rounded-full"></div>
                    <span className="font-queensides">Step-by-Step Guides</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
