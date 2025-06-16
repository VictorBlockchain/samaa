"use client"

import { motion } from "framer-motion"
import { ArrowLeft, FileText, Users, Shield, Heart, AlertTriangle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function TermsPage() {
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">User Agreement</h1>
              <p className="text-sm text-slate-600 font-queensides">Terms of service</p>
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
                  <FileText className="w-10 h-10 text-indigo-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                  User Agreement
                </h2>
                <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                  Welcome to Samaa! These terms govern your use of our platform and help us create a 
                  <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    safe, respectful community
                  </span> for Muslim singles.
                </p>
                <p className="text-sm text-slate-500 font-queensides mt-4">
                  Last updated: December 2024
                </p>
              </div>
            </div>
          </motion.div>

          {/* Core Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Islamic Values</h3>
                </div>
                <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                  Samaa is built on Islamic principles. By using our platform, you agree to respect these values 
                  and maintain halal interactions with other users.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Respectful communication at all times",
                    "No inappropriate content or behavior",
                    "Marriage-focused intentions only",
                    "Honesty in profile information"
                  ].map((principle, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-3 border border-green-200/30">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-slate-600 font-queensides text-sm">{principle}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-blue-300/20 hover:border-blue-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-blue-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-blue-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200/50 mr-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Your Responsibilities</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      title: "Account Security",
                      description: "Keep your wallet and account information secure. Never share private keys or recovery phrases."
                    },
                    {
                      title: "Accurate Information",
                      description: "Provide truthful and current information in your profile. Misrepresentation is not allowed."
                    },
                    {
                      title: "Respectful Behavior",
                      description: "Treat all users with respect and kindness. Harassment or abuse will result in account termination."
                    },
                    {
                      title: "Legal Compliance",
                      description: "Follow all applicable laws and regulations in your jurisdiction when using Samaa."
                    }
                  ].map((responsibility, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-200/30">
                      <h4 className="font-semibold text-blue-700 font-queensides mb-2">{responsibility.title}</h4>
                      <p className="text-slate-600 font-queensides text-sm">{responsibility.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Smart NFT Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-purple-300/20 hover:border-purple-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-purple-50/50 to-pink-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-purple-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-pink-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-pink-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-purple-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 font-qurova">Smart NFT Wallet Terms</h3>
                <div className="space-y-3">
                  {[
                    "You own your Smart NFT wallets and all assets within them",
                    "Samaa cannot access or control your wallet contents",
                    "You are responsible for wallet security and backup",
                    "Smart NFT transfers are permanent and cannot be reversed",
                    "Time-locked assets cannot be accessed until the specified date",
                    "Lost private keys cannot be recovered by Samaa"
                  ].map((term, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-slate-600 font-queensides text-sm">{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Prohibited Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-red-300/20 hover:border-red-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-red-50/50 to-orange-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-red-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-orange-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-orange-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-red-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center border border-red-200/50 mr-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Prohibited Activities</h3>
                </div>
                <p className="text-slate-600 font-queensides mb-4">
                  The following activities are strictly prohibited and may result in immediate account termination:
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Creating fake profiles or impersonating others",
                    "Sharing inappropriate or explicit content",
                    "Harassment, bullying, or discriminatory behavior",
                    "Soliciting money or financial information",
                    "Promoting non-Islamic values or practices",
                    "Using the platform for commercial purposes without permission"
                  ].map((activity, index) => (
                    <div key={index} className="bg-gradient-to-br from-red-50/50 to-orange-50/50 rounded-xl p-3 border border-red-200/30">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-slate-600 font-queensides text-sm">{activity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Platform Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="relative group mb-8"
          >
            <div className="relative rounded-2xl p-6 border-2 border-amber-300/20 hover:border-amber-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30">
              <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-amber-400/60 rounded-tl-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-orange-400/60 rounded-tr-lg"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-orange-400/60 rounded-bl-lg"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-amber-400/60 rounded-br-lg"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center border border-amber-200/50 mr-4">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 font-qurova">Our Rights</h3>
                </div>
                <p className="text-slate-600 font-queensides mb-4">
                  To maintain a safe and respectful community, Samaa reserves the right to:
                </p>
                <div className="space-y-2">
                  {[
                    "Moderate content and remove inappropriate material",
                    "Suspend or terminate accounts that violate these terms",
                    "Update these terms with reasonable notice",
                    "Investigate reported violations and take appropriate action"
                  ].map((right, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-slate-600 font-queensides text-sm">{right}</span>
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
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-6 border border-indigo-200/30">
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-qurova">Questions About These Terms?</h3>
              <p className="text-slate-600 font-queensides leading-relaxed mb-4">
                If you have any questions about these terms or need clarification on any point, 
                please contact our legal team.
              </p>
              <div className="flex justify-center space-x-4 text-sm mb-4">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                  <span className="font-queensides">Legal Support</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-600">
                  <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
                  <span className="font-queensides">Clear Guidance</span>
                </div>
              </div>
              <p className="text-indigo-700 font-queensides font-semibold">
                legal@samaa.app
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
