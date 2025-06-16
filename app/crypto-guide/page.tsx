"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Smartphone, Download, Shield, Zap, BookOpen, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function CryptoGuidePage() {
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Get Started with Crypto</h1>
              <p className="text-sm text-slate-600 font-queensides">Your beginner's guide</p>
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
                  <BookOpen className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  Welcome to Crypto
                </h2>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                  Don't worry - we'll guide you through everything step by step. 
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    No technical experience required!
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Step-by-Step Guide */}
          <div className="space-y-6 mb-8">
            {[
              {
                step: "1",
                title: "Download a Wallet App",
                description: "Start with a beginner-friendly wallet like Phantom or Solflare",
                icon: Download,
                color: "blue",
                details: [
                  "Available on iOS and Android app stores",
                  "Free to download and use",
                  "Highly rated and trusted by millions"
                ]
              },
              {
                step: "2",
                title: "Create Your Wallet",
                description: "Follow the app's setup process to create your first crypto wallet",
                icon: Shield,
                color: "green",
                details: [
                  "Write down your recovery phrase safely",
                  "Never share your recovery phrase with anyone",
                  "Store it offline in a secure location"
                ]
              },
              {
                step: "3",
                title: "Get Some SOL",
                description: "Buy Solana (SOL) cryptocurrency to use on Samaa",
                icon: Zap,
                color: "purple",
                details: [
                  "Use the wallet's built-in purchase feature",
                  "Start with a small amount ($10-20)",
                  "SOL is used for transactions and Smart NFTs"
                ]
              },
              {
                step: "4",
                title: "Connect to Samaa",
                description: "Link your wallet to Samaa and start your marriage journey",
                icon: CheckCircle,
                color: "amber",
                details: [
                  "Click 'Connect Wallet' in Samaa",
                  "Select your wallet app",
                  "Approve the connection"
                ]
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
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
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50 flex-shrink-0">
                        <span className="text-lg font-bold text-indigo-600">{step.step}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <step.icon className="w-6 h-6 text-indigo-600" />
                          <h3 className="text-xl font-bold text-slate-800 font-qurova">{step.title}</h3>
                        </div>
                        <p className="text-slate-600 font-queensides mb-3">{step.description}</p>
                        <div className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                              <span className="text-sm text-slate-600 font-queensides">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recommended Wallets */}
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
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Recommended Wallets</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    {
                      name: "Phantom",
                      description: "Most popular Solana wallet with excellent mobile app",
                      features: ["Easy to use", "Built-in crypto purchase", "Great security"]
                    },
                    {
                      name: "Solflare",
                      description: "Official Solana wallet with advanced features",
                      features: ["Official support", "Web and mobile", "Advanced features"]
                    }
                  ].map((wallet, index) => (
                    <div key={wallet.name} className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/30">
                      <h4 className="font-bold text-green-700 font-queensides mb-2">{wallet.name}</h4>
                      <p className="text-slate-600 font-queensides text-sm mb-3">{wallet.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {wallet.features.map((feature, featureIndex) => (
                          <span key={featureIndex} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-queensides">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Safety Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-amber-300/20 hover:border-amber-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-orange-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-orange-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Safety First</h3>
                <div className="space-y-3">
                  {[
                    "Never share your recovery phrase with anyone",
                    "Only download wallets from official app stores",
                    "Start with small amounts while learning",
                    "Double-check all transaction details",
                    "Keep your wallet app updated"
                  ].map((tip, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span className="text-slate-600 font-queensides">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-6 border border-indigo-200/30">
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-qurova">Need Help?</h3>
              <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                Our support team is here to help you every step of the way. Don't hesitate to reach out 
                if you have any questions about getting started with crypto.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                  <span className="font-queensides">24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-600">
                  <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
                  <span className="font-queensides">Beginner Friendly</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
