"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  Star,
  Shield,
  MessageCircle,
  Camera,
  Video,
  Mic,
  UserCircle,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  DollarSign,
  Utensils,
  Palette,
  Moon,
  Sparkles,
  User,
  PiggyBank,
  Settings,
  X,
  CheckCircle,
  Image,
  FileText,
  Volume2,
  Users,
  Send,
  Bitcoin,
  Wallet,
  Lock,
  Unlock,
  Copy,
  Crown,
  Edit,
  Loader2,
} from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/context/UserContext"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { ProfileService } from "@/lib/database"
import { getSignedUrlForPath, storagePathFromUrlOrPath, STORAGE_CONFIG, ProfileMediaService } from "@/lib/storage"
import { ArabicCard, ArabicCardContent, ArabicCardTitle, ArabicCardDescription } from "@/components/ui/arabic-card"
import { supabase } from "@/lib/supabase"

interface ProfileData {
  firstName: string
  lastName?: string
  age: string
  gender: string
  bio: string
  bioTagline?: string
  location?: string
  city?: string
  state?: string
  country?: string
  education?: string
  profession?: string
  religiosity?: string
  prayerFrequency?: string
  hijabPreference?: string
  marriageIntention?: string
  sect?: string
  islamicValues?: string
  isRevert?: string
  alcohol?: string
  smoking?: string
  psychedelics?: string
  psychedelicsTypes?: string[]
  halalFood?: string
  familyInvolvement?: string
  financeStyle?: string
  diningFrequency?: string
  travelFrequency?: string
  hairStyle?: string
  makeUpStyle?: string
  polygamyReason?: string
  selfCareFrequency?: string
  selfCareBudget?: string
  shoppingFrequency?: string
  shoppingBudgetType?: string
  shoppingBudgetAmount?: number
  livingArrangements?: string
  willingToRelocate?: string
  mahrMaxAmount?: string
  mahrRequirement?: string
  workPreference?: string
  stylePreference?: string
  maritalStatus?: string
  hasChildren?: string
  wantChildren?: string
  interests?: string[]
  personality?: string[]
  profile_photos?: string[]
  voiceIntro?: string
  videoIntro?: string
  profileRating?: number
  chatRating?: number
  responseRate?: number
  isVerified?: boolean
  createdAt?: string
  nationality?: string
  height?: string
  availableLeads?: number
  availableViews?: number
}

// ─── Profile Scoring Algorithm ───────────────────────────────────────────────

interface ScoreBreakdown {
  label: string
  icon: React.ReactNode
  points: number
  maxPoints: number
  detail: string
}

function calculateProfileScore(profile: ProfileData): { total: number; breakdown: ScoreBreakdown[] } {
  const breakdown: ScoreBreakdown[] = []

  // 1. Basic Info — 10 pts
  let basicPts = 0
  if (profile.firstName) basicPts += 2
  if (profile.age) basicPts += 2
  if (profile.gender) basicPts += 1
  if (profile.city || profile.location) basicPts += 2
  if (profile.nationality) basicPts += 2
  if (profile.height) basicPts += 1
  breakdown.push({ label: "Basic Info", icon: <User className="w-4 h-4" />, points: basicPts, maxPoints: 10, detail: `Name, age, gender, location, nationality, height` })

  // 2. Photos — 12 pts (1=3, 2=5, 3=7, 4=10, 5+=12)
  const photoCount = profile.profile_photos?.length ?? 0
  let photoPts = 0
  if (photoCount >= 5) photoPts = 12
  else if (photoCount === 4) photoPts = 10
  else if (photoCount === 3) photoPts = 7
  else if (photoCount === 2) photoPts = 5
  else if (photoCount === 1) photoPts = 3
  breakdown.push({ label: "Photos", icon: <Image className="w-4 h-4" />, points: photoPts, maxPoints: 12, detail: `${photoCount} photo${photoCount !== 1 ? "s" : ""} uploaded` })

  // 3. Video Intro — 8 pts
  const videoPts = profile.videoIntro ? 8 : 0
  breakdown.push({ label: "Video Intro", icon: <Video className="w-4 h-4" />, points: videoPts, maxPoints: 8, detail: videoPts > 0 ? "Video uploaded" : "No video yet" })

  // 4. Voice Intro — 7 pts
  const voicePts = profile.voiceIntro ? 7 : 0
  breakdown.push({ label: "Voice Intro", icon: <Volume2 className="w-4 h-4" />, points: voicePts, maxPoints: 7, detail: voicePts > 0 ? "Voice note uploaded" : "No voice note yet" })

  // 5. Bio — 10 pts (char count: 0=0, 1-50=2, 51-150=5, 151-300=8, 301+=10)
  const bioLen = (profile.bio || "").length
  let bioPts = 0
  if (bioLen >= 301) bioPts = 10
  else if (bioLen >= 151) bioPts = 8
  else if (bioLen >= 51) bioPts = 5
  else if (bioLen >= 1) bioPts = 2
  breakdown.push({ label: "Bio", icon: <FileText className="w-4 h-4" />, points: bioPts, maxPoints: 10, detail: `${bioLen} characters written` })

  // 6. Islamic Values — 14 pts (bonus for 5 daily prayers & religiosity depth)
  let islamicPts = 0
  if (profile.religiosity) {
    islamicPts += 2
    if (/very\s*practicing|practicing/i.test(profile.religiosity)) islamicPts += 1
  }
  if (profile.prayerFrequency) {
    islamicPts += 2
    // Bonus for 5 daily prayers
    if (/5\s*daily|five\s*daily|all\s*five|5\s*times|five\s*times/i.test(profile.prayerFrequency)) islamicPts += 3
  }
  if (profile.sect) islamicPts += 2
  if (profile.halalFood) islamicPts += 2
  if (profile.marriageIntention) islamicPts += 2
  islamicPts = Math.min(islamicPts, 14)
  const prayerDetail = /5\s*daily|five\s*daily|all\s*five|5\s*times|five\s*times/i.test(profile.prayerFrequency || "")
    ? "5 daily prayers (+3 bonus)"
    : "Religious preferences filled"
  breakdown.push({ label: "Islamic Values", icon: <Moon className="w-4 h-4" />, points: islamicPts, maxPoints: 14, detail: prayerDetail })

  // 7. Education & Career — 5 pts
  let eduPts = 0
  if (profile.education) eduPts += 2.5
  if (profile.profession) eduPts += 2.5
  breakdown.push({ label: "Education & Career", icon: <GraduationCap className="w-4 h-4" />, points: Math.round(eduPts), maxPoints: 5, detail: `Education & profession` })

  // 8. Psychedelics — 15 pts (highest-value category)
  let psychPts = 0
  const psychTypes = profile.psychedelicsTypes ?? []
  const hasMushrooms = psychTypes.some(t => /mushroom|psilocybin|shroom/i.test(t))
  if (profile.psychedelics) {
    psychPts += 3 // filled the preference at all
    if (psychTypes.length >= 3) psychPts += 4
    else if (psychTypes.length >= 2) psychPts += 3
    else if (psychTypes.length >= 1) psychPts += 2
    if (hasMushrooms) psychPts += 8 // mushrooms = biggest bonus
  }
  psychPts = Math.min(psychPts, 15)
  const psychDetail = hasMushrooms
    ? `Mushrooms selected (+8 bonus) · ${psychTypes.length} type${psychTypes.length !== 1 ? "s" : ""}`
    : psychTypes.length > 0
    ? `${psychTypes.length} type${psychTypes.length !== 1 ? "s" : ""} selected`
    : profile.psychedelics ? "Preference set, add types for more" : "Not filled"
  breakdown.push({ label: "Psychedelics", icon: <Sparkles className="w-4 h-4" />, points: psychPts, maxPoints: 15, detail: psychDetail })

  // 9. Finance & Style — 8 pts (thrift, responsible spending, natural hair, finance style)
  let finPts = 0
  if (profile.financeStyle) {
    finPts += 2
    if (/thrift|frugal|saver|budget/i.test(profile.financeStyle)) finPts += 2
    else if (/responsible|balanced|moderate/i.test(profile.financeStyle)) finPts += 1
  }
  if (profile.hairStyle) {
    finPts += 1
    if (/natural|no\s*product|minimal/i.test(profile.hairStyle)) finPts += 1
  }
  if (profile.shoppingFrequency) finPts += 1
  if (profile.selfCareBudget) finPts += 1
  finPts = Math.min(finPts, 8)
  const finDetail = /thrift|frugal|saver|budget/i.test(profile.financeStyle || "")
    ? "Thrifty spender (+2 bonus)"
    : /natural|no\s*product|minimal/i.test(profile.hairStyle || "")
    ? "Natural hair (+1 bonus)"
    : "Finance & style preferences"
  breakdown.push({ label: "Finance & Style", icon: <DollarSign className="w-4 h-4" />, points: finPts, maxPoints: 8, detail: finDetail })

  // 10. Lifestyle — 4 pts (smoking, alcohol, self-care — psychedelics & finance scored separately)
  let lifePts = 0
  const lifeFields = [profile.smoking, profile.alcohol, profile.selfCareFrequency, profile.selfCareBudget ? undefined : profile.shoppingFrequency].filter(Boolean)
  lifeFields.forEach(() => { lifePts += 1 })
  if (profile.smoking) lifePts = Math.max(lifePts, 1)
  if (profile.alcohol) lifePts = Math.max(lifePts, 1)
  lifePts = Math.min(lifePts + (profile.selfCareFrequency ? 1 : 0), 4)
  breakdown.push({ label: "Lifestyle", icon: <Palette className="w-4 h-4" />, points: Math.min(lifePts, 4), maxPoints: 4, detail: `Lifestyle preferences filled` })

  // 11. Family & Marriage — 4 pts
  let famPts = 0
  if (profile.maritalStatus) famPts += 1
  if (profile.hasChildren && profile.hasChildren !== "no") famPts += 1
  else if (profile.hasChildren === "no") famPts += 1
  if (profile.wantChildren) famPts += 1
  if (profile.livingArrangements) famPts += 1
  breakdown.push({ label: "Family & Marriage", icon: <Users className="w-4 h-4" />, points: Math.min(famPts, 4), maxPoints: 4, detail: `Family preferences filled` })

  // 12. Polygamy Preferences — 4 pts (char count)
  const polyLen = (profile.polygamyReason || "").length
  let polyPts = 0
  if (polyLen >= 151) polyPts = 4
  else if (polyLen >= 51) polyPts = 3
  else if (polyLen >= 1) polyPts = 2
  breakdown.push({ label: "Polygamy Preferences", icon: <Heart className="w-4 h-4" />, points: polyPts, maxPoints: 4, detail: polyLen > 0 ? `${polyLen} characters written` : "Not filled" })

  // 13. Interests & Personality — 7 pts
  let intPts = 0
  const interestCount = profile.interests?.length ?? 0
  const personalityCount = profile.personality?.length ?? 0
  if (interestCount >= 5) intPts += 3; else if (interestCount >= 3) intPts += 2; else if (interestCount >= 1) intPts += 1
  if (personalityCount >= 3) intPts += 4; else if (personalityCount >= 2) intPts += 3; else if (personalityCount >= 1) intPts += 1
  breakdown.push({ label: "Interests & Personality", icon: <Heart className="w-4 h-4" />, points: Math.min(intPts, 7), maxPoints: 7, detail: `${interestCount} interests, ${personalityCount} personality traits` })

  const total = breakdown.reduce((sum, b) => sum + b.points, 0)
  return { total: Math.min(total, 100), breakdown }
}

