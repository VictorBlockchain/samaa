"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, Gift } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card } from "@/components/ui/card"
import { CelestialBackground } from "@/components/ui/celestial-background"

interface Notification {
  id: string
  type: "like" | "message" | "match" | "gift" | "system"
  title: string
  description: string
  time: string
  read: boolean
  avatar?: string
  actionUrl?: string
}

// Mock data removed - notifications will come from real backend
const NOTIFICATIONS: Notification[] = []

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "likes" | "messages" | "matches">("all")
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  
  const router = useRouter()
  const { connected } = useWallet()

  const tabs = [
    { id: "all", label: "All", icon: Bell },
    { id: "likes", label: "Likes", icon: Heart },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "matches", label: "Matches", icon: UserPlus },
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like": return "💖"
      case "message": return "💌"
      case "match": return "✨"
      case "gift": return "🎁"
      case "system": return "🔔"
      default: return "📱"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "like": return "from-pink-100 to-red-100 border-pink-200/50"
      case "message": return "from-blue-100 to-indigo-100 border-blue-200/50"
      case "match": return "from-purple-100 to-indigo-100 border-purple-200/50"
      case "gift": return "from-yellow-100 to-orange-100 border-yellow-200/50"
      case "system": return "from-gray-100 to-slate-100 border-gray-200/50"
      default: return "from-indigo-100 to-purple-100 border-indigo-200/50"
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    if (activeTab === "likes") return notification.type === "like"
    if (activeTab === "messages") return notification.type === "message"
    if (activeTab === "matches") return notification.type === "match"
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Notifications</h1>
              <p className="text-sm text-slate-600 font-queensides">Stay updated with your matches</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20 w-full">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    <tab.icon className="w-6 h-6 mx-auto" />
                  </div>
                  <div className="text-xs font-queensides font-bold text-slate-700 leading-tight">
                    {tab.label}
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredNotifications.length === 0 ? (
                <Card className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-700 font-qurova mb-2">No Notifications</h3>
                  <p className="text-slate-600 font-queensides">You're all caught up!</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      onClick={() => handleNotificationClick(notification)}
                      className="cursor-pointer"
                    >
                      <Card className={`p-4 hover:shadow-lg transition-all duration-300 bg-gradient-to-r ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'ring-2 ring-indigo-200/50' : ''
                      }`}>
                        <div className="flex items-start space-x-4">
                          {/* Avatar or Icon */}
                          <div className="flex-shrink-0">
                            {notification.avatar ? (
                              <img
                                src={notification.avatar}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-slate-800 font-qurova text-sm">
                                  {notification.title}
                                </h3>
                                <p className="text-slate-600 font-queensides text-sm mt-1">
                                  {notification.description}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-queensides mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
