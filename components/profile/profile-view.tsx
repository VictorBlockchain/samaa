"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/context/UserContext"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { ProfileService } from "@/lib/database"
import { getSignedUrlForPath, storagePathFromUrlOrPath, STORAGE_CONFIG } from "@/lib/storage"

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
  bioRating?: number
  chatRating?: number
  responseRate?: number
  isVerified?: boolean
  createdAt?: string
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

export function ProfileViewElegant({ userId: profileUserId }: { userId: string }) {
  const router = useRouter()
  const { userId, isAuthenticated } = useUser()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [viewMode, setViewMode] = useState<'my-profile' | 'my-match'>('my-profile')

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

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
          bioRating: (supabaseProfile as any).bio_rating || 0,
          chatRating: (supabaseProfile as any).chat_rating || 0,
          responseRate: (supabaseProfile as any).response_rate || 0,
          isVerified: supabaseProfile.is_verified || false,
          createdAt: supabaseProfile.created_at || new Date().toISOString(),
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
                onClick={() => setViewMode(viewMode === 'my-profile' ? 'my-match' : 'my-profile')}
                className="p-2 hover:bg-pink-50 rounded-xl transition-colors justify-self-end"
                title={viewMode === 'my-profile' ? "Switch to Match Preferences" : "Switch to My Profile"}
              >
                <RefreshCw className="w-6 h-6 text-pink-600" />
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
            <div className="relative w-full overflow-hidden">
              <img
                src={profile.profile_photos[0]}
                alt={`${profile.firstName}'s profile photo`}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '600px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="relative w-full h-96 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
              <UserCircle className="w-32 h-32 text-pink-300" />
            </div>
          )}

          {/* Profile Info Card */}
          <div className="relative -mt-24 px-6 z-10">
            <div className="bg-white rounded-2xl shadow-lg border border-pink-200/50 p-4 sm:p-6 max-w-md mx-auto">
              {/* Name & Age - Stacked for mobile */}
              <div className="text-center mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 font-queensides leading-tight">
                  {profile.firstName || "User"}
                </h1>
                {profile.age && (
                  <p className="text-xl sm:text-2xl text-slate-600 font-queensides mt-1">{profile.age} years old, {profile.gender}</p>
                )}
              </div>

              {/* Location */}
              {(profile.city || profile.state || profile.country || profile.location) && (
                <div className="flex items-center justify-center gap-1.5 text-slate-600 font-queensides text-sm mb-4">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || profile.location}
                  </span>
                </div>
              )}

              {/* Bio Rating & Chat Rating - Two Column */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-pink-700 font-queensides uppercase tracking-wide">Bio Rating</p>
                      <p className="text-lg font-bold text-pink-800 font-queensides">{profile.bioRating ?? 0}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700 font-queensides uppercase tracking-wide">Chat Rating</p>
                      <p className="text-lg font-bold text-purple-800 font-queensides">{profile.chatRating ?? 0}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats - Two Column Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-rose-700 font-queensides uppercase tracking-wide">Likes</p>
                      <p className="text-lg font-bold text-rose-800 font-queensides">24</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700 font-queensides uppercase tracking-wide">Compliments</p>
                      <p className="text-lg font-bold text-purple-800 font-queensides">12</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 font-queensides uppercase tracking-wide">Joined</p>
                      <p className="text-sm font-bold text-blue-800 font-queensides">{profile.createdAt ? formatDate(profile.createdAt) : 'Recently'}</p>
                    </div>
                  </div>
                </div>
                
                {profile.isVerified && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 font-queensides uppercase tracking-wide">Verified</p>
                        <p className="text-sm font-bold text-emerald-800 font-queensides">Masjid</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="px-6 max-w-4xl mx-auto bg-white mt-8 relative">
            <p className="font-16 font-queensides leading-relaxed pb-8 text-left pt-8">
              {profile.bio}
            </p>
          </div>
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
              {profile.bioTagline && (
                <div className="col-span-2 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-black-600 font-queensides mb-2 uppercase tracking-wide">Tagline</p>
                  <p className="text-slate-800 font-queensides text-lg italic">{profile.bioTagline}</p>
                </div>
              )}
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
          <div className="relative w-full overflow-hidden">
            <img
              src={profile.profile_photos[1]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
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
          <div className="relative w-full overflow-hidden">
            <img
              src={profile.profile_photos[2]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
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
                  <h4 className="text-sm font-semibold font-queensides mb-1 uppercase tracking-wide">Marriage Timeline</h4>
                  <p className="text-lg font-bold font-queensides">{profile.marriageIntention.replace('_', ' ')}</p>
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
          <div className="relative w-full overflow-hidden">
            <img
              src={profile.profile_photos[3]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
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
            {profile.gender === 'female' && (
              <div className="p-1 rounded-xl text-center">
                <Palette className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Hair Style</p>
                <p className="text-slate-800 font-queensides font-medium capitalize">{profile.hairStyle ? profile.hairStyle.replace('_', ' ') : 'N/A'}</p>
              </div>
            )}
            <div className="p-1 rounded-xl text-center">
              <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2.293 2.293c-.63.63-.184 1.707.707 1.707H18a2 2 0 002-2v-6a2 2 0 00-2-2h-5.293c-.495 0-.964.14-1.38.415l-2.293 2.293a1 1 0 101.414 1.414l2.293-2.293a1 1 0 00-1.414-1.414z" />
              </svg>
              <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Shopping</p>
              <p className="text-slate-800 font-queensides font-medium capitalize">{profile.shoppingFrequency ? profile.shoppingFrequency : 'N/A'}</p>
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
        <div className="mt-10">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <Star className="w-4 h-4 text-pink-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                <Moon className="w-4 h-4 text-purple-300" />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            </div>
            <>
            <h3 className="text-lg font-bold text-slate-800 font-queensides mt-5 mb-6 text-center">Polygamy Perspective</h3>
            <h1 className="text-2xl font-bold text-slate-800 font-queensides text-center">{profile.polygamyReason ? profile.polygamyReason : 'n/a'}</h1>
            </>
        </div>

        {/* Photo 5 */}
        {profile.profile_photos && profile.profile_photos.length > 4 && (
          <div className="relative w-full overflow-hidden">
            <img
              src={profile.profile_photos[4]}
              alt={`${profile.firstName}'s photo`}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}

        {profile.gender === 'male' && (
            <>
            <div className="px-6 py-8 max-w-4xl mx-auto bg-white mt-10">
                <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4">
                    <Star className="w-4 h-4 text-pink-300" />
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                    <Moon className="w-4 h-4 text-purple-300" />
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                    <Sparkles className="w-4 h-4 text-blue-300" />
                </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-queensides mt-5 mb-6 text-center">Beauty</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                    <div className="p-1 rounded-xl text-center">
                        <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Hair</p>
                        <p className="text-slate-800 font-queensides font-medium capitalize">{profile.hairStyle ? profile.hairStyle.replace('_', ' ') : 'N/A'}</p>
                    </div>
                    <div className="p-1 rounded-xl text-center">
                        <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <p className="text-xs font-semibold text-amber-700 font-queensides mb-2 uppercase tracking-wider">Make Up</p>
                        <p className="text-slate-800 font-queensides font-medium capitalize">{profile.makeUpStyle ? profile.makeUpStyle : 'N/A'}</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-6 py-8 max-w-6xl mx-auto">
            {profile.profile_photos.slice(5).map((photo, index) => (
              <div key={index} className="relative overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={photo}
                  alt={`${profile.firstName}'s photo ${index + 6}`}
                  className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}


        </>
        )}

        {/* Islamic Quote */}
        <div className="px-6 py-20 max-w-4xl mx-auto">
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
    </div>
  )
}

export default ProfileViewElegant
