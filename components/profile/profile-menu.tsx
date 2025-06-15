"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Edit3,
  Settings,
  Shield,
  QrCode,
  Users,
  HelpCircle,
  Calendar,
  Crown,
  Filter,
  Star,
  Moon,
  Sparkles,
} from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { useRouter } from "next/navigation"

export function ProfileMenu() {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("marriage")

  const menuItems = [
    {
      icon: Edit3,
      title: "Edit Profile",
      description: "Update your information and photos",
      action: () => router.push("/profile-setup"),
    },
    {
      icon: Filter,
      title: "Search Filters",
      description: "Customize your match preferences",
      action: () => router.push("/filters"),
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Privacy and account settings",
      action: () => router.push("/settings"),
      badge: "New",
    },
    {
      icon: Calendar,
      title: "Islamic Events",
      description: "Meet single Muslims face-to-face. Discover exciting new events happening near you!",
      action: () => router.push("/events"),
      badge: "New",
    },
    {
      icon: HelpCircle,
      title: "Help & Support Center",
      description: "Get help with your account",
      action: () => router.push("/support"),
    },
    {
      icon: Users,
      title: "Invite Friends",
      description: "Earn rewards for referrals",
      action: () => router.push("/invite"),
    },
    {
      icon: QrCode,
      title: "Share Wallet QR Code",
      description: "Use your QR code to match with Samaa members you meet offline",
      action: () => router.push("/qr-code"),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      <CelestialBackground intensity="light" />

      <div className="relative z-10">
        {/* Header */}
        <div className="p-4 bg-white/80 backdrop-blur-xl border-b border-indigo-200/50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold font-qurova">Menu</h1>

            <div className="flex items-center gap-2">
              <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-queensides">4 ✈️</div>
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">•</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("marriage")}
              className={`pb-2 font-queensides ${
                activeTab === "marriage" ? "text-slate-800 border-b-2 border-slate-800" : "text-slate-500"
              }`}
            >
              Marriage
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`pb-2 font-queensides ${
                activeTab === "social" ? "text-slate-800 border-b-2 border-slate-800" : "text-slate-500"
              }`}
            >
              Social
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Profile Preview */}
          {connected && publicKey && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full border-4 border-pink-400 flex items-center justify-center">
                  <span className="text-2xl font-qurova">IB</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>

              <h2 className="text-xl font-bold font-qurova mb-1">Ibrahym</h2>
              <Button
                variant="outline"
                size="sm"
                className="font-queensides"
                onClick={() => router.push(`/profile/${publicKey.toString()}`)}
              >
                View profile
              </Button>
            </motion.div>
          )}

          {/* Premium Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200">
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-slate-800 font-qurova">4</h3>
                <h4 className="font-bold text-slate-800 font-qurova mb-1">Profile Boosts</h4>
                <p className="text-xs text-slate-600 font-queensides mb-3">Get up to 11x more visits</p>
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600 font-queensides">
                  Buy more
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-slate-800 font-qurova">1</h3>
                <h4 className="font-bold text-slate-800 font-qurova mb-1">Compliment</h4>
                <p className="text-xs text-slate-600 font-queensides mb-3">Message without waiting</p>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600 font-queensides">
                  Buy more
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Premium Membership */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-600" />
                <span className="font-bold text-slate-800 font-qurova">Manage Gold membership</span>
              </div>
              <Button variant="ghost" size="sm">
                <Crown className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="bg-white/80 backdrop-blur-xl border border-indigo-200/50 cursor-pointer hover:bg-white/90 transition-colors"
                  onClick={item.action}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <item.icon className="w-5 h-5 text-slate-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800 font-qurova">{item.title}</h3>
                          {item.badge && (
                            <Badge variant="destructive" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-slate-600 font-queensides">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ID Verification */}
          <Card className="bg-slate-50 border border-slate-200 mt-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-500" />
                <div>
                  <h4 className="font-bold text-slate-800 font-qurova">ID Verification ✓</h4>
                  <p className="text-sm text-slate-600 font-queensides">
                    Verify your age and identity to receive more likes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Islamic Blessing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center py-8"
          >
            {/* Islamic Divider */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-indigo-400" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-400" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            <p className="text-base text-slate-500 font-queensides italic">
              "And Allah has made for you from yourselves mates"
            </p>
            <p className="text-sm text-slate-400 font-queensides mt-1">- Quran 16:72</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