// ─── Profile Score Modal ─────────────────────────────────────────────────────

function ProfileScoreModal({ profile, isOpen, onClose, onScoreCalculated }: {
  profile: ProfileData
  isOpen: boolean
  onClose: () => void
  onScoreCalculated: (score: number) => void
}) {
  const [phase, setPhase] = useState<"scoring" | "results">("scoring")
  const [result, setResult] = useState<{ total: number; breakdown: ScoreBreakdown[] } | null>(null)
  const [revealedRows, setRevealedRows] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setPhase("scoring")
      setResult(null)
      setRevealedRows(0)
      return
    }
    // Start scoring animation
    const timer = setTimeout(() => {
      const r = calculateProfileScore(profile)
      setResult(r)
      setPhase("results")
      onScoreCalculated(r.total)
    }, 2200)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Stagger reveal rows
  useEffect(() => {
    if (phase !== "results" || !result) return
    if (revealedRows >= result.breakdown.length) return
    const t = setTimeout(() => setRevealedRows(prev => prev + 1), 120)
    return () => clearTimeout(t)
  }, [phase, revealedRows, result])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto"
      >
        <ArabicCard>
          <ArabicCardContent>
            {/* Close button */}
            <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 border border-pink-200/60 flex items-center justify-center hover:bg-pink-50 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>

            <AnimatePresence mode="wait">
              {phase === "scoring" ? (
                <motion.div
                  key="scoring"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-8 text-center"
                >
                  {/* Animated spinner */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-pink-100 border-t-pink-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Star className="w-8 h-8 text-pink-400" />
                    </div>
                  </div>
                  <ArabicCardTitle>Scoring your profile...</ArabicCardTitle>
                  <ArabicCardDescription>
                    Analyzing completeness across 13 dimensions
                  </ArabicCardDescription>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4"
                >
                  {/* Score circle */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                      className="relative w-28 h-28 mx-auto mb-4"
                    >
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#fce7f3" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="url(#scoreGradient)" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${(result?.total ?? 0) * 2.64} 264`}
                          initial={{ strokeDasharray: "0 264" }}
                          animate={{ strokeDasharray: `${(result?.total ?? 0) * 2.64} 264` }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#f43f5e" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-3xl font-bold text-pink-600 font-queensides"
                        >
                          {result?.total ?? 0}%
                        </motion.span>
                      </div>
                    </motion.div>
                    <ArabicCardTitle>Profile Score</ArabicCardTitle>
                    <ArabicCardDescription className="text-xs">
                      {(result?.total ?? 0) >= 80 ? "Excellent! Your profile is highly complete" :
                       (result?.total ?? 0) >= 60 ? "Good profile! A few areas to improve" :
                       (result?.total ?? 0) >= 40 ? "Getting there — fill more sections to stand out" :
                       "Needs work — complete more sections to attract matches"}
                    </ArabicCardDescription>
                  </div>

                  {/* Breakdown rows */}
                  <div className="space-y-2">
                    {result?.breakdown.map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={i < revealedRows ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-gradient-to-r from-pink-50/60 to-rose-50/40 border border-pink-100/50"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.points === item.maxPoints
                            ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                            : item.points > 0
                            ? "bg-gradient-to-br from-pink-400 to-rose-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-700 font-queensides">{item.label}</p>
                            <p className={`text-xs font-bold font-queensides ${
                              item.points === item.maxPoints ? "text-emerald-600" : item.points > 0 ? "text-pink-600" : "text-slate-400"
                            }`}>
                              {item.points}/{item.maxPoints}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 font-queensides truncate">{item.detail}</p>
                          {/* Progress bar */}
                          <div className="mt-1 h-1 rounded-full bg-pink-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={i < revealedRows ? { width: `${(item.points / item.maxPoints) * 100}%` } : { width: 0 }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                              className={`h-full rounded-full ${
                                item.points === item.maxPoints
                                  ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                                  : "bg-gradient-to-r from-pink-400 to-rose-500"
                              }`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ArabicCardContent>
        </ArabicCard>
      </motion.div>
    </div>
  )
}

// UI Kit Section Divider
function SectionDivider({ icon: Icon, title, color = "pink" }: { 
  icon: any
  title: string
  color?: "pink" | "purple" | "blue" | "emerald" | "amber" | "violet"
}) {
  const colorMap: any = {
    pink: { gradient: "from-pink-50 to-rose-50", border: "border-pink-200", iconBg: "from-pink-400 to-rose-500", text: "text-pink-800", line: "via-pink-300" },
    purple: { gradient: "from-purple-50 to-pink-50", border: "border-purple-200", iconBg: "from-purple-400 to-pink-500", text: "text-purple-800", line: "via-purple-300" },
    blue: { gradient: "from-blue-50 to-indigo-50", border: "border-blue-200", iconBg: "from-blue-400 to-indigo-500", text: "text-blue-800", line: "via-blue-300" },
    emerald: { gradient: "from-emerald-50 to-teal-50", border: "border-emerald-200", iconBg: "from-emerald-400 to-teal-500", text: "text-emerald-800", line: "via-emerald-300" },
    amber: { gradient: "from-amber-50 to-orange-50", border: "border-amber-200", iconBg: "from-amber-400 to-orange-500", text: "text-amber-800", line: "via-amber-300" },
    violet: { gradient: "from-violet-50 to-purple-50", border: "border-violet-200", iconBg: "from-violet-400 to-purple-500", text: "text-violet-800", line: "via-violet-300" },
  }

  const colors = colorMap[color]

  return (
    <div className="relative py-6">
      <div className="absolute inset-0 flex items-center">
        <div className={`w-full h-px bg-gradient-to-r from-transparent ${colors.line} to-transparent`} />
      </div>
      <div className="relative flex justify-center">
        <div className={`bg-gradient-to-r ${colors.gradient} px-6 py-2 rounded-full border ${colors.border} shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${colors.iconBg} rounded-xl flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className={`font-queensides font-semibold ${colors.text}`}>{title}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to convert cm to feet and inches
function cmToFeetInches(cm: string | undefined): string {
  if (!cm || isNaN(Number(cm))) return ""
  const totalInches = Math.round(Number(cm) / 2.54)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return `${feet}'${inches}"`
}

export function ProfileViewElegant({ userId: profileUserId }: { userId: string }) {
  const router = useRouter()
  const { userId, isAuthenticated } = useUser()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [viewMode, setViewMode] = useState<'my-profile' | 'my-match'>('my-profile')
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showLeadCard, setShowLeadCard] = useState(false)
  const [leadMessage, setLeadMessage] = useState('')
  const [isSendingLead, setIsSendingLead] = useState(false)
  const [viewerGender, setViewerGender] = useState<string | null>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [mahrPurseData, setMahrPurseData] = useState<{
    address: string
    balanceSatoshis: number
    unlockDate: string
    isActive: boolean
  } | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  
  // Image editing state
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Helper function to format BTC balance
  const formatBtc = (satoshis: number) => {
    const btc = satoshis / 100000000
    return btc.toFixed(8)
  }

  // Helper function to calculate time until unlock
  const getTimeUntilUnlock = (unlockDate: string) => {
    const unlock = new Date(unlockDate)
    const now = new Date()
    const diff = unlock.getTime() - now.getTime()

    if (diff <= 0) return "Unlocked"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} days ${hours} hours`
    return `${hours} hours`
  }

  // Check if unlock date has passed
  const isUnlocked = (unlockDate: string) => {
    return new Date(unlockDate) <= new Date()
  }

  useEffect(() => {
    if (isAuthenticated && userId) {
      setIsOwnProfile(userId === profileUserId)
      // Fetch viewer's gender
      const fetchViewerGender = async () => {
        try {
          const { data } = await supabase
            .from('users')
            .select('gender')
            .eq('id', userId)
            .single()
          if (data?.gender) {
            setViewerGender(data.gender)
          }
        } catch (error) {
          console.error('Error fetching viewer gender:', error)
        }
      }
      // Check if viewer has active subscription
      const checkSubscription = async () => {
        try {
          const { data } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle()
          setHasActiveSubscription(!!data)
        } catch (error) {
          console.error('Error checking subscription:', error)
        }
      }
      fetchViewerGender()
      checkSubscription()
    }
    loadProfile()
  }, [profileUserId, userId, isAuthenticated])

  const loadProfile = async () => {
    try {
      const supabaseProfile = await ProfileService.getProfileByUserId(profileUserId)
      
      if (supabaseProfile) {
        let photos: string[] = []
        if (supabaseProfile.profile_photos && Array.isArray(supabaseProfile.profile_photos)) {
          const resolved = await Promise.all(
            supabaseProfile.profile_photos.map(async (raw: string) => {
              const path = storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, raw)
              const signed = await getSignedUrlForPath(STORAGE_CONFIG.BUCKETS.PROFILES, path, 7200)
              return signed || raw
            })
          )
          photos = resolved.filter(Boolean)
        }

        let videoIntro: string | undefined
        if (supabaseProfile.video_intro) {
          const path = storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.VIDEOS, supabaseProfile.video_intro)
          const signed = await getSignedUrlForPath(STORAGE_CONFIG.BUCKETS.VIDEOS, path, 7200)
          videoIntro = signed || undefined
        }

        let voiceIntro: string | undefined
        if (supabaseProfile.voice_intro) {
          const path = storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.VOICE_NOTES, supabaseProfile.voice_intro)
          const signed = await getSignedUrlForPath(STORAGE_CONFIG.BUCKETS.VOICE_NOTES, path, 7200)
          voiceIntro = signed || undefined
        }

        setProfile({
          firstName: supabaseProfile.first_name || "",
          lastName: (supabaseProfile as any).last_name || "",
          age: supabaseProfile.age ? String(supabaseProfile.age) : "",
          gender: supabaseProfile.gender || "",
          bio: supabaseProfile.bio || "",
          bioTagline: (supabaseProfile as any).bio_tagline || "",
          location: supabaseProfile.location || "",
          city: (supabaseProfile as any).city || "",
          state: (supabaseProfile as any).state || "",
          country: (supabaseProfile as any).country || "",
          education: supabaseProfile.education || "",
          profession: supabaseProfile.profession || "",
          religiosity: supabaseProfile.religiosity || "",
          prayerFrequency: supabaseProfile.prayer_frequency || "",
          hijabPreference: supabaseProfile.hijab_preference || "",
          marriageIntention: supabaseProfile.marriage_intention || "",
          sect: (supabaseProfile as any).sect || "",
          islamicValues: (supabaseProfile as any).islamic_values || "",
          isRevert: supabaseProfile.is_revert ? "yes" : "no",
          alcohol: supabaseProfile.alcohol || "",
          smoking: supabaseProfile.smoking || "",
          psychedelics: supabaseProfile.psychedelics || "",
          psychedelicsTypes: Array.isArray((supabaseProfile as any).psychedelics_types) ? (supabaseProfile as any).psychedelics_types : [],
          halalFood: supabaseProfile.halal_food || "",
          familyInvolvement: (supabaseProfile as any).family_involvement || "",
          financeStyle: (supabaseProfile as any).finance_style || "",
          diningFrequency: (supabaseProfile as any).dining_frequency || "",
          travelFrequency: (supabaseProfile as any).travel_frequency || "",
          hairStyle: (supabaseProfile as any).hair_style || "",
          makeUpStyle: (supabaseProfile as any).make_up_style || "",
          polygamyReason: (supabaseProfile as any).polygamy_reason || "",
          selfCareFrequency: (supabaseProfile as any).self_care_frequency || "",
          selfCareBudget: (supabaseProfile as any).self_care_budget || "",
          shoppingFrequency: (supabaseProfile as any).shopping_frequency || "",
          shoppingBudgetType: (supabaseProfile as any).shopping_budget_preference_type || "",
          shoppingBudgetAmount: (supabaseProfile as any).shopping_budget_preference_amount || null,
          livingArrangements: (supabaseProfile as any).living_arrangements || "",
          willingToRelocate: (supabaseProfile as any).willing_to_relocate === true ? "yes" : "no",
          mahrMaxAmount: (supabaseProfile as any).mahr_max_amount || "",
          mahrRequirement: (supabaseProfile as any).mahr_requirement || "",
          workPreference: (supabaseProfile as any).work_preference || "",
          stylePreference: (supabaseProfile as any).style_preference || "",
          maritalStatus: (supabaseProfile as any).marital_status || "",
          hasChildren: (supabaseProfile as any).has_children === true ? "yes" : "no",
          wantChildren: (supabaseProfile as any).want_children || "",
          interests: Array.isArray(supabaseProfile.interests) ? supabaseProfile.interests : [],
          personality: Array.isArray((supabaseProfile as any).personality) ? (supabaseProfile as any).personality : [],
          profile_photos: photos,
          voiceIntro,
          videoIntro,
          profileRating: (supabaseProfile as any).profile_rating || 0,
          chatRating: (supabaseProfile as any).chat_rating || 0,
          responseRate: (supabaseProfile as any).response_rate || 0,
          isVerified: supabaseProfile.is_verified || false,
          createdAt: supabaseProfile.created_at || new Date().toISOString(),
          nationality: (supabaseProfile as any).nationality || "",
          height: (supabaseProfile as any).height || "",
          availableLeads: (supabaseProfile as any).available_leads || 0,
          availableViews: (supabaseProfile as any).available_views || 0,
        })

        // Fetch Mahr/Purse data if profile has it
        const profileGender = supabaseProfile.gender
        const mahrPurseType = profileGender === 'male' ? 'mahr' : 'purse'
        const isActive = (supabaseProfile as any)[`${mahrPurseType}_is_active`]
        
        if (isActive) {
          setMahrPurseData({
            address: (supabaseProfile as any)[`${mahrPurseType}_principle_address`] || '',
            balanceSatoshis: (supabaseProfile as any)[`${mahrPurseType}_balance_satoshis`] || 0,
            unlockDate: (supabaseProfile as any)[`${mahrPurseType}_unlock_date`] || '',
            isActive: true,
          })
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendLead = async () => {
    if (!leadMessage.trim() || !profile) return
    
    setIsSendingLead(true)
    try {
      // Send message via API
      const response = await fetch('/api/messages/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: profileUserId,
          message: leadMessage.trim(),
        }),
      })

      if (response.ok) {
        setLeadMessage('')
        setShowLeadCard(false)
        // You could add a toast notification here
        alert('Message sent successfully!')
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending lead:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSendingLead(false)
    }
  }

  // Image editing handlers
  const handleEditPhoto = (index: number) => {
    setEditingPhotoIndex(index)
    fileInputRef.current?.click()
  }

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || editingPhotoIndex === null || !userId || !profile) return

    setIsUploadingPhoto(true)

    try {
      // Upload new photo
      const result = await ProfileMediaService.uploadProfilePhoto(file, userId)
      
      if (result.success && result.path) {
        // Get signed URL for the new photo
        const signedUrl = await getSignedUrlForPath(STORAGE_CONFIG.BUCKETS.PROFILES, result.path, 7200)
        const newPhotoUrl = signedUrl || result.path

        // Delete old photo from storage if it exists
        const oldPhotos = profile.profile_photos || []
        if (oldPhotos[editingPhotoIndex]) {
          const oldPath = storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.PROFILES, oldPhotos[editingPhotoIndex])
          try {
            await ProfileMediaService.deleteProfileMedia(STORAGE_CONFIG.BUCKETS.PROFILES, oldPath)
          } catch (error) {
            console.error('Failed to delete old photo:', error)
          }
        }

        // Update photos array
        const updatedPhotos = [...oldPhotos]
        updatedPhotos[editingPhotoIndex] = result.path

        // Save to database
        const { error } = await supabase
          .from('users')
          .update({ profile_photos: updatedPhotos })
          .eq('id', profileUserId)

        if (error) {
          console.error('Error updating profile photos:', error)
          alert('Failed to update photo')
        } else {
          // Update local state
          const updatedProfile: ProfileData = {
            ...profile,
            profile_photos: updatedPhotos.map((path, i) => 
              i === editingPhotoIndex ? newPhotoUrl : path
            )
          }
          setProfile(updatedProfile)
        }
      } else {
        alert('Failed to upload photo: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating photo:', error)
      alert('Failed to update photo')
    } finally {
      setIsUploadingPhoto(false)
      setEditingPhotoIndex(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-queensides">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative pt-24 pb-24">
        <CelestialBackground intensity="light" />
        <div className="md:hidden"><MobileNavigation /></div>
        <div className="hidden md:block"><DesktopNavigation /></div>
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
          <div className="text-center">
            <UserCircle className="w-24 h-24 text-pink-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 font-queensides mb-4">Profile Not Found</h2>
            {isOwnProfile && (
              <button
                onClick={() => router.push("/profile/setup")}
                className="bg-gradient-to-r from-pink-400 to-rose-500 text-white font-queensides py-3 px-6 rounded-xl shadow-lg"
              >
                Create Profile
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative pb-24">
      <CelestialBackground intensity="light" />

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-pink-100/50">
          <div className="grid grid-cols-3 items-center p-4">
            {/* Column 1: Back Button */}
            <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-xl transition-colors justify-self-start">
              <ArrowLeft className="w-6 h-6 text-pink-600" />
            </button>
            
            {/* Column 2: Title */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-queensides">
                {viewMode === 'my-profile' 
                  ? (isOwnProfile ? "My Profile" : `${profile.firstName || "User"}'s Profile`)
                  : "My Match Preferences"
                }
              </h1>
            </div>
            
            {/* Column 3: Toggle Switch */}
            {isOwnProfile && (
              <button 
                onClick={() => router.push('/profile/preference')}
                className="p-2 hover:bg-pink-50 rounded-xl transition-colors justify-self-end"
                title="Edit Match Preferences"
              >
                <Settings className="w-6 h-6 text-pink-600" />
              </button>
            )}
            {!isOwnProfile && <div className="w-10" />}
          </div>
        </div>

        {/* Profile Sections - Only show in My Profile mode */}
        {viewMode === 'my-profile' && (
        <>
        {/* Hero Image */}
        <div className="relative w-full">
          {profile.profile_photos && profile.profile_photos.length > 0 ? (
            <div className="relative w-full overflow-hidden group">
              <img
                src={profile.profile_photos[0]}
                alt={`${profile.firstName}'s profile photo`}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '600px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              
              {/* Edit button for profile owner */}
              {isOwnProfile && (
                <button
                  onClick={() => handleEditPhoto(0)}
                  disabled={isUploadingPhoto}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Edit photo"
                >
                  {isUploadingPhoto && editingPhotoIndex === 0 ? (
                    <Loader2 className="w-4 h-4 text-pink-600 animate-spin" />
                  ) : (
                    <Edit className="w-4 h-4 text-pink-600" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="relative w-full h-96 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center group">
              <UserCircle className="w-32 h-32 text-pink-300" />
              
              {/* Add photo button for profile owner */}
              {isOwnProfile && (
                <button
                  onClick={() => handleEditPhoto(0)}
                  disabled={isUploadingPhoto}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add photo"
                >
                  <Camera className="w-4 h-4 text-pink-600" />
                </button>
              )}
            </div>
          )}

          {/* Profile Info Card */}
          <div className="relative -mt-24 px-6 z-10">
            <div className="bg-white rounded-3xl shadow-2xl border border-pink-200/30 p-5 sm:p-7 max-w-md mx-auto relative overflow-hidden">
              {/* Decorative top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" />
              
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }} />

              {/* Content */}
              <div className="relative z-10">
                {/* Name & Age - Stacked for mobile */}
                <div className="text-center mb-5">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 font-queensides leading-tight mb-1">
                    {profile.firstName || "User"}
                  </h1>
                  {profile.age && (
                    <>
                    <p className="text-lg sm:text-xl text-slate-600 font-queensides">{profile.age} years old, {profile.gender}</p>
                    <p className="text-lg sm:text-xl text-slate-600 font-queensides">{cmToFeetInches(profile.height)}{profile.nationality ? `, ${profile.nationality}` : ""}</p>
                    </>
                  )}
                </div>

                {/* Location */}
                {(profile.city || profile.state || profile.country || profile.location) && (
                  <div className="flex items-center justify-center gap-2 text-slate-600 font-queensides text-sm mb-5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-pink-600" />
                    </div>
                    <span className="font-medium">
                      {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || profile.location}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center justify-center mb-5">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                  <Star className="w-3 h-3 text-pink-400 mx-2" />
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                </div>

                {/* Bio Rating & Chat Rating - Two Column */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    className={`group p-3.5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/60 hover:shadow-md hover:shadow-pink-100 transition-all duration-300 hover:-translate-y-0.5 ${isOwnProfile ? "cursor-pointer active:scale-95" : ""}`}
                    onClick={() => { if (isOwnProfile) setShowScoreModal(true) }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Star className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-pink-600 font-queensides uppercase tracking-wider">Profile Score</p>
                        <p className="text-xl font-bold text-pink-700 font-queensides">{profile.profileRating ?? 0}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 hover:shadow-md hover:shadow-purple-100 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <MessageCircle className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-purple-600 font-queensides uppercase tracking-wider">Chat Rating</p>
                        <p className="text-xl font-bold text-purple-700 font-queensides">{profile.chatRating ?? 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats - Two Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="group p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/60 hover:shadow-md hover:shadow-rose-100 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Heart className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-rose-600 font-queensides uppercase tracking-wider">Leads</p>
                        <p className="text-xl font-bold text-rose-700 font-queensides">{profile.availableLeads ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/60 hover:shadow-md hover:shadow-purple-100 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-purple-600 font-queensides uppercase tracking-wider">Views</p>
                        <p className="text-xl font-bold text-purple-700 font-queensides">{profile.availableViews ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 hover:shadow-md hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-blue-600 font-queensides uppercase tracking-wider">Joined</p>
                        <p className="text-xs font-bold text-blue-700 font-queensides">{profile.createdAt ? formatDate(profile.createdAt) : 'Recently'}</p>
                      </div>
                    </div>
                  </div>
                  
                    <div className="group p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 hover:shadow-md hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Shield className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-emerald-600 font-queensides uppercase tracking-wider">Verified</p>
                          <p className="text-xs font-bold text-emerald-700 font-queensides">{profile.isVerified ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <>
          <div className="px-4 max-w-4xl mx-auto mt-10 mb-10 relative">
            <ArabicCard>
              <ArabicCardContent>
                <ArabicCardDescription className="whitespace-pre-line text-left break-words overflow-wrap-anywhere">
                  {profile.bio}
                </ArabicCardDescription>
              </ArabicCardContent>
            </ArabicCard>
            <div className="flex items-center justify-center mt-4">
              {!isOwnProfile && profile.gender && viewerGender && (
                // Only show if viewer is opposite gender
                ((profile.gender === 'male' && viewerGender === 'female') ||
                 (profile.gender === 'female' && viewerGender === 'male')) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLeadCard(true)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides font-medium rounded-2xl flex items-center gap-3 transition-all shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Take The Lead</span>
                  <Send className="w-4 h-4" />
                </motion.button>
                )
              )}
            </div>
          </div>
          </>
        )}

        {/* Basic Information Details */}
        {(profile.maritalStatus || profile.hasChildren || profile.wantChildren || profile.bioTagline) && (
          <div className="px-6 py-8 max-w-4xl bg-white mx-auto">
            <>
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mt-8">

              {profile.maritalStatus && (
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Marital Status</p>
                  <p className="text-slate-800 font-queensides text-lg capitalize">{profile.maritalStatus.replace('_', ' ')}</p>
                </div>
              )}
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Has Children</p>
                  <p className="text-slate-800 font-queensides text-lg capitalize">{profile.hasChildren ? 'Yes' : 'No'}</p>
                </div>
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Want Children</p>
                  <p className="text-slate-800 font-queensides text-lg capitalize">{profile.wantChildren ? 'Yes' : 'No'}</p>
                </div>
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Will Relocate</p>
                  <p className="text-slate-800 font-queensides text-lg capitalize">{profile.willingToRelocate ? 'Yes' : 'No'}</p>
                </div>
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Living Arrangements</p>
                  <p className="text-slate-800 font-queensides text-lg capitalize">{profile.livingArrangements ? profile.livingArrangements : 'Not Specified'}</p>
                </div>
                {profile.gender == 'male' && (
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Mahr Max</p>
                  <p className="text-slate-800 font-queensides text-lg capitalize">${profile.mahrMaxAmount ? profile.mahrMaxAmount : 'Not Specified'}</p>
                </div>
                )}
                {profile.gender == 'female' && (
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Mahr</p>
                  <p className="text-slate-800 font-queensides text-lg capitalize">${profile.mahrRequirement ? profile.mahrRequirement : 'Not Specified'}</p>
                </div>
                )}

            </div>
            </>
          </div>
        )}

        {/* Photo 2 */}
        {profile.profile_photos && profile.profile_photos.length > 1 && (
          <div className="relative w-full overflow-hidden group">
            <img
              src={profile.profile_photos[1]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            
            {/* Edit button for profile owner */}
            {isOwnProfile && (
              <button
                onClick={() => handleEditPhoto(1)}
                disabled={isUploadingPhoto}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit photo"
              >
                {isUploadingPhoto && editingPhotoIndex === 1 ? (
                  <Loader2 className="w-4 h-4 text-pink-600 animate-spin" />
                ) : (
                  <Edit className="w-4 h-4 text-pink-600" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Education & Career */}
        {(profile.education || profile.profession) && (
          <div className="px-6 py-8 max-w-4xl mx-auto bg-white">            
            <div className="grid grid-cols-2 gap-6 text-center">
              {profile.education && (
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-bold text-black-700 font-queensides mb-2 uppercase tracking-wide">Education</p>
                  <p className="text-slate-800 font-queensides text-lg">{profile.education}</p>
                </div>
              )}
              
              {profile.profession && (
                <div className="p-1 rounded-xl">
                  <p className="text-xs font-bold text-black-700 font-queensides mb-2 uppercase tracking-wide">Profession</p>
                  <p className="text-slate-800 font-queensides text-lg">{profile.profession}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video */}
        {profile.videoIntro && (
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-xl">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-400 rounded-tl-2xl opacity-50" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-indigo-400 rounded-tr-2xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-indigo-400 rounded-bl-2xl opacity-50" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-400 rounded-br-2xl opacity-50" />
              <div className="relative z-10 p-2">
                <video 
                  controls 
                  className="w-full rounded-xl shadow-lg bg-black"
                  style={{ maxHeight: '500px' }}
                >
                  <source src={profile.videoIntro} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              </div>
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
          </div>
        )}

        {/* Photo 3 */}
        {profile.profile_photos && profile.profile_photos.length > 2 && (
          <div className="relative w-full overflow-hidden group">
            <img
              src={profile.profile_photos[2]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            
            {/* Edit button for profile owner */}
            {isOwnProfile && (
              <button
                onClick={() => handleEditPhoto(2)}
                disabled={isUploadingPhoto}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit photo"
              >
                {isUploadingPhoto && editingPhotoIndex === 2 ? (
                  <Loader2 className="w-4 h-4 text-pink-600 animate-spin" />
                ) : (
                  <Edit className="w-4 h-4 text-pink-600" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Islamic Values */}
        {(profile.religiosity || profile.prayerFrequency || profile.sect || profile.hijabPreference || profile.islamicValues || profile.isRevert || profile.alcohol || profile.smoking || profile.psychedelics || profile.halalFood || profile.familyInvolvement) && (
          <>
          <div className="px-6 py-8 max-w-4xl mx-auto bg-white">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-queensides text-center mb-8">Islamic Values & Lifestyle</h3>

            </div>
            
            <div className="px-6 py-8 max-w-4xl mx-auto">
            {profile.marriageIntention && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                 className="p-6 rounded-2xl flextext-centert gap-8"
              >
                <div className="flex-1 text-center">
                  <ArabicCard>
                    <ArabicCardContent>
                      <ArabicCardTitle>Marriage Timeline</ArabicCardTitle>
                      <ArabicCardDescription>
                        {profile.marriageIntention.replace('_', ' ')}
                      </ArabicCardDescription>
                    </ArabicCardContent>
                  </ArabicCard>
                </div>
              </motion.div>
            )}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            </div>
            
            <div className="px-6 py-8 max-w-4xl mx-auto bg-white">

   
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {profile.religiosity && (
                <div className="pl-4 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Religiosity</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.religiosity}</p>
                </div>
              )}
              {profile.prayerFrequency && (
                <div className="pl-4 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Prayer</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.prayerFrequency}</p>
                </div>
              )}
              {profile.sect && (
                <div className="pl-4 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Sect</p>
                  <p className="text-slate-800 font-queensides font-medium text-lg">{profile.sect}</p>
                </div>
              )}
              {profile.islamicValues && (
                <div className="pl-4 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Islamic Values</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.islamicValues}</p>
                </div>
              )}
              {profile.isRevert && (
                <div className="pl-4 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Revert</p>
                  <p className="text-slate-800 font-queensides font-medium text-lg">{profile.isRevert === 'yes' ? 'Yes' : 'No'}</p>
                </div>
              )}
              {profile.hijabPreference && (
                <div className="pl-4 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Hijab</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.hijabPreference}</p>
                </div>
              )}
              {profile.familyInvolvement && (
                <div className="pl-4 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Family Involvement</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.familyInvolvement}</p>
                </div>
              )}

            </div>

            {/* Personal Habits */}
            {(profile.alcohol || profile.smoking || profile.psychedelics || profile.halalFood) && (
              <div className="mt-5">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
                
                <h3 className="text-lg font-bold text-slate-800 font-queensides mt-5 mb-6 text-center">Personal Habits</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {profile.alcohol && (
                    <div className="p-1 rounded-xl text-center">
                      <p className="text-xs font-semibold text-green-600 font-queensides mb-2 uppercase tracking-wide">Alcohol</p>
                      <p className="text-slate-800 font-queensides font-medium capitalize">{profile.alcohol}</p>
                    </div>
                  )}
                  {profile.smoking && (
                    <div className="p-1 rounded-xl text-center">
                      <p className="text-xs font-semibold text-green-600 font-queensides mb-2 uppercase tracking-wide">Smoking</p>
                      <p className="text-slate-800 font-queensides font-medium capitalize">{profile.smoking}</p>
                    </div>
                  )}
                  {profile.psychedelics && (
                    <div className="p-1 rounded-xl text-center">
                      <p className="text-xs font-semibold text-green-600 font-queensides mb-2 uppercase tracking-wide">Psychedelics</p>
                      <p className="text-slate-800 font-queensides font-medium capitalize">{profile.psychedelics}</p>
                      {profile.psychedelicsTypes && profile.psychedelicsTypes.length > 0 && (
                        <p className="text-sm text-amber-600 font-queensides">*{profile.psychedelicsTypes.join(', ')}</p>
                      )}
                    </div>
                  )}
                  {profile.halalFood && (
                    <div className="p-1 rounded-xl text-center">
                      <p className="text-xs font-semibold text-green-600 font-queensides mb-2 uppercase tracking-wide">Halal Food</p>
                      <p className="text-slate-800 font-queensides font-medium capitalize">{profile.halalFood}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          </>
        )}

        {/* Audio */}
        {profile.voiceIntro && (
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 shadow-lg">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-purple-400 rounded-tl-2xl opacity-50" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-pink-400 rounded-tr-2xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-pink-400 rounded-bl-2xl opacity-50" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-purple-400 rounded-br-2xl opacity-50" />
              <div className="relative z-10 p-4">
                <audio controls className="w-full">
                  <source src={profile.voiceIntro} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
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
          </div>
        )}

        {/* Photo 4 */}
        {profile.profile_photos && profile.profile_photos.length > 3 && (
          <div className="relative w-full overflow-hidden group">
            <img
              src={profile.profile_photos[3]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            
            {/* Edit button for profile owner */}
            {isOwnProfile && (
              <button
                onClick={() => handleEditPhoto(3)}
                disabled={isUploadingPhoto}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit photo"
              >
                {isUploadingPhoto && editingPhotoIndex === 3 ? (
                  <Loader2 className="w-4 h-4 text-pink-600 animate-spin" />
                ) : (
                  <Edit className="w-4 h-4 text-pink-600" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Lifestyle */}
        <div className="px-6 py-8 max-w-4xl mx-auto bg-white">
                      <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
                
                <h3 className="text-lg font-bold text-slate-800 font-queensides mt-5 mb-6 text-center">Finance Style</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            <div className="p-1 rounded-xl text-center">
              <DollarSign className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Spending</p>
              <p className="text-slate-800 font-queensides font-medium capitalize">{profile.financeStyle ? profile.financeStyle.replace('_', ' ') : 'Thrifty'}</p>
            </div>
            <div className="p-1 rounded-xl text-center">
              <Utensils className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Fine Dining</p>
              <p className="text-slate-800 font-queensides font-medium capitalize">{profile.diningFrequency ? profile.diningFrequency.replace('_', ' ') : 'Rarely'}</p>
            </div>
            <div className="p-1 rounded-xl text-center">
              <Plane className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Travel</p>
              <p className="text-slate-800 font-queensides font-medium capitalize">{profile.travelFrequency ? profile.travelFrequency.replace('_', ' ') : 'Rarely'}</p>
            </div>

            <div className="p-1 rounded-xl text-center">
              <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2.293 2.293c-.63.63-.184 1.707.707 1.707H18a2 2 0 002-2v-6a2 2 0 00-2-2h-5.293c-.495 0-.964.14-1.38.415l-2.293 2.293a1 1 0 101.414 1.414l2.293-2.293a1 1 0 00-1.414-1.414z" />
              </svg>
              <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Shopping</p>
              <p className="text-slate-800 font-queensides font-medium capitalize">{profile.shoppingFrequency ? profile.shoppingFrequency : 'N/A'}</p>
            </div>
            <div className="p-1 rounded-xl text-center">
              <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Shopping Budget</p>
              <p className="text-slate-800 font-queensides font-medium">
                {profile.shoppingBudgetType && profile.shoppingBudgetAmount ? (
                  profile.shoppingBudgetType === 'less_than' ? (
                    `< $${profile.shoppingBudgetAmount.toLocaleString()}`
                  ) : (
                    `> $${profile.shoppingBudgetAmount.toLocaleString()}`
                  )
                ) : (
                  'N/A'
                )}
              </p>
            </div>
            <div className="p-1 rounded-xl text-center">
              <Briefcase className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Work Pref</p>
              <p className="text-slate-800 font-queensides font-medium capitalize">{profile.workPreference ? profile.workPreference.replace('_', ' ') : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Self Care */}
        <div className="px-6 py-8 max-w-4xl mx-auto bg-white">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <Star className="w-4 h-4 text-pink-300" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
              <Moon className="w-4 h-4 text-purple-300" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
              <Sparkles className="w-4 h-4 text-blue-300" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-queensides mt-5 mb-6 text-center">Self Care</h3>
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="p-1 rounded-xl text-center">
              <p className="text-xs font-semibold text-pink-700 font-queensides mb-2 uppercase tracking-wider">Frequency</p>
              <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.selfCareFrequency ? profile.selfCareFrequency : 'N/A'}</p>
            </div>
            <div className="p-1 rounded-xl text-center">
              <p className="text-xs font-semibold text-purple-700 font-queensides mb-2 uppercase tracking-wider">Budget</p>
              <p className="text-slate-800 font-queensides font-medium text-lg">{profile.selfCareBudget ? profile.selfCareBudget : 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="mt-10 mb-10 p-3">

            <>
                  <ArabicCard>
                    <ArabicCardContent>
                      <ArabicCardTitle>Polygamy Perspective</ArabicCardTitle>
                      <ArabicCardDescription className="whitespace-pre-line">
                        {profile.polygamyReason ? profile.polygamyReason.replace('_', ' ') : 'N/A'}
                      </ArabicCardDescription>
                    </ArabicCardContent>
                  </ArabicCard>
            </>
        </div>

        {/* Photo 5 */}
        {profile.profile_photos && profile.profile_photos.length > 4 && (
          <div className="relative w-full overflow-hidden group">
            <img
              src={profile.profile_photos[4]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            
            {/* Edit button for profile owner */}
            {isOwnProfile && (
              <button
                onClick={() => handleEditPhoto(4)}
                disabled={isUploadingPhoto}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit photo"
              >
                {isUploadingPhoto && editingPhotoIndex === 4 ? (
                  <Loader2 className="w-4 h-4 text-pink-600 animate-spin" />
                ) : (
                  <Edit className="w-4 h-4 text-pink-600" />
                )}
              </button>
            )}
          </div>
        )}

        {profile.gender === 'female' && (
            <>
        <div className="px-6 py-8 max-w-4xl mx-auto bg-white">
          <div className="flex items-center justify-center mt-10">
            <div className="flex items-center space-x-4">
              <Star className="w-4 h-4 text-pink-300" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
              <Moon className="w-4 h-4 text-purple-300" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
              <Sparkles className="w-4 h-4 text-blue-300" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-queensides mt-5 mb-6 text-center">Beauty</h3>
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="p-1 rounded-xl text-center">
              <p className="text-xs font-semibold text-pink-700 font-queensides mb-2 uppercase tracking-wider">Hair</p>
              <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.hairStyle ? profile.hairStyle : 'N/A'}</p>
            </div>
            <div className="p-1 rounded-xl text-center">
              <p className="text-xs font-semibold text-purple-700 font-queensides mb-2 uppercase tracking-wider">Make Up</p>
              <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.makeUpStyle ? profile.makeUpStyle : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center justify-center mt-10">
            <div className="flex items-center space-x-4">
              <Star className="w-4 h-4 text-pink-300" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
              <Moon className="w-4 h-4 text-purple-300" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
              <Sparkles className="w-4 h-4 text-blue-300" />
            </div>
          </div>
        </div>
            </>
        )}


        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="px-6  max-w-4xl mx-auto bg-white">
            <SectionDivider icon={Star} title="Interests & Hobbies" color="purple" />
            <div className="flex flex-wrap gap-4 mt-3 justify-center">
              {profile.interests.map((interest, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200 text-purple-700 font-queensides font-medium hover:from-purple-100 hover:to-pink-100 transition-all cursor-default text-lg"
                >
                  {interest}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Personality */}
        {profile.personality && profile.personality.length > 0 && (
          <div className="px-6 max-w-4xl mx-auto bg-white pb-10">
            <SectionDivider icon={Sparkles} title="Personality" color="violet" />
            <div className="flex flex-wrap gap-4 mt-3 justify-center">
              {profile.personality.map((trait, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-6 py-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-full border border-violet-200 text-violet-700 font-queensides font-medium hover:from-violet-100 hover:to-purple-100 transition-all cursor-default text-lg"
                >
                  {trait}
                </motion.span>
              ))}
            </div>
          </div>
        )}


        {/* Remaining Photos Grid */}
        {profile.profile_photos && profile.profile_photos.length > 5 && (
          <div className="relative w-full overflow-hidden group">
            <img
              src={profile.profile_photos[5]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            
            {/* Edit button for profile owner */}
            {isOwnProfile && (
              <button
                onClick={() => handleEditPhoto(5)}
                disabled={isUploadingPhoto}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit photo"
              >
                {isUploadingPhoto && editingPhotoIndex === 5 ? (
                  <Loader2 className="w-4 h-4 text-pink-600 animate-spin" />
                ) : (
                  <Edit className="w-4 h-4 text-pink-600" />
                )}
              </button>
            )}
          </div>
        )}


        </>
        )}

        {profile.gender === 'female' && mahrPurseData && (isOwnProfile || hasActiveSubscription) && (
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 font-queensides">Purse Wallet</h3>
                  <p className="text-sm text-slate-600 font-queensides">Financial independence & planning</p>
                </div>
                {!isOwnProfile && (
                  <Badge className="ml-auto bg-purple-100 text-purple-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Balance */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white mb-4">
                <div className="text-center">
                  <p className="text-sm opacity-90 font-queensides mb-1">Balance</p>
                  <p className="text-3xl font-bold font-mono">
                    {formatBtc(mahrPurseData.balanceSatoshis)} BTC
                  </p>
                  <p className="text-sm opacity-75 mt-1">
                    {mahrPurseData.balanceSatoshis.toLocaleString()} satoshis
                  </p>
                </div>
              </div>

              {/* Address & Unlock Info */}
              <div className="bg-white/80 rounded-xl p-4 border border-purple-100 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-queensides mb-1">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600 shrink-0" />
                    <code className="flex-1 text-xs font-mono text-slate-700 break-all">
                      {mahrPurseData.address}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(mahrPurseData.address)
                        setCopiedAddress(true)
                        setTimeout(() => setCopiedAddress(false), 2000)
                      }}
                      className="shrink-0 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      {copiedAddress ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                  <div>
                    <p className="text-xs text-slate-500 font-queensides">Unlock Date</p>
                    <p className="text-sm font-medium text-slate-800 font-queensides">
                      {formatDate(mahrPurseData.unlockDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-queensides">Status</p>
                    <Badge className={
                      isUnlocked(mahrPurseData.unlockDate)
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }>
                      {isUnlocked(mahrPurseData.unlockDate) ? (
                        <><Unlock className="w-3 h-3 mr-1" /> Unlocked</>
                      ) : (
                        <><Lock className="w-3 h-3 mr-1" /> {getTimeUntilUnlock(mahrPurseData.unlockDate)}</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Prompt for Female Profile's Purse Wallet */}
        {profile.gender === 'female' && mahrPurseData && !isOwnProfile && !hasActiveSubscription && (
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border-2 border-dashed border-purple-300">
              <div className="text-center">
                {/* Lock Icon */}
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-800 font-queensides mb-3">
                  Her Time-Locked Purse Wallet
                </h3>

                {/* Description */}
                <p className="text-slate-600 font-queensides mb-6 max-w-md mx-auto leading-relaxed">
                  This profile has created a Purse wallet demonstrating financial independence and planning. 
                  Subscribe to view her complete Purse wallet details including balance, address, and unlock date.
                </p>

                {/* Features */}
                <div className="bg-white/60 rounded-xl p-4 mb-6 max-w-sm mx-auto">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Wallet className="w-4 h-4 text-purple-600" />
                      <span className="font-queensides">View BTC balance & wallet address</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Lock className="w-4 h-4 text-purple-600" />
                      <span className="font-queensides">See timelock unlock date & status</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="font-queensides">Access all premium profile features</span>
                    </div>
                  </div>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => router.push('/wallet')}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-queensides px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" />
                    Subscribe to View Purse Wallet
                  </span>
                </button>

                <p className="text-xs text-slate-500 font-queensides mt-4">
                  Unlock premium features and show serious intentions
                </p>
              </div>
            </div>
          </div>
        )}

        {profile.gender === 'male' && mahrPurseData && (isOwnProfile || hasActiveSubscription) && (
          <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-6 border-2 border-pink-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 font-queensides">Mahr Wallet</h3>
                  <p className="text-sm text-slate-600 font-queensides">Marriage commitment signal</p>
                </div>
                {!isOwnProfile && (
                  <Badge className="ml-auto bg-pink-100 text-pink-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Balance */}
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-4 text-white mb-4">
                <div className="text-center">
                  <p className="text-sm opacity-90 font-queensides mb-1">Balance</p>
                  <p className="text-3xl font-bold font-mono">
                    {formatBtc(mahrPurseData.balanceSatoshis)} BTC
                  </p>
                  <p className="text-sm opacity-75 mt-1">
                    {mahrPurseData.balanceSatoshis.toLocaleString()} satoshis
                  </p>
                </div>
              </div>

              {/* Address & Unlock Info */}
              <div className="bg-white/80 rounded-xl p-4 border border-pink-100 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 font-queensides mb-1">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-pink-600 shrink-0" />
                    <code className="flex-1 text-xs font-mono text-slate-700 break-all">
                      {mahrPurseData.address}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(mahrPurseData.address)
                        setCopiedAddress(true)
                        setTimeout(() => setCopiedAddress(false), 2000)
                      }}
                      className="shrink-0 p-2 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      {copiedAddress ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-pink-100">
                  <div>
                    <p className="text-xs text-slate-500 font-queensides">Unlock Date</p>
                    <p className="text-sm font-medium text-slate-800 font-queensides">
                      {formatDate(mahrPurseData.unlockDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-queensides">Status</p>
                    <Badge className={
                      isUnlocked(mahrPurseData.unlockDate)
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }>
                      {isUnlocked(mahrPurseData.unlockDate) ? (
                        <><Unlock className="w-3 h-3 mr-1" /> Unlocked</>
                      ) : (
                        <><Lock className="w-3 h-3 mr-1" /> {getTimeUntilUnlock(mahrPurseData.unlockDate)}</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Prompt for Male Profile's Mahr Wallet */}
        {profile.gender === 'male' && mahrPurseData && !isOwnProfile && !hasActiveSubscription && (
          <div className="px-6 py-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border-2 border-dashed border-pink-300">
              <div className="text-center">
                {/* Lock Icon */}
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-800 font-queensides mb-3">
                  His Time-Locked Mahr Wallet
                </h3>

                {/* Description */}
                <p className="text-slate-600 font-queensides mb-6 max-w-md mx-auto leading-relaxed">
                  This profile has created a Mahr wallet showing serious marriage commitment and financial readiness. 
                  Subscribe to view his complete Mahr wallet details including balance, address, and unlock date.
                </p>

                {/* Features */}
                <div className="bg-white/60 rounded-xl p-4 mb-6 max-w-sm mx-auto">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Heart className="w-4 h-4 text-pink-600" />
                      <span className="font-queensides">View BTC balance & wallet address</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Lock className="w-4 h-4 text-pink-600" />
                      <span className="font-queensides">See timelock unlock date & status</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Crown className="w-4 h-4 text-pink-600" />
                      <span className="font-queensides">Access all premium profile features</span>
                    </div>
                  </div>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={() => router.push('/wallet')}
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-queensides px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" />
                    Subscribe to View Mahr Wallet
                  </span>
                </button>

                <p className="text-xs text-slate-500 font-queensides mt-4">
                  Unlock premium features and show serious intentions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Islamic Quote */}
        <div className="px-6  max-w-4xl mx-auto mb-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <p className="text-2xl text-slate-600 font-queensides italic mb-4">
              "And among His signs is that He created for you mates from among yourselves"
            </p>
            <p className="text-base text-slate-500 font-queensides">- Quran 30:21</p>
          </div>
        </div>
      </div>

      {/* Profile Score Modal */}
      {profile !== null && isOwnProfile && (
        <ProfileScoreModal
          profile={profile!}
          isOpen={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          onScoreCalculated={async (score) => {
            try {
              await supabase
                .from('users')
                .update({ profile_rating: score, updated_at: new Date().toISOString() })
                .eq('id', profileUserId)
              setProfile(prev => prev ? { ...prev, profileRating: score } : prev)
            } catch (err) {
              console.error('Error saving profile score:', err)
            }
          }}
        />
      )}

      {/* Lead Card Slide Up */}
      <AnimatePresence>
        {showLeadCard && profile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeadCard(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            
            {/* Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-6 max-w-lg mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-800 font-qurova">Take The Lead</h3>
                </div>
                <button
                  onClick={() => setShowLeadCard(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Profile Preview */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <img
                  src={profile.profile_photos?.[0] || '/placeholder-user.jpg'}
                  alt={profile.firstName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-semibold text-slate-800 font-queensides">{profile.firstName}{profile.lastName ? ` ${profile.lastName}` : ''}, {profile.age}</p>
                  <p className="text-xs text-slate-500 font-queensides">{profile.location || 'Location not set'}</p>
                </div>
              </div>

              {/* Message Input */}
              <textarea
                value={leadMessage}
                onChange={(e) => setLeadMessage(e.target.value)}
                placeholder="Write a heartfelt message..."
                className="w-full h-24 p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent font-queensides text-sm"
                maxLength={280}
              />
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-slate-400 font-queensides">{leadMessage.length}/280</span>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendLead}
                disabled={!leadMessage.trim() || isSendingLead}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-queensides font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {isSendingLead ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Hidden file input for photo editing */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoFileChange}
        accept={STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
      />
    </div>
  )
}

export default ProfileViewElegant
