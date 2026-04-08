"use client"

import { useAuth } from "@/app/context/AuthContext"

export function useAppWallet() {
  const { userId, isAuthenticated, signOut } = useAuth()

  return {
    address: userId,
    connected: isAuthenticated,
    disconnect: signOut,
  }
}
