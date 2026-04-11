"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  User,
  Camera,
  Heart,
  Search,
  MapPin,
  Calendar,
  Briefcase,
  Sparkles,
  X,
  FileText,
  Star,
  Moon,
  Zap,
  TrendingUp,
  UserCircle,
  Shield,
  Wallet,
  Upload,
  Video,
  Mic,
  Loader2,
  Ruler,
  Globe,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { countries } from "@/data/countries"
import dynamic from "next/dynamic"
import { useUser } from "@/app/context/UserContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { FileUpload } from "@/components/ui/file-upload"
import { ProfileService, UserSettingsService } from "@/lib/database"
import { saveProfile } from "@/utils/profile-storage"
import {
  getSignedUrlForPath,
  ProfileMediaService,
  storagePathFromUrlOrPath,
  STORAGE_CONFIG,
} from "@/lib/storage"
import "leaflet/dist/leaflet.css"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Photo preview component with signed URL generation
function PhotoPreview({ bucket, path }: { bucket: string; path: string }) {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchSignedUrl = async () => {
      try {
        const signedUrl = await getSignedUrlForPath(bucket, path)
        if (!cancelled && signedUrl) {
          setImageUrl(signedUrl)
          setLoading(false)
        } else if (!cancelled) {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error generating signed URL:", error)
        if (!cancelled) setLoading(false)
      }
    }
    fetchSignedUrl()
    return () => { cancelled = true }
  }, [bucket, path])

  return (
    <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : imageUrl ? (
        <img src={imageUrl} alt="Uploaded photo" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-queensides">
          Failed to load
        </div>
      )}
    </div>
  )
}

