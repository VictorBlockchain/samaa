"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  User,
  MapPin,
  Heart,
  Camera,
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  Moon,
  Sparkles,
  FileText,
  Zap,
  TrendingUp,
  UserCircle,
  Shield,
  Wallet,
  Upload,
  Video,
  Mic,
  X,
  Loader2
} from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { cn } from "@/lib/utils"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { useIsMobile } from "@/app/hooks/use-mobile"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { FileUpload } from "@/components/ui/file-upload"
import { ProfileMediaService, STORAGE_CONFIG } from "@/lib/storage"
import { saveProfile } from "@/utils/profile-storage"

interface ProfileData {
  // Basic Info
  firstName: string
  lastName: string
  age: string
  gender: string
  maritalStatus: string
  hasChildren: string
  wantChildren: string
  bioTagline: string

  // Location & Education
  location: string
  latitude?: number
  longitude?: number
  education: string
  profession: string

  // Islamic Values
  religiosity: string
  prayerFrequency: string
  hijabPreference: string
  marriageIntention: string
  isRevert: string
  alcohol: string
  smoking: string
  psychedelics: string
  halalFood: string

  // Photos & Bio
  bio: string
  interests: string[]
  profilePhoto: File | null
  additionalPhotos: File[]
  videoIntro: File | null
  voiceIntro: File | null
}

const steps = [
  { id: 1, title: "Basic Information", icon: User },
  { id: 2, title: "Location & Education", icon: MapPin },
  { id: 3, title: "Islamic Values", icon: Heart },
  { id: 4, title: "About You", icon: FileText },
  { id: 5, title: "Interests & Hobbies", icon: Star },
  { id: 6, title: "Photos & Media", icon: Camera },
]

const interests = [
  "Reading Quran",
  "Islamic History",
  "Cooking",
  "Travel",
  "Sports",
  "Art",
  "Volunteering",
  "Nature",
  "Technology",
  "Languages",
  "Music",
  "Photography",
]

