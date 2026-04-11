"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Heart, Users, Bell, Shield, BookOpen, User, Wallet, UtensilsCrossed, Video, Mic, Globe, Search, X, Save, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/context/UserContext"
import { useAuth } from "@/app/context/AuthContext"
import { UserSettingsService, ProfileService } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { countries } from "@/data/countries"
import { useToast } from "@/hooks/use-toast"


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

const languagesList = [
  "Arabic", "English", "Urdu", "French", "Turkish", "Indonesian", 
  "Malay", "Bengali", "Spanish", "German", "Italian", "Portuguese", 
  "Russian", "Chinese", "Japanese", "Korean", "Hindi", "Persian", 
  "Swahili", "Hausa", "Yoruba", "Amharic", "Somali", "Afghan", 
  "Bosnian", "Albanian", "Kurdish", "Pashto", "Tamil", "Punjabi",
  "Other"
]

export function PreferencesView() {
  const router = useRouter()
  const { userId, profile, refreshProfile } = useUser()
  const { user } = useAuth()
  const { toast } = useToast()
  const [customInterests, setCustomInterests] = useState("")
  const [customInterestsPills, setCustomInterestsPills] = useState<string[]>([])
  const [languageSearch, setLanguageSearch] = useState("")
  const [languageSuggestions, setLanguageSuggestions] = useState<string[]>([])
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const languageSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [nationalitySearch, setNationalitySearch] = useState("")
  const [nationalitySuggestions, setNationalitySuggestions] = useState<string[]>([])
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false)
  const nationalitySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [settings, setSettings] = useState({
    ageRange: [22, 35],
    maxDistance: 50,
    anywhereInWorld: false,
    showOnlyVerified: true,
    interests: [] as string[],
    islamValues: {
      prayerFrequency: "No preference",
      hijabPreference: "No preference",
      marriageTimeline: "No preference",
      halalFood: "No preference",
      alcohol: "No preference",
      smoking: "No preference",
      psychedelics: "No preference",
      psychedelicsTypes: [] as string[],
      sect: "No preference",
      isRevert: "No preference",
      religiosity: "No preference",
      familyInvolvement: "No preference",
      polygamyPerspective: "No preference",
    },
    personal: {
      nationality: [] as string[],
      height: "No preference",
      heightMin: null as number | null,
      languages: [] as string[],
      willingToRelocate: "No preference",
      livingArrangements: "No preference",
      mahr: "No preference",
      mahrType: "no_preference" as string,
      mahrAmount: null as number | null,
      occupation: "No preference",
      personality: [] as string[],
      hasVideo: false,
      hasAudio: false,
    },
    lifestyle: {
      spending: "No preference",
      fineDiningFrequency: "No preference",
      travelFrequency: "No preference",
      shoppingFrequency: "No preference",
      shoppingBudgetType: "no_preference" as string,
      shoppingBudgetAmount: null as number | null,
      selfCareFrequency: "No preference",
      selfCareBudgetType: "no_preference" as string,
      selfCareBudgetAmount: null as number | null,
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
    profileRatingMinimum: 70,
    responseRateMinimum: 50,
  })



  // Nationality autocomplete handlers
  const handleNationalitySearch = useCallback((value: string) => {
    setNationalitySearch(value)
    if (nationalitySearchTimeoutRef.current) {
      clearTimeout(nationalitySearchTimeoutRef.current)
    }
    nationalitySearchTimeoutRef.current = setTimeout(() => {
      if (value.length > 0) {
        const filtered = countries
          .filter((country: string) =>
            country.toLowerCase().includes(value.toLowerCase()) &&
            !settings.personal.nationality.includes(country)
          )
          .slice(0, 8)
        setNationalitySuggestions(filtered)
        setShowNationalityDropdown(true)
      } else {
        setNationalitySuggestions([])
        setShowNationalityDropdown(false)
      }
    }, 150)
  }, [settings.personal.nationality])

  const addNationality = useCallback((country: string) => {
    setSettings(prev => {
      if (prev.personal.nationality.includes(country)) return prev
      return { ...prev, personal: { ...prev.personal, nationality: [...prev.personal.nationality, country] } }
    })
    setNationalitySearch("")
    setNationalitySuggestions([])
    setShowNationalityDropdown(false)
  }, [])

  const removeNationality = useCallback((country: string) => {
    setSettings(prev => ({
      ...prev,
      personal: { ...prev.personal, nationality: prev.personal.nationality.filter(n => n !== country) }
    }))
  }, [])

  // Generic section save function
  const saveSection = async (sectionName: string, settingsUpdate: any) => {
    if (!userId) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save settings",
        variant: "destructive",
      })
      return false
    }

    console.log(`[Settings] Saving ${sectionName}:`, settingsUpdate)
    setSavingSection(sectionName)
    try {
      await UserSettingsService.upsertUserSettings(userId, settingsUpdate)
      localStorage.setItem("userSettings", JSON.stringify(settings))
      toast({
        title: "Saved successfully",
        description: `${sectionName} settings updated`,
        action: <Check className="w-4 h-4 text-green-500" />,
      })
      return true
    } catch (error) {
      console.error(`Error saving ${sectionName}:`, error)
      toast({
        title: "Save failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setSavingSection(null)
    }
  }

  // Add custom interests with duplicate prevention
  const addCustomInterests = () => {
    if (customInterests.trim()) {
      const newInterests = customInterests
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest && !settings.interests.includes(interest) && !customInterestsPills.includes(interest))

      if (newInterests.length > 0) {
        setCustomInterestsPills(prev => [...prev, ...newInterests])
        setCustomInterests("")
      } else {
        toast({
          title: "Duplicate interests",
          description: "These interests are already in your list",
          variant: "destructive",
        })
      }
    }
  }

  // Remove a custom interest
  const removeCustomInterest = (interest: string) => {
    setCustomInterestsPills(prev => prev.filter(i => i !== interest))
  }

  // Language search with debouncing
  const handleLanguageSearch = (value: string) => {
    setLanguageSearch(value)
    
    if (languageSearchTimeoutRef.current) {
      clearTimeout(languageSearchTimeoutRef.current)
    }

    if (value.trim().length > 0) {
      languageSearchTimeoutRef.current = setTimeout(() => {
        const filtered = ["Arabic", "English", "Urdu", "French", "Turkish", "Indonesian", "Malay", "Bengali", "Spanish", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean", "Hindi", "Persian", "Swahili", "Hausa", "Yoruba", "Amharic", "Somali", "Afghan", "Bosnian", "Albanian", "Kurdish", "Pashto", "Tamil", "Punjabi", "Other"]
          .filter(lang => 
            lang.toLowerCase().includes(value.toLowerCase()) && 
            !settings.personal.languages.includes(lang)
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
    if (!settings.personal.languages.includes(language)) {
      setSettings(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          languages: [...prev.personal.languages, language]
        }
      }))
      setLanguageSearch("")
      setLanguageSuggestions([])
      setShowLanguageDropdown(false)
    }
  }

  // Remove language
  const removeLanguage = (language: string) => {
    setSettings(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        languages: prev.personal.languages.filter(l => l !== language)
      }
    }))
  }

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.language-search-container')) {
        setShowLanguageDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Load settings and user profile data
  useEffect(() => {
    const loadSettings = async () => {
      if (userId) {
        const dbSettings = await UserSettingsService.getUserSettings(userId)
        console.log('[Settings] Loaded from DB:', dbSettings)
        if (dbSettings) {
          console.log('[Settings] islamValues:', {
            prayerFrequency: (dbSettings as any).prayer_frequency_preference,
            hijabPreference: (dbSettings as any).hijab_preference,
            marriageTimeline: (dbSettings as any).marriage_timeline_preference,
            sect: (dbSettings as any).sect_preference,
            religiosity: (dbSettings as any).religiosity_preference,
          })
          console.log('[Settings] lifestyle:', {
            spending: (dbSettings as any).spending_preference,
            fineDiningFrequency: (dbSettings as any).fine_dining_frequency_preference,
          })
          console.log('[Settings] personal:', {
            height: (dbSettings as any).height_preference,
            languages: (dbSettings as any).languages_preference,
            livingArrangements: (dbSettings as any).living_arrangements_preference,
          })
          setSettings(prev => ({
            ...prev,
            ageRange: [(dbSettings as any).age_range_min || 22, (dbSettings as any).age_range_max || 35],
            maxDistance: (dbSettings as any).max_distance || 50,
            anywhereInWorld: dbSettings.anywhere_in_world || false,
            showOnlyVerified: dbSettings.show_only_verified ?? true,
            userGender: profile?.gender || "female",
            // Load interests
            interests: Array.isArray((dbSettings as any).interests_preference) ? (dbSettings as any).interests_preference.filter((i: string) => interests.includes(i)) : [],
            customInterestsPills: Array.isArray((dbSettings as any).interests_preference) ? (dbSettings as any).interests_preference.filter((i: string) => !interests.includes(i)) : [],
            // Load Islam Values
            islamValues: {
              prayerFrequency: (dbSettings as any).prayer_frequency_preference || "No preference",
              hijabPreference: (dbSettings as any).hijab_preference || "No preference",
              marriageTimeline: (dbSettings as any).marriage_timeline_preference || "No preference",
              halalFood: (dbSettings as any).halal_food_preference || "No preference",
              alcohol: (dbSettings as any).alcohol_preference || "No preference",
              smoking: (dbSettings as any).smoking_preference || "No preference",
              psychedelics: (dbSettings as any).psychedelics_preference || "No preference",
              psychedelicsTypes: Array.isArray((dbSettings as any).psychedelics_types_preference) ? (dbSettings as any).psychedelics_types_preference : [],
              sect: (dbSettings as any).sect_preference || "No preference",
              isRevert: (dbSettings as any).is_revert_preference || "No preference",
              religiosity: Array.isArray((dbSettings as any).religiosity_preference) && (dbSettings as any).religiosity_preference.length > 0 ? (dbSettings as any).religiosity_preference[0] : "No preference",
              familyInvolvement: (dbSettings as any).family_involvement_preference || "No preference",
              polygamyPerspective: (dbSettings as any).polygamy_perspective_preference || "No preference",
            },
            // Load Personal Details
            personal: {
              nationality: Array.isArray((dbSettings as any).nationality_preference) ? (dbSettings as any).nationality_preference : [],
              height: (dbSettings as any).height_preference || "No preference",
              heightMin: (dbSettings as any).height_min_preference || null,
              languages: Array.isArray((dbSettings as any).languages_preference) ? (dbSettings as any).languages_preference : [],
              willingToRelocate: (dbSettings as any).willing_to_relocate_preference || "No preference",
              livingArrangements: (dbSettings as any).living_arrangements_preference || "No preference",
              mahr: (dbSettings as any).mahr_preference_type && (dbSettings as any).mahr_preference_amount 
                ? `${(dbSettings as any).mahr_preference_type}:${(dbSettings as any).mahr_preference_amount}`
                : "No preference",
              mahrType: (dbSettings as any).mahr_preference_type || "no_preference",
              mahrAmount: (dbSettings as any).mahr_preference_amount || null,
              occupation: (dbSettings as any).occupation_preference || "No preference",
              personality: Array.isArray((dbSettings as any).personality_preference) ? (dbSettings as any).personality_preference : [],
              hasVideo: (dbSettings as any).has_video_preference ?? false,
              hasAudio: (dbSettings as any).has_audio_preference ?? false,
            },
            // Load Lifestyle & Finance
            lifestyle: {
              spending: (dbSettings as any).spending_preference || "No preference",
              fineDiningFrequency: (dbSettings as any).fine_dining_frequency_preference || "No preference",
              travelFrequency: (dbSettings as any).travel_frequency_preference || "No preference",
              shoppingFrequency: (dbSettings as any).shopping_frequency_preference || "No preference",
              shoppingBudgetType: (dbSettings as any).shopping_budget_preference_type || "no_preference",
              shoppingBudgetAmount: (dbSettings as any).shopping_budget_preference_amount || null,
              selfCareFrequency: (dbSettings as any).self_care_frequency_preference || "No preference",
              selfCareBudgetType: (dbSettings as any).self_care_budget_preference_type || "no_preference",
              selfCareBudgetAmount: (dbSettings as any).self_care_budget_preference_amount || null,
            },
            // Load Notifications
            notifications: {
              matches: (dbSettings as any).notifications_matches ?? true,
              messages: (dbSettings as any).notifications_messages ?? true,
              profileViews: (dbSettings as any).notifications_profile_views ?? false,
            },
            // Load Privacy
            privacy: {
              showAge: (dbSettings as any).show_age ?? true,
              showLocation: (dbSettings as any).show_location ?? true,
              showLastSeen: (dbSettings as any).show_last_seen ?? false,
            },
            // Load Quality Filters
            profileRatingMinimum: (dbSettings as any).profile_rating_minimum_preference || 70,
            responseRateMinimum: (dbSettings as any).response_rate_minimum_preference || 50,
          }))
        }
      }
      
      // Also check localStorage as fallback
      const savedSettings = localStorage.getItem("userSettings")
      if (savedSettings && !userId) {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(parsedSettings)
      }
      
      // Get user gender from profile
      if (profile?.gender) {
        setSettings(prev => ({ ...prev, userGender: profile.gender }))
      }
    }
    
    loadSettings()
  }, [userId, profile])

  const FilterSelect = ({
    label,
    value,
    onValueChange,
    options,
  }: {
    label: string
    value: string
    onValueChange: (value: string) => void
    options: string[]
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <Label className="font-queensides text-slate-700">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-40 h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />

      <div className="relative z-10">
        {/* Header - Same style as other pages */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center pt-3">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Match Preferences</h1>
              <p className="text-sm text-slate-600 font-queensides">What you're looking for in a partner</p>
            </div>
            <Button variant="ghost" size="sm" className="text-indigo-600 font-semibold font-queensides">
              Clear all
            </Button>
          </div>
        </div>

        <div className="p-4 pb-24">

        <div className="space-y-6">
          {/* Age Range */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold font-qurova">Age Range</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{settings.ageRange[0]} years</span>
                <span>{settings.ageRange[1]} years</span>
              </div>
              <Slider
                value={settings.ageRange}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, ageRange: value }))}
                min={18}
                max={60}
                step={1}
                className="w-full"
              />
            </div>
            <Button
              onClick={() => saveSection("Age Range", {
                age_range_min: settings.ageRange[0],
                age_range_max: settings.ageRange[1],
              })}
              disabled={savingSection === "Age Range"}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-queensides"
            >
              {savingSection === "Age Range" ? "Saving..." : "Save Age Range"}
            </Button>
          </motion.div>

          {/* Distance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold font-qurova">Distance Preference</h3>
            </div>

            {/* Anywhere in World Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🌍</span>
                </div>
                <div>
                  <Label htmlFor="anywhere-toggle" className="font-semibold text-slate-800 font-qurova cursor-pointer">
                    Anywhere in the World
                  </Label>
                  <p className="text-xs text-blue-600 font-queensides">
                    Match with people globally, regardless of distance
                  </p>
                </div>
              </div>
              <Switch
                id="anywhere-toggle"
                checked={settings.anywhereInWorld}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, anywhereInWorld: checked }))}
              />
            </div>

            {/* Distance Slider - Only show when not "anywhere in world" */}
            {!settings.anywhereInWorld && (
              <div className="space-y-4">
                <div className="text-center text-sm text-slate-600">
                  Within {settings.maxDistance} miles
                </div>
                <Slider
                  value={[settings.maxDistance]}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, maxDistance: value[0] }))}
                  min={5}
                  max={300}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 font-queensides">
                  <span>5 miles</span>
                  <span>300 miles</span>
                </div>
              </div>
            )}

            {/* Global matching indicator */}
            {settings.anywhereInWorld && (
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 rounded-xl">
                <p className="text-green-700 font-queensides font-semibold">
                  ✈️ Global matching enabled - no distance limits
                </p>
                <p className="text-xs text-green-600 font-queensides mt-1">
                  You'll see potential matches from around the world
                </p>
              </div>
            )}

            <Button
              onClick={() => saveSection("Distance", {
                max_distance: settings.maxDistance,
                anywhere_in_world: settings.anywhereInWorld,
              })}
              disabled={savingSection === "Distance"}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-queensides"
            >
              {savingSection === "Distance" ? "Saving..." : "Save Distance Preference"}
            </Button>
          </motion.div>

          {/* Islam Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold font-qurova text-amber-700">Islam Values</h3>
            </div>
            <div className="space-y-1">
              {settings && settings.islamValues && (
                <>
                           <FilterSelect
                label="Prayer frequency"
                value={settings.islamValues.prayerFrequency}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, prayerFrequency: value } }))
                }
                options={["No preference", "Five times daily", "Regularly", "Sometimes", "Learning to pray"]}
              />
              {settings.userGender === "male" && (
                <FilterSelect
                  label="Hijab preference"
                  value={settings.islamValues.hijabPreference}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, hijabPreference: value } }))
                  }
                  options={["No preference", "Always wear hijab", "Sometimes", "Planning to wear", "Never"]}
                />
              )}
              <FilterSelect
                label="Marriage timeline"
                value={settings.islamValues.marriageTimeline}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, marriageTimeline: value } }))
                }
                options={["No preference", "1-4_months", "4-12_months", "1-2_years", "agree_together"]}
              />
              <FilterSelect
                label="Halal food"
                value={settings.islamValues.halalFood}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, halalFood: value } }))
                }
                options={["No preference", "Always halal", "Mostly halal", "Sometimes"]}
              />
              <FilterSelect
                label="Alcohol"
                value={settings.islamValues.alcohol}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, alcohol: value } }))
                }
                options={["No preference", "Never", "Rarely", "Socially", "Regularly"]}
              />
              <FilterSelect
                label="Smoking"
                value={settings.islamValues.smoking}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, smoking: value } }))
                }
                options={["No preference", "Never", "Rarely", "Socially", "Regularly"]}
              />
              <FilterSelect
                label="Psychedelics"
                value={settings.islamValues.psychedelics}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, psychedelics: value } }))
                }
                options={["No preference", "Never", "Rarely", "Socially", "Regularly"]}
              />

              {/* Which psychedelics - Multi-toggle */}
              {settings.islamValues.psychedelics !== "No preference" && settings.islamValues.psychedelics !== "Never" && (
                <div className="pt-2 pb-3 border-b border-gray-100">
                  <Label className="font-queensides text-slate-700 mb-2 block">Which psychedelics</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Cannabis", "Psilocybin", "Ayahuasca", "MDMA", "LSD", "Ketamine", "Other"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSettings(prev => {
                            const current = prev.islamValues.psychedelicsTypes
                            const updated = current.includes(option) ? current.filter(v => v !== option) : [...current, option]
                            return { ...prev, islamValues: { ...prev.islamValues, psychedelicsTypes: updated } }
                          })
                        }}
                        className={`px-3 py-2 rounded-xl text-sm font-queensides transition-all duration-300 ${
                          settings.islamValues.psychedelicsTypes.includes(option)
                            ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md border border-white/20"
                            : "bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100"
                        }`}
                      >
                        {settings.islamValues.psychedelicsTypes.includes(option) && "✓ "}
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <FilterSelect
                label="Sect"
                value={settings.islamValues.sect}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, sect: value } }))
                }
                options={["No preference", "Sunni", "Shia", "Other"]}
              />
              <FilterSelect
                label="Revert"
                value={settings.islamValues.isRevert}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, isRevert: value } }))
                }
                options={["No preference", "Yes", "No"]}
              />
              <FilterSelect
                label="Family involvement"
                value={settings.islamValues.familyInvolvement}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, familyInvolvement: value } }))
                }
                options={["No preference", "Very involved", "Somewhat involved", "Minimal", "Not involved"]}
              />
              <FilterSelect
                label="Polygamy perspective"
                value={settings.islamValues.polygamyPerspective}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, polygamyPerspective: value } }))
                }
                options={["No preference", "Open to it", "Not interested", "Only if first wife"]}
              />

              <FilterSelect
                label="Religiosity"
                value={settings.islamValues.religiosity}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, islamValues: { ...prev.islamValues, religiosity: value } }))
                }
                options={["No preference", "practicing", "moderate", "learning"]}
              />
                </>             
              )}
   
            </div>
            <Button
              onClick={() => saveSection("Islam Values", {
                prayer_frequency_preference: settings.islamValues.prayerFrequency,
                hijab_preference: settings.islamValues.hijabPreference,
                marriage_timeline_preference: settings.islamValues.marriageTimeline,
                halal_food_preference: settings.islamValues.halalFood,
                alcohol_preference: settings.islamValues.alcohol,
                smoking_preference: settings.islamValues.smoking,
                psychedelics_preference: settings.islamValues.psychedelics,
                psychedelics_types_preference: settings.islamValues.psychedelicsTypes,
                sect_preference: settings.islamValues.sect,
                is_revert_preference: settings.islamValues.isRevert,
                religiosity_preference: settings.islamValues.religiosity !== "No preference" ? [settings.islamValues.religiosity] : [],
                family_involvement_preference: settings.islamValues.familyInvolvement,
                polygamy_perspective_preference: settings.islamValues.polygamyPerspective,
              })}
              disabled={savingSection === "Islam Values"}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-queensides"
            >
              {savingSection === "Islam Values" ? "Saving..." : "Save Islam Values"}
            </Button>
          </motion.div>

          {/* Personal Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold font-qurova text-amber-700">Personal Details</h3>
            </div>
            <div className="space-y-1">
              {/* Nationality autocomplete */}
              <div className="py-3 border-b border-gray-100">
                <Label className="font-queensides text-slate-700 mb-2 block">Nationality</Label>

                {/* Selected nationalities */}
                {settings.personal.nationality.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.personal.nationality.map((country) => (
                      <div
                        key={country}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-xl text-sm font-queensides border border-amber-200/60"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {country}
                        <button
                          onClick={() => removeNationality(country)}
                          className="hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    value={nationalitySearch}
                    onChange={(e) => handleNationalitySearch(e.target.value)}
                    onFocus={() => {
                      if (nationalitySearch.length > 0) {
                        setShowNationalityDropdown(true)
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 font-queensides text-sm transition-all duration-300"
                    placeholder="Search countries..."
                  />

                  {/* Autocomplete dropdown */}
                  {showNationalityDropdown && nationalitySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {nationalitySuggestions.map((country) => (
                        <button
                          key={country}
                          onClick={() => addNationality(country)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-colors font-queensides text-sm text-slate-700 border-b border-amber-100/50 last:border-b-0 flex items-center gap-2"
                        >
                          <Globe className="w-4 h-4 text-amber-400" />
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <FilterSelect
                label="Height"
                value={settings.personal.height}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, personal: { ...prev.personal, height: value } }))
                }
                options={["No preference", "Under 5'0\"", "5'0\" - 5'4\"", "5'5\" - 5'9\"", "5'10\" - 6'2\"", "Over 6'2\""]}
              />

              {/* Height Min (cm) */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <Label className="font-queensides text-slate-700">Min Height (cm)</Label>
                <Input
                  type="number"
                  value={settings.personal.heightMin ?? ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev, personal: { ...prev.personal, heightMin: e.target.value ? parseInt(e.target.value) : null }
                  }))}
                  placeholder="e.g. 160"
                  className="w-28 h-8 text-sm"
                  min={100}
                  max={250}
                />
              </div>

              <div className="py-3 border-b border-gray-100">
                <Label className="font-queensides text-slate-700 mb-2 block">Languages</Label>
                
                {/* Selected Languages Pills */}
                {settings.personal.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {settings.personal.languages.map((lang) => (
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
                <div className="relative language-search-container">
                  <Input
                    value={languageSearch}
                    onChange={(e) => handleLanguageSearch(e.target.value)}
                    onFocus={() => {
                      if (languageSearch.trim().length > 0 && languageSuggestions.length > 0) {
                        setShowLanguageDropdown(true)
                      }
                    }}
                    placeholder="Search and add languages (e.g., Arabic, English, French)"
                    className="w-full bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 font-queensides"
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

                {settings.personal.languages.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2 font-queensides">
                    Add languages you speak or prefer
                  </p>
                )}
              </div>
              <FilterSelect
                label="Willing to relocate"
                value={settings.personal.willingToRelocate}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, personal: { ...prev.personal, willingToRelocate: value } }))
                }
                options={["No preference", "Yes", "No", "For the right person", "Within same country", "Internationally"]}
              />
              <FilterSelect
                label="Living arrangements"
                value={settings.personal.livingArrangements}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, personal: { ...prev.personal, livingArrangements: value } }))
                }
                options={["No preference", "Alone", "With family", "With roommates", "Flexible"]}
              />


              {/* Mahr - Type + Amount */}
              <div className="py-3 border-b border-gray-100">
                <Label className="font-queensides text-slate-700 mb-2 block">Mahr expectation</Label>
                <div className="flex gap-2">
                  <Select
                    value={settings.personal.mahrType || "no_preference"}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, mahrType: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-32 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                      <SelectItem value="greater_than">Greater than</SelectItem>
                    </SelectContent>
                  </Select>
                  {settings.personal.mahrType !== "no_preference" && (
                    <Input
                      type="number"
                      value={settings.personal.mahrAmount || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          personal: {
                            ...prev.personal,
                            mahrAmount: e.target.value ? parseInt(e.target.value) : null,
                          },
                        }))
                      }
                      placeholder="Amount"
                      className="flex-1 h-9 text-sm"
                      min={0}
                      step={1000}
                    />
                  )}
                </div>
              </div>
              <FilterSelect
                label="Occupation"
                value={settings.personal.occupation}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, personal: { ...prev.personal, occupation: value } }))
                }
                options={["No preference", "Employed", "Self-employed", "Student", "Homemaker", "Retired", "Other"]}
              />

              {/* Personality traits - Multi-toggle */}
              <div className="pt-3 border-t border-gray-100">
                <Label className="font-queensides text-slate-700 mb-2 block">Personality traits</Label>
                <div className="flex flex-wrap gap-2">
                  {["Introverted", "Extroverted", "Ambivert", "Adventurous", "Calm", "Humorous", "Intellectual", "Creative", "Empathetic", "Ambitious"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSettings(prev => {
                          const current = prev.personal.personality
                          const updated = current.includes(option) ? current.filter((v: string) => v !== option) : [...current, option]
                          return { ...prev, personal: { ...prev.personal, personality: updated } }
                        })
                      }}
                      className={`px-3 py-2 rounded-xl text-sm font-queensides transition-all duration-300 ${
                        settings.personal.personality.includes(option)
                          ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md border border-white/20"
                          : "bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100"
                      }`}
                    >
                      {settings.personal.personality.includes(option) && "✓ "}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media requirements */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-amber-600" />
                    <Label className="font-queensides text-slate-700">Has video intro</Label>
                  </div>
                  <Switch
                    checked={settings.personal.hasVideo}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, personal: { ...prev.personal, hasVideo: checked } }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-amber-600" />
                    <Label className="font-queensides text-slate-700">Has voice intro</Label>
                  </div>
                  <Switch
                    checked={settings.personal.hasAudio}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, personal: { ...prev.personal, hasAudio: checked } }))
                    }
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => saveSection("Personal Details", {
                nationality_preference: settings.personal.nationality,
                height_preference: settings.personal.height,
                height_min_preference: settings.personal.heightMin,
                languages_preference: settings.personal.languages,
                willing_to_relocate_preference: settings.personal.willingToRelocate,
                living_arrangements_preference: settings.personal.livingArrangements,
                mahr_preference_type: settings.personal.mahrType !== "no_preference" ? settings.personal.mahrType : null,
                mahr_preference_amount: settings.personal.mahrAmount,
                occupation_preference: settings.personal.occupation,
                personality_preference: settings.personal.personality,
                has_video_preference: settings.personal.hasVideo,
                has_audio_preference: settings.personal.hasAudio,
              })}
              disabled={savingSection === "Personal Details"}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-queensides"
            >
              {savingSection === "Personal Details" ? "Saving..." : "Save Personal Details"}
            </Button>
          </motion.div>

          {/* Lifestyle & Finance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <UtensilsCrossed className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold font-qurova text-purple-700">Lifestyle & Finance</h3>
            </div>
            <div className="space-y-1">
              {/* Spending Style */}
              <FilterSelect
                label="Spending style"
                value={settings.lifestyle.spending}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, spending: value } }))
                }
                options={["No preference", "thrift", "luxury", "responsible", "saver"]}
              />
              <FilterSelect
                label="Fine dining frequency"
                value={settings.lifestyle.fineDiningFrequency}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, fineDiningFrequency: value } }))
                }
                options={["No preference", "Rarely", "Monthly", "Weekly", "Multiple times a week"]}
              />
              <FilterSelect
                label="Travel frequency"
                value={settings.lifestyle.travelFrequency}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, travelFrequency: value } }))
                }
                options={["No preference", "Rarely", "Once a year", "Few times a year", "Frequently"]}
              />
              <FilterSelect
                label="Shopping frequency"
                value={settings.lifestyle.shoppingFrequency}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, shoppingFrequency: value } }))
                }
                options={["No preference", "Rarely", "Once a month", "Few times a month", "Weekly", "Multiple times a week"]}
              />

              {/* Shopping Budget - Type + Amount */}
              <div className="py-3 border-b border-gray-100">
                <Label className="font-queensides text-slate-700 mb-2 block">Shopping budget</Label>
                <div className="flex gap-2">
                  <Select
                    value={settings.lifestyle.shoppingBudgetType || "no_preference"}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        lifestyle: { ...prev.lifestyle, shoppingBudgetType: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-32 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                      <SelectItem value="greater_than">Greater than</SelectItem>
                    </SelectContent>
                  </Select>
                  {settings.lifestyle.shoppingBudgetType !== "no_preference" && (
                    <Input
                      type="number"
                      value={settings.lifestyle.shoppingBudgetAmount || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          lifestyle: {
                            ...prev.lifestyle,
                            shoppingBudgetAmount: e.target.value ? parseInt(e.target.value) : null,
                          },
                        }))
                      }
                      placeholder="Amount"
                      className="flex-1 h-9 text-sm"
                      min={0}
                      step={50}
                    />
                  )}
                </div>
              </div>

              <FilterSelect
                label="Self-care frequency"
                value={settings.lifestyle.selfCareFrequency}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, selfCareFrequency: value } }))
                }
                options={["No preference", "Rarely", "Monthly", "Bi-weekly", "Weekly"]}
              />

              {/* Self-Care Budget - Type + Amount */}
              <div className="py-3 border-b border-gray-100">
                <Label className="font-queensides text-slate-700 mb-2 block">Self-care budget</Label>
                <div className="flex gap-2">
                  <Select
                    value={settings.lifestyle.selfCareBudgetType || "no_preference"}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        lifestyle: { ...prev.lifestyle, selfCareBudgetType: value },
                      }))
                    }
                  >
                    <SelectTrigger className="w-32 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                      <SelectItem value="greater_than">Greater than</SelectItem>
                    </SelectContent>
                  </Select>
                  {settings.lifestyle.selfCareBudgetType !== "no_preference" && (
                    <Input
                      type="number"
                      value={settings.lifestyle.selfCareBudgetAmount || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          lifestyle: {
                            ...prev.lifestyle,
                            selfCareBudgetAmount: e.target.value ? parseInt(e.target.value) : null,
                          },
                        }))
                      }
                      placeholder="Amount"
                      className="flex-1 h-9 text-sm"
                      min={0}
                      step={25}
                    />
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => saveSection("Lifestyle & Finance", {
                spending_preference: settings.lifestyle.spending,
                fine_dining_frequency_preference: settings.lifestyle.fineDiningFrequency,
                travel_frequency_preference: settings.lifestyle.travelFrequency,
                shopping_frequency_preference: settings.lifestyle.shoppingFrequency,
                shopping_budget_preference_type: settings.lifestyle.shoppingBudgetType !== "no_preference" ? settings.lifestyle.shoppingBudgetType : null,
                shopping_budget_preference_amount: settings.lifestyle.shoppingBudgetAmount,
                self_care_frequency_preference: settings.lifestyle.selfCareFrequency,
                self_care_budget_preference_type: settings.lifestyle.selfCareBudgetType !== "no_preference" ? settings.lifestyle.selfCareBudgetType : null,
                self_care_budget_preference_amount: settings.lifestyle.selfCareBudgetAmount,
              })}
              disabled={savingSection === "Lifestyle & Finance"}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-queensides"
            >
              {savingSection === "Lifestyle & Finance" ? "Saving..." : "Save Lifestyle & Finance"}
            </Button>
          </motion.div>



          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Heart className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold font-qurova">Interests</h3>
            </div>

            {/* Predefined Interests */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <Checkbox
                    id={interest}
                    checked={settings.interests.includes(interest)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (settings.interests.includes(interest)) {
                          toast({
                            title: "Already added",
                            description: `"${interest}" is already in your interests`,
                            variant: "destructive",
                          })
                          return
                        }
                        setSettings(prev => ({ ...prev, interests: [...prev.interests, interest] }))
                      } else {
                        setSettings(prev => ({
                          ...prev,
                          interests: prev.interests.filter((i) => i !== interest)
                        }))
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
                <h4 className="font-semibold text-slate-800 font-qurova">Add Other Interests</h4>
              </div>
              <div className="space-y-2">
                <Input
                  value={customInterests}
                  onChange={(e) => setCustomInterests(e.target.value)}
                  placeholder="Type interests separated by commas (e.g., hiking, cooking, reading)"
                  className="w-full bg-white/80 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 font-queensides"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomInterests()
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-purple-600 font-queensides">
                    Separate multiple interests with commas, then press Enter or click Add
                  </p>
                  <Button
                    type="button"
                    onClick={addCustomInterests}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-queensides px-4"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Custom Interests Pills - Only for manually entered interests */}
            {customInterestsPills.length > 0 && (
              <div className="mt-4">
                <Label className="font-queensides text-slate-700 mb-3 block">Your custom interests</Label>
                <div className="flex flex-wrap gap-2">
                  {customInterestsPills.map((interest) => (
                    <div
                      key={interest}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 rounded-xl text-sm font-queensides border border-indigo-200/60"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      {interest}
                      <button
                        onClick={() => removeCustomInterest(interest)}
                        className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Feedback */}
            {(settings.interests.length > 0 || customInterestsPills.length > 0) && (
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-indigo-700 font-queensides text-sm">
                  <strong>{settings.interests.length + customInterestsPills.length}</strong> interests selected. These help find better matches.
                </p>
              </div>
            )}
            <Button
              onClick={() => saveSection("Interests", {
                interests_preference: [...settings.interests, ...customInterestsPills],
              })}
              disabled={savingSection === "Interests"}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-queensides"
            >
              {savingSection === "Interests" ? "Saving..." : "Save Interests"}
            </Button>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold font-qurova">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-queensides">New matches</Label>
                <Switch
                  checked={settings.notifications.matches}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, matches: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-queensides">Messages</Label>
                <Switch
                  checked={settings.notifications.messages}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, messages: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-queensides">Profile views</Label>
                <Switch
                  checked={settings.notifications.profileViews}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, profileViews: checked },
                    }))
                  }
                />
              </div>
            </div>
            <Button
              onClick={() => saveSection("Notifications", {
                notifications_matches: settings.notifications.matches,
                notifications_messages: settings.notifications.messages,
                notifications_profile_views: settings.notifications.profileViews,
              })}
              disabled={savingSection === "Notifications"}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-queensides"
            >
              {savingSection === "Notifications" ? "Saving..." : "Save Notifications"}
            </Button>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold font-qurova">Privacy</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-queensides">Show my age</Label>
                <Switch
                  checked={settings.privacy.showAge}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showAge: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-queensides">Show my location</Label>
                <Switch
                  checked={settings.privacy.showLocation}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showLocation: checked },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-queensides">Show when I was last seen</Label>
                <Switch
                  checked={settings.privacy.showLastSeen}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, showLastSeen: checked },
                    }))
                  }
                />
              </div>
            </div>
            <Button
              onClick={() => saveSection("Privacy", {
                show_age: settings.privacy.showAge,
                show_location: settings.privacy.showLocation,
                show_last_seen: settings.privacy.showLastSeen,
              })}
              disabled={savingSection === "Privacy"}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-queensides"
            >
              {savingSection === "Privacy" ? "Saving..." : "Save Privacy"}
            </Button>
          </motion.div>
              <br/><br/><br/>
          {/* Removed old global save button - each section now has its own save */}
        </div>
        </div>
      </div>
    </div>
  )
}
