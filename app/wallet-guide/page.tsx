"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Wallet, Heart, Shield, Clock, Users, Gift } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function WalletGuidePage() {
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Dowry & Purse Wallets</h1>
              <p className="text-sm text-slate-600 font-queensides">Smart NFT wallet system</p>
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
                  <Wallet className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  Smart NFT Wallets
                </h2>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                  Revolutionary 
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Smart NFTs that can hold assets
                  </span>, 
                  combining Islamic marriage traditions with cutting-edge blockchain technology.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Wallet Types */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Dowry Wallets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="relative rounded-2xl p-6 border-2 border-blue-300/20 hover:border-blue-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-blue-400/60 rounded-tl-lg"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-lg"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-blue-400/60 rounded-br-lg"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200/50 mr-4">
                      <Gift className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 font-qurova">Dowry Wallets</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-queensides">For Men</span>
                    </div>
                  </div>
                  <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                    Smart NFTs that men can mint and offer to their future wives. These wallets can hold SOL, SAMAA tokens, 
                    and other assets as a digital dowry, honoring Islamic marriage traditions in the modern age.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50/50 rounded-lg p-3">
                      <span className="text-xs text-blue-600 font-queensides">🎁 Traditional Value</span>
                    </div>
                    <div className="bg-indigo-50/50 rounded-lg p-3">
                      <span className="text-xs text-indigo-600 font-queensides">💎 Digital Assets</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Purse Wallets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative group"
            >
              <div className="relative rounded-2xl p-6 border-2 border-purple-300/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-50/50 to-pink-50/30">
                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-purple-400/60 rounded-tl-lg"></div>
                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-pink-400/60 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-pink-400/60 rounded-bl-lg"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-purple-400/60 rounded-br-lg"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center border border-purple-200/50 mr-4">
                      <Heart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 font-qurova">Purse Wallets</h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-queensides">For Women</span>
                    </div>
                  </div>
                  <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                    Smart NFTs that women can mint to receive and manage their assets. These wallets provide secure storage 
                    for dowries, personal savings, and other digital assets with complete ownership control.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50/50 rounded-lg p-3">
                      <span className="text-xs text-purple-600 font-queensides">👑 Full Control</span>
                    </div>
                    <div className="bg-pink-50/50 rounded-lg p-3">
                      <span className="text-xs text-pink-600 font-queensides">🔒 Secure Storage</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Smart NFT Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-green-300/20 hover:border-green-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-green-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-emerald-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-emerald-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-green-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Smart NFT Features</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      icon: "🏦",
                      title: "Vault Address",
                      description: "Each Smart NFT has a unique vault address that can hold SOL, SAMAA tokens, and other Solana assets."
                    },
                    {
                      icon: "👤",
                      title: "Owner-Only Access",
                      description: "Only the NFT owner can access the vault assets. Complete control and security guaranteed."
                    },
                    {
                      icon: "⏰",
                      title: "Time Lock Controls",
                      description: "Set future dates to lock the vault until marriage ceremonies or other important milestones."
                    },
                    {
                      icon: "🔄",
                      title: "Transferable",
                      description: "NFTs can be transferred between wallets, perfect for dowry ceremonies and marriage contracts."
                    }
                  ].map((feature, index) => (
                    <div key={feature.title} className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/30">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">{feature.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 font-queensides mb-1">{feature.title}</h4>
                          <p className="text-slate-600 font-queensides text-sm">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-amber-300/20 hover:border-amber-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-orange-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-orange-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">How It Works</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Mint Your Smart NFT", description: "Choose a design and mint your dowry or purse wallet" },
                    { step: "2", title: "Add Assets", description: "Transfer SOL, SAMAA tokens, or other assets to your vault" },
                    { step: "3", title: "Set Time Locks", description: "Optional: Lock assets until marriage or other milestones" },
                    { step: "4", title: "Transfer or Share", description: "Give as dowry or manage as personal wealth storage" }
                  ].map((step, index) => (
                    <div key={step.step} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center border border-amber-200/50 flex-shrink-0">
                        <span className="text-sm font-bold text-amber-700">{step.step}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 font-queensides">{step.title}</h4>
                        <p className="text-slate-600 font-queensides text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Islamic Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-6 border border-indigo-200/30">
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-qurova">Honoring Islamic Traditions</h3>
              <p className="text-slate-600 font-queensides leading-relaxed">
                Our Smart NFT wallet system modernizes traditional Islamic marriage practices while maintaining 
                their spiritual and cultural significance. Technology serving faith, not replacing it.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
