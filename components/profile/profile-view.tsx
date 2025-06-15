"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  // Marriage Intentions
  chattingTimeline: string
  familyInvolvement: string
  marriageTimeline: string

  // Future Plans
  relocationPlans: string
  familyPlans: string
  polygamyPlan: string

  // Interests & Personality
  interests: string[]
  personality: string[]

  // Media
  profilePhoto?: string
  voiceIntro?: string
  video?: string

  // Verification & Premium
  walletAddress: string
  createdAt: string
  isVerified?: boolean
  premiumMember?: boolean
  idVerified?: boolean
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
  const [messagePermissions, setMessagePermissions] = useState({
    requireFinancialSetup: true,
    minBioRating: 75,
    minResponseRate: 60,
    allowVideoMessages: true,
  })

  const { publicKey, connected } = useWallet()

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
    checkIfOwnProfile()
    loadProfile()
  }, [walletAddress, publicKey, connected])

  const loadProfile = () => {
    try {
      const savedProfile = localStorage.getItem(`profile_${walletAddress}`)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
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
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavigation />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <DesktopNavigation />
        </div>

        <div className="px-4 py-6 space-y-6 pt-24">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                <AvatarImage src={profile.profilePhoto || "/images/futuristic-muslim-couple-hero.jpg"} />
                <AvatarFallback className="text-2xl font-qurova bg-gradient-to-br from-indigo-100 to-purple-100">
                  {profile.firstName?.[0] || "U"}
                  {profile.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>

              {profile.premiumMember && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}

              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-800 font-qurova mb-2">
              {profile.firstName || "User"} {profile.lastName || ""}
            </h1>

            <div className="flex items-center justify-center gap-2 mb-4">
              {profile.age && (
                <Badge variant="secondary" className="font-queensides">
                  {profile.age} years old
                </Badge>
              )}
              {profile.currentLocation && (
                <Badge variant="secondary" className="font-queensides">
                  {profile.currentLocation}
                </Badge>
              )}
            </div>

            {profile.tagline && (
              <p className="text-slate-700 font-queensides font-medium mb-2 italic">"{profile.tagline}"</p>
            )}

            {profile.bio && <p className="text-slate-600 font-queensides max-w-md mx-auto">{profile.bio}</p>}

            {isOwnProfile && (
              <Button onClick={() => router.push("/profile-setup")} variant="outline" className="mt-4 font-queensides">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </motion.div>

          {/* About Me */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white/80 backdrop-blur-xl arabic-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">About Me</h3>

                <div className="grid grid-cols-2 gap-4">
                  {profile.height && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Height</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.height}</p>
                    </div>
                  )}
                  {profile.maritalStatus && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Marital Status</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.maritalStatus}</p>
                    </div>
                  )}
                  {profile.children && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Children</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.children}</p>
                    </div>
                  )}
                  {profile.livingArrangements && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Living Arrangements</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.livingArrangements}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Islamic Values & Religiosity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white/80 backdrop-blur-xl arabic-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-500" />
                  Islamic Values
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {profile.sect && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Sect</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.sect}</p>
                    </div>
                  )}
                  {profile.religiousPractice && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Religious Practice</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.religiousPractice}</p>
                    </div>
                  )}
                  {profile.bornMuslim && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Born Muslim</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.bornMuslim}</p>
                    </div>
                  )}
                  {profile.faith && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Faith</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.faith}</p>
                    </div>
                  )}
                  {profile.diet && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Diet</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.diet}</p>
                    </div>
                  )}
                  {profile.alcohol && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Alcohol</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.alcohol}</p>
                    </div>
                  )}
                  {profile.smoking && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Smoking</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.smoking}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Education & Career */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white/80 backdrop-blur-xl arabic-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Education & Career</h3>

                <div className="space-y-3">
                  {profile.education && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Education</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.education}</p>
                    </div>
                  )}
                  {profile.profession && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Profession</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.profession}</p>
                    </div>
                  )}
                  {profile.employer && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Employer</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.employer}</p>
                    </div>
                  )}
                  {profile.jobTitle && (
                    <div>
                      <p className="text-sm text-slate-500 font-queensides">Job Title</p>
                      <p className="font-medium text-slate-800 font-queensides">{profile.jobTitle}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Languages & Ethnicity */}
          {(profile.ethnicity || profile.nationality || profile.languages?.length) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-white/80 backdrop-blur-xl arabic-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Languages & Ethnicity</h3>

                  <div className="space-y-3">
                    {profile.ethnicity && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Ethnicity</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.ethnicity}</p>
                      </div>
                    )}
                    {profile.nationality && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Nationality</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.nationality}</p>
                      </div>
                    )}
                    {profile.languages?.length > 0 && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Languages</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.languages.map((language, index) => (
                            <Badge key={index} variant="outline" className="font-queensides">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Marriage Intentions */}
          {(profile.chattingTimeline || profile.familyInvolvement || profile.marriageTimeline) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-white/80 backdrop-blur-xl arabic-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Marriage Intentions
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {profile.chattingTimeline && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Chatting Timeline</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.chattingTimeline}</p>
                      </div>
                    )}
                    {profile.marriageTimeline && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Marriage Timeline</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.marriageTimeline}</p>
                      </div>
                    )}
                    {profile.familyInvolvement && (
                      <div className="col-span-2">
                        <p className="text-sm text-slate-500 font-queensides">Family Involvement</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.familyInvolvement}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Future Plans */}
          {(profile.relocationPlans || profile.familyPlans || profile.polygamyPlan) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-white/80 backdrop-blur-xl arabic-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Future Plans</h3>

                  <div className="space-y-3">
                    {profile.relocationPlans && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Relocation Plans</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.relocationPlans}</p>
                      </div>
                    )}
                    {profile.familyPlans && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Family Plans</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.familyPlans}</p>
                      </div>
                    )}
                    {profile.polygamyPlan && (
                      <div>
                        <p className="text-sm text-slate-500 font-queensides">Polygamy Plan</p>
                        <p className="font-medium text-slate-800 font-queensides">{profile.polygamyPlan}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Interests & Personality */}
          {(profile.interests?.length > 0 || profile.personality?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Card className="bg-white/80 backdrop-blur-xl arabic-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Interests & Personality</h3>

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
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Premium Features (if own profile) */}
          {isOwnProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 arabic-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-800 font-qurova mb-2">Profile Boosts</h4>
                  <p className="text-sm text-slate-600 font-queensides mb-4">Get up to 11x more visits</p>
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-600 font-queensides">
                    Buy more
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 arabic-border">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-slate-800 font-qurova mb-2">Compliments</h4>
                  <p className="text-sm text-slate-600 font-queensides mb-4">Message without waiting</p>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 font-queensides">
                    Buy more
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Web3 Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            {isOwnProfile && (
              <>
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 arabic-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      <div>
                        <h4 className="font-bold text-slate-800 font-qurova">Manage Premium Membership</h4>
                        <p className="text-sm text-slate-600 font-queensides">Access exclusive features</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="font-queensides">
                      Manage
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-xl arabic-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <QrCode className="w-6 h-6 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-slate-800 font-qurova">Share Wallet QR Code</h4>
                        <p className="text-sm text-slate-600 font-queensides">Connect with other Samaa members</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="font-queensides">
                      Share
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-xl arabic-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-600" />
                      <div>
                        <h4 className="font-bold text-slate-800 font-qurova">Invite Friends</h4>
                        <p className="text-sm text-slate-600 font-queensides">Earn rewards for referrals</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="font-queensides">
                      Invite
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Wallet Address Display */}
            <Card className="bg-slate-50 arabic-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 font-qurova">Wallet Address</h4>
                    <code className="text-sm font-mono text-slate-600">
                      {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                    </code>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
