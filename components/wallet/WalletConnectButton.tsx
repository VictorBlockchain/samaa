"use client"

import React from "react"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"
import { LogIn, LogOut } from "lucide-react"

export function WalletConnectButton() {
  const { isAuthenticated, signOut } = useAuth()
  const router = useRouter()

  if (isAuthenticated) {
    return (
      <button
        onClick={async () => {
          await signOut()
          router.push("/")
        }}
        className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    )
  }

  return (
    <button
      onClick={() => router.push("/auth/login")}
      className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </button>
  )
}