export function ProfileSetup() {
  const { publicKey, connected } = useWallet()
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    maritalStatus: "",
    hasChildren: "",
    wantChildren: "",
    bioTagline: "",
    location: "",
    education: "",
    profession: "",
    religiosity: "",
    prayerFrequency: "",
    hijabPreference: "",
    marriageIntention: "",
    isRevert: "",
    alcohol: "",
    smoking: "",
    psychedelics: "",
    halalFood: "",
    bio: "",
    interests: [],
    profilePhoto: null,
    additionalPhotos: [],
    videoIntro: null,
    voiceIntro: null,
  })

  const [locationData, setLocationData] = useState<{
    latitude: number | null
    longitude: number | null
    address: string
  }>({
    latitude: null,
    longitude: null,
    address: "",
  })
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const [bioRating, setBioRating] = useState<number>(0)
  const [bioFeedback, setBioFeedback] = useState<string>("")
  const [showAiRating, setShowAiRating] = useState<boolean>(false)
  const [aiRatingComplete, setAiRatingComplete] = useState<boolean>(false)
  const [bioHasBeenEdited, setBioHasBeenEdited] = useState<boolean>(false)

  const isMobile = useIsMobile()
  const [currentTab, setCurrentTab] = useState("home")

  // Media upload states
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedUrls, setUploadedUrls] = useState<{
    profilePhoto?: string
    additionalPhotos: string[]
    videoIntro?: string
    voiceIntro?: string
  }>({
    additionalPhotos: []
  })
  const [isUploading, setIsUploading] = useState(false)

  // Load existing profile data if available
  useEffect(() => {
    if (connected && publicKey) {
      const existingProfile = localStorage.getItem(`profile_${publicKey.toString()}`)
      if (existingProfile) {
        try {
          const profileData = JSON.parse(existingProfile)
          // Pre-fill the form with existing data
          setProfileData({
            firstName: profileData.firstName || "",
            lastName: profileData.lastName || "",
            age: profileData.age || "",
            gender: profileData.gender || "",
            maritalStatus: profileData.maritalStatus || "",
            hasChildren: profileData.hasChildren || profileData.children || "",
            wantChildren: profileData.wantChildren || "",
            bioTagline: profileData.bioTagline || "",
            location: profileData.currentLocation || profileData.location || "",
            education: profileData.education || "",
            profession: profileData.profession || "",
            religiosity: profileData.religiousPractice || "",
            prayerFrequency: profileData.prayerFrequency || "",
            hijabPreference: profileData.hijabPreference || "",
            marriageIntention: profileData.marriageTimeline || "",
            isRevert: profileData.isRevert || "",
            alcohol: profileData.alcohol || "",
            smoking: profileData.smoking || "",
            psychedelics: profileData.psychedelics || "",
            halalFood: profileData.halalFood || "",
            bio: profileData.bio || "",
            interests: profileData.interests || [],
            profilePhoto: null, // Can't pre-fill file inputs
            additionalPhotos: [], // Can't pre-fill file inputs
            videoIntro: null, // Can't pre-fill file inputs
            voiceIntro: null, // Can't pre-fill file inputs
          })

          // Set location data if available
          if (profileData.latitude && profileData.longitude) {
            setLocationData({
              latitude: profileData.latitude,
              longitude: profileData.longitude,
              address: profileData.currentLocation || profileData.location || "",
            })
          }

          // Set bio rating if available
          if (profileData.bioRating) {
            setBioRating(profileData.bioRating)
            setAiRatingComplete(true)
            setBioHasBeenEdited(false) // User hasn't edited the existing bio yet
          }
        } catch (error) {
          console.error("Error loading existing profile:", error)
        }
      }
    }
  }, [connected, publicKey])

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  // Media upload handlers
  const handleProfilePhotoUpload = async (files: File[]) => {
    if (files.length === 0 || !publicKey) return

    const file = files[0]
    updateProfileData('profilePhoto', file)

    try {
      const result = await ProfileMediaService.uploadProfilePhoto(file, publicKey.toString())
      if (result.success && result.url) {
        setUploadedUrls(prev => ({ ...prev, profilePhoto: result.url }))
      } else {
        alert(result.error || 'Failed to upload profile photo')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload profile photo')
    }
  }

  const handleAdditionalPhotosUpload = async (files: File[]) => {
    if (files.length === 0 || !publicKey) return

    updateProfileData('additionalPhotos', files)

    try {
      const uploadPromises = files.map(file =>
        ProfileMediaService.uploadProfilePhoto(file, publicKey.toString())
      )

      const results = await Promise.all(uploadPromises)
      const successfulUrls = results
        .filter(result => result.success && result.url)
        .map(result => result.url!)

      setUploadedUrls(prev => ({
        ...prev,
        additionalPhotos: [...prev.additionalPhotos, ...successfulUrls]
      }))

      const failedCount = results.length - successfulUrls.length
      if (failedCount > 0) {
        alert(`${failedCount} photos failed to upload`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload photos')
    }
  }

  const handleVideoUpload = async (files: File[]) => {
    if (files.length === 0 || !publicKey) return

    const file = files[0]
    updateProfileData('videoIntro', file)

    try {
      const result = await ProfileMediaService.uploadProfileVideo(file, publicKey.toString())
      if (result.success && result.url) {
        setUploadedUrls(prev => ({ ...prev, videoIntro: result.url }))
      } else {
        alert(result.error || 'Failed to upload video')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload video')
    }
  }

  const handleAudioUpload = async (files: File[]) => {
    if (files.length === 0 || !publicKey) return

    const file = files[0]
    updateProfileData('voiceIntro', file)

    try {
      const result = await ProfileMediaService.uploadProfileAudio(file, publicKey.toString())
      if (result.success && result.url) {
        setUploadedUrls(prev => ({ ...prev, voiceIntro: result.url }))
      } else {
        alert(result.error || 'Failed to upload audio')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload audio')
    }
  }

  const analyzeBio = (bio: string) => {
    const wordCount = bio.trim().split(/\s+/).length
    const hasPersonalDetails = /\b(love|enjoy|passionate|dream|goal|value)\b/i.test(bio)
    const hasSpecifics = /\b(travel|cook|read|work|study|volunteer)\b/i.test(bio)

    let feedback = ""

    if (wordCount < 20) {
      feedback = "Your bio is too short. Add more details about yourself!"
    } else if (wordCount < 50) {
      feedback = "Good start! Add more about your values and interests."
    } else if (wordCount < 100) {
      feedback =
        hasPersonalDetails && hasSpecifics
          ? "Great bio! Very engaging and informative."
          : "Good length! Add more personal touches and specific interests."
    } else {
      feedback =
        hasPersonalDetails && hasSpecifics
          ? "Excellent bio! Perfect balance of personal and specific details."
          : "Good detail! Make sure to include personal values and specific interests."
    }

    // Only set feedback for preview, don't affect progression
    setBioFeedback(feedback)
  }

  const getUserLocation = async () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          )
          const data = await response.json()
          const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`

          setLocationData({ latitude, longitude, address })
          updateProfileData("location", address)
          updateProfileData("latitude", latitude)
          updateProfileData("longitude", longitude)
        } catch (error) {
          console.error("Error getting address:", error)
          alert("Unable to validate your location. Please enter manually.")
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setLocationData({ latitude, longitude, address })
          updateProfileData("location", address)
          updateProfileData("latitude", latitude)
          updateProfileData("longitude", longitude)
        }

        setIsGettingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please enter manually.")
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const searchLocations = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      )
      const data = await response.json()
      setLocationSuggestions(data)
    } catch (error) {
      console.error("Error searching locations:", error)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!publicKey) return

    setIsUploading(true)

    try {
      // Upload media files first
      const mediaUrls: any = {
        photos: [...uploadedUrls.additionalPhotos],
        videoIntro: uploadedUrls.videoIntro,
        voiceNote: uploadedUrls.voiceIntro,
        audioMessages: []
      }

      // Add profile photo if uploaded
      if (uploadedUrls.profilePhoto) {
        mediaUrls.photos.unshift(uploadedUrls.profilePhoto)
      }

      // If no media uploaded, use placeholder for development
      if (mediaUrls.photos.length === 0) {
        mediaUrls.photos = [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
        ]
      }

      // Prepare profile data for saving
      const profileWithWallet = {
        ...profileData,
        walletAddress: publicKey.toString(),
        createdAt: new Date().toISOString(),
        media: mediaUrls,
        profileComplete: true,
        isVerified: false,
        bioRating: bioRating || 0,
        lastActive: new Date().toISOString(),
        matchingEnabled: true,
        profilePhoto: uploadedUrls.profilePhoto || mediaUrls.photos[0],
        photos: mediaUrls.photos,
        voiceIntro: uploadedUrls.voiceIntro,
        video: uploadedUrls.videoIntro
      }

      // Save to Supabase (this will also save to localStorage as backup)
      const success = await saveProfile(publicKey.toString(), profileWithWallet)

      if (success) {
        // Redirect to profile page
        window.location.href = `/profile/${publicKey.toString()}`
      } else {
        alert('Failed to save profile. Please try again.')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 relative overflow-hidden">
        <CelestialBackground intensity="medium" />

        {/* Header */}
        <div className="relative z-10 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-indigo-200/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-queensides">Back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-800 font-qurova">Profile Setup</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-6">
          <div className="w-full max-w-lg mx-auto">
            <Card className="border-2 border-indigo-200/50 overflow-hidden backdrop-blur-sm bg-white/95 shadow-2xl">
              <CardContent className="p-8 text-center relative">
                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-indigo-300/30 rounded-full opacity-20"></div>
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>

                {/* Islamic Divider */}
                <div className="flex items-center justify-center mb-8 relative z-10">
                  <div className="flex items-center space-x-3">
                    <Star className="w-4 h-4 text-indigo-400" />
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
                    <Moon className="w-4 h-4 text-purple-400" />
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-indigo-200/50 relative z-10"
                >
                  <UserCircle className="w-12 h-12 text-indigo-600" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-3xl font-bold text-slate-800 font-qurova mb-4 relative z-10"
                >
                  Ready to Create Your Profile?
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-slate-600 font-queensides mb-8 leading-relaxed text-lg relative z-10"
                >
                  Connect your wallet to start building your Islamic dating profile and join our growing community of Muslims seeking meaningful connections
                </motion.p>

                {/* Profile Setup Steps Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 relative z-10"
                >
                  <h3 className="font-bold text-indigo-700 font-queensides mb-4">What You'll Set Up:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-indigo-600 font-queensides">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Basic Information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Location & Education</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Islamic Values</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>About You</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Interests & Hobbies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>Photos & Media</span>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative divider */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="flex items-center justify-center mb-8 relative z-10"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
                    <div className="w-4 h-4 border border-indigo-400/60 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform rotate-45"></div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="space-y-4 relative z-10"
                >
                  <Button
                    onClick={() => window.location.href = "/crypto-guide"}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides py-4 text-lg shadow-xl"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet to Continue
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="w-full font-queensides border-indigo-200 hover:bg-indigo-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </motion.div>

                {/* Security Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="mt-8 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 relative z-10"
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-green-700 font-queensides">Secure & Private</h3>
                  </div>
                  <p className="text-sm text-green-600 font-queensides">
                    Your profile data is secured on the blockchain. Only you control your information and who can see it.
                  </p>
                </motion.div>

                {/* Islamic Divider */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="flex items-center justify-center mt-8 relative z-10"
                >
                  <div className="flex items-center space-x-3">
                    <Star className="w-3 h-3 text-indigo-300" />
                    <div className="w-6 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                    <Moon className="w-3 h-3 text-purple-300" />
                    <div className="w-6 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
                    <Sparkles className="w-3 h-3 text-blue-300" />
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header - Same style as explore page */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Profile Setup</h1>
              <p className="text-sm text-slate-600 font-queensides">Step {currentStep} of {steps.length}</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Progress Steps - Same style as explore page tabs */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-6 gap-1 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20 w-full">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`relative p-2 rounded-xl transition-all duration-300 ${
                    currentStep === step.id
                      ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                      : currentStep > step.id
                      ? "bg-gradient-to-br from-green-400/20 to-emerald-400/20 border border-green-300/40"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="text-lg mb-1">
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4 mx-auto text-green-600" />
                    ) : (
                      <step.icon className="w-4 h-4 mx-auto" />
                    )}
                  </div>
                  <div className="text-xs font-queensides font-bold text-slate-700 leading-tight text-center">
                    {step.title.split(" ")[0]}
                  </div>
                  {currentStep === step.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                  )}
                  {currentStep > step.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          <div className="max-w-2xl mx-auto relative z-10">
            {/* Wallet Address Display */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <div className="bg-white/60 backdrop-blur-sm border border-indigo-200/50 rounded-xl p-4 shadow-sm">
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-queensides mb-1">Connected Wallet</p>
                  <p className="text-lg font-bold text-slate-800 font-mono tracking-wider">
                    {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-6)}
                  </p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-600 font-queensides font-medium">Connected</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Bio Importance Message */}
              {currentStep === 4 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-amber-800 font-qurova mb-3 text-lg">Make Your Bio Stand Out</h3>
                    <p className="text-amber-700 font-queensides text-base leading-relaxed">
                      Photos of you traveling the world, yet 3-line bios is not a good look. We use AI to give your bio
                      a rating. Tell your potential suitors things about yourself they can't see in pictures. You'll
                      perform better in match opportunities.
                    </p>
                  </div>
                </div>
              )}

              <Card className="bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-qurova">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                      {React.createElement(steps[currentStep - 1].icon, { className: "w-4 h-4 text-white" })}
                    </div>
                    {steps[currentStep - 1].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Basic Information - Single Column Layout */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="firstName" className="font-queensides text-sm font-semibold text-slate-700 mb-2 block">
                          <User className="w-4 h-4 inline mr-2" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => updateProfileData("firstName", e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                          placeholder="Enter your first name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="lastName" className="font-queensides text-sm font-semibold text-slate-700 mb-2 block">
                          <User className="w-4 h-4 inline mr-2" />
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => updateProfileData("lastName", e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                          placeholder="Enter your last name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="age" className="font-queensides text-sm font-semibold text-slate-700 mb-2 block">
                          <span className="inline-block w-4 h-4 mr-2 text-center">🎂</span>
                          Age
                        </Label>
                        <Select value={profileData.age} onValueChange={(value) => updateProfileData("age", value)}>
                          <SelectTrigger className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides">
                            <SelectValue placeholder="Select your age" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                              <SelectItem key={age} value={age.toString()}>
                                {age} years old
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="font-queensides text-sm font-semibold text-slate-700 mb-3 block">
                          <span className="inline-block w-4 h-4 mr-2 text-center">⚧️</span>
                          Gender
                        </Label>
                        <RadioGroup
                          value={profileData.gender}
                          onValueChange={(value) => updateProfileData("gender", value)}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-3 p-4 bg-white/60 border border-indigo-200/50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="font-queensides font-medium cursor-pointer">
                              Male
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-white/60 border border-indigo-200/50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="font-queensides font-medium cursor-pointer">
                              Female
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides text-sm font-semibold text-slate-700 mb-3 block">
                          <span className="inline-block w-4 h-4 mr-2 text-center">💍</span>
                          Marital Status
                        </Label>
                        <Select value={profileData.maritalStatus} onValueChange={(value) => updateProfileData("maritalStatus", value)}>
                          <SelectTrigger className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never-married">Never Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="font-queensides text-sm font-semibold text-slate-700 mb-3 block">
                          <span className="inline-block w-4 h-4 mr-2 text-center">👶</span>
                          Do you have children?
                        </Label>
                        <RadioGroup
                          value={profileData.hasChildren}
                          onValueChange={(value) => updateProfileData("hasChildren", value)}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-3 p-4 bg-white/60 border border-indigo-200/50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="no" id="no-children" />
                            <Label htmlFor="no-children" className="font-queensides font-medium cursor-pointer">
                              No children
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-white/60 border border-indigo-200/50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="yes" id="has-children" />
                            <Label htmlFor="has-children" className="font-queensides font-medium cursor-pointer">
                              Yes, I have children
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides text-sm font-semibold text-slate-700 mb-3 block">
                          <span className="inline-block w-4 h-4 mr-2 text-center">❤️</span>
                          Do you want children?
                        </Label>
                        <RadioGroup
                          value={profileData.wantChildren}
                          onValueChange={(value) => updateProfileData("wantChildren", value)}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-4 bg-white/60 border border-indigo-200/50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="yes" id="want-children" />
                            <Label htmlFor="want-children" className="font-queensides font-medium cursor-pointer">
                              Yes, I want children
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-white/60 border border-indigo-200/50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="no" id="no-want-children" />
                            <Label htmlFor="no-want-children" className="font-queensides font-medium cursor-pointer">
                              No, I don't want children
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-white/60 border border-indigo-200/50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="maybe" id="maybe-children" />
                            <Label htmlFor="maybe-children" className="font-queensides font-medium cursor-pointer">
                              Maybe/Undecided
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label htmlFor="bioTagline" className="font-queensides text-sm font-semibold text-slate-700 mb-2 block">
                          <span className="inline-block w-4 h-4 mr-2 text-center">✨</span>
                          Bio Tagline (Words you live by)
                        </Label>
                        <Input
                          id="bioTagline"
                          value={profileData.bioTagline}
                          onChange={(e) => updateProfileData("bioTagline", e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                          placeholder="e.g., 'Trust in Allah and tie your camel'"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location & Education */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="font-queensides text-sm font-semibold text-slate-700 mb-3 block">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Your Location
                        </Label>

                        {/* Location Display or Detection */}
                        {profileData.location ? (
                          <div className="bg-white/60 backdrop-blur-sm border border-indigo-200/50 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-semibold text-slate-800 font-queensides">
                                  {profileData.location}
                                </p>
                                {locationData.latitude && locationData.longitude && (
                                  <p className="text-xs text-green-600 mt-1 font-queensides">
                                    ✓ GPS coordinates: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-green-600 font-queensides font-medium">Located</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={getUserLocation}
                              disabled={isGettingLocation}
                              variant="outline"
                              size="sm"
                              className="mt-3 font-queensides"
                            >
                              {isGettingLocation ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600 mr-2"></div>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-3 h-3 mr-2" />
                                  Update Location
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-xl p-6">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-800 font-qurova mb-2">Detect Your Location</h3>
                              <p className="text-slate-600 font-queensides mb-4 leading-relaxed">
                                We'll use your location to find matches nearby and show your city to potential partners
                              </p>
                              <Button
                                type="button"
                                onClick={getUserLocation}
                                disabled={isGettingLocation}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides px-6 py-3"
                              >
                                {isGettingLocation ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Detecting Location...
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Detect My Location
                                  </>
                                )}
                              </Button>
                              <p className="text-xs text-slate-500 font-queensides mt-3">
                                Your exact coordinates are kept private
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="education" className="font-queensides">
                          Education Level
                        </Label>
                        <Select
                          value={profileData.education}
                          onValueChange={(value) => updateProfileData("education", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-school">High School</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="profession" className="font-queensides">
                          Profession
                        </Label>
                        <Input
                          id="profession"
                          value={profileData.profession}
                          onChange={(e) => updateProfileData("profession", e.target.value)}
                          className="mt-1"
                          placeholder="Your profession or field of work"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Islamic Values */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="font-queensides">Level of Religiosity</Label>
                        <RadioGroup
                          value={profileData.religiosity}
                          onValueChange={(value) => updateProfileData("religiosity", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="practicing" id="practicing" />
                            <Label htmlFor="practicing" className="font-queensides">
                              Practicing
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="moderate" id="moderate" />
                            <Label htmlFor="moderate" className="font-queensides">
                              Moderate
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="learning" id="learning" />
                            <Label htmlFor="learning" className="font-queensides">
                              Learning
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides">Prayer Frequency</Label>
                        <Select
                          value={profileData.prayerFrequency}
                          onValueChange={(value) => updateProfileData("prayerFrequency", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select prayer frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="five-times">Five times daily</SelectItem>
                            <SelectItem value="regularly">Regularly</SelectItem>
                            <SelectItem value="sometimes">Sometimes</SelectItem>
                            <SelectItem value="learning">Learning to pray</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {profileData.gender === "female" && (
                        <div>
                          <Label className="font-queensides">Hijab Preference</Label>
                          <RadioGroup
                            value={profileData.hijabPreference}
                            onValueChange={(value) => updateProfileData("hijabPreference", value)}
                            className="mt-2 space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="always" id="always" />
                              <Label htmlFor="always" className="font-queensides">
                                Always wear hijab
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sometimes" id="sometimes-hijab" />
                              <Label htmlFor="sometimes-hijab" className="font-queensides">
                                Sometimes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="planning" id="planning" />
                              <Label htmlFor="planning" className="font-queensides">
                                Planning to wear
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="no-hijab" />
                              <Label htmlFor="no-hijab" className="font-queensides">
                                Do not wear
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      <div>
                        <Label className="font-queensides">Marriage Intention</Label>
                        <RadioGroup
                          value={profileData.marriageIntention}
                          onValueChange={(value) => updateProfileData("marriageIntention", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="soon" id="soon" />
                            <Label htmlFor="soon" className="font-queensides">
                              Ready to marry soon
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="year" id="year" />
                            <Label htmlFor="year" className="font-queensides">
                              Within a year
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="future" id="future" />
                            <Label htmlFor="future" className="font-queensides">
                              In the future
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides">Are you a revert to Islam?</Label>
                        <RadioGroup
                          value={profileData.isRevert}
                          onValueChange={(value) => updateProfileData("isRevert", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="revert-yes" />
                            <Label htmlFor="revert-yes" className="font-queensides">
                              Yes, I'm a revert
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="revert-no" />
                            <Label htmlFor="revert-no" className="font-queensides">
                              No, born Muslim
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides">Alcohol</Label>
                        <RadioGroup
                          value={profileData.alcohol}
                          onValueChange={(value) => updateProfileData("alcohol", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="never" id="alcohol-never" />
                            <Label htmlFor="alcohol-never" className="font-queensides">
                              Never
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="socially" id="alcohol-socially" />
                            <Label htmlFor="alcohol-socially" className="font-queensides">
                              Socially
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="regularly" id="alcohol-regularly" />
                            <Label htmlFor="alcohol-regularly" className="font-queensides">
                              Regularly
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides">Smoking</Label>
                        <RadioGroup
                          value={profileData.smoking}
                          onValueChange={(value) => updateProfileData("smoking", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="never" id="smoking-never" />
                            <Label htmlFor="smoking-never" className="font-queensides">
                              Never
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="occasionally" id="smoking-occasionally" />
                            <Label htmlFor="smoking-occasionally" className="font-queensides">
                              Occasionally
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="regularly" id="smoking-regularly" />
                            <Label htmlFor="smoking-regularly" className="font-queensides">
                              Regularly
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides">Psychedelics</Label>
                        <RadioGroup
                          value={profileData.psychedelics}
                          onValueChange={(value) => updateProfileData("psychedelics", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="never" id="psychedelics-never" />
                            <Label htmlFor="psychedelics-never" className="font-queensides">
                              Never
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="occasionally" id="psychedelics-occasionally" />
                            <Label htmlFor="psychedelics-occasionally" className="font-queensides">
                              Occasionally
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="regularly" id="psychedelics-regularly" />
                            <Label htmlFor="psychedelics-regularly" className="font-queensides">
                              Regularly
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="font-queensides">Halal Food</Label>
                        <RadioGroup
                          value={profileData.halalFood}
                          onValueChange={(value) => updateProfileData("halalFood", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="always" id="halal-always" />
                            <Label htmlFor="halal-always" className="font-queensides">
                              Always halal
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mostly" id="halal-mostly" />
                            <Label htmlFor="halal-mostly" className="font-queensides">
                              Mostly halal
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sometimes" id="halal-sometimes" />
                            <Label htmlFor="halal-sometimes" className="font-queensides">
                              Sometimes
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}

                  {/* Step 4: About You - Enhanced Bio Section */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      {/* Bio Writing Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="bio" className="font-queensides text-lg">
                            About You
                          </Label>
                          {profileData.bio && bioRating > 0 && (
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  bioRating >= 8
                                    ? "bg-green-100 text-green-700"
                                    : bioRating >= 6
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                <TrendingUp className="w-3 h-3" />
                                {bioRating}/10
                              </div>
                            </div>
                          )}
                        </div>

                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => {
                            updateProfileData("bio", e.target.value)
                            setBioHasBeenEdited(true)
                            setAiRatingComplete(false) // Reset AI rating when bio is edited
                            setBioRating(0) // Reset rating when editing
                            if (e.target.value.length > 10) {
                              analyzeBio(e.target.value)
                            }
                          }}
                          className="mt-1 min-h-[150px] text-base leading-relaxed"
                          placeholder="Share your story... What makes you unique? What are your values? What do you love doing? What are you looking for in a partner? Be authentic and specific!"
                        />

                        {/* AI Rating Button - directly under textarea */}
                        {profileData.bio.length > 50 && bioHasBeenEdited && !aiRatingComplete && (
                          <div className="mt-4">
                            <Button
                              onClick={() => {
                                setShowAiRating(true)
                                // Mock AI rating - in production this would call actual AI
                                setTimeout(() => {
                                  const mockRating = Math.floor(Math.random() * 30) + 70 // Random rating between 70-100
                                  setBioRating(mockRating)
                                  setBioFeedback(
                                    `Great! Your bio has been rated ${mockRating}/100. You can now proceed to the next step.`,
                                  )
                                  setAiRatingComplete(true) // Always allow progression after AI rating
                                  setShowAiRating(false)
                                }, 2000)
                              }}
                              disabled={showAiRating}
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-queensides px-8 py-3 w-full"
                            >
                              {showAiRating ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  AI is analyzing your bio...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Rate My Bio with AI
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {bioFeedback && (
                          <div
                            className={`mt-3 p-3 rounded-lg text-sm ${
                              aiRatingComplete
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : bioHasBeenEdited
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              <span className="font-medium">
                                {aiRatingComplete ? "AI Rating:" : "Bio Preview:"}
                              </span>
                            </div>
                            <p className="mt-1">{bioFeedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Interests & Hobbies */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="font-queensides text-lg mb-4 block">Select Your Interests & Hobbies</Label>
                        <p className="text-slate-600 font-queensides text-sm mb-4">
                          Choose interests that represent you and add your own. This helps us find compatible matches who share your passions.
                        </p>

                        {/* Predefined Interests */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {interests.map((interest) => (
                            <div
                              key={interest}
                              className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                            >
                              <Checkbox
                                id={interest}
                                checked={profileData.interests.includes(interest)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    updateProfileData("interests", [...profileData.interests, interest])
                                  } else {
                                    updateProfileData(
                                      "interests",
                                      profileData.interests.filter((i) => i !== interest),
                                    )
                                  }
                                }}
                              />
                              <Label htmlFor={interest} className="font-queensides cursor-pointer flex-1">
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>

                        {/* Add Custom Interests */}
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">+</span>
                            </div>
                            <h4 className="font-semibold text-slate-800 font-qurova">Add Your Own Interests</h4>
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Type your interests separated by commas (e.g., hiking, cooking, reading)"
                              className="w-full bg-white/80 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 font-queensides"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const input = e.target as HTMLInputElement
                                  const newInterests = input.value
                                    .split(',')
                                    .map(interest => interest.trim())
                                    .filter(interest => interest && !profileData.interests.includes(interest))

                                  if (newInterests.length > 0) {
                                    updateProfileData("interests", [...profileData.interests, ...newInterests])
                                    input.value = ''
                                  }
                                }
                              }}
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-purple-600 font-queensides">
                                Separate multiple interests with commas, then press Enter or click Add
                              </p>
                              <Button
                                type="button"
                                onClick={(e) => {
                                  const input = (e.target as HTMLElement).parentElement?.parentElement?.querySelector('input') as HTMLInputElement
                                  const newInterests = input?.value
                                    .split(',')
                                    .map(interest => interest.trim())
                                    .filter(interest => interest && !profileData.interests.includes(interest))

                                  if (newInterests && newInterests.length > 0) {
                                    updateProfileData("interests", [...profileData.interests, ...newInterests])
                                    input.value = ''
                                  }
                                }}
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-queensides px-4"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Progress Feedback */}
                        {profileData.interests.length > 0 && (
                          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <p className="text-indigo-700 font-queensides text-sm">
                              <strong>{profileData.interests.length}</strong> interests selected. Great! This helps us find better matches for you.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 6: Photos & Media */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      {/* Profile Photos */}
                      <div>
                        <Label className="font-queensides text-lg mb-4 block">Profile Photos & Media</Label>
                        <p className="text-slate-600 font-queensides text-sm mb-6">
                          Upload your photos, video introduction, and voice note. All files are stored securely and can be up to {STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB each.
                        </p>

                        {/* Main Profile Photo */}
                        <div className="mb-6">
                          <Label className="font-queensides text-base mb-3 block flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Main Profile Photo
                          </Label>
                          <FileUpload
                            accept={STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.join(',')}
                            maxSize={STORAGE_CONFIG.MAX_FILE_SIZE}
                            multiple={false}
                            onFileSelect={(files) => updateProfileData('profilePhoto', files[0] || null)}
                            onUpload={handleProfilePhotoUpload}
                            type="image"
                            placeholder="Upload your main profile photo"
                            className="mb-4"
                          />
                        </div>

                        {/* Additional Photos */}
                        <div className="mb-6">
                          <Label className="font-queensides text-base mb-3 block flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Additional Photos (Optional)
                          </Label>
                          <FileUpload
                            accept={STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.join(',')}
                            maxSize={STORAGE_CONFIG.MAX_FILE_SIZE}
                            multiple={true}
                            onFileSelect={(files) => updateProfileData('additionalPhotos', files)}
                            onUpload={handleAdditionalPhotosUpload}
                            type="image"
                            placeholder="Upload additional photos (up to 4 more)"
                            className="mb-4"
                          />
                        </div>

                        {/* Video Introduction */}
                        <div className="mb-6">
                          <Label className="font-queensides text-base mb-3 block flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video Introduction (Optional)
                          </Label>
                          <FileUpload
                            accept={STORAGE_CONFIG.ALLOWED_VIDEO_TYPES.join(',')}
                            maxSize={STORAGE_CONFIG.MAX_FILE_SIZE}
                            multiple={false}
                            onFileSelect={(files) => updateProfileData('videoIntro', files[0] || null)}
                            onUpload={handleVideoUpload}
                            type="video"
                            placeholder="Upload a short video introduction"
                            className="mb-4"
                          />
                          <p className="text-xs text-slate-500 font-queensides">
                            Share a brief video about yourself (recommended: 30-60 seconds)
                          </p>
                        </div>

                        {/* Voice Introduction */}
                        <div className="mb-6">
                          <Label className="font-queensides text-base mb-3 block flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            Voice Introduction (Optional)
                          </Label>
                          <FileUpload
                            accept={STORAGE_CONFIG.ALLOWED_AUDIO_TYPES.join(',')}
                            maxSize={STORAGE_CONFIG.MAX_FILE_SIZE}
                            multiple={false}
                            onFileSelect={(files) => updateProfileData('voiceIntro', files[0] || null)}
                            onUpload={handleAudioUpload}
                            type="audio"
                            placeholder="Upload a voice introduction"
                            className="mb-4"
                          />
                          <p className="text-xs text-slate-500 font-queensides">
                            Record a voice message introducing yourself (recommended: 30-60 seconds)
                          </p>
                        </div>

                        {/* Upload Progress */}
                        {isUploading && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                              <div>
                                <p className="font-medium text-blue-800 font-queensides">Uploading media files...</p>
                                <p className="text-sm text-blue-600 font-queensides">Please wait while we process your uploads</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Islamic Divider */}
                  <div className="flex items-center justify-center py-6">
                    <div className="flex items-center space-x-4">
                      <Star className="w-4 h-4 text-indigo-400" />
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
                      <Moon className="w-4 h-4 text-purple-400" />
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="font-queensides"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    {currentStep === steps.length ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isUploading}
                        className="bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 font-queensides disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving Profile...
                          </>
                        ) : (
                          <>
                            Complete Profile
                            <Check className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        disabled={currentStep === 4 && bioHasBeenEdited && !aiRatingComplete}
                        className="bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 font-queensides disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentStep === 4 && bioHasBeenEdited && !aiRatingComplete ? (
                          <>Get AI Rating to Continue</>
                        ) : (
                          <>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bio Writing Tips */}
              {currentStep === 4 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                  <h4 className="font-semibold text-blue-800 font-qurova mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Bio Writing Tips
                  </h4>
                  <ul className="space-y-2 text-blue-700 font-queensides text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Share your Islamic values and what faith means to you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Mention your hobbies, passions, and what you do for fun</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Describe your goals, dreams, and what you're working towards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Be specific about what you're looking for in a partner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Keep it authentic - let your personality shine through</span>
                    </li>
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Islamic Blessing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-base text-slate-500 font-queensides italic">
              "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word
              is the truth."
            </p>
            <p className="text-sm text-slate-400 font-queensides mt-1">- Quran 6:73</p>
          </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />}
    </div>
  )
}
