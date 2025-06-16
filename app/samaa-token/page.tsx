"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Coins, ShoppingBag, Wallet, Users, TrendingUp, Gift } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function SamaaTokenPage() {
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">SAMAA Token</h1>
              <p className="text-sm text-slate-600 font-queensides">The heart of our platform</p>
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
                  <Coins className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  SAMAA Token
                </h2>
                <p className="text-xl text-slate-600 font-queensides leading-relaxed">
                  The native utility token that powers the entire Samaa ecosystem. 
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Hold SAMAA tokens to access platform features
                  </span> and participate in our Islamic marriage community.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Token Uses */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {[
              {
                icon: Users,
                title: "Platform Access",
                description: "Hold SAMAA tokens to use Samaa's matchmaking features and connect with other Muslim singles.",
                color: "blue",
                highlight: "Required for access"
              },
              {
                icon: ShoppingBag,
                title: "Shop Purchases",
                description: "Use SAMAA tokens to buy wedding items, Islamic gifts, and other products in our integrated marketplace.",
                color: "green",
                highlight: "Shop currency"
              },
              {
                icon: Wallet,
                title: "Dowry & Purse Wallets",
                description: "Include SAMAA tokens in your Smart NFT wallets as part of your dowry or personal savings.",
                color: "purple",
                highlight: "Wallet assets"
              },
              {
                icon: Gift,
                title: "Digital Gifts",
                description: "Send SAMAA tokens as digital gifts to show interest and appreciation to potential matches.",
                color: "pink",
                highlight: "Express interest"
              }
            ].map((use, index) => (
              <motion.div
                key={use.title}
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
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50 flex-shrink-0">
                        <use.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-800 font-qurova">{use.title}</h3>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-queensides">
                            {use.highlight}
                          </span>
                        </div>
                        <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                          {use.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Token Economics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-green-300/20 hover:border-green-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-green-50/50 to-emerald-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-green-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-emerald-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-emerald-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-green-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border border-green-200/50 mr-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Token Economics</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      title: "No Monthly Fees",
                      description: "Instead of subscription fees, use SAMAA tokens for platform access and features."
                    },
                    {
                      title: "Utility-Driven Value",
                      description: "Token value is backed by real platform usage and demand from our growing community."
                    },
                    {
                      title: "Islamic Compliance",
                      description: "Designed to be halal and compliant with Islamic financial principles."
                    },
                    {
                      title: "Community Ownership",
                      description: "Token holders become stakeholders in the Samaa ecosystem's success."
                    }
                  ].map((feature, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/30">
                      <h4 className="font-semibold text-green-700 font-queensides mb-2">{feature.title}</h4>
                      <p className="text-slate-600 font-queensides leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* How to Get SAMAA Tokens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-blue-300/20 hover:border-blue-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-blue-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-blue-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">How to Get SAMAA Tokens</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Connect Your Wallet", description: "Link your Solana wallet to the Samaa platform" },
                    { step: "2", title: "Purchase with SOL", description: "Buy SAMAA tokens using SOL directly in the app" },
                    { step: "3", title: "Start Using Samaa", description: "Use your tokens to access features and shop in our marketplace" },
                    { step: "4", title: "Earn More Tokens", description: "Participate in community activities to earn additional SAMAA tokens" }
                  ].map((step, index) => (
                    <div key={step.step} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200/50 flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700">{step.step}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 font-queensides">{step.title}</h4>
                        <p className="text-slate-600 font-queensides">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits of Holding SAMAA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-purple-300/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-50/50 to-pink-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-purple-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-pink-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-pink-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-purple-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Benefits of Holding SAMAA</h3>
                <div className="space-y-3">
                  {[
                    "Access to premium matchmaking features",
                    "Discounts on shop purchases and wedding items",
                    "Priority customer support and assistance",
                    "Early access to new platform features",
                    "Participation in community governance decisions",
                    "Potential for token value appreciation"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-sm">✓</span>
                      </div>
                      <span className="text-lg text-slate-600 font-queensides">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Get Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-6 border border-amber-200/30">
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-qurova">Ready to Get Started?</h3>
              <p className="text-lg text-slate-600 font-queensides leading-relaxed mb-4">
                Connect your wallet and purchase SAMAA tokens to begin your journey toward finding 
                your perfect match in our Islamic marriage community.
              </p>
              <div className="flex justify-center space-x-4 text-sm mb-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <div className="w-2 h-2 bg-amber-500/70 rounded-full"></div>
                  <span className="font-queensides">Islamic Values</span>
                </div>
                <div className="flex items-center space-x-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500/70 rounded-full"></div>
                  <span className="font-queensides">Community Driven</span>
                </div>
              </div>
              <p className="text-amber-700 font-queensides font-semibold">
                Start your Samaa journey today!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
