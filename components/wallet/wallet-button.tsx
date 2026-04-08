"use client"

import { useAuth } from "@/app/context/AuthContext"
import {
  User,
  LogOut,
  Settings,
  Shield,
  LogIn,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface AuthButtonProps {
  className?: string
  showText?: boolean
}

export function WalletButton({ className, showText = false }: AuthButtonProps) {
  const { isAuthenticated, userId, signOut } = useAuth()
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  const handleLogin = () => {
    router.push("/auth/login")
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    if (error) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" })
    } else {
      setShowDetails(false)
      toast({ title: "Signed out successfully" })
      router.push("/")
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.button
        onClick={handleLogin}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center justify-center rounded-xl",
          "bg-gradient-to-r from-indigo-400 to-purple-500 text-white",
          "hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",
          showText ? "px-4 py-2 space-x-2" : "w-10 h-10",
          className
        )}
        aria-label="Sign in to continue with Samaa"
      >
        <LogIn className={cn("w-4 h-4")} />
        {showText && <span className="font-queensides font-bold text-sm">Sign In</span>}
      </motion.button>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => router.push("/settings")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          "bg-gray-100 hover:bg-gray-200 text-gray-600",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
          className
        )}
      >
        <Settings className="w-4 h-4" />
      </motion.button>

      {/* User details dropdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 min-w-56 backdrop-blur-xl rounded-xl shadow-2xl border border-indigo-200/50 overflow-hidden z-50 bg-white"
          >
            {/* Header */}
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 border-b border-indigo-400/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm font-qurova">Account</h3>
                  <p className="text-xs text-indigo-100 font-queensides flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                    Signed In
                  </p>
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="p-3 border-b border-slate-200">
              <p className="text-xs text-slate-500 font-queensides mb-1">User ID</p>
              <code className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {userId ? `${userId.slice(0, 8)}...${userId.slice(-4)}` : ""}
              </code>
            </div>

            {/* Security info */}
            <div className="p-3 border-b border-slate-200">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-green-500" />
                <p className="text-xs text-green-600">Secure • Protected</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-queensides border border-red-200 text-sm"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {showDetails && <div className="fixed inset-0 z-40" onClick={() => setShowDetails(false)} />}
    </div>
  )
}
