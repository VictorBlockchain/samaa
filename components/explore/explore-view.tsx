"use client"

import { useState } from "react"
import { ArrowLeft, Users, Sparkles, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CelestialBackground } from "@/components/ui/celestial-background"



export function ExploreView() {
  const [activeTab, setActiveTab] = useState<"wants-you" | "potentials" | "you-want-them">("potentials")
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Explore</h1>
              <p className="text-sm text-slate-600 font-queensides">Discover your matches</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-3 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20 w-full">
              <button
                onClick={() => setActiveTab("wants-you")}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  activeTab === "wants-you"
                    ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="text-2xl mb-1">💌</div>
                <div className="text-xs font-queensides text-slate-600 leading-tight">Wants You</div>
                {activeTab === "wants-you" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("potentials")}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  activeTab === "potentials"
                    ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="text-2xl mb-1">🔍</div>
                <div className="text-xs font-queensides text-slate-600 leading-tight">Potentials</div>
                {activeTab === "potentials" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("you-want-them")}
                className={`relative p-3 rounded-xl transition-all duration-300 ${
                  activeTab === "you-want-them"
                    ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="text-2xl mb-1">💕</div>
                <div className="text-xs font-queensides text-slate-600 leading-tight">You Want Them</div>
                {activeTab === "you-want-them" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Simple Message Content */}
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <div className="text-center max-w-md mx-auto">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-indigo-200/50"
            >
              <Users className="w-12 h-12 text-indigo-600" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-3xl font-bold text-slate-800 font-qurova mb-4"
            >
              Matches Start Soon
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-slate-600 font-queensides text-lg leading-relaxed mb-8"
            >
              For now, create your profile to get ready for when matching begins
            </motion.p>

            {/* Decorative divider */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                <div className="w-4 h-4 border border-indigo-400/60 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                </div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
              </div>
            </motion.div>

            {/* Create Profile Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <button
                onClick={() => router.push("/profile-setup")}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 font-qurova flex items-center justify-center space-x-3"
              >
                <Heart className="w-5 h-5" />
                <span>Create Your Profile</span>
                <Sparkles className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