// Audio preview component with signed URL generation
function AudioPreview({ bucket, path }: { bucket: string; path: string }) {
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchSignedUrl = async () => {
      try {
        const signedUrl = await getSignedUrlForPath(bucket, path)
        if (!cancelled && signedUrl) {
          setAudioUrl(signedUrl)
          setLoading(false)
        } else if (!cancelled) {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error generating signed URL:", error)
        if (!cancelled) setLoading(false)
      }
    }
    fetchSignedUrl()
    return () => { cancelled = true }
  }, [bucket, path])

  if (loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 relative z-10" />
          </div>
          <p className="text-purple-600 font-queensides text-sm">Loading audio...</p>
        </div>
      </div>
    )
  }

  if (!audioUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-pink-100 border border-red-200 p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 font-queensides font-semibold text-sm mb-1">Failed to Load Audio</p>
          <p className="text-red-500 text-xs font-queensides">Please try uploading again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 shadow-lg">
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-purple-400 rounded-tl-2xl opacity-50" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-pink-400 rounded-tr-2xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-pink-400 rounded-bl-2xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-purple-400 rounded-br-2xl opacity-50" />
      
      {/* Audio player */}
      <div className="relative z-10 p-4">
        <audio controls className="w-full">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
      
      {/* Bottom gradient overlay with info */}
      <div className="relative z-10 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-t border-purple-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs font-queensides text-purple-700 font-medium">Voice Introduction</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-600 font-queensides">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Video preview component with signed URL generation
function VideoPreview({ bucket, path }: { bucket: string; path: string }) {
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchSignedUrl = async () => {
      try {
        const signedUrl = await getSignedUrlForPath(bucket, path)
        if (!cancelled && signedUrl) {
          setVideoUrl(signedUrl)
          setLoading(false)
        } else if (!cancelled) {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error generating signed URL:", error)
        if (!cancelled) setLoading(false)
      }
    }
    fetchSignedUrl()
    return () => { cancelled = true }
  }, [bucket, path])

  if (loading) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200">
        <div className="flex flex-col items-center justify-center p-12">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 relative z-10" />
          </div>
          <p className="text-blue-600 font-queensides text-sm">Loading video...</p>
        </div>
      </div>
    )
  }

  if (!videoUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-pink-100 border border-red-200 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 font-queensides font-semibold mb-1">Failed to Load Video</p>
          <p className="text-red-500 text-sm font-queensides">Please try uploading again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-xl">
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl opacity-50" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-indigo-400 rounded-tr-2xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-indigo-400 rounded-bl-2xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-400 rounded-br-2xl opacity-50" />
      
      {/* Video player */}
      <div className="relative z-10 p-2">
        <video 
          controls 
          className="w-full rounded-xl shadow-lg bg-black"
          style={{ maxHeight: '400px' }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video element.
        </video>
      </div>
      
      {/* Bottom gradient overlay with info */}
      <div className="relative z-10 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border-t border-blue-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-queensides text-blue-700 font-medium">Video Introduction</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-queensides">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Toaster } from "@/components/ui/toaster"
import { ToastAction } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const LeafletMap = dynamic(() => import("@/components/auth/leaflet-map"), { ssr: false })

const MAX_PROFILE_PHOTOS = 6

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

const personalityTraits = [
  "Kind",
  "Ambitious",
  "Religious",
  "Family-oriented",
  "Adventurous",
  "Thoughtful",
  "Creative",
  "Calm",
  "Social",
  "Introvert",
  "Extrovert",
]
const PROFILE_IMAGE_ACCEPT = STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.join(",")

const profileSetupStepStorageKey = (uid: string) => `samaa_profile_setup_step_${uid}`

interface ProfileData {
  firstName: string
  lastName: string
  age: string
  gender: string
  maritalStatus: string
  hasChildren: string
  wantChildren: string
  bioTagline: string
  location: string
  city: string
  state: string
  country: string
  latitude?: number
  longitude?: number
  education: string
  profession: string
  religiosity: string
  prayerFrequency: string
  hijabPreference: string
  marriageIntention: string
  sect?: string
  islamicValues?: string
  isRevert: string
  alcohol: string
  smoking: string
  psychedelics: string
  halalFood: string
  livingArrangements?: string
  willingToRelocate?: string
  mahrMaxAmount?: string
  mahrRequirement?: string
  workPreference?: string
  stylePreference?: string
  familyInvolvement?: string
  psychedelicsTypes?: string[]
  dob?: string
  height?: string
  heightFeet?: string
  heightInches?: string
  nationality?: string
  nationalitySearch?: string
  nationalitySuggestions?: string[]
  // Lifestyle preferences
  financeStyle?: string
  diningFrequency?: string
  travelFrequency?: string
  hairStyle?: string // Female only
  makeUpStyle?: string // Female only
  polygamyReason?: string // Male only
  selfCareFrequency?: string
  selfCareBudgetType?: string
  selfCareBudgetAmount?: string
  shoppingFrequency?: string
  shoppingBudgetType?: string
  shoppingBudgetAmount?: string
  languages?: string[]
  bio: string
  interests: string[]
  customInterests?: string[]
  personality?: string[]
  profilePhoto: File | null
  additionalPhotos: File[]
  videoIntro: File | null
  voiceIntro: File | null
  photos: string[] // Renamed from photos to profile_photos
  preferences: {
    ageRange: { min: number; max: number }
    maxDistance: number
    education: string[]
    occupation: string[]
  }
}

export default function ProfileSetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [hasHydratedFromDb, setHasHydratedFromDb] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isResolvingLocation, setIsResolvingLocation] = useState(false)
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null)
  const [photoUploadKey, setPhotoUploadKey] = useState(0)
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)
  const [sectionSaveError, setSectionSaveError] = useState<string | null>(null)
  const [photoSignedUrls, setPhotoSignedUrls] = useState<Record<string, string>>({})
  const photosRef = useRef<string[]>([])
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
    city: "",
    state: "",
    country: "",
    education: "",
    profession: "",
    religiosity: "",
    prayerFrequency: "",
    hijabPreference: "",
    marriageIntention: "",
    sect: "",
    islamicValues: "",
    isRevert: "",
    alcohol: "",
    smoking: "",
    psychedelics: "",
    halalFood: "",
    livingArrangements: "",
    willingToRelocate: "",
    mahrMaxAmount: "",
    mahrRequirement: "",
    workPreference: "",
    stylePreference: "",
    familyInvolvement: "",
    psychedelicsTypes: [],
    dob: "",
    height: "",
    heightFeet: "",
    heightInches: "",
    nationality: "",
    nationalitySearch: "",
    nationalitySuggestions: [],
    financeStyle: "",
    diningFrequency: "",
    travelFrequency: "",
    hairStyle: "",
    makeUpStyle: "",
    polygamyReason: "",
    selfCareFrequency: "",
    selfCareBudgetType: "",
    selfCareBudgetAmount: "",
    shoppingFrequency: "",
    shoppingBudgetType: "",
    shoppingBudgetAmount: "",
    languages: [],
    bio: "",
    interests: [],
    customInterests: [],
    personality: [],
    profilePhoto: null,
    additionalPhotos: [],
    videoIntro: null,
    voiceIntro: null,
    photos: [],
    preferences: {
      ageRange: { min: 22, max: 35 },
      maxDistance: 50,
      education: [],
      occupation: [],
    },
  })

  const [originalProfileData, setOriginalProfileData] = useState<Partial<ProfileData>>({})
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set())
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
  const [showManualLocation, setShowManualLocation] = useState(false)
  const [profileRating, setProfileRating] = useState<number>(0)
  const [bioFeedback, setBioFeedback] = useState<string>("")
  const [showAiRating, setShowAiRating] = useState<boolean>(false)
  const [aiRatingComplete, setAiRatingComplete] = useState<boolean>(false)
  const [bioHasBeenEdited, setBioHasBeenEdited] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadedUrls, setUploadedUrls] = useState<{
    profilePhoto?: string
    additionalPhotos: string[]
    videoIntro?: string
    voiceIntro?: string
  }>({
    additionalPhotos: [],
  })
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const [modalVariant, setModalVariant] = useState<"success" | "error">("error")
  const [languageSearch, setLanguageSearch] = useState("")
  const [languageSuggestions, setLanguageSuggestions] = useState<string[]>([])
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const languageSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const openModal = (title: string, message: string, variant: "success" | "error" = "error") => {
    setModalTitle(title)
    setModalMessage(message)
    setModalVariant(variant)
    setModalOpen(true)
    toast({
      title,
      description: message,
      variant: variant === "success" ? "default" : "destructive",
      action:
        variant === "error" ? (
          <ToastAction
            altText="Copy error"
            onClick={() => {
              const text = typeof message === "string" ? message : String(message)
              navigator.clipboard.writeText(text)
            }}
          >
            Copy
          </ToastAction>
        ) : undefined,
    })
  }

  // Media upload handlers
  const handleProfilePhotoUpload = async (files: File[]) => {
    if (files.length === 0 || !userId) return

    const file = files[0]
    updateProfileData("profilePhoto", file)

    try {
      const result = await ProfileMediaService.uploadProfilePhoto(file, userId)
      const path =
        result.path ||
        (result.url ? storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, result.url) : null)
      if (result.success && path) {
        setUploadedUrls((prev) => ({ ...prev, profilePhoto: path }))
      } else {
        openModal("Upload Failed", result.error || "Failed to upload profile photo", "error")
      }
    } catch (error) {
      console.error("Upload error:", error)
      openModal("Upload Error", "Failed to upload profile photo.", "error")
    }
  }

  const handleAdditionalPhotosUpload = async (files: File[]) => {
    if (files.length === 0 || !userId) return

    // Check if adding these files would exceed the 6 photo limit
    const currentCount = uploadedUrls.additionalPhotos.length
    if (currentCount + files.length > 6) {
      openModal("Photo Limit", `You can only have up to 6 photos. You currently have ${currentCount} photo(s).`, "error")
      return
    }

    updateProfileData("additionalPhotos", files)

    try {
      const uploadPromises = files.map((file) =>
        ProfileMediaService.uploadProfilePhoto(file, userId)
      )

      const results = await Promise.all(uploadPromises)
      const successfulUrls = results
        .filter((r: any) => r.success && (r.path || r.url))
        .map(
          (r: any) => r.path || storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, r.url!)!
        )

      const newPhotos = [...uploadedUrls.additionalPhotos, ...successfulUrls]
      setUploadedUrls((prev) => ({
        ...prev,
        additionalPhotos: newPhotos,
      }))

      // Save to database immediately
      await ProfileService.updateProfileByUserId(userId, {
        additional_photos: newPhotos.length > 0 ? newPhotos : null,
      } as any)

      const failedCount = results.length - successfulUrls.length
      if (failedCount > 0) {
        openModal("Partial Upload", `${failedCount} photos failed to upload.`, "error")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload photos")
    }
  }

  const handleVideoUpload = async (files: File[]) => {
    if (files.length === 0 || !userId) return

    const file = files[0]
    updateProfileData("videoIntro", file)

    try {
      const result = await ProfileMediaService.uploadProfileVideo(file, userId)
      if (result.success && (result as any).path) {
        const videoPath = (result as any).path
        setUploadedUrls((prev) => ({ ...prev, videoIntro: videoPath }))
        
        // Save to database immediately
        await ProfileService.updateProfileByUserId(userId, { video_intro: videoPath } as any)
      } else {
        openModal("Upload Failed", result.error || "Failed to upload video", "error")
      }
    } catch (error) {
      console.error("Upload error:", error)
      openModal("Upload Error", "Failed to upload video.", "error")
    }
  }

  const handleDeleteVideo = async () => {
    if (!userId) return
    try {
      await ProfileService.updateProfileByUserId(userId, { video_intro: null } as any)
      setUploadedUrls((prev) => ({ ...prev, videoIntro: undefined }))
      updateProfileData("videoIntro", null)
      await refreshProfile()
    } catch (error) {
      console.error("Error deleting video:", error)
      openModal("Delete Failed", "Failed to delete video. Please try again.", "error")
    }
  }

  const handleAudioUpload = async (files: File[]) => {
    if (files.length === 0 || !userId) return

    const file = files[0]
    updateProfileData("voiceIntro", file)

    try {
      const result = await ProfileMediaService.uploadProfileAudio(file, userId)
      if (result.success && (result as any).path) {
        const audioPath = (result as any).path
        setUploadedUrls((prev) => ({ ...prev, voiceIntro: audioPath }))
        
        // Save to database immediately
        await ProfileService.updateProfileByUserId(userId, { voice_intro: audioPath } as any)
      } else {
        openModal("Upload Failed", result.error || "Failed to upload audio", "error")
      }
    } catch (error) {
      console.error("Upload error:", error)
      openModal("Upload Error", "Failed to upload audio.", "error")
    }
  }

  const handleDeleteAudio = async () => {
    if (!userId) return
    try {
      await ProfileService.updateProfileByUserId(userId, { voice_intro: null } as any)
      setUploadedUrls((prev) => ({ ...prev, voiceIntro: undefined }))
      updateProfileData("voiceIntro", null)
      await refreshProfile()
    } catch (error) {
      console.error("Error deleting audio:", error)
      openModal("Delete Failed", "Failed to delete audio. Please try again.", "error")
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
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parts = [profileData.city, profileData.state, profileData.country]
      .map((p) => (p || "").trim())
      .filter(Boolean)
    if (parts.length) {
      updateProfileData("location", parts.join(", "))
    }
    // Hide the manual form after submit
    setShowManualLocation(false)
  }

  const searchLocations = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      setLocationSuggestions(data)
    } catch (error) {
      console.error("Error searching locations:", error)
    }
  }

  const router = useRouter()
  const { isAuthenticated, userId, profile, refreshProfile } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated || !userId || hasHydratedFromDb || !profile) return

    console.log('Loading profile data from database:', {
      location: profile.location,
      city: profile.city,
      state: (profile as any).state,
      country: (profile as any).country,
      education: profile.education,
      profession: profile.profession,
      marital_status: profile.marital_status,
      willing_to_relocate: (profile as any).willing_to_relocate,
      mahr_max_amount: (profile as any).mahr_max_amount,
      mahr_requirement: (profile as any).mahr_requirement,
      work_preference: (profile as any).work_preference,
      style_preference: (profile as any).style_preference,
      living_arrangements: (profile as any).living_arrangements,
      profile_photo: profile.profile_photo,
      profile_photos: profile.profile_photos,
      additional_photos: (profile as any).additional_photos,
      video_intro: (profile as any).video_intro,
      voice_intro: (profile as any).voice_intro,
    })

    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim()
    const location =
      profile.location || [profile.city, profile.state, profile.country].filter(Boolean).join(", ")

    if (profile.latitude && profile.longitude) {
      setLocationCoords([profile.latitude, profile.longitude])
    }

    setProfileData((prev) => ({
      ...prev,
      firstName: profile.first_name || prev.firstName,
      lastName: profile.last_name || prev.lastName,
      age: profile.age ? String(profile.age) : prev.age,
      gender: profile.gender || prev.gender,
      maritalStatus: profile.marital_status || prev.maritalStatus,
      hasChildren: profile.has_children ? "yes" : "no",
      wantChildren: profile.wants_children ? "yes" : "no",
      bioTagline:
        profile.bio_tagline ||
        (profile.bio ? String(profile.bio).substring(0, 100) : prev.bioTagline),
      location: location || prev.location,
      city: profile.city || prev.city,
      state: (profile as any).state || prev.state,
      country: (profile as any).country || prev.country,
      education: profile.education || prev.education,
      profession: profile.profession || prev.profession,
      religiosity: profile.religiosity || prev.religiosity,
      prayerFrequency: profile.prayer_frequency || prev.prayerFrequency,
      hijabPreference: profile.hijab_preference || prev.hijabPreference,
      marriageIntention: profile.marriage_intention || prev.marriageIntention,
      sect: (profile as any).sect || prev.sect,
      islamicValues: (profile as any).islamic_values || prev.islamicValues,
      isRevert: profile.is_revert ? "yes" : "no",
      alcohol: profile.alcohol || prev.alcohol,
      smoking: profile.smoking || prev.smoking,
      psychedelics: profile.psychedelics || prev.psychedelics,
      psychedelicsTypes: Array.isArray((profile as any).psychedelics_types) ? (profile as any).psychedelics_types : prev.psychedelicsTypes,
      halalFood: profile.halal_food || prev.halalFood,
      livingArrangements: (profile as any).living_arrangements || prev.livingArrangements,
      willingToRelocate: (profile as any).willing_to_relocate === true ? "yes" : (profile as any).willing_to_relocate === false ? "no" : prev.willingToRelocate,
      mahrMaxAmount: (profile as any).mahr_max_amount ? String((profile as any).mahr_max_amount) : prev.mahrMaxAmount,
      mahrRequirement: (profile as any).mahr_requirement ? String((profile as any).mahr_requirement) : prev.mahrRequirement,
      workPreference: (profile as any).work_preference || prev.workPreference,
      stylePreference: (profile as any).style_preference || prev.stylePreference,
      familyInvolvement: (profile as any).family_involvement || prev.familyInvolvement,
      dob: (profile as any).date_of_birth || prev.dob,
      height: (profile as any).height || prev.height,
      nationality: (profile as any).nationality || prev.nationality,
      bio: profile.bio || prev.bio,
      interests: Array.isArray(profile.interests) ? profile.interests : prev.interests,
      customInterests: Array.isArray((profile as any).custom_interests) ? (profile as any).custom_interests : prev.customInterests,
      personality: Array.isArray((profile as any).personality)
        ? (profile as any).personality
        : prev.personality,
      photos: Array.isArray(profile.profile_photos)
        ? profile.profile_photos.map((p: string) =>
            storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, p)
          )
        : prev.photos,
      videoIntro: profile.video_intro || null,
      voiceIntro: profile.voice_intro || null,
      profilePhoto: profile.profile_photo || null,
      additionalPhotos: Array.isArray(profile.additional_photos) ? profile.additional_photos : [],
      preferences: {
        // Ensure preferences are still handled
        ...prev.preferences,
        education: profile.education ? [profile.education] : prev.preferences.education,
        occupation: profile.profession ? [profile.profession] : prev.preferences.occupation,
      },
    }))
    const mapped = {
      // Create mapped object to set originalProfileData
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      age: profile.age ? String(profile.age) : "",
      gender: profile.gender || "",
      maritalStatus: profile.marital_status || "",
      hasChildren: profile.has_children ? "yes" : "no",
      wantChildren: profile.wants_children ? "yes" : "no",
      bioTagline: profile.bio_tagline || (profile.bio ? String(profile.bio).substring(0, 100) : ""),
      location: location || "",
      city: profile.city || "",
      state: (profile as any).state || "",
      country: (profile as any).country || "",
      education: profile.education || "",
      profession: profile.profession || "",
      religiosity: profile.religiosity || "",
      prayerFrequency: profile.prayer_frequency || "",
      hijabPreference: profile.hijab_preference || "",
      marriageIntention: profile.marriage_intention || "",
      sect: (profile as any).sect || "",
      islamicValues: (profile as any).islamic_values || "",
      isRevert: profile.is_revert ? "yes" : "no",
      alcohol: profile.alcohol || "",
      smoking: profile.smoking || "",
      psychedelics: profile.psychedelics || "",
      psychedelicsTypes: Array.isArray((profile as any).psychedelics_types) ? (profile as any).psychedelics_types : [],
      dob: (profile as any).date_of_birth || "",
      height: (profile as any).height || "",
      nationality: (profile as any).nationality || "",
      halalFood: profile.halal_food || "",
      bio: profile.bio || "",
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      customInterests: Array.isArray((profile as any).custom_interests) ? (profile as any).custom_interests : [],
      livingArrangements: (profile as any).living_arrangements || "",
      willingToRelocate: (profile as any).willing_to_relocate === true ? "yes" : (profile as any).willing_to_relocate === false ? "no" : "",
      mahrMaxAmount: (profile as any).mahr_max_amount ? String((profile as any).mahr_max_amount) : "",
      mahrRequirement: (profile as any).mahr_requirement ? String((profile as any).mahr_requirement) : "",
      workPreference: (profile as any).work_preference || "",
      stylePreference: (profile as any).style_preference || "",
      familyInvolvement: (profile as any).family_involvement || "",
      financeStyle: (profile as any).finance_style || "",
      diningFrequency: (profile as any).dining_frequency || "",
      travelFrequency: (profile as any).travel_frequency || "",
      hairStyle: (profile as any).hair_style || "",
      polygamyReason: (profile as any).polygamy_reason || "",
      selfCareBudgetType: (profile as any).self_care_budget_preference_type || "",
      selfCareBudgetAmount: (profile as any).self_care_budget_preference_amount ? String((profile as any).self_care_budget_preference_amount) : "",
      shoppingBudgetType: (profile as any).shopping_budget_preference_type || "",
      shoppingBudgetAmount: (profile as any).shopping_budget_preference_amount ? String((profile as any).shopping_budget_preference_amount) : "",
      languages: Array.isArray((profile as any).languages_preference) ? (profile as any).languages_preference : [],
      personality: Array.isArray((profile as any).personality) ? (profile as any).personality : [],
      profilePhoto: profile.profile_photo || null,
      additionalPhotos: Array.isArray(profile.additional_photos) ? profile.additional_photos : [],
      videoIntro: profile.video_intro || null,
      voiceIntro: profile.voice_intro || null,
      photos: Array.isArray(profile.profile_photos)
        ? profile.profile_photos.map((p: string) =>
            storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, p)
          )
        : [],
      preferences: {
        // Ensure preferences are still handled
        ageRange: { min: profile.age_range_min ?? 22, max: profile.age_range_max ?? 35 },
        maxDistance: profile.max_distance ?? 50,
        education: profile.education ? [profile.education] : [],
        occupation: profile.profession ? [profile.profession] : [],
      },
    }
    setOriginalProfileData(mapped)

    if (profile.latitude && profile.longitude) {
      setLocationData({
        latitude: profile.latitude,
        longitude: profile.longitude,
        address: profile.location || "",
      })
    }

    setUploadedUrls({
      profilePhoto: profile.profile_photo || undefined,
      additionalPhotos: Array.isArray((profile as any).additional_photos) 
        ? (profile as any).additional_photos 
        : Array.isArray(profile.profile_photos) 
          ? profile.profile_photos 
          : [],
      videoIntro: (profile as any).video_intro || undefined,
      voiceIntro: (profile as any).voice_intro || undefined,
    })

    console.log('Set uploadedUrls:', {
      profilePhoto: profile.profile_photo,
      additionalPhotos: Array.isArray((profile as any).additional_photos) 
        ? (profile as any).additional_photos 
        : Array.isArray(profile.profile_photos) 
          ? profile.profile_photos 
          : [],
      videoIntro: (profile as any).video_intro,
      voiceIntro: (profile as any).voice_intro,
    })

    setHasHydratedFromDb(true)
  }, [isAuthenticated, userId, profile, hasHydratedFromDb])

  useEffect(() => {
    if (!hasHydratedFromDb || !userId) return
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(profileSetupStepStorageKey(userId))
        : null
    if (raw == null) return
    const step = parseInt(raw, 10)
    if (!Number.isNaN(step) && step >= 0 && step <= steps.length) {
      setCurrentStep(step)
    }
  }, [hasHydratedFromDb, userId])

  useEffect(() => {
    if (!isAuthenticated || !hasHydratedFromDb || !userId) return
    void (async () => {
      try {
        const s = await UserSettingsService.getUserSettings(userId)
        if (!s) return
        setProfileData((prev) => ({
          ...prev,
          preferences: {
            ...prev.preferences,
            ageRange: {
              min: s.age_range_min ?? prev.preferences.ageRange.min,
              max: s.age_range_max ?? prev.preferences.ageRange.max,
            },
            maxDistance: s.max_distance ?? prev.preferences.maxDistance,
          },
        }))
      } catch (error) {
        console.error('Error loading user settings in profile setup:', error)
        // Silently fail - settings will use defaults
      }
    })()
  }, [isAuthenticated, hasHydratedFromDb, userId])

  useEffect(() => {
    setSectionSaveError(null)
  }, [currentStep])

  useEffect(() => {
    photosRef.current = profileData.photos
  }, [profileData.photos])

  useEffect(() => {
    const paths = profileData.photos
    if (paths.length === 0) {
      setPhotoSignedUrls({})
      return
    }
    let cancelled = false
    void (async () => {
      const next: Record<string, string> = {}
      await Promise.all(
        paths.map(async (entry) => {
          const path = storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, entry)
          const signed = await getSignedUrlForPath(STORAGE_CONFIG.BUCKETS.PROFILES, path, 3600)
          if (signed) {
            next[path] = signed
          }
        })
      )
      if (!cancelled) {
        setPhotoSignedUrls(next)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [profileData.photos])

  const steps = [
    { id: 1, title: "Basic Information", icon: User },
    { id: 2, title: "Islamic Values", icon: Heart },
    { id: 3, title: "Interests & Hobbies", icon: Star },
    { id: 4, title: "Photos & Media", icon: Camera },
  ]

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  // Language search with debouncing
  const handleLanguageSearch = (value: string) => {
    setLanguageSearch(value)
    
    if (languageSearchTimeoutRef.current) {
      clearTimeout(languageSearchTimeoutRef.current)
    }

    if (value.trim().length > 0) {
      languageSearchTimeoutRef.current = setTimeout(() => {
        const languagesList = ["Arabic", "English", "Urdu", "French", "Turkish", "Indonesian", "Malay", "Bengali", "Spanish", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean", "Hindi", "Persian", "Swahili", "Hausa", "Yoruba", "Amharic", "Somali", "Afghan", "Bosnian", "Albanian", "Kurdish", "Pashto", "Tamil", "Punjabi", "Other"]
        const filtered = languagesList
          .filter(lang => 
            lang.toLowerCase().includes(value.toLowerCase()) && 
            !(profileData.languages || []).includes(lang)
          )
          .slice(0, 8)
        setLanguageSuggestions(filtered)
        setShowLanguageDropdown(true)
      }, 200)
    } else {
      setLanguageSuggestions([])
      setShowLanguageDropdown(false)
    }
  }

  // Add language
  const addLanguage = (language: string) => {
    if (!(profileData.languages || []).includes(language)) {
      updateProfileData('languages', [...(profileData.languages || []), language])
      setLanguageSearch("")
      setLanguageSuggestions([])
      setShowLanguageDropdown(false)
    }
  }

  // Remove language
  const removeLanguage = (language: string) => {
    updateProfileData('languages', (profileData.languages || []).filter(l => l !== language))
  }

  const handleBasicInfoChange = (field: keyof ProfileData, value: string | string[]) => {
    updateProfileData(field, value)
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsResolvingLocation(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      )
      const data = await res.json()
      const address = data?.address || {}
      // Extract only city, state, country
      const city = address.city || address.town || address.village || address.municipality || ""
      const state = address.state || address.region || address.province || ""
      const country = address.country || ""
      const locationParts = [city, state, country].filter(Boolean)
      const locationString = locationParts.length > 0 ? locationParts.join(", ") : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      handleBasicInfoChange("location", locationString)
      setLocationCoords([lat, lng])
    } catch {
      handleBasicInfoChange("location", `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      setLocationCoords([lat, lng])
    } finally {
      setIsResolvingLocation(false)
    }
  }

  const handleMapPositionChange = async (lat: number, lng: number) => {
    await reverseGeocode(lat, lng)
  }

  const removePhotoAt = async (index: number) => {
    const photoToDelete = uploadedUrls.additionalPhotos[index]
    
    const next = uploadedUrls.additionalPhotos.filter((_, i) => i !== index)
    setUploadedUrls((prev) => ({
      ...prev,
      additionalPhotos: next,
    }))
    
    // Update main photo index if needed
    if (mainPhotoIndex === index) {
      setMainPhotoIndex(0)
    } else if (mainPhotoIndex > index) {
      setMainPhotoIndex(mainPhotoIndex - 1)
    }
    
    if (!userId) return
    const saved = await ProfileService.updateProfileByUserId(userId, {
      profile_photos: next.length > 0 ? next : null,
    } as any)
    if (saved) {
      void refreshProfile()
    }
  }

  const handleProfilePhotosSelected = async (files: File[]) => {
    if (!userId || files.length === 0) return
    setPhotoUploadError(null)
    setIsUploadingPhotos(true)
    try {
      const remaining = Math.max(0, MAX_PROFILE_PHOTOS - photosRef.current.length)
      const toUpload = files.slice(0, remaining)
      if (toUpload.length === 0) {
        setPhotoUploadError(`You can add up to ${MAX_PROFILE_PHOTOS} photos.`)
        return
      }
      const newUrls: string[] = []
      for (const file of toUpload) {
        const result = await ProfileMediaService.uploadProfilePhoto(file, userId)
        const storedPath =
          result.path ||
          (result.url
            ? storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, result.url)
            : null)
        if (result.success && storedPath) {
          newUrls.push(storedPath)
        } else {
          setPhotoUploadError(result.error || "Upload failed for one or more images.")
        }
      }
      if (newUrls.length > 0) {
        const merged = [...photosRef.current, ...newUrls].slice(0, MAX_PROFILE_PHOTOS)
        setProfileData((prev) => ({
          ...prev,
          photos: merged,
        }))
        if (userId) {
          const savedPhotos = await ProfileService.updateProfileByUserId(userId, {
            profile_photo: merged[0] || null,
            profile_photos: merged.length > 0 ? merged : null,
          } as any)
          if (savedPhotos) {
            void refreshProfile()
          }
        }
      }
    } finally {
      setIsUploadingPhotos(false)
      setPhotoUploadKey((k) => k + 1)
    }
  }

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await reverseGeocode(latitude, longitude)
      },
      () => {
        console.warn("Unable to get current location.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const persistBasicSection = async (): Promise<boolean> => {
    if (!userId) return false
    const [firstName = "", ...rest] = profileData.firstName.trim().split(" ")
    const lastName = profileData.lastName.trim()
    const row = await ProfileService.updateProfileByUserId(userId, {
      first_name: firstName || null,
      last_name: lastName || null,
      age: profileData.age ? Number(profileData.age) : null,
      location: profileData.location || null,
      latitude: locationCoords ? locationCoords[0] : null,
      longitude: locationCoords ? locationCoords[1] : null,
      education: profileData.education || null,
      profession: profileData.profession || null,
      marital_status: profileData.maritalStatus || null,
      willing_to_relocate: profileData.willingToRelocate === "yes" ? true : profileData.willingToRelocate === "no" ? false : null,
      languages_preference: profileData.languages || null,
      mahr_max_amount: profileData.mahrMaxAmount ? Number(profileData.mahrMaxAmount) : null,
      mahr_requirement: profileData.mahrRequirement ? Number(profileData.mahrRequirement) : null,
      work_preference: profileData.workPreference || null,
      style_preference: profileData.stylePreference || null,
      living_arrangements: profileData.livingArrangements || null,
      finance_style: profileData.financeStyle || null,
      dining_frequency: profileData.diningFrequency || null,
      travel_frequency: profileData.travelFrequency || null,
      shopping_frequency_preference: profileData.shoppingFrequency || null,
      shopping_budget_preference_type: profileData.shoppingBudgetType || null,
      shopping_budget_preference_amount: profileData.shoppingBudgetAmount ? Number(profileData.shoppingBudgetAmount) : null,
      self_care_frequency_preference: profileData.selfCareFrequency || null,
      self_care_budget_preference_type: profileData.selfCareBudgetType || null,
      self_care_budget_preference_amount: profileData.selfCareBudgetAmount ? Number(profileData.selfCareBudgetAmount) : null,
      hair_style: profileData.hairStyle || null,
      polygamy_reason: profileData.polygamyReason || null,
      bio: profileData.bio || null,
    } as any)
    return !!row
  }

  const persistPhotosSection = async (): Promise<boolean> => {
    if (!userId) return false
    const row = await ProfileService.updateProfileByUserId(userId, {
      profile_photos: uploadedUrls.additionalPhotos.length > 0 ? uploadedUrls.additionalPhotos : null,
      video_intro: uploadedUrls.videoIntro || null,
      voice_intro: uploadedUrls.voiceIntro || null,
    } as any)
    return !!row
  }

  const persistInterestsSection = async (): Promise<boolean> => {
    if (!userId) return false
    const row = await ProfileService.updateProfileByUserId(userId, {
      interests: profileData.interests.length > 0 ? profileData.interests : null,
      custom_interests: profileData.customInterests && profileData.customInterests.length > 0 ? profileData.customInterests : null,
      personality:
        profileData.personality && profileData.personality.length > 0
          ? profileData.personality
          : null,
    } as any)
    return !!row
  }

  const persistIslamicValuesSection = async (): Promise<boolean> => {
    if (!userId) return false
    const row = await ProfileService.updateProfileByUserId(userId, {
      religiosity: profileData.religiosity || null,
      prayer_frequency: profileData.prayerFrequency || null,
      hijab_preference: profileData.hijabPreference || null,
      marriage_intention: profileData.marriageIntention || null,
      sect: profileData.sect || null,
      islamic_values: profileData.islamicValues || null,
      is_revert: profileData.isRevert === "yes",
      alcohol: profileData.alcohol || null,
      smoking: profileData.smoking || null,
      psychedelics: profileData.psychedelics || null,
      psychedelics_types: profileData.psychedelicsTypes || null,
      halal_food: profileData.halalFood || null,
      family_involvement: profileData.familyInvolvement || null,
    } as any)
    return !!row
  }

  const persistFinalProfile = async (): Promise<boolean> => {
    if (!userId) return false

    const profileWithId = {
      id: `user_${Date.now()}`,
      walletAddress: userId || undefined,
      ...profileData,
      createdAt: new Date().toISOString(),
      isVerified: false,
      profileRating: 0,
    }
    console.log("Saving profile data:", profileWithId)
    localStorage.setItem("userProfile", JSON.stringify(profileWithId))

    const [firstName = "", ...rest] = profileData.firstName.trim().split(" ")
    const lastName = profileData.lastName.trim()

    const dbPayload = {
      first_name: firstName || null,
      last_name: lastName || null,
      age: profileData.age ? Number(profileData.age) : null,
      location: profileData.location || null,
      latitude: locationCoords ? locationCoords[0] : null,
      longitude: locationCoords ? locationCoords[1] : null,
      bio: profileData.bio || null,
      interests: profileData.interests.length > 0 ? profileData.interests : null,
      custom_interests: profileData.customInterests && profileData.customInterests.length > 0 ? profileData.customInterests : null,
      profile_photo: uploadedUrls.profilePhoto || null,
      profile_photos: uploadedUrls.additionalPhotos.length > 0 ? uploadedUrls.additionalPhotos : null,
      additional_photos: uploadedUrls.additionalPhotos.length > 0 ? uploadedUrls.additionalPhotos : null,
      video_intro: uploadedUrls.videoIntro || null,
      voice_intro: uploadedUrls.voiceIntro || null,
      education: profileData.preferences.education[0] || null,
      profession: profileData.preferences.occupation[0] || null,
      profile_complete: true,
    }

    const saved = await ProfileService.updateProfileByUserId(userId, dbPayload as any)
    if (!saved) {
      console.warn("Profile save to Supabase failed, localStorage backup retained.")
      return false
    }

    try {
      await UserSettingsService.upsertUserSettings(userId, {
        age_range_min: profileData.preferences.ageRange.min,
        age_range_max: profileData.preferences.ageRange.max,
        max_distance: profileData.preferences.maxDistance,
      } as any)
    } catch (e) {
      console.warn("Could not sync match preferences to user_settings:", e)
    }

    return true
  }

  const persistSectionForStep = async (stepIndex: number): Promise<boolean> => {
    if (!userId) return false
    switch (stepIndex) {
      case 1:
        return persistBasicSection()
      case 2: // New step 2 is Islamic Values
        return persistIslamicValuesSection()
      case 3: // New step 3 is Interests & Hobbies
        return persistInterestsSection()
      case 4: // New step 4 is Photos & Media
        return persistPhotosSection()
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (isSaving || isUploadingPhotos) return

    // Check validation and show errors if form is incomplete
    const missingFields = getMissingFields()
    if (missingFields.length > 0) {
      setShowValidationErrors(true)
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setShowValidationErrors(false)

    if (currentStep < steps.length) {
      if (!isAuthenticated || !userId) {
        setSectionSaveError("Please sign in to save your progress.")
        return
      }
      setIsSaving(true)
      setSectionSaveError(null)
      try {
        const ok = await persistSectionForStep(currentStep)
        if (!ok) {
          setSectionSaveError("Could not save this step. Check your connection and try again.")
          return
        }
        localStorage.setItem(profileSetupStepStorageKey(userId), String(currentStep + 1))
        await refreshProfile()
        setCurrentStep(currentStep + 1)
      } finally {
        setIsSaving(false)
      }
    } else {
      if (!isAuthenticated || !userId) {
        openModal("Not Signed In", "Please sign in to save your profile.", "error")
        return
      }
      setIsSaving(true)
      setSectionSaveError(null)

      try {
        // Required field validation
        if (!profileData.bio || profileData.bio.trim().length === 0) {
          openModal("Missing Bio", "Bio is required. Please write a short bio.", "error")
          return
        }
        if (profileData.bio.trim().length < 300) {
          openModal("Bio Too Short", `Your bio must be at least 300 characters. Currently: ${profileData.bio.length} characters.`, "error")
          return
        }

        // Compose location from manual fields
        const manualParts = [profileData.city, profileData.state, profileData.country]
          .map((s) => (s || "").trim())
          .filter(Boolean)
        const composedLocation =
          manualParts.length > 0
            ? manualParts.join(", ")
            : (profileData.location || locationData.address || "").trim()
        if (!composedLocation) {
          openModal("Missing Location", "Please detect or enter your location.", "error")
          return
        }

        // Ensure uploads if files were selected but not uploaded yet
        const withTimeout = async <T,>(p: Promise<T>, ms: number) => {
          return Promise.race<T>([
            p,
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error("Upload timed out")), ms)
            ) as Promise<T>,
          ])
        }

        let mainPhotoUrl = uploadedUrls.profilePhoto
        let additionalUrls = [...uploadedUrls.additionalPhotos]
        let videoUrl = uploadedUrls.videoIntro
        let audioUrl = uploadedUrls.voiceIntro
        try {
          if (!mainPhotoUrl && profileData.profilePhoto) {
            toast({ title: "Uploading Photo", description: "Uploading your main profile photo..." })
            const r = await withTimeout(
              ProfileMediaService.uploadProfilePhoto(profileData.profilePhoto, userId),
              15000
            )
            if (r.success && (r.path || r.url)) {
              mainPhotoUrl =
                r.path || storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, r.url!)!
              setUploadedUrls((prev) => ({ ...prev, profilePhoto: mainPhotoUrl }))
            } else {
              openModal("Upload Failed", r.error || "Failed to upload main profile photo.", "error")
              return
            }
          }
          if (additionalUrls.length === 0 && (profileData.additionalPhotos?.length || 0) > 0) {
            toast({ title: "Uploading Photos", description: "Uploading your additional photos..." })
            const results = await withTimeout(
              Promise.all(
                profileData.additionalPhotos.map((f) =>
                  ProfileMediaService.uploadProfilePhoto(f, userId)
                )
              ),
              25000
            )
            const successful = results
              .filter((res) => res.success && (res.path || res.url))
              .map(
                (res) =>
                  res.path || storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, res.url!)!
              )
            if (successful.length === 0) {
              openModal("Upload Failed", "Failed to upload additional photos.", "error")
              return
            }
            additionalUrls = successful
            setUploadedUrls((prev) => ({ ...prev, additionalPhotos: successful }))
          }
          if (!videoUrl && profileData.videoIntro) {
            toast({ title: "Uploading Video", description: "Uploading your video intro..." })
            const rv = await withTimeout(
              ProfileMediaService.uploadProfileVideo(profileData.videoIntro, userId),
              30000
            )
            if (rv.success && (rv as any).path) {
              videoUrl =
                (rv as any).path ||
                storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.VIDEOS, rv.url!)!
              setUploadedUrls((prev) => ({ ...prev, videoIntro: videoUrl }))
            } else {
              openModal("Upload Failed", rv.error || "Failed to upload video intro.", "error")
              return
            }
          }
          if (!audioUrl && profileData.voiceIntro) {
            toast({ title: "Uploading Audio", description: "Uploading your voice intro..." })
            const ra = await withTimeout(
              ProfileMediaService.uploadProfileAudio(profileData.voiceIntro, userId),
              20000
            )
            if (ra.success && (ra as any).path) {
              audioUrl =
                (ra as any).path ||
                storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.VOICE_NOTES, ra.url!)!
              setUploadedUrls((prev) => ({ ...prev, voiceIntro: audioUrl }))
            } else {
              openModal("Upload Failed", ra.error || "Failed to upload voice intro.", "error")
              return
            }
          }
        } catch (e) {
          openModal(
            "Upload Error",
            e instanceof Error ? e.message : "An error occurred while uploading your photos.",
            "error"
          )
          return
        }

        // Build media URLs from uploaded results
        const mediaUrls: any = {
          photos: [...(mainPhotoUrl ? [mainPhotoUrl] : []), ...additionalUrls],
          videoIntro: videoUrl,
          voiceNote: audioUrl,
          audioMessages: [],
        }

        // Skip photo requirement for faster testing
        if (mediaUrls.photos.length === 0) {
          toast({ title: "No Photos", description: "Skipping photo requirement for testing." })
        }

        // Prepare profile data for saving - only include edited fields
        const profileWithWallet = {
          ...profileData,
          // Only override fields that have been edited
          ...(editedFields.has("firstName") && { firstName: profileData.firstName }),
          ...(editedFields.has("lastName") && { lastName: profileData.lastName }),
          ...(editedFields.has("age") && { age: profileData.age }),
          ...(editedFields.has("gender") && { gender: profileData.gender }),
          ...(editedFields.has("maritalStatus") && { maritalStatus: profileData.maritalStatus }),
          ...(editedFields.has("hasChildren") && { hasChildren: profileData.hasChildren }),
          ...(editedFields.has("wantChildren") && { wantChildren: profileData.wantChildren }),
          ...(editedFields.has("bioTagline") && { bioTagline: profileData.bioTagline }),
          ...(editedFields.has("location") && { location: composedLocation }),
          ...(editedFields.has("city") && { city: profileData.city }),
          ...(editedFields.has("state") && { state: profileData.state }),
          ...(editedFields.has("country") && { country: profileData.country }),
          ...(editedFields.has("education") && { education: profileData.education }),
          ...(editedFields.has("profession") && { profession: profileData.profession }),
          ...(editedFields.has("religiosity") && { religiosity: profileData.religiosity }),
          ...(editedFields.has("prayerFrequency") && {
            prayerFrequency: profileData.prayerFrequency,
          }),
          ...(editedFields.has("hijabPreference") && {
            hijabPreference: profileData.hijabPreference,
          }),
          ...(editedFields.has("marriageIntention") && {
            marriageIntention: profileData.marriageIntention,
          }),
          ...(editedFields.has("isRevert") && { isRevert: profileData.isRevert }),
          ...(editedFields.has("alcohol") && { alcohol: profileData.alcohol }),
          ...(editedFields.has("smoking") && { smoking: profileData.smoking }),
          ...(editedFields.has("psychedelics") && { psychedelics: profileData.psychedelics }),
          ...(editedFields.has("halalFood") && { halalFood: profileData.halalFood }),
          ...(editedFields.has("selfCareFrequency") && { selfCareFrequency: profileData.selfCareFrequency }),
          ...(editedFields.has("selfCareBudgetType") && { selfCareBudgetType: profileData.selfCareBudgetType }),
          ...(editedFields.has("selfCareBudgetAmount") && { selfCareBudgetAmount: profileData.selfCareBudgetAmount }),
          ...(editedFields.has("shoppingFrequency") && { shoppingFrequency: profileData.shoppingFrequency }),
          ...(editedFields.has("shoppingBudgetType") && { shoppingBudgetType: profileData.shoppingBudgetType }),
          ...(editedFields.has("shoppingBudgetAmount") && { shoppingBudgetAmount: profileData.shoppingBudgetAmount }),
          ...(editedFields.has("hairStyle") && { hairStyle: profileData.hairStyle }),
          ...(editedFields.has("makeUpStyle") && { makeUpStyle: profileData.makeUpStyle }),
          ...(editedFields.has("bio") && { bio: profileData.bio }),
          ...(editedFields.has("interests") && { interests: profileData.interests }),
          location:
            editedFields.has("location") ||
            editedFields.has("city") ||
            editedFields.has("state") ||
            editedFields.has("country")
              ? composedLocation
              : profileData.location,
          userId: userId,
          createdAt: new Date().toISOString(),
          media: mediaUrls,
          profileComplete: true,
          isVerified: false,
          profileRating: profileRating || 0,
          lastActive: new Date().toISOString(),
          matchingEnabled: true,
          profilePhoto: uploadedUrls.profilePhoto || undefined,
          photos: mediaUrls.photos,
          voiceIntro: uploadedUrls.voiceIntro,
          video: uploadedUrls.videoIntro,
        }

        // Save to Supabase (this will also save to localStorage as backup)
        const success = await saveProfile(userId, profileWithWallet)

        if (success) {
          // Redirect to profile page
          openModal("Profile Saved", "Your profile was saved successfully.", "success")
          toast({ title: "Profile Saved", description: "Redirecting to your profile..." })
          setTimeout(() => {
            window.location.href = `/profile?userId=${userId}`
          }, 800)
        } else {
          openModal("Save Failed", "Failed to save profile. Please try again.", "error")
          toast({
            title: "Save Failed",
            description: "Please try again.",
            variant: "destructive",
            action: (
              <ToastAction
                altText="Copy error"
                onClick={() => navigator.clipboard.writeText("Please try again.")}
              >
                Copy
              </ToastAction>
            ),
          })
        }
      } catch (error) {
        console.error("Error saving profile:", error)
        openModal("Save Error", "Failed to save profile. Please try again.", "error")
        toast({
          title: "Save Error",
          description: "Failed to save profile.",
          variant: "destructive",
          action: (
            <ToastAction
              altText="Copy error"
              onClick={() => navigator.clipboard.writeText("Failed to save profile.")}
            >
              Copy
            </ToastAction>
          ),
        })
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (isSaving || isUploadingPhotos) return
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const getButtonText = () => {
    if (isSaving) {
      return "Saving…"
    }
    if (currentStep === 1) {
      return "Next: Islamic Values"
    }
    if (currentStep === 2) {
      return "Next: Interests & Hobbies"
    }
    if (currentStep === 3) {
      return "Next: Photos & Media"
    }
    return "Save Profile"
  }

  // Get missing required fields for current step
  const getMissingFields = () => {
    const missing: string[] = []
    
    if (currentStep === 1) {
      if (!profileData.firstName) missing.push("First Name")
      if (!profileData.age) missing.push("Age")
      if (!profileData.location) missing.push("Location")
      if (!profileData.education) missing.push("Education")
      if (!profileData.profession) missing.push("Profession")
      if (!profileData.maritalStatus) missing.push("Marital Status")
      if (!profileData.willingToRelocate) missing.push("Willingness to Relocate")
      if (!profileData.livingArrangements) missing.push("Living Arrangements")
      if (profileData.gender === "male" && !profileData.mahrMaxAmount) missing.push("Mahr Budget")
      if (profileData.gender === "female") {
        if (!profileData.mahrRequirement) missing.push("Mahr Requirement")
        if (!profileData.workPreference) missing.push("Work Preference")
        if (!profileData.stylePreference) missing.push("Style Preference")
      }
    } else if (currentStep === 2) {
      if (!profileData.religiosity) missing.push("Religiosity")
      if (!profileData.prayerFrequency) missing.push("Prayer Frequency")
      if (profileData.gender === "female" && !profileData.hijabPreference) missing.push("Hijab Preference")
      if (!profileData.marriageIntention) missing.push("Marriage Intention")
      if (!profileData.isRevert) missing.push("Revert Status")
      if (!profileData.sect) missing.push("Sect")
      if (!profileData.islamicValues) missing.push("Islamic Values")
      if (!profileData.familyInvolvement) missing.push("Family Involvement")
      if (!profileData.alcohol) missing.push("Alcohol Preference")
      if (!profileData.smoking) missing.push("Smoking Preference")
    } else if (currentStep === 3) {
      if (profileData.interests.length === 0) missing.push("At least one interest")
    } else if (currentStep === 4) {
      if (profileData.photos.length === 0) missing.push("At least one photo")
    }
    
    return missing
  }

  const isIslamicValuesSectionDisabled = () => {
    return (
      isSaving ||
      !profileData.religiosity ||
      !profileData.prayerFrequency ||
      (profileData.gender === "female" && !profileData.hijabPreference) ||
      !profileData.marriageIntention ||
      !profileData.isRevert ||
      !profileData.sect ||
      !profileData.islamicValues ||
      !profileData.familyInvolvement ||
      !profileData.alcohol ||
      !profileData.smoking ||
      !profileData.psychedelics
    )
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header - Same style as explore page */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Profile Setup</h1>
              <p className="text-sm text-slate-600 font-queensides">
                Step {currentStep} of {steps.length}
              </p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Progress Steps */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20 w-full">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (isSaving || isUploadingPhotos) return
                    setCurrentStep(step.id)
                  }}
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    currentStep === step.id
                      ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                      : currentStep > step.id
                        ? "bg-gradient-to-br from-green-400/20 to-emerald-400/20 border border-green-300/40"
                        : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    <step.icon className="w-6 h-6 mx-auto" />
                  </div>
                  <div className="text-xs font-queensides font-bold text-slate-700 leading-tight">
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
          {sectionSaveError && (
            <p className="mb-4 text-sm text-red-700 font-queensides bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {sectionSaveError}
            </p>
          )}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-white/90 to-indigo-50/80 border-indigo-200/50 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-2">
                      Basic Information
                    </h2>
                    <p className="text-slate-600 font-queensides">Tell us about yourself</p>
                  </div>

                  {/* Validation Error Message */}
                  {showValidationErrors && currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-queensides font-bold text-red-800 mb-2">Please complete these required fields:</h4>
                          <ul className="space-y-1">
                            {getMissingFields().map((field, idx) => (
                              <li key={idx} className="text-sm text-red-700 font-queensides flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                {field}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Single Column Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleBasicInfoChange("firstName", e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleBasicInfoChange("lastName", e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Age
                      </label>
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleBasicInfoChange("age", e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="Enter your age"
                        min="18"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profileData.dob}
                        onChange={(e) => handleBasicInfoChange("dob", e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="Enter your date of birth"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <Ruler className="w-4 h-4 inline mr-2" />
                        Height
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={profileData.heightFeet || ""}
                          onChange={(e) => {
                            const feet = e.target.value
                            const inches = profileData.heightInches || "0"
                            const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0)
                            const cm = Math.round(totalInches * 2.54)
                            handleBasicInfoChange("heightFeet", feet)
                            handleBasicInfoChange("heightInches", inches)
                            handleBasicInfoChange("height", cm.toString())
                          }}
                          className="w-1/2 px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                          placeholder="Feet"
                          min="3"
                          max="8"
                        />
                        <input
                          type="number"
                          value={profileData.heightInches || ""}
                          onChange={(e) => {
                            const inches = e.target.value
                            const feet = profileData.heightFeet || "0"
                            const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0)
                            const cm = Math.round(totalInches * 2.54)
                            handleBasicInfoChange("heightFeet", feet)
                            handleBasicInfoChange("heightInches", inches)
                            handleBasicInfoChange("height", cm.toString())
                          }}
                          className="w-1/2 px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                          placeholder="Inches"
                          min="0"
                          max="11"
                        />
                      </div>
                      {profileData.height && (
                        <p className="text-xs text-slate-500 font-queensides mt-1">
                          {profileData.heightFeet || 0}'{profileData.heightInches || 0}" = {profileData.height} cm
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <Globe className="w-4 h-4 inline mr-2" />
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={profileData.nationalitySearch || profileData.nationality}
                        onChange={(e) => {
                          const value = e.target.value
                          handleBasicInfoChange("nationalitySearch", value)
                          handleBasicInfoChange("nationality", value)
                          
                          // Show suggestions when user types
                          if (value.length > 0) {
                            const filtered = countries.filter(country => 
                              country.toLowerCase().includes(value.toLowerCase())
                            ).slice(0, 8)
                            handleBasicInfoChange("nationalitySuggestions" as any, filtered)
                          } else {
                            handleBasicInfoChange("nationalitySuggestions" as any, [] as string[])
                          }
                        }}
                        onFocus={() => {
                          // Show all countries when focused if empty
                          if (!profileData.nationality || profileData.nationality.length === 0) {
                            handleBasicInfoChange("nationalitySuggestions" as any, countries.slice(0, 8))
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="Search your nationality..."
                        autoComplete="off"
                      />
                      
                      {/* Autocomplete Dropdown */}
                      {profileData.nationalitySuggestions && profileData.nationalitySuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-indigo-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                          {profileData.nationalitySuggestions.map((country, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                handleBasicInfoChange("nationality", country)
                                handleBasicInfoChange("nationalitySearch", country)
                                handleBasicInfoChange("nationalitySuggestions" as any, [] as string[])
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors font-queensides text-sm text-slate-700 border-b border-indigo-100 last:border-b-0"
                            >
                              <Globe className="w-3.5 h-3.5 inline mr-2 text-indigo-500" />
                              {country}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={profileData.location}
                          readOnly
                          className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none font-queensides"
                          placeholder="Set location from map or GPS"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="font-queensides"
                            onClick={() => setIsLocationModalOpen(true)}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Pick on Map
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="font-queensides"
                            onClick={useCurrentLocation}
                            disabled={isResolvingLocation}
                          >
                            {isResolvingLocation ? "Locating..." : "Update Location"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="education" className="font-queensides text-black">
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
                      <Label htmlFor="profession" className="font-queensides text-black">
                        Profession
                      </Label>
                      <Input
                        id="profession"
                        value={profileData.profession}
                        onChange={(e) => updateProfileData("profession", e.target.value)}
                        className="mt-1"
                        placeholder={"Your profession or field of work"}
                      />
                    </div>

                    {/* Marital Status */}
                    <div>
                      <Label className="font-queensides text-black">Status</Label>
                      <RadioGroup
                        value={profileData.maritalStatus || ""}
                        onValueChange={(value) => updateProfileData("maritalStatus", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="single" id="status-single" />
                          <Label htmlFor="status-single" className="font-queensides text-black">
                            Single
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="divorced" id="status-divorced" />
                          <Label htmlFor="status-divorced" className="font-queensides text-black">
                            Divorced
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="married" id="status-married" />
                          <Label htmlFor="status-married" className="font-queensides text-black">
                            Married Before
                          </Label>
                        </div>
                        {profileData.gender === "male" && (
                          <>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="seeking_2nd_wife" id="status-2nd-wife" />
                              <Label htmlFor="status-2nd-wife" className="font-queensides text-black">
                                Seeking 2nd wife
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="seeking_3rd_wife" id="status-3rd-wife" />
                              <Label htmlFor="status-3rd-wife" className="font-queensides text-black">
                                Seeking 3rd wife
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="seeking_4th_wife" id="status-4th-wife" />
                              <Label htmlFor="status-4th-wife" className="font-queensides text-black">
                                Seeking 4th wife
                              </Label>
                            </div>
                          </>
                        )}
                      </RadioGroup>
                    </div>

                    {/* Willing to Relocate */}
                    <div>
                      <Label className="font-queensides text-black">Willing to Relocate</Label>
                      <RadioGroup
                        value={profileData.willingToRelocate || ""}
                        onValueChange={(value) => updateProfileData("willingToRelocate", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="relocate-yes" />
                          <Label htmlFor="relocate-yes" className="font-queensides text-black">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="relocate-no" />
                          <Label htmlFor="relocate-no" className="font-queensides text-black">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Languages - Multi-select */}
                    <div>
                      <Label className="font-queensides text-black">Languages</Label>
                      
                      {/* Selected Languages Pills */}
                      {(profileData.languages || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                          {(profileData.languages || []).map((lang) => (
                            <div
                              key={lang}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl text-sm font-queensides border border-blue-200/60"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              {lang}
                              <button
                                onClick={() => removeLanguage(lang)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Language Search Input */}
                      <div className="relative">
                        <Input
                          value={languageSearch}
                          onChange={(e) => handleLanguageSearch(e.target.value)}
                          onFocus={() => {
                            if (languageSearch.trim().length > 0 && languageSuggestions.length > 0) {
                              setShowLanguageDropdown(true)
                            }
                          }}
                          placeholder="Search and add languages (e.g., Arabic, English, French)"
                          className="mt-1"
                        />
                        
                        {/* Language Suggestions Dropdown */}
                        {showLanguageDropdown && languageSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {languageSuggestions.map((lang) => (
                              <button
                                key={lang}
                                onClick={() => addLanguage(lang)}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors font-queensides text-sm flex items-center justify-between"
                              >
                                <span>{lang}</span>
                                <span className="text-xs text-blue-500">Click to add</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {(profileData.languages || []).length === 0 && (
                        <p className="text-xs text-slate-500 mt-2 font-queensides">
                          Add languages you speak or prefer
                        </p>
                      )}
                    </div>

                    {/* Mahr Max Amount (for males) */}
                    {profileData.gender === "male" && (
                      <div>
                        <Label htmlFor="mahrMaxAmount" className="font-queensides text-black">
                          Mahr Max Amount
                        </Label>
                        <Input
                          id="mahrMaxAmount"
                          type="number"
                          value={profileData.mahrMaxAmount || ""}
                          onChange={(e) => updateProfileData("mahrMaxAmount", e.target.value)}
                          className="mt-1"
                          placeholder="Enter maximum mahr amount"
                          min="0"
                        />
                      </div>
                    )}

                    {/* Mahr Requirement (for females) */}
                    {profileData.gender === "female" && (
                      <div>
                        <Label htmlFor="mahrRequirement" className="font-queensides text-black">
                          Mahr Requirement
                        </Label>
                        <Input
                          id="mahrRequirement"
                          type="number"
                          value={profileData.mahrRequirement || ""}
                          onChange={(e) => updateProfileData("mahrRequirement", e.target.value)}
                          className="mt-1"
                          placeholder="Enter mahr requirement"
                          min="0"
                        />
                      </div>
                    )}

                    {/* Work Preference (for females) */}
                    {profileData.gender === "female" && (
                      <div>
                        <Label className="font-queensides text-black">Work Preference</Label>
                        <RadioGroup
                          value={profileData.workPreference || ""}
                          onValueChange={(value) => updateProfileData("workPreference", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="home_maker" id="work-home" />
                            <Label htmlFor="work-home" className="font-queensides text-black">
                              Home Maker
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self_employed" id="work-self" />
                            <Label htmlFor="work-self" className="font-queensides text-black">
                              Self Employed
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="career" id="work-career" />
                            <Label htmlFor="work-career" className="font-queensides text-black">
                              Career
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Style Preference (for females) */}
                    {profileData.gender === "female" && (
                      <div>
                        <Label className="font-queensides text-black">Style</Label>
                        <RadioGroup
                          value={profileData.stylePreference || ""}
                          onValueChange={(value) => updateProfileData("stylePreference", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="traditional" id="style-traditional" />
                            <Label htmlFor="style-traditional" className="font-queensides text-black">
                              Traditional
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="modern" id="style-modern" />
                            <Label htmlFor="style-modern" className="font-queensides text-black">
                              Modern
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="feminist" id="style-feminist" />
                            <Label htmlFor="style-feminist" className="font-queensides text-black">
                              Feminist
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Living Arrangements */}
                    <div>
                      <Label className="font-queensides text-black">Living Situation</Label>
                      <RadioGroup
                        value={profileData.livingArrangements || ""}
                        onValueChange={(value) => updateProfileData("livingArrangements", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="alone" id="living-alone" />
                          <Label htmlFor="living-alone" className="font-queensides text-black">
                            Alone
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="with_family" id="living-family" />
                          <Label htmlFor="living-family" className="font-queensides text-black">
                            With family
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="with_roommates" id="living-roommates" />
                          <Label htmlFor="living-roommates" className="font-queensides text-black">
                            With roommates
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* UI Kit Styled Section Divider - Lifestyle */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent" />
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-2 rounded-full border border-emerald-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            <span className="font-queensides font-semibold text-emerald-800">Lifestyle Preferences</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Finance Style */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                        <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Finance Style
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'thrift', label: 'Thrift Store', emoji: '🏷️' },
                          { value: 'luxury', label: 'Luxury Shopper', emoji: '💎' },
                          { value: 'responsible', label: 'Responsible $$', emoji: '💰' },
                          { value: 'saver', label: 'Saver', emoji: '🏦' },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateProfileData('financeStyle', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                              profileData.financeStyle === option.value
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-md'
                                : 'bg-white border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <span className="text-2xl">{option.emoji}</span>
                            <span className="font-queensides text-sm font-medium text-slate-700">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Dining Frequency */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                        <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.997 2.997 0 00-.454 1.5c0 .828.672 1.5 1.5 1.5h3a1.5 1.5 0 001.5-1.5c0-.828-.672-1.5-1.5-1.5a2.997 2.997 0 00-.454-1.5 2.997 2.997 0 00-1.5-.454zM3 15.546c-.523 0-1.046.151-1.5.454a2.997 2.997 0 00-.454 1.5c0 .828.672 1.5 1.5 1.5h3a1.5 1.5 0 001.5-1.5c0-.828-.672-1.5-1.5-1.5a2.997 2.997 0 00-.454-1.5 2.997 2.997 0 00-1.5-.454zM12 3v12" />
                        </svg>
                        Fine Dining Frequency
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'rarely', label: 'Rarely', emoji: '🏠' },
                          { value: 'monthly', label: 'Monthly', emoji: '🍽️' },
                          { value: 'weekly', label: 'Weekly', emoji: '🥂' },
                          { value: 'multiple_times_week', label: 'Multiple times a week', emoji: '✨' },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateProfileData('diningFrequency', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                              profileData.diningFrequency === option.value
                                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 shadow-md'
                                : 'bg-white border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <span className="text-2xl">{option.emoji}</span>
                            <span className="font-queensides text-sm font-medium text-slate-700">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Travel Frequency */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Travel Frequency
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'weekly', label: 'Weekly', emoji: '✈️' },
                          { value: 'monthly', label: 'Monthly', emoji: '🌍' },
                          { value: 'frequently', label: 'Frequently', emoji: '🗺️' },
                          { value: 'rarely', label: 'Rarely', emoji: '🏡' },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateProfileData('travelFrequency', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                              profileData.travelFrequency === option.value
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md'
                                : 'bg-white border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <span className="text-2xl">{option.emoji}</span>
                            <span className="font-queensides text-sm font-medium text-slate-700">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    {/* Shopping Frequency */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                        <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2.293 2.293c-.63.63-.184 1.707.707 1.707H18a2 2 0 002-2v-6a2 2 0 00-2-2h-5.293c-.495 0-.964.14-1.38.415l-2.293 2.293a1 1 0 101.414 1.414l2.293-2.293a1 1 0 00-1.414-1.414z" />
                        </svg>
                        Shopping Frequency
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'weekly', label: 'Weekly', emoji: '🛍️' },
                          { value: 'monthly', label: 'Monthly', emoji: '🛍️' },
                          { value: 'frequently', label: 'Frequently', emoji: '🛍️' },
                          { value: 'rarely', label: 'Rarely', emoji: '🛍️' },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateProfileData('shoppingFrequency', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                              profileData.shoppingFrequency === option.value
                                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-md'
                                : 'bg-white border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            <span className="text-2xl">{option.emoji}</span>
                            <span className="font-queensides text-sm font-medium text-slate-700">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Shopping Budget - Type + Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                        Shopping Budget
                      </label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'less_than', label: 'Less than' },
                            { value: 'greater_than', label: 'Greater than' },
                          ].map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateProfileData('shoppingBudgetType', option.value)}
                              className={`p-3 rounded-xl border-2 transition-all duration-300 font-queensides text-sm font-medium ${
                                profileData.shoppingBudgetType === option.value
                                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-md'
                                  : 'bg-white border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                        {profileData.shoppingBudgetType && profileData.shoppingBudgetType !== 'no_preference' && (
                          <Input
                            type="number"
                            value={profileData.shoppingBudgetAmount || ""}
                            onChange={(e) => updateProfileData('shoppingBudgetAmount', e.target.value)}
                            placeholder="Amount"
                            min="0"
                            step="50"
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                    {/*Self Care Frequency */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                        <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.313 0a8.24 8.24 0 01+8 8V16.382A8.255 8.255 0 0121 15.313M4 4a8.25 8.25 0 008 8v.582M4 4a8.25 8.25 0 01+8-8V4M4 4a8.25 8.25 0 01+8 8h.582M4 4a8.25 8.25 0 008-8H4z" />
                        </svg>
                        Self Care Frequency
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'daily', label: 'Daily', emoji: '🌸' },
                          { value: 'weekly', label: 'Weekly', emoji: '🌸' },
                          { value: 'monthly', label: 'Monthly', emoji: '🌸' },
                          { value: 'rarely', label: 'Rarely', emoji: '🌸' },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateProfileData('selfCareFrequency', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                              profileData.selfCareFrequency === option.value
                                ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 shadow-md'
                                : 'bg-white border-slate-200 hover:border-pink-300'
                            }`}
                          >
                            <span className="text-2xl">{option.emoji}</span>
                            <span className="font-queensides text-sm font-medium text-slate-700">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    {/* Self Care Budget - Type + Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                        Self Care Budget
                      </label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'less_than', label: 'Less than' },
                            { value: 'greater_than', label: 'Greater than' },
                          ].map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateProfileData('selfCareBudgetType', option.value)}
                              className={`p-3 rounded-xl border-2 transition-all duration-300 font-queensides text-sm font-medium ${
                                profileData.selfCareBudgetType === option.value
                                  ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 shadow-md'
                                  : 'bg-white border-slate-200 hover:border-pink-300'
                              }`}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                        {profileData.selfCareBudgetType && profileData.selfCareBudgetType !== 'no_preference' && (
                          <Input
                            type="number"
                            value={profileData.selfCareBudgetAmount || ""}
                            onChange={(e) => updateProfileData('selfCareBudgetAmount', e.target.value)}
                            placeholder="Amount"
                            min="0"
                            step="25"
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>

                    {/* Female Only - Beauty Style */}
                    {profileData.gender === 'female' && (
                      <>
                        {/* UI Kit Styled Section Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                          </div>
                          <div className="relative flex justify-center">
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-2 rounded-full border border-pink-200 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <span className="font-queensides font-semibold text-pink-800">Beauty</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                            Hair Style
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'natural', label: 'Natural', emoji: '🌿' },
                              { value: 'wigs_weaves', label: 'Wigs/Weaves', emoji: '💇' },
                            ].map((option) => (
                              <motion.button
                                key={option.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => updateProfileData('hairStyle', option.value)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                                  profileData.hairStyle === option.value
                                    ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 shadow-md'
                                    : 'bg-white border-slate-200 hover:border-pink-300'
                                }`}
                              >
                                <span className="text-2xl">{option.emoji}</span>
                                <span className="font-queensides text-sm font-medium text-slate-700">{option.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                            Make Up Style
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'natural', label: 'Natural', emoji: '🌿' },
                              { value: 'traditional', label: 'Traditional', emoji: '👑' },
                              { value: 'modern', label: 'Modern', emoji: '💎' },
                              { value: 'girly', label: 'Girly', emoji: 'Vintage' },
                            ].map((option) => (
                              <motion.button
                                key={option.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => updateProfileData('makeUpStyle', option.value)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                                  profileData.makeUpStyle === option.value
                                    ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 shadow-md'
                                    : 'bg-white border-slate-200 hover:border-pink-300'
                                }`}
                              >
                                <span className="text-2xl">{option.emoji}</span>
                                <span className="font-queensides text-sm font-medium text-slate-700">{option.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Male Only - Polygamy Reason */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
                          </div>
                          <div className="relative flex justify-center">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-2 rounded-full border border-indigo-200 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                                  <Heart className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-queensides font-semibold text-indigo-800">Polygamy Approach</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          {profileData.gender === "male" && (
                          <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                            If you want more than 1 wife, why?
                          </label>
                          )}
                          {profileData.gender === "female" && (
                          <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                            Why or why not polygamy?
                          </label>
                          )}

                          <textarea
                            value={profileData.polygamyReason || ''}
                            onChange={(e) => updateProfileData('polygamyReason', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides resize-none"
                            placeholder="Share your thoughts on polygamy (optional)..."
                          />
                        </div>

                    {/* UI Kit Styled Section Divider - Bio */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-2 rounded-full border border-violet-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <span className="font-queensides font-semibold text-violet-800">Your Story</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleBasicInfoChange("bio", e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides resize-none"
                        placeholder="Tell us about yourself, your interests, and what you're looking for... (minimum 300 characters)"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-sm font-queensides ${profileData.bio.length >= 300 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {profileData.bio.length}/300 characters {profileData.bio.length >= 300 ? '✓' : '(minimum required)'}
                        </p>
                        {profileData.bio.length >= 300 && (
                          <button
                            type="button"
                            onClick={() => router.push(`/profile/bio?userId=${userId}`)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-queensides text-sm rounded-xl hover:shadow-lg transition-all"
                          >
                            Rate My Bio ✨
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="px-6 py-3 font-queensides"
                      disabled={isSaving}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 font-queensides"
                      disabled={
                        isSaving ||
                        !profileData.firstName ||
                        !profileData.age ||
                        !profileData.location ||
                        !profileData.education ||
                        !profileData.profession ||
                        !profileData.maritalStatus ||
                        !profileData.willingToRelocate ||
                        !profileData.livingArrangements ||
                        (profileData.gender === "male" && !profileData.mahrMaxAmount) ||
                        (profileData.gender === "female" && (!profileData.mahrRequirement || !profileData.workPreference || !profileData.stylePreference))
                      }
                    >
                      {getButtonText()}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Placeholder for other steps */}

            {currentStep === 2 && (
              <motion.div
                key="islamic-values"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-qurova">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                      Islamic Values
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Validation Error Message */}
                    {showValidationErrors && currentStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-queensides font-bold text-red-800 mb-2">Please complete these required fields:</h4>
                            <ul className="space-y-1">
                              {getMissingFields().map((field, idx) => (
                                <li key={idx} className="text-sm text-red-700 font-queensides flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                  {field}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div>
                      <Label className="font-queensides text-black">Level of Religiosity</Label>
                      <RadioGroup
                        value={profileData.religiosity}
                        onValueChange={(value) => updateProfileData("religiosity", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="practicing" id="practicing" />
                          <Label htmlFor="practicing" className="font-queensides text-black">
                            Practicing
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="moderate" id="moderate" />
                          <Label htmlFor="moderate" className="font-queensides text-black">
                            Moderate
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="learning" id="learning" />
                          <Label htmlFor="learning" className="font-queensides text-black">
                            Learning
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="font-queensides text-black">Prayer Frequency</Label>
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
                        <Label className="font-queensides text-black">Hijab Preference</Label>
                        <RadioGroup
                          value={profileData.hijabPreference}
                          onValueChange={(value) => updateProfileData("hijabPreference", value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="always" id="always" />
                            <Label htmlFor="always" className="font-queensides text-black">
                              Always wear hijab
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sometimes" id="sometimes-hijab" />
                            <Label htmlFor="sometimes-hijab" className="font-queensides text-black">
                              Sometimes
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="planning" id="planning" />
                            <Label htmlFor="planning" className="font-queensides text-black">
                              Planning to wear
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no-hijab" />
                            <Label htmlFor="no-hijab" className="font-queensides text-black">
                              Do not wear
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    <div>
                      <Label className="font-queensides text-black">Marriage Plans</Label>
                      <RadioGroup
                        value={profileData.marriageIntention}
                        onValueChange={(value) => updateProfileData("marriageIntention", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1-4_months" id="marriage-1-4" />
                          <Label htmlFor="marriage-1-4" className="font-queensides text-black">
                            1-4 months
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4-12_months" id="marriage-4-12" />
                          <Label htmlFor="marriage-4-12" className="font-queensides text-black">
                            4-12 months
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1-2_years" id="marriage-1-2y" />
                          <Label htmlFor="marriage-1-2y" className="font-queensides text-black">
                            1 - 2 years
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="agree_together" id="marriage-agree" />
                          <Label htmlFor="marriage-agree" className="font-queensides text-black">
                            Agree together
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="font-queensides text-black">
                        Are you a revert to Islam?
                      </Label>
                      <RadioGroup
                        value={profileData.isRevert}
                        onValueChange={(value) => updateProfileData("isRevert", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="revert-yes" />
                          <Label htmlFor="revert-yes" className="font-queensides text-black">
                            Yes, I'm a revert
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="revert-no" />
                          <Label htmlFor="revert-no" className="font-queensides text-black">
                            No, born Muslim
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Sect */}
                    <div>
                      <Label className="font-queensides text-black">Sect</Label>
                      <RadioGroup
                        value={profileData.sect || ""}
                        onValueChange={(value) => updateProfileData("sect", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sunni" id="sect-sunni" />
                          <Label htmlFor="sect-sunni" className="font-queensides text-black">
                            Sunni
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Shia" id="sect-shia" />
                          <Label htmlFor="sect-shia" className="font-queensides text-black">
                            Shia
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Other" id="sect-other" />
                          <Label htmlFor="sect-other" className="font-queensides text-black">
                            Other
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Islamic Values */}
                    <div>
                      <Label className="font-queensides text-black">Islamic Values</Label>
                      <RadioGroup
                        value={profileData.islamicValues || ""}
                        onValueChange={(value) => updateProfileData("islamicValues", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="traditional" id="values-traditional" />
                          <Label
                            htmlFor="values-traditional"
                            className="font-queensides text-black"
                          >
                            Traditional
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="balanced" id="values-balanced" />
                          <Label htmlFor="values-balanced" className="font-queensides text-black">
                            Balanced
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="modern" id="values-modern" />
                          <Label htmlFor="values-modern" className="font-queensides text-black">
                            Modern
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Family Involvement */}
                    <div>
                      <Label className="font-queensides text-black">Family Involvement</Label>
                      <RadioGroup
                        value={profileData.familyInvolvement || ""}
                        onValueChange={(value) => updateProfileData("familyInvolvement", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="involved" id="family-involved" />
                          <Label htmlFor="family-involved" className="font-queensides text-black">
                            Involved
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="somewhat" id="family-somewhat" />
                          <Label htmlFor="family-somewhat" className="font-queensides text-black">
                            Somewhat involved
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="minimal" id="family-minimal" />
                          <Label htmlFor="family-minimal" className="font-queensides text-black">
                            Minimal
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="font-queensides text-black">Alcohol</Label>
                      <RadioGroup
                        value={profileData.alcohol}
                        onValueChange={(value) => updateProfileData("alcohol", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="never" id="alcohol-never" />
                          <Label htmlFor="alcohol-never" className="font-queensides text-black">
                            Never
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="socially" id="alcohol-socially" />
                          <Label htmlFor="alcohol-socially" className="font-queensides text-black">
                            Socially
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="regularly" id="alcohol-regularly" />
                          <Label htmlFor="alcohol-regularly" className="font-queensides text-black">
                            Regularly
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="font-queensides text-black">Smoking</Label>
                      <RadioGroup
                        value={profileData.smoking}
                        onValueChange={(value) => updateProfileData("smoking", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="never" id="smoking-never" />
                          <Label htmlFor="smoking-never" className="font-queensides text-black">
                            Never
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="occasionally" id="smoking-occasionally" />
                          <Label
                            htmlFor="smoking-occasionally"
                            className="font-queensides text-black"
                          >
                            Occasionally
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="regularly" id="smoking-regularly" />
                          <Label htmlFor="smoking-regularly" className="font-queensides text-black">
                            Regularly
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="font-queensides text-black">Psychedelics</Label>
                      <RadioGroup
                        value={profileData.psychedelics}
                        onValueChange={(value) => {
                          setProfileData((prev) => ({
                            ...prev,
                            psychedelics: value,
                            psychedelicsTypes:
                              value === "never" ? [] : prev.psychedelicsTypes || [],
                          }))
                        }}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="never" id="psychedelics-never" />
                          <Label
                            htmlFor="psychedelics-never"
                            className="font-queensides text-black"
                          >
                            Never
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="occasionally" id="psychedelics-occasionally" />
                          <Label
                            htmlFor="psychedelics-occasionally"
                            className="font-queensides text-black"
                          >
                            Occasionally
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="regularly" id="psychedelics-regularly" />
                          <Label
                            htmlFor="psychedelics-regularly"
                            className="font-queensides text-black"
                          >
                            Regularly
                          </Label>
                        </div>
                      </RadioGroup>
                      {profileData.psychedelics && profileData.psychedelics !== "never" && (
                        <div className="mt-3 space-y-2">
                          <Label className="font-queensides text-black">Psychedelic Types</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: "mushroom", label: "Mushroom" },
                              { key: "cannabis", label: "Cannabis" },
                              { key: "other", label: "Other" },
                            ].map((opt) => (
                              <div
                                key={opt.key}
                                className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200"
                              >
                                <Checkbox
                                  id={`psy-${opt.key}`}
                                  checked={(profileData.psychedelicsTypes || []).includes(opt.key)}
                                  onCheckedChange={(checked) => {
                                    const current = profileData.psychedelicsTypes || []
                                    if (checked) {
                                      updateProfileData("psychedelicsTypes", [...current, opt.key])
                                    } else {
                                      updateProfileData(
                                        "psychedelicsTypes",
                                        current.filter((k) => k !== opt.key)
                                      )
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor={`psy-${opt.key}`}
                                  className="font-queensides text-black cursor-pointer flex-1"
                                >
                                  {opt.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="font-queensides text-black">Halal Food</Label>
                      <RadioGroup
                        value={profileData.halalFood}
                        onValueChange={(value) => updateProfileData("halalFood", value)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="always" id="halal-always" />
                          <Label htmlFor="halal-always" className="font-queensides text-black">
                            Always halal
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mostly" id="halal-mostly" />
                          <Label htmlFor="halal-mostly" className="font-queensides text-black">
                            Mostly halal
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sometimes" id="halal-sometimes" />
                          <Label htmlFor="halal-sometimes" className="font-queensides text-black">
                            Sometimes
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        className="px-6 py-3 font-queensides"
                        disabled={isSaving}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 font-queensides"
                        disabled={isIslamicValuesSectionDisabled()}
                      >
                        {getButtonText()}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="interests-hobbies"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-qurova">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      Interests & Hobbies
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Validation Error Message */}
                    {showValidationErrors && currentStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-5"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-queensides font-bold text-red-800 mb-2">Please complete these required fields:</h4>
                            <ul className="space-y-1">
                              {getMissingFields().map((field, idx) => (
                                <li key={idx} className="text-sm text-red-700 font-queensides flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                                  {field}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div>
                      <Label className="font-queensides text-black text-lg mb-4 block">
                        Select Your Interests & Hobbies
                      </Label>
                      <p className="text-slate-600 font-queensides text-sm mb-4">
                        Choose interests that represent you and add your own. This helps us find
                        compatible matches who share your passions.
                      </p>

                      {/* Predefined Interests */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {interests.map((interest) => (
                          <div
                            key={interest}
                            className="flex items-center   space-x-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                          >
                            <Checkbox
                              id={interest}
                              checked={profileData.interests.includes(interest)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateProfileData("interests", [
                                    ...profileData.interests,
                                    interest,
                                  ])
                                } else {
                                  updateProfileData(
                                    "interests",
                                    profileData.interests.filter((i) => i !== interest)
                                  )
                                }
                              }}
                            />
                            <Label
                              htmlFor={interest}
                              className="font-queensides text-black cursor-pointer flex-1"
                            >
                              {interest}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {/* Custom Interests Display */}
                      {profileData.customInterests && profileData.customInterests.length > 0 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                            <h4 className="font-semibold text-slate-800 font-qurova">
                              Your Custom Interests
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {profileData.customInterests.map((interest, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-emerald-200 shadow-sm"
                              >
                                <span className="text-sm font-queensides text-slate-700">{interest}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (profileData.customInterests || []).filter((_, i) => i !== index)
                                    updateProfileData("customInterests", updated)
                                  }}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Custom Interests */}
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">+</span>
                          </div>
                          <h4 className="font-semibold text-slate-800 font-qurova">
                            Add Your Own Interests
                          </h4>
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Type your interests separated by commas (e.g., hiking, cooking, reading)"
                            className="w-full bg-white/80 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 font-queensides"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const input = e.target as HTMLInputElement
                                const newInterests = input.value
                                  .split(",")
                                  .map((interest) => interest.trim())
                                  .filter(
                                    (interest) =>
                                      interest && 
                                      !profileData.interests.includes(interest) &&
                                      !profileData.customInterests?.includes(interest)
                                  )

                                if (newInterests.length > 0) {
                                  updateProfileData("customInterests", [
                                    ...(profileData.customInterests || []),
                                    ...newInterests,
                                  ])
                                  input.value = ""
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
                                const input = (
                                  e.target as HTMLElement
                                ).parentElement?.parentElement?.querySelector(
                                  "input"
                                ) as HTMLInputElement
                                const newInterests = input?.value
                                  .split(",")
                                  .map((interest) => interest.trim())
                                  .filter(
                                    (interest) =>
                                      interest && 
                                      !profileData.interests.includes(interest) &&
                                      !profileData.customInterests?.includes(interest)
                                  )

                                if (newInterests && newInterests.length > 0) {
                                  updateProfileData("customInterests", [
                                    ...(profileData.customInterests || []),
                                    ...newInterests,
                                  ])
                                  input.value = ""
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

                      {/* Personality Traits */}
                      <div className="space-y-3">
                        <Label className="font-queensides text-black text-lg mb-2 block">
                          Personality
                        </Label>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          {personalityTraits.map((trait) => (
                            <div
                              key={trait}
                              className="flex items-center   space-x-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                            >
                              <Checkbox
                                id={`trait-${trait}`}
                                checked={(profileData.personality || []).includes(trait)}
                                onCheckedChange={(checked) => {
                                  const current = profileData.personality || []
                                  if (checked) {
                                    updateProfileData("personality", [...current, trait])
                                  } else {
                                    updateProfileData(
                                      "personality",
                                      current.filter((t) => t !== trait)
                                    )
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`trait-${trait}`}
                                className="font-queensides text-black cursor-pointer flex-1"
                              >
                                {trait}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Feedback */}
                      {profileData.interests.length > 0 && (
                        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <p className="text-indigo-700 font-queensides text-sm">
                            <strong>{profileData.interests.length}</strong> interests selected.
                            Great! This helps us find better matches for you.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        className="px-6 py-3 font-queensides"
                        disabled={isSaving}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 font-queensides"
                        disabled={isSaving || profileData.interests.length === 0}
                      >
                        {getButtonText()}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="photos-media"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Important Notice */}
                <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-qurova text-lg font-bold text-amber-900 mb-3">Best Photos & Video Guidelines</h3>
                      <ul className="space-y-2 font-queensides text-sm text-amber-800">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold mt-0.5">✕</span>
                          <span><strong>No filters</strong> - Use natural, unedited photos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold mt-0.5">✕</span>
                          <span><strong>DO NOT upload pictures with children</strong> - Only photos of you</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold mt-0.5">✕</span>
                          <span><strong>Plain clothes only</strong> - No polka dots, no patterns, no busy designs</span>
                        </li>
                        <li className="flex items-start gap-2 mt-3 pt-3 border-t border-amber-300">
                          <span className="text-green-600 font-bold mt-0.5">✓</span>
                          <span className="text-green-700"><strong>Photos are accessible on this app only</strong> - Not made public to the web</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Card className="bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-qurova">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      Photos & Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Photo Upload Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label className="font-queensides text-black text-lg">
                          Upload Photos (Up to 6)
                        </Label>
                        <span className={`text-sm font-queensides font-semibold ${uploadedUrls.additionalPhotos.length >= 6 ? 'text-red-600' : 'text-slate-600'}`}>
                          {uploadedUrls.additionalPhotos.length}/6
                        </span>
                      </div>
                      <p className="text-slate-600 font-queensides text-sm mb-4">
                        Swipe through your photos and tap "Set as Main" to choose your profile picture
                      </p>
                      
                      {/* Disable upload if limit reached */}
                      {uploadedUrls.additionalPhotos.length >= 6 ? (
                        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-center">
                          <p className="text-amber-800 font-queensides font-semibold">
                            Photo limit reached (6/6). Delete a photo to upload more.
                          </p>
                        </div>
                      ) : (
                        <FileUpload
                          accept="image/jpeg,image/png,image/webp"
                          maxSize={5 * 1024 * 1024} // 5MB
                          multiple={true}
                          onFileSelect={handleAdditionalPhotosUpload}
                          className="border-2 border-dashed border-indigo-300 hover:border-indigo-400 rounded-xl"
                        />
                      )}
                      
                      {/* Photo Slider */}
                      {uploadedUrls.additionalPhotos.length > 0 && (
                        <div className="mt-6">
                          <div className="relative bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl border border-indigo-200/50 p-6">
                            {/* Main Photo Display */}
                            <div className="relative aspect-square max-w-md mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                              <PhotoPreview 
                                bucket={STORAGE_CONFIG.BUCKETS.PROFILES} 
                                path={uploadedUrls.additionalPhotos[currentPhotoIndex]} 
                              />
                              
                              {/* Main Photo Badge */}
                              {currentPhotoIndex === mainPhotoIndex && (
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-400 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold font-queensides flex items-center gap-1.5 shadow-lg">
                                  <Star className="w-3.5 h-3.5" />
                                  Main Photo
                                </div>
                              )}
                              
                              {/* Delete Button */}
                              <button
                                onClick={() => removePhotoAt(currentPhotoIndex)}
                                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                title="Delete this photo"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              
                              {/* Photo Counter */}
                              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-queensides">
                                {currentPhotoIndex + 1} / {uploadedUrls.additionalPhotos.length}
                              </div>
                            </div>
                            
                            {/* Swipe Controls */}
                            <div className="flex items-center justify-between gap-4">
                              <button
                                onClick={() => setCurrentPhotoIndex(prev => 
                                  prev > 0 ? prev - 1 : uploadedUrls.additionalPhotos.length - 1
                                )}
                                className="p-3 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-lg group"
                                disabled={uploadedUrls.additionalPhotos.length <= 1}
                              >
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              
                              {/* Set as Main Button */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={async () => {
                                  if (currentPhotoIndex === mainPhotoIndex) return
                                  
                                  // Reorder array to put selected photo first
                                  const photos = [...uploadedUrls.additionalPhotos]
                                  const [selectedPhoto] = photos.splice(currentPhotoIndex, 1)
                                  const reordered = [selectedPhoto, ...photos]
                                  
                                  setUploadedUrls((prev) => ({
                                    ...prev,
                                    additionalPhotos: reordered,
                                  }))
                                  setMainPhotoIndex(0)
                                  setCurrentPhotoIndex(0)
                                  
                                  // Save to database immediately
                                  if (userId) {
                                    await ProfileService.updateProfileByUserId(userId, {
                                      additional_photos: reordered,
                                    } as any)
                                  }
                                }}
                                className={`flex-1 py-3 px-6 rounded-xl font-semibold font-queensides transition-all duration-300 flex items-center justify-center gap-2 ${
                                  currentPhotoIndex === mainPhotoIndex
                                    ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg'
                                    : 'bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 text-pink-600 border-2 border-pink-300 hover:border-pink-400'
                                }`}
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Main</span>
                              </motion.button>
                              
                              <button
                                onClick={() => setCurrentPhotoIndex(prev => 
                                  prev < uploadedUrls.additionalPhotos.length - 1 ? prev + 1 : 0
                                )}
                                className="p-3 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-lg group"
                                disabled={uploadedUrls.additionalPhotos.length <= 1}
                              >
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* UI Kit Styled Section Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-2 rounded-full border border-purple-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                              <Mic className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-queensides font-semibold text-purple-800">Voice Introduction</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audio Upload Section */}
                    <div>
                      <p className="text-slate-600 font-queensides text-sm mb-4 text-center">
                        Share a brief voice message to help others get to know you better. Optional
                      </p>
                      <FileUpload
                        accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
                        maxSize={10 * 1024 * 1024} // 10MB
                        onFileSelect={handleAudioUpload}
                        className="border-2 border-dashed border-purple-300 hover:border-purple-400 rounded-xl"
                      />
                      {uploadedUrls.voiceIntro && (
                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-queensides text-purple-700 font-semibold">Uploaded Audio:</p>
                            <button
                              onClick={handleDeleteAudio}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete audio"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <AudioPreview 
                            bucket={STORAGE_CONFIG.BUCKETS.VOICE_NOTES} 
                            path={uploadedUrls.voiceIntro} 
                          />
                        </div>
                      )}
                    </div>

                    {/* UI Kit Styled Section Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-2 rounded-full border border-blue-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-queensides font-semibold text-blue-800">Video Introduction</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Video Upload Section */}
                    <div>
                      <p className="text-slate-600 font-queensides text-sm mb-4 text-center">
                        Upload a short video introduction <br/>(max 60 seconds) optional
                      </p>
                      <FileUpload
                        accept="video/mp4,video/quicktime,video/webm,video/mov"
                        maxSize={50 * 1024 * 1024} // 50MB
                        onFileSelect={handleVideoUpload}
                        className="border-2 border-dashed border-blue-300 hover:border-blue-400 rounded-xl"
                      />
                      {uploadedUrls.videoIntro && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-queensides text-blue-700 font-semibold">Uploaded Video:</p>
                            <button
                              onClick={handleDeleteVideo}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              title="Delete video"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <VideoPreview 
                            bucket={STORAGE_CONFIG.BUCKETS.VIDEOS} 
                            path={uploadedUrls.videoIntro} 
                          />
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                      <Button
                        onClick={handleBack}
                        variant="outline"
                        className="px-6 py-3 font-queensides"
                        disabled={isSaving}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 font-queensides"
                        disabled={isSaving || profileData.photos.length === 0}
                      >
                        {getButtonText()}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      <div
        className={`fixed inset-0 z-50 backdrop-blur-sm items-center justify-center p-4 ${
          isLocationModalOpen ? "flex bg-black/50" : "hidden pointer-events-none"
        }`}
        aria-hidden={!isLocationModalOpen}
      >
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-indigo-200/50 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-indigo-100">
            <h3 className="text-lg font-bold text-slate-800 font-qurova">Select Your Location</h3>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(false)}
              className="text-slate-500 hover:text-slate-700 font-queensides"
            >
              Close
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-600 font-queensides">
              Click anywhere on the map to drop a pin, or drag the marker to refine.
            </p>
            <LeafletMap position={locationCoords} onPositionChange={handleMapPositionChange} />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                className="font-queensides"
                onClick={useCurrentLocation}
                disabled={isResolvingLocation}
              >
                {isResolvingLocation ? "Locating..." : "Use Current Location"}
              </Button>
              <Button
                type="button"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
                onClick={() => setIsLocationModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
