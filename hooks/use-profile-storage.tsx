"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"

interface ProfileData {
  firstName: string
  lastName: string
  age: string
  gender: string
  location: string
  education: string
  profession: string
  religiosity: string
  prayerFrequency: string
  hijabPreference: string
  marriageIntention: string
  bio: string
  interests: string[]
  profilePhoto: File | null
  walletAddress: string
  createdAt: string
}

export function useProfileStorage() {
  const { publicKey, connected } = useWallet()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (connected && publicKey) {
      loadProfile()
    } else {
      setProfile(null)
      setIsLoading(false)
    }
  }, [connected, publicKey])

  const loadProfile = () => {
    if (!publicKey) return

    try {
      const savedProfile = localStorage.getItem(`profile_${publicKey.toString()}`)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = (profileData: Partial<ProfileData>) => {
    if (!publicKey) return

    const updatedProfile = {
      ...profile,
      ...profileData,
      walletAddress: publicKey.toString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(`profile_${publicKey.toString()}`, JSON.stringify(updatedProfile))
      setProfile(updatedProfile as ProfileData)
      return true
    } catch (error) {
      console.error("Error saving profile:", error)
      return false
    }
  }

  const isProfileComplete = () => {
    if (!profile) return false

    const requiredFields = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "location",
      "education",
      "profession",
      "religiosity",
      "prayerFrequency",
      "marriageIntention",
      "bio",
    ]

    return requiredFields.every((field) => profile[field as keyof ProfileData])
  }

  return {
    profile,
    isLoading,
    saveProfile,
    loadProfile,
    isProfileComplete: isProfileComplete(),
    walletAddress: publicKey?.toString(),
  }
}
