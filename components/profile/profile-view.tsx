"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
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
  Home,
  Plane,
  DollarSign,
  Utensils,
  Palette,
  Users,
  BookOpen,
  Moon,
  Sparkles,
  CheckCircle,
  Clock,
  Globe,
} from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/context/UserContext"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { ProfileService } from "@/lib/database"
import { getSignedUrlForPath, storagePathFromUrlOrPath, STORAGE_CONFIG } from "@/lib/storage"

interface ProfileData {
  // Basic Info
  firstName: string
  lastName: string
  age: string
  gender: string
  maritalStatus: string
  bio: string
  location?: string
  city?: string
  state?: string
  country?: string
  education?: string
  profession?: string
  
  // Islamic Values
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
  
  // Lifestyle Preferences
  financeStyle?: string
  diningFrequency?: string
  travelFrequency?: string
  hairStyle?: string
  polygamyReason?: string
  
  // Living & Family
  livingArrangements?: string
  willingToRelocate?: string
  
  // Interests
  interests?: string[]
  personality?: string[]
  
  // Media
  profilePhoto?: string
  profile_photos?: string[]
  voiceIntro?: string
  videoIntro?: string
  
  // Stats
  bioRating?: number
  responseRate?: number
  isVerified?: boolean
}

// UI Kit Section Divider Component
function SectionDivider({ icon: Icon, title, color = "pink" }: { 
  icon: any
  title: string
  color?: "pink" | "purple" | "blue" | "emerald" | "amber" | "violet"
}) {
  const colorMap = {
    pink: {
      gradient: "from-pink-50 to-rose-50",
      border: "border-pink-200",
      iconBg: "from-pink-400 to-rose-500",
      text: "text-pink-800",
      line: "via-pink-300",
    },
    purple: {
      gradient: "from-purple-50 to-pink-50",
      border: "border-purple-200",
      iconBg: "from-purple-400 to-pink-500",
      text: "text-purple-800",
      line: "via-purple-300",
    },
    blue: {
      gradient: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
      iconBg: "from-blue-400 to-indigo-500",
      text: "text-blue-800",
      line: "via-blue-300",
    },
    emerald: {
      gradient: "from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      iconBg: "from-emerald-400 to-teal-500",
      text: "text-emerald-800",
      line: "via-emerald-300",
    },
    amber: {
      gradient: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      iconBg: "from-amber-400 to-orange-500",
      text: "text-amber-800",
      line: "via-amber-300",
    },
    violet: {
      gradient: "from-violet-50 to-purple-50",
      border: "border-violet-200",
      iconBg: "from-violet-400 to-purple-500",
      text: "text-violet-800",
      line: "via-violet-300",
    },
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

// Photo Preview Component
function PhotoGallery({ photos }: { photos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!photos || photos.length === 0) return null

  return (
    <div className="px-4 py-6">
      <SectionDivider icon={Camera} title="Photos" color="blue" />
      
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border border-blue-200/50 p-6 shadow-xl">
        {/* Main Photo Display */}
        <div className="relative aspect-square max-w-md mx-auto mb-4 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
          <img
            src={photos[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Photo Counter */}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-queensides">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
        
        {/* Navigation Controls */}
        {photos.length > 1 && (
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
              className="p-3 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)}
              className="p-3 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Audio Preview Component
function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  if (!audioUrl) return null

  return (
    <div className="px-4 py-6">
      <SectionDivider icon={Mic} title="Voice Introduction" color="purple" />
      
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 shadow-lg">
        <div className="p-4">
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        
        <div className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-t border-purple-200/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-xs font-queensides text-purple-700 font-medium">Voice Message</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Video Preview Component
function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  if (!videoUrl) return null

  return (
    <div className="px-4 py-6">
      <SectionDivider icon={Video} title="Video Introduction" color="blue" />
      
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-xl">
        <div className="p-2">
          <video controls className="w-full rounded-xl shadow-lg bg-black" style={{ maxHeight: '400px' }}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        </div>
        
        <div className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border-t border-blue-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs font-queensides text-blue-700 font-medium">Video Introduction</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-queensides">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileViewNew({ userId: profileUserId }: { userId: string }) {
  const router = useRouter()
  const { userId, isAuthenticated } = useUser()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (isAuthenticated && userId) {
      setIsOwnProfile(userId === profileUserId)
    }
    loadProfile()
  }, [profileUserId, userId, isAuthenticated])

  const loadProfile = async () => {
    try {
      const supabaseProfile = await ProfileService.getProfileByUserId(profileUserId)
      
      if (supabaseProfile) {
        // Get signed URLs for photos
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

        // Get signed URL for video
        let videoIntro: string | undefined
        if (supabaseProfile.video_intro) {
          const path = storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.VIDEOS, supabaseProfile.video_intro)
          const signed = await getSignedUrlForPath(STORAGE_CONFIG.BUCKETS.VIDEOS, path, 7200)
          videoIntro = signed || undefined
        }

        // Get signed URL for audio
        let voiceIntro: string | undefined
        if (supabaseProfile.voice_intro) {
          const path = storagePathFromUrlOrPath(STORAGE_CONFIG.BUCKETS.VOICE_NOTES, supabaseProfile.voice_intro)
          const signed = await getSignedUrlForPath(STORAGE_CONFIG.BUCKETS.VOICE_NOTES, path, 7200)
          voiceIntro = signed || undefined
        }

        setProfile({
          firstName: supabaseProfile.first_name || "",
          lastName: supabaseProfile.last_name || "",
          age: supabaseProfile.age ? String(supabaseProfile.age) : "",
          gender: supabaseProfile.gender || "",
          maritalStatus: supabaseProfile.marital_status || "",
          bio: supabaseProfile.bio || "",
          location: supabaseProfile.location || "",
          city: supabaseProfile.city || "",
          state: (supabaseProfile as any).state || "",
          country: (supabaseProfile as any).country || "",
          education: supabaseProfile.education || "",
          profession: supabaseProfile.profession || "",
          
          // Islamic Values
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
          psychedelicsTypes: (supabaseProfile as any).psychedelics_types || [],
          halalFood: supabaseProfile.halal_food || "",
          familyInvolvement: (supabaseProfile as any).family_involvement || "",
          
          // Lifestyle
          financeStyle: (supabaseProfile as any).finance_style || "",
          diningFrequency: (supabaseProfile as any).dining_frequency || "",
          travelFrequency: (supabaseProfile as any).travel_frequency || "",
          hairStyle: (supabaseProfile as any).hair_style || "",
          polygamyReason: (supabaseProfile as any).polygamy_reason || "",
          
          // Living
          livingArrangements: (supabaseProfile as any).living_arrangements || "",
          willingToRelocate: (supabaseProfile as any).willing_to_relocate === true ? "yes" : "no",
          
          // Interests
          interests: Array.isArray(supabaseProfile.interests) ? supabaseProfile.interests : [],
          personality: Array.isArray((supabaseProfile as any).personality) ? (supabaseProfile as any).personality : [],
          
          // Media
          profile_photos: photos,
          voiceIntro,
          videoIntro,
          
          // Stats
          bioRating: (supabaseProfile as any).bio_rating || 0,
          responseRate: (supabaseProfile as any).response_rate || 0,
          isVerified: supabaseProfile.is_verified || false,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setIsLoading(false)
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
          <Card className="w-full max-w-md border-2 border-pink-200/50">
            <CardContent className="p-8 text-center">
              <UserCircle className="w-24 h-24 text-pink-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-4">Profile Not Found</h2>
              <p className="text-slate-600 font-queensides mb-6">
                {isOwnProfile 
                  ? "Create your profile to start finding meaningful connections"
                  : "This user profile is not available"}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => router.push("/profile/setup")}
                  className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-queensides py-3 px-6 rounded-xl shadow-lg"
                >
                  Create Profile
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative pb-24">
      <CelestialBackground intensity="light" />

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-pink-100/50">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-pink-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-pink-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">
                {isOwnProfile ? "My Profile" : `${profile.firstName || "User"}'s Profile`}
              </h1>
              <p className="text-sm text-slate-600 font-queensides">
                {isOwnProfile ? "Your Samaa profile" : "Member profile"}
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Hero Section - Full Width Image */}
        <div className="relative w-full">
          {profile.profile_photos && profile.profile_photos.length > 0 ? (
            <div className="relative w-full overflow-hidden">
              <img
                src={profile.profile_photos[0]}
                alt={`${profile.firstName}'s profile photo`}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '600px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
              
              {profile.profile_photos.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-queensides flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {profile.profile_photos.length} Photos
                </div>
              )}
            </div>
          ) : (
            <div className="relative w-full h-96 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
              <UserCircle className="w-32 h-32 text-pink-300" />
            </div>
          )}

          {/* Profile Info - Elegant Overlay */}
          <div className="relative -mt-24 px-6 z-10">
            <div className="text-center mb-6">
              <h1 className="text-5xl font-bold gradient-text font-qurova mb-3 drop-shadow-lg">
                {profile.firstName || "User"}
                {profile.age && <span className="text-4xl ml-2">{profile.age}</span>}
              </h1>
              {profile.gender && (
                <Badge className="bg-white/90 backdrop-blur-sm text-pink-600 px-5 py-2 rounded-full text-sm font-semibold shadow-lg border border-pink-200">
                  {profile.gender === 'male' ? '♂ Male' : '♀ Female'}
                </Badge>
              )}
            </div>

            {/* Location */}
            {(profile.city || profile.state || profile.country || profile.location) && (
              <div className="flex items-center justify-center gap-2 text-white font-queensides text-lg mb-4 drop-shadow-md">
                <MapPin className="w-5 h-5" />
                <span>
                  {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || profile.location}
                </span>
              </div>
            )}

            {/* Quick Stats */}
            {(profile.bioRating || profile.responseRate || profile.isVerified) && (
              <div className="flex items-center justify-center gap-6 pb-6">
                {profile.bioRating && profile.bioRating > 0 && (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-queensides font-medium">{profile.bioRating}%</span>
                  </div>
                )}
                {profile.responseRate && profile.responseRate > 0 && (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-queensides font-medium">{profile.responseRate}%</span>
                  </div>
                )}
                {profile.isVerified && (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-queensides font-medium">Verified</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio Section - Clean, No Card */}
        {profile.bio && (
          <div className="px-6 py-12 max-w-4xl mx-auto">
            <SectionDivider icon={Heart} title="About Me" color="pink" />
            <p className="text-slate-700 font-queensides leading-relaxed text-xl mt-8 text-center">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Photo 2 - Full Width */}
        {profile.profile_photos && profile.profile_photos.length > 1 && (
          <div className="relative w-full overflow-hidden my-8">
            <img
              src={profile.profile_photos[1]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Education & Career - Clean Layout */}
        {(profile.education || profile.profession) && (
          <div className="px-6 py-12 max-w-4xl mx-auto">
            <SectionDivider icon={Briefcase} title="Education & Career" color="blue" />
            
            <div className="space-y-6 mt-8">
              {profile.education && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 font-queensides mb-1">Education</p>
                    <p className="text-slate-800 font-queensides text-lg">{profile.education}</p>
                  </div>
                </div>
              )}
              
              {profile.profession && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 font-queensides mb-1">Profession</p>
                    <p className="text-slate-800 font-queensides text-lg">{profile.profession}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Introduction - Full Width */}
        {profile.videoIntro && (
          <div className="my-8">
            <div className="max-w-4xl mx-auto px-6">
              <SectionDivider icon={Video} title="Video Introduction" color="blue" />
            </div>
            <div className="mt-8">
              <video controls className="w-full" style={{ maxHeight: '500px' }}>
                <source src={profile.videoIntro} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            </div>
          </div>
        )}

        {/* Photo 3 - Full Width */}
        {profile.profile_photos && profile.profile_photos.length > 2 && (
          <div className="relative w-full overflow-hidden my-8">
            <img
              src={profile.profile_photos[2]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Islamic Values - Clean Grid */}
        {(profile.religiosity || profile.prayerFrequency || profile.sect) && (
          <div className="px-6 py-12 max-w-4xl mx-auto">
            <SectionDivider icon={Moon} title="Islamic Values" color="emerald" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {profile.religiosity && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Religiosity</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.religiosity}</p>
                </div>
              )}
              
              {profile.prayerFrequency && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Prayer</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.prayerFrequency}</p>
                </div>
              )}
              
              {profile.sect && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Sect</p>
                  <p className="text-slate-800 font-queensides font-medium text-lg">{profile.sect}</p>
                </div>
              )}
              
              {profile.islamicValues && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Islamic Values</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize text-lg">{profile.islamicValues}</p>
                </div>
              )}
              
              {profile.isRevert && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-emerald-600 font-queensides mb-2 uppercase tracking-wide">Revert</p>
                  <p className="text-slate-800 font-queensides font-medium text-lg">{profile.isRevert === 'yes' ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audio Introduction */}
        {profile.voiceIntro && (
          <div className="px-6 py-12 max-w-4xl mx-auto">
            <SectionDivider icon={Mic} title="Voice Introduction" color="purple" />
            
            <div className="mt-8">
              <audio controls className="w-full">
                <source src={profile.voiceIntro} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}

        {/* Photo 4 - Full Width */}
        {profile.profile_photos && profile.profile_photos.length > 3 && (
          <div className="relative w-full overflow-hidden my-8">
            <img
              src={profile.profile_photos[3]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Lifestyle Preferences - Clean */}
        {(profile.financeStyle || profile.diningFrequency || profile.travelFrequency) && (
          <div className="px-6 py-12 max-w-4xl mx-auto">
            <SectionDivider icon={Sparkles} title="Lifestyle" color="amber" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {profile.financeStyle && (
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-amber-700 font-queensides mb-1 uppercase tracking-wide">Finance Style</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize">{profile.financeStyle.replace('_', ' ')}</p>
                </div>
              )}
              
              {profile.diningFrequency && (
                <div className="text-center">
                  <Utensils className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-amber-700 font-queensides mb-1 uppercase tracking-wide">Dining</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize">{profile.diningFrequency.replace('_', ' ')}</p>
                </div>
              )}
              
              {profile.travelFrequency && (
                <div className="text-center">
                  <Plane className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-amber-700 font-queensides mb-1 uppercase tracking-wide">Travel</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize">{profile.travelFrequency.replace('_', ' ')}</p>
                </div>
              )}
              
              {profile.hairStyle && (
                <div className="text-center">
                  <Palette className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-amber-700 font-queensides mb-1 uppercase tracking-wide">Hair Style</p>
                  <p className="text-slate-800 font-queensides font-medium capitalize">{profile.hairStyle.replace('_', ' ')}</p>
                </div>
              )}
            </div>
            
            {profile.polygamyReason && (
              <div className="mt-8 p-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-2xl border border-amber-200">
                <p className="text-sm font-semibold text-amber-700 font-queensides mb-2">Polygamy Perspective</p>
                <p className="text-slate-700 font-queensides leading-relaxed">{profile.polygamyReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Photo 5 - Full Width */}
        {profile.profile_photos && profile.profile_photos.length > 4 && (
          <div className="relative w-full overflow-hidden my-8">
            <img
              src={profile.profile_photos[4]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Interests & Hobbies - Tag Cloud */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="px-6 py-12 max-w-4xl mx-auto">
            <SectionDivider icon={Star} title="Interests & Hobbies" color="purple" />
            
            <div className="flex flex-wrap gap-3 mt-8 justify-center">
              {profile.interests.map((interest, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200 text-purple-700 font-queensides text-sm font-medium hover:from-purple-100 hover:to-pink-100 transition-all cursor-default"
                >
                  {interest}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Remaining Photos */}
        {profile.profile_photos && profile.profile_photos.length > 5 && (
          <div className="grid grid-cols-2 gap-4 px-6 py-8 max-w-4xl mx-auto">
            {profile.profile_photos.slice(5).map((photo, index) => (
              <div key={index} className="relative overflow-hidden rounded-2xl">
                <img
                  src={photo}
                  alt={`${profile.firstName}'s photo ${index + 6}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Islamic Quote */}
        <div className="px-6 py-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <Star className="w-3 h-3 text-pink-300" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-3 h-3 text-purple-300" />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-3 h-3 text-blue-300" />
              </div>
            </div>
            <p className="text-xl text-slate-600 font-queensides italic mb-3">
              "And among His signs is that He created for you mates from among yourselves"
            </p>
            <p className="text-sm text-slate-500 font-queensides">- Quran 30:21</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for compatibility
export default ProfileViewNew
