'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { ProfileService } from '@/lib/database'

type UserContextType = {
  userId: string | null
  isAuthenticated: boolean
  isMod: boolean
  isAdmin: boolean
  loading: boolean
  refreshIsMod: () => Promise<void>
  refreshIsAdmin: () => Promise<void>
  profile: any
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth()

  const [isMod, setIsMod] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any | undefined>(undefined)

  const refreshIsMod = async () => {
    setIsMod(false)
  }

  const refreshIsAdmin = async () => {
    setIsAdmin(false)
  }

  const refreshProfile = async () => {
    try {
      if (!userId) {
        setProfile(undefined)
        return
      }
      setLoading(true)
      // Try to load existing profile by user ID
      const existing = await ProfileService.getProfileByUserId(userId)
      if (existing) {
        setProfile(existing)
        return
      }
      // Create minimal profile if not found
      const created = await ProfileService.createProfile({
        id: userId,
        is_active: true,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      setProfile(created || undefined)
    } catch (e) {
      console.warn('Failed to load/create profile:', e)
      setProfile(undefined)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshIsMod()
    refreshIsAdmin()
    refreshProfile()
  }, [userId])

  const value = useMemo(
    () => ({ 
      userId, 
      isAuthenticated, 
      isMod, 
      isAdmin, 
      loading: loading || authLoading, 
      profile, 
      refreshIsMod, 
      refreshIsAdmin, 
      refreshProfile 
    }),
    [userId, isAuthenticated, isMod, isAdmin, loading, authLoading, profile],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
