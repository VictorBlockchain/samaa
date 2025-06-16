"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Shield, Eye, Lock, Users, Database, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function PrivacyPage() {
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Privacy Policy</h1>
              <p className="text-sm text-slate-600 font-queensides">Your privacy matters</p>
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
                  <Shield className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  Privacy First
                </h2>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                  At Samaa, we believe privacy is a fundamental right. This policy explains how we 
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    protect and respect your personal information
                  </span>.
                </p>
                <p className="text-sm text-slate-500 font-queensides mt-4">
                  Last updated: December 2024
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy Principles */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {[
              {
                icon: Eye,
                title: "Transparency",
                description: "We clearly explain what data we collect and why we need it.",
                details: ["Clear data collection notices", "No hidden tracking", "Open about our practices"]
              },
              {
                icon: Lock,
                title: "Security",
                description: "Your data is protected with industry-leading security measures.",
                details: ["End-to-end encryption", "Secure data storage", "Regular security audits"]
              },
              {
                icon: Users,
                title: "Control",
                description: "You have full control over your personal information.",
                details: ["Delete your data anytime", "Control sharing preferences", "Manage privacy settings"]
              }
            ].map((principle, index) => (
              <motion.div
                key={principle.title}
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
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50 mr-4">
                        <principle.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 font-qurova">{principle.title}</h3>
                    </div>
                    <p className="text-slate-600 font-queensides mb-4">{principle.description}</p>
                    <div className="space-y-2">
                      {principle.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                          <span className="text-sm text-slate-600 font-queensides">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Data Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
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
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">What We Collect</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      category: "Profile Information",
                      items: ["Name, age, location", "Islamic values and preferences", "Photos and bio"]
                    },
                    {
                      category: "Wallet Data",
                      items: ["Public wallet addresses only", "Transaction history for Smart NFTs", "No private keys or seed phrases"]
                    },
                    {
                      category: "Usage Data",
                      items: ["App interactions and preferences", "Match and messaging activity", "Support communications"]
                    }
                  ].map((section, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/30">
                      <h4 className="font-semibold text-green-700 font-queensides mb-2">{section.category}</h4>
                      <ul className="space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-slate-600 font-queensides text-sm flex items-center space-x-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* How We Use Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-blue-300/20 hover:border-blue-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-blue-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-blue-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">How We Use Your Data</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    "Provide matchmaking services based on your preferences",
                    "Enable secure messaging and communication features",
                    "Process Smart NFT wallet transactions",
                    "Improve our services and user experience",
                    "Provide customer support and assistance",
                    "Ensure platform safety and prevent fraud"
                  ].map((use, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-200/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                        </div>
                        <span className="text-slate-600 font-queensides">{use}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-purple-300/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-50/50 to-pink-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-purple-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-pink-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-pink-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-purple-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Your Rights</h3>
                <div className="space-y-3">
                  {[
                    "Access your personal data at any time",
                    "Correct or update your information",
                    "Delete your account and all associated data",
                    "Export your data in a portable format",
                    "Opt out of marketing communications",
                    "Request information about data sharing"
                  ].map((right, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-slate-600 font-queensides">{right}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-6 border border-amber-200/30">
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-qurova">Questions About Privacy?</h3>
              <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                If you have any questions about this privacy policy or how we handle your data, 
                please don't hesitate to contact our privacy team.
              </p>
              <div className="flex justify-center space-x-4 text-sm mb-4">
                <div className="flex items-center space-x-2 text-amber-600">
                  <div className="w-2 h-2 bg-amber-500/70 rounded-full"></div>
                  <span className="font-queensides">Quick Response</span>
                </div>
                <div className="flex items-center space-x-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500/70 rounded-full"></div>
                  <span className="font-queensides">Expert Support</span>
                </div>
              </div>
              <p className="text-amber-700 font-queensides font-semibold">
                privacy@samaa.app
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
