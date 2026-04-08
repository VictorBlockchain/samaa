"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, User, Settings, Shield, LogOut, Mail, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function WalletView() {
  const [activeTab, setActiveTab] = useState<"account" | "settings">("account")
  const router = useRouter()
  const { user, userId, isAuthenticated, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-100/50 p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-2">Sign In Required</h2>
            <p className="text-slate-600 font-queensides mb-6">
              Please sign in to access your account settings.
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Account</h1>
              <p className="text-sm text-slate-600 font-queensides">
                Manage your profile and settings
              </p>
            </div>
            <div className="w-10" />
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-4">
            <div className="flex bg-indigo-50 rounded-2xl p-1 w-full">
              {["account", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "account" | "settings")}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-white shadow-md text-indigo-600"
                      : "text-slate-600 hover:text-indigo-600"
                  } font-queensides capitalize`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100/50 p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 font-qurova">
                      {user?.user_metadata?.first_name || user?.email?.split('@')[0] || "User"}
                    </h3>
                    <p className="text-sm text-slate-500 font-queensides">{user?.email}</p>
                  </div>
                </div>

                {/* Account Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-queensides text-slate-600">Email</span>
                    </div>
                    <span className="text-sm font-queensides text-slate-800">{user?.email}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-queensides text-slate-600">Joined</span>
                    </div>
                    <span className="text-sm font-queensides text-slate-800">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-queensides text-slate-600">Status</span>
                    </div>
                    <span className="text-sm font-queensides text-green-600">Verified</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => router.push("/profile-setup")}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    Complete Profile
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-indigo-100/50 p-6">
                <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Settings</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/settings")}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-queensides text-slate-600">Match Preferences</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
                  </button>

                  <button
                    onClick={() => router.push("/privacy")}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-queensides text-slate-600">Privacy Settings</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
