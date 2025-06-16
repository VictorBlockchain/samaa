"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  ArrowLeft,
  Edit3,
  Heart,
  Star,
  Shield,
  Crown,
  Sparkles,
  Moon,
  Share,
  QrCode,
  Gift,
  Users,
  Plus,
  UserPlus,
  Settings,
  MapPin,
  MessageCircle,
  Wallet,
  Baby,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"

interface ProfileData {
  // Basic Info
  firstName: string
  lastName: string
  age: string
  gender: string
  height: string
  maritalStatus: string
  children: string
  tagline: string
  bio: string
  location?: string
  bioTagline?: string
  wantChildren?: string
  hasChildren?: string

  // Location
  currentLocation: string
  grewUpIn: string
  livingArrangements: string

  // Education & Career
  education: string
  profession: string
  employer: string
  jobTitle: string

  // Languages & Ethnicity
  ethnicity: string
  nationality: string
  languages: string[]

  // Islamic Values & Religiosity
  sect: string
  bornMuslim: string
  religiousPractice: string
  faith: string
  diet: string
  alcohol: string
  smoking: string
  psychedelics?: string
  halalFood?: string
  isRevert?: string
  hijabChoice?: string
  islamicValues?: string
  prayerFrequency?: string
  quranReading?: string
  islamicEducation?: string

  // Marriage Intentions
  chattingTimeline: string
  familyInvolvement: string
  marriageTimeline: string
  lookingFor?: string
  familyPlans?: string

  // Future Plans
  relocationPlans: string
  polygamyPlan: string

  // Interests & Personality
  interests: string[]
  personality: string[]

  // Wallet Information
  dowryWallet?: {
    isSetup: boolean
    address?: string
    solanaBalance?: number
    samaaBalance?: number
  }
  purseWallet?: {
    isSetup: boolean
    address?: string
    solanaBalance?: number
    samaaBalance?: number
  }

  // Media from profile setup
  media?: {
    photos: string[]
    videoIntro?: string
    voiceNote?: string
    audioMessages?: string[]
  }
  profilePhoto?: string
  voiceIntro?: string
  video?: string

  // Verification & Premium
  walletAddress: string
  createdAt: string
  isVerified?: boolean
  premiumMember?: boolean
  idVerified?: boolean
  bioRating?: number
  responseRate?: number
  profileComplete?: boolean
}

interface ProfileViewProps {
  walletAddress: string
}

export function ProfileView({ walletAddress }: ProfileViewProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [currentTab, setCurrentTab] = useState("home")
  const [showMessagePermissions, setShowMessagePermissions] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [messagePermissions, setMessagePermissions] = useState({
    requireFinancialSetup: true,
    minBioRating: 75,
    minResponseRate: 60,
    allowVideoMessages: true,
  })
  const [userSettings, setUserSettings] = useState({
    ageRange: [22, 35],
    maxDistance: 50,
    anywhereInWorld: false,
    showOnlyVerified: true,
    showOnlyPracticing: true,
    interests: [] as string[],
    faithAndPractice: {
      prayerFrequency: "No preference",
      hijabPreference: "No preference",
      marriageIntention: "No preference",
      halalFood: "No preference",
      diet: "No preference",
      alcohol: "No preference",
      smoking: "No preference",
      psychedelics: "No preference",
      bornMuslim: "No preference",
    },
    aboutThem: {
      nationality: "No preference",
      height: "No preference",
      maritalStatus: "No preference",
      children: "No preference",
      grewUpIn: "No preference",
      languages: "No preference",
      willingToRelocate: "No preference",
      education: "No preference",
    },
    notifications: {
      matches: true,
      messages: true,
      profileViews: false,
    },
    privacy: {
      showAge: true,
      showLocation: true,
      showLastSeen: false,
    },
    userGender: "female",
    requireFinancialSetup: false,
    bioRatingMinimum: 70,
    responseRateMinimum: 50,
  })

  const { publicKey, connected } = useWallet()

  // Keyboard navigation for photo modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null || !profile?.media?.photos) return

      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null)
      } else if (e.key === 'ArrowLeft' && selectedPhotoIndex > 0) {
        setSelectedPhotoIndex(selectedPhotoIndex - 1)
      } else if (e.key === 'ArrowRight' && selectedPhotoIndex < profile.media.photos.length - 1) {
        setSelectedPhotoIndex(selectedPhotoIndex + 1)
      }
    }

    if (selectedPhotoIndex !== null) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedPhotoIndex, profile?.media?.photos])

  const checkIfOwnProfile = () => {
    console.log("Checking if own profile...")
    console.log("Connected:", connected)
    console.log("PublicKey:", publicKey?.toString())
    console.log("WalletAddress from URL:", walletAddress)

    if (connected && publicKey) {
      const isOwn = publicKey.toString() === walletAddress
      console.log("Is own profile:", isOwn)
      setIsOwnProfile(isOwn)
    } else {
      console.log("Wallet not connected, setting isOwnProfile to false")
      setIsOwnProfile(false)
    }
  }

  useEffect(() => {
    console.log("Profile component mounted with walletAddress:", walletAddress)
    console.log("Connected:", connected, "PublicKey:", publicKey?.toString())
    checkIfOwnProfile()
    loadProfile()
  }, [walletAddress, publicKey, connected])

  // Migrate old settings format to new format
  const migrateSettings = (oldSettings: any) => {
    const newSettings = {
      ageRange: oldSettings.ageRange || [22, 35],
      maxDistance: oldSettings.maxDistance || 50,
      anywhereInWorld: oldSettings.anywhereInWorld || false,
      showOnlyVerified: oldSettings.showOnlyVerified || true,
      showOnlyPracticing: oldSettings.showOnlyPracticing || true,
      interests: oldSettings.interests || [],
      faithAndPractice: {
        prayerFrequency: oldSettings.faithAndPractice?.prayerFrequency || "No preference",
        hijabPreference: oldSettings.faithAndPractice?.hijabPreference || "No preference",
        marriageIntention: oldSettings.faithAndPractice?.marriageIntention || "No preference",
        halalFood: oldSettings.faithAndPractice?.halalFood || "No preference",
        diet: oldSettings.faithAndPractice?.diet || "No preference",
        alcohol: oldSettings.faithAndPractice?.alcohol || "No preference",
        smoking: oldSettings.faithAndPractice?.smoking || "No preference",
        psychedelics: oldSettings.faithAndPractice?.psychedelics || "No preference",
        bornMuslim: oldSettings.faithAndPractice?.bornMuslim || "No preference",
      },
      aboutThem: {
        nationality: oldSettings.aboutThem?.nationality || "No preference",
        height: oldSettings.aboutThem?.height || "No preference",
        maritalStatus: oldSettings.aboutThem?.maritalStatus || "No preference",
        children: oldSettings.aboutThem?.children || "No preference",
        grewUpIn: oldSettings.aboutThem?.grewUpIn || "No preference",
        languages: oldSettings.aboutThem?.languages || "No preference",
        willingToRelocate: oldSettings.aboutThem?.willingToRelocate || "No preference",
        education: oldSettings.aboutThem?.education || "No preference",
      },
      notifications: oldSettings.notifications || {
        matches: true,
        messages: true,
        profileViews: false,
      },
      privacy: oldSettings.privacy || {
        showAge: true,
        showLocation: true,
        showLastSeen: false,
      },
      userGender: oldSettings.userGender || "female",
      requireFinancialSetup: oldSettings.requireFinancialSetup || false,
      bioRatingMinimum: oldSettings.bioRatingMinimum || 70,
      responseRateMinimum: oldSettings.responseRateMinimum || 50,
    }

    // Save the migrated settings
    localStorage.setItem("userSettings", JSON.stringify(newSettings))
    console.log("Settings migrated to new format:", newSettings)

    return newSettings
  }

  const loadProfile = () => {
    try {
      const savedProfile = localStorage.getItem(`profile_${walletAddress}`)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }

      // Load user settings if this is own profile (check directly with wallet comparison)
      const isOwn = connected && publicKey && publicKey.toString() === walletAddress
      console.log("Loading settings - isOwn:", isOwn, "connected:", connected, "publicKey:", publicKey?.toString(), "walletAddress:", walletAddress)

      if (isOwn) {
        const savedSettings = localStorage.getItem("userSettings")
        console.log("Raw saved settings:", savedSettings) // Debug log
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          console.log("Parsed settings:", parsedSettings) // Debug log

          // Check if settings need migration (has old fields)
          if (parsedSettings.faithAndPractice?.religiousPractice ||
              parsedSettings.faithAndPractice?.islamicDress ||
              parsedSettings.futurePlans) {
            console.log("Migrating old settings format...")
            const migratedSettings = migrateSettings(parsedSettings)
            setUserSettings(migratedSettings)
          } else {
            console.log("Using settings as-is")
            setUserSettings(parsedSettings)
          }
        } else {
          console.log("No saved settings found") // Debug log
        }
      } else {
        console.log("Not own profile, skipping settings load")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-queensides">Loading profile...</p>
        </div>
      </div>
    )
  }

  console.log("Render state:")
  console.log("- isLoading:", isLoading)
  console.log("- profile:", !!profile)
  console.log("- isOwnProfile:", isOwnProfile)
  console.log("- walletAddress:", walletAddress)
  console.log("- connected:", connected)
  console.log("- publicKey:", publicKey?.toString())

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative pb-24">
        <CelestialBackground intensity="light" />

        <div className="relative z-10">
          {/* Header */}
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <DesktopNavigation />
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 pt-20">
            {isOwnProfile ? (
              // Own profile - encourage to create profile
              <div className="w-full max-w-md space-y-8">
 

                {/* Profile Setup Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="arabic-border bg-gradient-to-br from-indigo-50 to-purple-50">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">Create Your Profile</h3>
                      <p className="text-slate-600 font-queensides mb-6 leading-relaxed">
                        Share your values, interests, and what you're looking for in a life partner.
                      </p>
                      <Button
                        onClick={() => router.push("/profile-setup")}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides py-4 text-lg"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create My Profile
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Audio/Video Message Permissions Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="arabic-border bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">Message Permissions</h3>
                      <p className="text-slate-600 font-queensides mb-6 leading-relaxed">
                        Control who can send you audio and video messages. These are separate from your match
                        preferences.
                      </p>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                          <div className="text-left">
                            <p className="font-medium text-slate-800 font-qurova">Require Financial Setup</p>
                            <p className="text-sm text-slate-600 font-queensides">
                              Only users with dowry wallet/purse can message me
                            </p>
                          </div>
                          <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                            <div className="w-5 h-5 bg-emerald-500 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                          <div className="text-left">
                            <p className="font-medium text-slate-800 font-qurova">Minimum Bio Rating</p>
                            <p className="text-sm text-slate-600 font-queensides">
                              Require 75%+ profile completion to message me
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-emerald-600">75%</span>
                            <div className="w-16 h-2 bg-slate-200 rounded-full">
                              <div className="w-3/4 h-2 bg-emerald-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                          <div className="text-left">
                            <p className="font-medium text-slate-800 font-qurova">Response Rate Filter</p>
                            <p className="text-sm text-slate-600 font-queensides">
                              Only users with 60%+ response rate can message me
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-emerald-600">60%</span>
                            <div className="w-16 h-2 bg-slate-200 rounded-full">
                              <div className="w-3/5 h-2 bg-emerald-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/60 rounded-lg">
                          <div className="text-left">
                            <p className="font-medium text-slate-800 font-qurova">Allow Video Messages</p>
                            <p className="text-sm text-slate-600 font-queensides">
                              Users can send video messages to me
                            </p>
                          </div>
                          <div className="w-12 h-6 bg-emerald-200 rounded-full relative cursor-pointer">
                            <div className="w-5 h-5 bg-emerald-500 rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/30 mb-6">
                        <p className="text-sm text-emerald-700 font-queensides">
                          These settings only control who can send you messages. Your match preferences are configured
                          separately in Settings.
                        </p>
                      </div>

                      <Button
                        onClick={() => setShowMessagePermissions(true)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-queensides py-4 text-lg"
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        Configure Message Permissions
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Explore Options Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Card className="arabic-border bg-white/80 backdrop-blur-xl">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Explore Samaa</h3>
                      <p className="text-slate-600 font-queensides mb-6">
                        Take a look around and see what Samaa has to offer before creating your profile.
                      </p>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={() => router.push("/")}
                          className="w-full font-queensides py-3"
                        >
                          Browse Features
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => router.push("/ui-kit")}
                          className="w-full font-queensides py-3 text-slate-500"
                        >
                          View UI Components
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Islamic Blessing Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <Card className="arabic-border bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardContent className="p-10 text-center">
                      {/* Islamic Divider */}
                      <div className="flex items-center justify-center mb-6">
                        <div className="flex items-center space-x-3">
                          <Star className="w-3 h-3 text-indigo-300" />
                          <div className="w-6 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                          <Moon className="w-3 h-3 text-purple-300" />
                          <div className="w-6 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
                          <Sparkles className="w-3 h-3 text-blue-300" />
                        </div>
                      </div>

                      <p className="text-base text-slate-500 font-queensides italic mb-3">
                        "And among His signs is that He created for you mates from among yourselves"
                      </p>
                      <p className="text-sm text-slate-400 font-queensides">- Quran 30:21</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Message Permissions Modal */}
                {showMessagePermissions && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-slate-800 font-qurova">Message Permissions</h3>
                          <button
                            onClick={() => setShowMessagePermissions(false)}
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-6">
                          {/* Financial Setup Toggle */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800 font-qurova">Require Financial Setup</p>
                              <p className="text-sm text-slate-600 font-queensides">
                                Only users with dowry wallet/purse
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setMessagePermissions((prev) => ({
                                  ...prev,
                                  requireFinancialSetup: !prev.requireFinancialSetup,
                                }))
                              }
                              className={`w-12 h-6 rounded-full relative transition-colors ${
                                messagePermissions.requireFinancialSetup ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                                  messagePermissions.requireFinancialSetup ? "translate-x-6" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Bio Rating Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-slate-800 font-qurova">Minimum Bio Rating</p>
                              <span className="text-sm font-medium text-emerald-600">
                                {messagePermissions.minBioRating}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={messagePermissions.minBioRating}
                              onChange={(e) =>
                                setMessagePermissions((prev) => ({
                                  ...prev,
                                  minBioRating: Number.parseInt(e.target.value),
                                }))
                              }
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <p className="text-sm text-slate-600 font-queensides mt-1">Profile completion required</p>
                          </div>

                          {/* Response Rate Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-slate-800 font-qurova">Minimum Response Rate</p>
                              <span className="text-sm font-medium text-emerald-600">
                                {messagePermissions.minResponseRate}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={messagePermissions.minResponseRate}
                              onChange={(e) =>
                                setMessagePermissions((prev) => ({
                                  ...prev,
                                  minResponseRate: Number.parseInt(e.target.value),
                                }))
                              }
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <p className="text-sm text-slate-600 font-queensides mt-1">
                              How often they respond to messages
                            </p>
                          </div>

                          {/* Video Messages Toggle */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-800 font-qurova">Allow Video Messages</p>
                              <p className="text-sm text-slate-600 font-queensides">Users can send video messages</p>
                            </div>
                            <button
                              onClick={() =>
                                setMessagePermissions((prev) => ({
                                  ...prev,
                                  allowVideoMessages: !prev.allowVideoMessages,
                                }))
                              }
                              className={`w-12 h-6 rounded-full relative transition-colors ${
                                messagePermissions.allowVideoMessages ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                                  messagePermissions.allowVideoMessages ? "translate-x-6" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowMessagePermissions(false)}
                            className="flex-1 font-queensides"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              // Save permissions logic here
                              setShowMessagePermissions(false)
                            }}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-queensides"
                          >
                            Save Settings
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              // Someone else's profile - profile not found
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <Card className="arabic-border bg-white/90 backdrop-blur-xl">
                  <CardContent className="p-8 text-center">
                    {/* Islamic Divider */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex items-center space-x-3">
                        <Star className="w-4 h-4 text-slate-400" />
                        <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                        <Moon className="w-4 h-4 text-slate-400" />
                        <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                        <Sparkles className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-10 h-10 text-slate-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-3">Profile Not Available</h2>

                    <p className="text-slate-600 font-queensides mb-6 leading-relaxed">
                      This member hasn't completed their profile setup yet. Check back later or explore other members
                      who are ready to connect.
                    </p>

                    <div className="space-y-4">
                      <Button
                        onClick={() => router.back()}
                        className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-queensides py-3"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                      </Button>

                      <Button variant="outline" onClick={() => router.push("/")} className="w-full font-queensides">
                        Explore Other Members
                      </Button>
                    </div>

                    {/* Wallet Address Display */}
                    <div className="mt-6 p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 font-queensides mb-1">Member Address</p>
                      <code className="text-xs font-mono text-slate-600">
                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                      </code>
                    </div>

                    {/* Islamic Divider */}
                    <div className="flex items-center justify-center mt-6">
                      <div className="flex items-center space-x-3">
                        <Star className="w-3 h-3 text-slate-300" />
                        <div className="w-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                        <Moon className="w-3 h-3 text-slate-300" />
                        <div className="w-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                        <Sparkles className="w-3 h-3 text-slate-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative pb-24">
      <CelestialBackground intensity="light" />

      <div className="relative z-10">
        {/* Header */}
        {/* Header - Same style as explore page */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">
                {isOwnProfile ? "My Profile" : `${profile.firstName || "User"}'s Profile`}
              </h1>
              <p className="text-sm text-slate-600 font-queensides">
                {isOwnProfile ? "Your Samaa profile" : "Member profile"}
              </p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Full-Screen Hero Photo with Overlay Info */}
        <div className="relative h-screen w-full">
          {/* Main Profile Photo */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${profile.media?.photos?.[0] || profile.profilePhoto || "/images/futuristic-muslim-couple-hero.jpg"})`
            }}
            onClick={() => profile.media?.photos?.length && setSelectedPhotoIndex(0)}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>

          {/* Profile Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            {/* Name and Age */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold font-qurova">
                  {profile.firstName || "User"}
                  {profile.age && (
                    <span className="text-3xl font-qurova ml-3">{profile.age}</span>
                  )}
                </h1>
              </div>

              {/* Location, Bio Rating, Response Rate */}
              <div className="space-y-2 mb-3">
                {profile.currentLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-queensides">{profile.currentLocation}</span>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {profile.bioRating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-queensides">{profile.bioRating}% Bio Rating</span>
                    </div>
                  )}
                  {profile.responseRate && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-400" />
                      <span className="font-queensides">{profile.responseRate}% Response Rate</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Info Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.profession && (
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-queensides">{profile.profession}</span>
                </div>
              )}
              {profile.education && (
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-queensides">{profile.education}</span>
                </div>
              )}
              {profile.sect && (
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-queensides">{profile.sect}</span>
                </div>
              )}
              {profile.marriageTimeline && (
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-queensides">Marriage: {profile.marriageTimeline}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button
                  onClick={() => router.push("/profile-setup")}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides py-3"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-queensides py-3">
                    Send Message
                  </Button>
                  <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 px-4">
                    <Heart className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Arabic Divider */}
        <div className="flex items-center justify-center py-8 px-4">
          <div className="flex items-center space-x-3">
            <Star className="w-3 h-3 text-indigo-300" />
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
            <Moon className="w-4 h-4 text-purple-300" />
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
            <Sparkles className="w-3 h-3 text-blue-300" />
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            <Star className="w-3 h-3 text-indigo-300" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-0">

          {/* Bio Tagline Section */}
          {profile.bioTagline && (
            <div className="relative rounded-2xl p-6 mx-4 mb-6 border-2 border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white shadow-lg">
              {/* Arabic-inspired corner decorations */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-indigo-300/40 rounded-tl-lg"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-indigo-300/40 rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-indigo-300/40 rounded-bl-lg"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-indigo-300/40 rounded-br-lg"></div>

                {/* Arabic-inspired divider below tagline */}
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/20 pointer-events-none"></div>
              
              <div className="relative text-center mt-3">
                <h3 className="text-lg font-bold text-slate-800 font-qurova mb-3 mt-4">Words I Live By</h3>

                <p className="text-slate-700 font-queensides italic text-lg leading-relaxed mb-4">
                  "{profile.bioTagline}"
                </p>
                
              </div>
            </div>
          )}

          {/* Wallet Section */}
          {(profile.gender === 'male' && profile.dowryWallet) || (profile.gender === 'female' && profile.purseWallet) ? (
            <div className="bg-white/80 backdrop-blur-sm p-6 mx-4 mb-6 rounded-xl border border-indigo-100">
              <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-500" />
                {profile.gender === 'male' ? 'Dowry Wallet' : 'Purse Wallet'}
              </h3>

              {profile.gender === 'male' && profile.dowryWallet ? (
                <div className="space-y-3">
                  {profile.dowryWallet.isSetup ? (
                    <>
                      <div className="flex items-center gap-2 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        <span className="font-queensides font-medium">Wallet Setup Complete</span>
                      </div>
                      {profile.dowryWallet.address && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-sm text-slate-500 font-queensides mb-1">Wallet Address</p>
                          <p className="font-mono text-sm text-slate-700 break-all">
                            {profile.dowryWallet.address}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {profile.dowryWallet.solanaBalance !== undefined && (
                          <div className="bg-slate-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-slate-500 font-queensides">SOL Balance</p>
                            <p className="font-bold text-slate-800 font-qurova">
                              {profile.dowryWallet.solanaBalance.toFixed(4)}
                            </p>
                          </div>
                        )}
                        {profile.dowryWallet.samaaBalance !== undefined && (
                          <div className="bg-slate-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-slate-500 font-queensides">SAMAA Balance</p>
                            <p className="font-bold text-slate-800 font-qurova">
                              {profile.dowryWallet.samaaBalance.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 font-queensides">Dowry wallet not yet configured</p>
                    </div>
                  )}
                </div>
              ) : profile.gender === 'female' && profile.purseWallet ? (
                <div className="space-y-3">
                  {profile.purseWallet.isSetup ? (
                    <>
                      <div className="flex items-center gap-2 text-green-600">
                        <UserCheck className="w-4 h-4" />
                        <span className="font-queensides font-medium">Wallet Setup Complete</span>
                      </div>
                      {profile.purseWallet.address && (
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <p className="text-sm text-slate-500 font-queensides mb-1">Wallet Address</p>
                          <p className="font-mono text-sm text-slate-700 break-all">
                            {profile.purseWallet.address}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {profile.purseWallet.solanaBalance !== undefined && (
                          <div className="bg-slate-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-slate-500 font-queensides">SOL Balance</p>
                            <p className="font-bold text-slate-800 font-qurova">
                              {profile.purseWallet.solanaBalance.toFixed(4)}
                            </p>
                          </div>
                        )}
                        {profile.purseWallet.samaaBalance !== undefined && (
                          <div className="bg-slate-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-slate-500 font-queensides">SAMAA Balance</p>
                            <p className="font-bold text-slate-800 font-qurova">
                              {profile.purseWallet.samaaBalance.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 font-queensides">Purse wallet not yet configured</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* About Me - Compact */}
          <div className="bg-white p-6">
                              <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>
                <br/>
            <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">About {profile.firstName}</h3>

            {/* Bio */}
            {profile.bio && (
              <p className="text-slate-700 font-queensides text-lg leading-relaxed mb-6 whitespace-pre-wrap break-words">
                {profile.bio}
              </p>
            )}
            
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>
            <br/>
            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {profile.height && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Height</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.height}</p>
                </div>
              )}
              {profile.maritalStatus && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Marital Status</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.maritalStatus}</p>
                </div>
              )}
              {(profile.children || profile.hasChildren) && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Has Children</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.children || profile.hasChildren}</p>
                </div>
              )}
              {profile.wantChildren && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Wants Children</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.wantChildren}</p>
                </div>
              )}
              {profile.marriageTimeline && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Marriage Plans</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.marriageTimeline}</p>
                </div>
              )}
              {profile.livingArrangements && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Living Situation</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.livingArrangements}</p>
                </div>
              )}
            </div>
            <br/>
                <div className="flex items-center justify-center mb-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>          
          </div>

          {/* Photo Break 1 */}
          {profile.media?.photos?.[1] && (
            <div
              className="h-96 bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${profile.media.photos[1]})`
              }}
              onClick={() => setSelectedPhotoIndex(1)}
            >
              <div className="h-full w-full bg-black/20"></div>
            </div>
          )}

          {/* Islamic Values - Compact */}
          {(profile.prayerFrequency || profile.sect || profile.hijabChoice || profile.islamicValues || profile.isRevert || profile.alcohol || profile.smoking || profile.psychedelics || profile.halalFood) && (
            <div className="bg-white p-6">
                                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>
                <br/>
              <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">Islamic Values</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {profile.prayerFrequency && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Prayer Frequency</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.prayerFrequency}</p>
                  </div>
                )}
                {profile.sect && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Sect</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.sect}</p>
                  </div>
                )}
                {profile.isRevert && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Revert</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.isRevert}</p>
                  </div>
                )}
                {profile.hijabChoice && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Hijab</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.hijabChoice}</p>
                  </div>
                )}
                {profile.alcohol && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Alcohol</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.alcohol}</p>
                  </div>
                )}
                {profile.smoking && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Smoking</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.smoking}</p>
                  </div>
                )}
                {profile.psychedelics && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Psychedelics</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.psychedelics}</p>
                  </div>
                )}
                {profile.halalFood && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Halal Food</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.halalFood}</p>
                  </div>
                )}
                {profile.islamicValues && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 font-queensides">Islamic Values</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.islamicValues}</p>
                  </div>
                )}
              </div>
              <br/>
                <div className="flex items-center justify-center mb-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>
            </div>
          )}

          {/* Photo Break 2 */}
          {profile.media?.photos?.[2] && (
            <div
              className="h-96 bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${profile.media.photos[2]})`
              }}
              onClick={() => setSelectedPhotoIndex(2)}
            >
              <div className="h-full w-full bg-black/20"></div>
            </div>
          )}

          {/* Video Introduction - Full Width */}
          {profile.media?.videoIntro && (
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 font-qurova">Video Introduction</h3>
                {isOwnProfile && (
                  <Button variant="outline" size="sm" className="font-queensides">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Full Width Video Player */}
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full object-cover"
                  poster="/placeholder-video-thumbnail.jpg"
                >
                  <source src={profile.media.videoIntro} type="video/mp4" />
                  <source src={profile.media.videoIntro} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
          
          {/* Photo Break 3 */}
          {profile.media?.photos?.[3] && (
            <div
              className="h-96 bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${profile.media.photos[3]})`
              }}
              onClick={() => setSelectedPhotoIndex(3)}
            >
              <div className="h-full w-full bg-black/20"></div>
            </div>
          )}

          {/* Voice Introduction - Compact */}
          {profile.media?.voiceNote && (
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 font-qurova">Voice Introduction</h3>
                {isOwnProfile && (
                  <Button variant="outline" size="sm" className="font-queensides">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <audio controls className="w-full">
                <source src={profile.media.voiceNote} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Photo Break 4 */}
          {profile.media?.photos?.[4] && (
            <div
              className="h-96 bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${profile.media.photos[4]})`
              }}
              onClick={() => setSelectedPhotoIndex(4)}
            >
              <div className="h-full w-full bg-black/20"></div>
            </div>
          )}

          {/* Education & Career - Compact */}
          <div className="bg-white p-6 mt-4">
                              <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>
            <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">Education & Career</h3>

            <div className="grid grid-cols-2 gap-4">
              {profile.education && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Education</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.education}</p>
                </div>
              )}
              {profile.profession && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Profession</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.profession}</p>
                </div>
              )}
              {profile.employer && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Employer</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.employer}</p>
                </div>
              )}
              {profile.jobTitle && (
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Job Title</p>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.jobTitle}</p>
                </div>
              )}
            </div>
          </div>

          {/* Photo Break 5 */}
          {profile.media?.photos?.[5] && (
            <div
              className="h-96 bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${profile.media.photos[5]})`
              }}
              onClick={() => setSelectedPhotoIndex(5)}
            >
              <div className="h-full w-full bg-black/20"></div>
            </div>
          )}

          {/* Languages & Ethnicity - Compact */}
          {(profile.ethnicity || profile.nationality || profile.languages?.length) && (
            <div className="bg-white p-6">
              <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">Background</h3>

              <div className="grid grid-cols-2 gap-4">
                {profile.ethnicity && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Ethnicity</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.ethnicity}</p>
                  </div>
                )}
                {profile.nationality && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Nationality</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.nationality}</p>
                  </div>
                )}
              </div>

              {profile.languages?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 font-queensides mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="font-queensides">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Photo Break 6 */}
          {profile.media?.photos?.[6] && (
            <div
              className="h-96 bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${profile.media.photos[6]})`
              }}
              onClick={() => setSelectedPhotoIndex(6)}
            >
              <div className="h-full w-full bg-black/20"></div>
            </div>
          )}

          {/* Marriage Intentions - Compact */}
          {(profile.chattingTimeline || profile.familyInvolvement || profile.marriageTimeline || profile.familyPlans) && (
            <div className="bg-white p-6">
              <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">Marriage Plans</h3>

              <div className="grid grid-cols-2 gap-4">
                {profile.marriageTimeline && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Timeline</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.marriageTimeline}</p>
                  </div>
                )}
                {profile.familyInvolvement && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Family Role</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.familyInvolvement}</p>
                  </div>
                )}
                {profile.familyPlans && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500 font-queensides">Family Plans</p>
                    <p className="font-semibold text-slate-800 font-queensides">{profile.familyPlans}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          

          {/* Interests & Personality - Compact */}
          {(profile.interests?.length > 0 || profile.personality?.length > 0) && (
            <div className="bg-white p-6 mt-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-3 h-3 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>
              <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">Interests & Personality</h3>

              <div className="space-y-4">
                {profile.interests?.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="font-queensides">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.personality?.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 font-queensides mb-2">Personality</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.personality.map((trait, index) => (
                        <Badge key={index} variant="secondary" className="font-queensides">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Photo Break */}
          {profile.media?.photos?.[7] && (
            <div
              className="h-96 bg-cover bg-center cursor-pointer"
              style={{
                backgroundImage: `url(${profile.media.photos[7]})`
              }}
              onClick={() => setSelectedPhotoIndex(7)}
            >
              <div className="h-full w-full bg-black/20"></div>
            </div>
          )}

          

          {/* Arabic Divider */}
          {isOwnProfile && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <Star className="w-4 h-4 text-indigo-300" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                <Star className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
          )}

          {/* What I Want Section */}
          {isOwnProfile && (
            <div className="relative rounded-2xl p-8 mx-4 mb-6 border-2 border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white shadow-lg">
              {/* Arabic-inspired corner decorations */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
              <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/20 pointer-events-none"></div>

              <div className="relative">
                <h3 className="text-xl font-bold text-slate-800 font-qurova mb-6 text-center">What I Want</h3>

                {/* Arabic-inspired title divider */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-4 h-4 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </div>

              {/* Basic Preferences */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 font-qurova mb-3">Basic Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Age Range</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.ageRange[0]}-{userSettings.ageRange[1]} years
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Location</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      Within {userSettings.maxDistance} miles
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
                <div className="mx-3 w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
              </div>

              {/* About Them */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 font-qurova mb-3">About Them</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Nationality</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.nationality || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Height</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.height || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Marital Status</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.maritalStatus || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Children</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.children || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Education</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.education || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Languages</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.languages || "No preference"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                <div className="mx-3 w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
              </div>

              {/* Faith & Practice */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 font-qurova mb-3">Faith & Practice</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Prayer Frequency</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.prayerFrequency || "No preference"}
                    </p>
                  </div>

                  {userSettings.userGender === "male" && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Hijab Preference</p>
                      <p className="font-semibold text-slate-800 font-queensides">
                        {userSettings.faithAndPractice?.hijabPreference || "No preference"}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Marriage Intention</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.marriageIntention || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Diet</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.diet || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Halal Food</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.halalFood || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Alcohol</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.alcohol || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Smoking</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.smoking || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Psychedelics</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.psychedelics || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Born Muslim</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.faithAndPractice?.bornMuslim || "No preference"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                <div className="mx-3 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
              </div>

              {/* About Them */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 font-qurova mb-3">About Them</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Nationality</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.nationality || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Height</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.height || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Marital Status</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.maritalStatus || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Children</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.children || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Grew Up In</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.grewUpIn || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Languages</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.languages || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Willing to Relocate</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.willingToRelocate || "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Education</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.aboutThem?.education || "No preference"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
                <div className="mx-3 w-1.5 h-1.5 bg-orange-300 rounded-full"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent"></div>
              </div>

              {/* Financial & Quality Requirements */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 font-qurova mb-3">Requirements</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Financial Setup</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.requireFinancialSetup ?
                        (userSettings.userGender === "male" ? "Purse setup required" : "Dowry wallet required") :
                        "Not required"
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Bio Rating</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.bioRatingMinimum || 0}%+ required
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Response Rate</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.responseRateMinimum || 0}%+ required
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-green-200 to-transparent"></div>
                <div className="mx-3 w-1.5 h-1.5 bg-green-300 rounded-full"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
              </div>

              {/* Distance & Location */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 font-qurova mb-3">Distance & Location</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Age Range</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.ageRange ? `${userSettings.ageRange[0]} - ${userSettings.ageRange[1]} years` : "No preference"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 font-queensides">Distance</p>
                    <p className="font-semibold text-slate-800 font-queensides">
                      {userSettings.anywhereInWorld
                        ? "🌍 Anywhere in the world"
                        : `Within ${userSettings.maxDistance || 50} miles`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                <div className="mx-3 w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-700 font-qurova mb-3">Interests</h4>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500 font-queensides">Preferred Interests</p>
                  <p className="font-semibold text-slate-800 font-queensides">
                    {userSettings.interests && userSettings.interests.length > 0
                      ? userSettings.interests.join(", ")
                      : "No specific preferences"}
                  </p>
                </div>
              </div>

              {isOwnProfile && (
                <div className="pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    className="w-full font-queensides"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Update Preferences
                  </Button>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Islamic Blessing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
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
              "And among His signs is that He created for you mates from among yourselves"
            </p>
            <p className="text-sm text-slate-400 font-queensides mt-1">- Quran 30:21</p>
          </motion.div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && profile?.media?.photos && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              ✕
            </button>

            {/* Previous Button */}
            {profile.media.photos.length > 1 && selectedPhotoIndex > 0 && (
              <button
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                className="absolute left-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ←
              </button>
            )}

            {/* Next Button */}
            {profile.media.photos.length > 1 && selectedPhotoIndex < profile.media.photos.length - 1 && (
              <button
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                className="absolute right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                →
              </button>
            )}

            {/* Photo */}
            <img
              src={profile.media.photos[selectedPhotoIndex]}
              alt={`Profile photo ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo Counter */}
            {profile.media.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-queensides">
                {selectedPhotoIndex + 1} of {profile.media.photos.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      {/* Message Permissions Modal */}
      {showMessagePermissions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 font-qurova">Message Permissions</h3>
                <button
                  onClick={() => setShowMessagePermissions(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Financial Setup Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 font-qurova">Require Financial Setup</p>
                    <p className="text-sm text-slate-600 font-queensides">Only users with dowry wallet/purse</p>
                  </div>
                  <button
                    onClick={() =>
                      setMessagePermissions((prev) => ({ ...prev, requireFinancialSetup: !prev.requireFinancialSetup }))
                    }
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      messagePermissions.requireFinancialSetup ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        messagePermissions.requireFinancialSetup ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Bio Rating Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-800 font-qurova">Minimum Bio Rating</p>
                    <span className="text-sm font-medium text-emerald-600">{messagePermissions.minBioRating}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={messagePermissions.minBioRating}
                    onChange={(e) =>
                      setMessagePermissions((prev) => ({ ...prev, minBioRating: Number.parseInt(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-sm text-slate-600 font-queensides mt-1">Profile completion required</p>
                </div>

                {/* Response Rate Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-800 font-qurova">Minimum Response Rate</p>
                    <span className="text-sm font-medium text-emerald-600">{messagePermissions.minResponseRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={messagePermissions.minResponseRate}
                    onChange={(e) =>
                      setMessagePermissions((prev) => ({ ...prev, minResponseRate: Number.parseInt(e.target.value) }))
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <p className="text-sm text-slate-600 font-queensides mt-1">How often they respond to messages</p>
                </div>

                {/* Video Messages Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800 font-qurova">Allow Video Messages</p>
                    <p className="text-sm text-slate-600 font-queensides">Users can send video messages</p>
                  </div>
                  <button
                    onClick={() =>
                      setMessagePermissions((prev) => ({ ...prev, allowVideoMessages: !prev.allowVideoMessages }))
                    }
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      messagePermissions.allowVideoMessages ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        messagePermissions.allowVideoMessages ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMessagePermissions(false)}
                  className="flex-1 font-queensides"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Save permissions logic here
                    setShowMessagePermissions(false)
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-queensides"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
