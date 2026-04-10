"use client"

import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  User,
  GraduationCap,
  Briefcase,
  Moon,
  Settings,
  Save,
  Loader2,
  Check,
  X,
  Globe,
  Ruler,
  Search,
  Sparkles,
  Info,
  HelpCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/context/UserContext"
import { Button } from "@/components/ui/button"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { countries } from "@/data/countries"

// Memoized toggle button to prevent re-renders
const ToggleButton = memo(({ 
  option, 
  isSelected, 
  onToggle, 
  selectedClass,
  unselectedClass
}: { 
  option: string
  isSelected: boolean
  onToggle: () => void
  selectedClass: string
  unselectedClass: string
}) => (
  <button
    onClick={onToggle}
    className={`${isSelected ? selectedClass : unselectedClass} px-4 py-2.5 rounded-2xl font-queensides text-sm transition-all duration-300`}
  >
    {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
    {option}
  </button>
))
ToggleButton.displayName = 'ToggleButton'

// Memoized slider with helper tooltip
const ScoreSlider = memo(({ 
  label, 
  value, 
  onChange, 
  tooltipTitle, 
  tooltipText 
}: {
  label: string
  value: number
  onChange: (value: number) => void
  tooltipTitle: string
  tooltipText: string
}) => (
  <div>
    <div className="flex items-start justify-between mb-3">
      <label className="text-sm font-semibold text-slate-700 font-queensides flex items-center gap-2">
        {label} <span className="text-pink-500">{value}%</span>
      </label>
      <div className="group relative">
        <HelpCircle className="w-4 h-4 text-slate-400 hover:text-pink-500 transition-colors cursor-help" />
        <div className="absolute right-0 top-6 w-56 p-3 bg-white rounded-xl shadow-xl border border-pink-100/50 text-xs text-slate-600 font-queensides opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <strong className="text-pink-600">{tooltipTitle}</strong>
          <p className="mt-1">{tooltipText}</p>
        </div>
      </div>
    </div>
    <div className="relative">
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        min="0"
        max="100"
      />
    </div>
    <div className="flex justify-between text-xs text-slate-400 font-queensides mt-1">
      <span>0%</span>
      <span>100%</span>
    </div>
  </div>
))
ScoreSlider.displayName = 'ScoreSlider'

// Section gradients
const SECTION_GRADIENTS: Record<string, string> = {
  pink: "from-pink-400 via-rose-400 to-pink-500",
  purple: "from-purple-400 via-pink-400 to-rose-400",
  blue: "from-blue-400 via-cyan-400 to-teal-400",
  indigo: "from-indigo-400 via-blue-400 to-purple-400",
  emerald: "from-emerald-400 via-teal-400 to-cyan-400",
  amber: "from-amber-400 via-orange-400 to-rose-400",
  rose: "from-rose-400 via-pink-400 to-purple-400",
}

const SECTION_BG_GRADIENTS: Record<string, string> = {
  pink: "from-pink-50 via-white to-rose-50",
  purple: "from-purple-50 via-white to-pink-50",
  blue: "from-blue-50 via-white to-cyan-50",
  indigo: "from-indigo-50 via-white to-blue-50",
  emerald: "from-emerald-50 via-white to-teal-50",
  amber: "from-amber-50 via-white to-orange-50",
  rose: "from-rose-50 via-white to-pink-50",
}

// Memoized Section Card
const SectionCard = memo(({ 
  icon: Icon, 
  title, 
  color = "pink", 
  children,
  sectionKey,
  saveData,
  onSave,
  isSaving
}: { 
  icon: any
  title: string
  color?: string
  children: React.ReactNode
  sectionKey: string
  saveData: Record<string, any>
  onSave: (section: string, data: Record<string, any>) => void
  isSaving: boolean
}) => {
  const gradient = SECTION_GRADIENTS[color] || SECTION_GRADIENTS.pink
  const bgGradient = SECTION_BG_GRADIENTS[color] || SECTION_BG_GRADIENTS.pink

  return (
    <div className="relative overflow-hidden rounded-3xl border border-pink-100/50 shadow-xl">
      {/* Card background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-80`} />
      
      {/* Glass overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/40" />
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="relative overflow-hidden">
          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <pattern
                id={`islamic-pattern-${sectionKey}`}
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="1" fill="currentColor" />
                <path d="M5 10 L10 5 L15 10 L10 15 Z" fill="currentColor" opacity="0.3" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#islamic-pattern-${sectionKey})`} />
            </svg>
          </div>
          
          <div className={`bg-gradient-to-r ${gradient} px-6 py-5`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white font-queensides tracking-wide">
                {title}
              </h2>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Footer with Save Button */}
        <div className="px-6 pb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent mb-4" />
          <div className="flex justify-end">
            <button
              onClick={() => onSave(sectionKey, saveData)}
              disabled={isSaving}
              className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 font-queensides flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  <span className="relative z-10">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Save Changes</span>
                </>
              )}
              
              {/* Bottom glow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-pink-400/30 rounded-full blur-md" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
SectionCard.displayName = 'SectionCard'

interface MatchPreferences {
  // Basic Requirements
  ageRangeMin: number
  ageRangeMax: number
  minProfileRating: number
  minChatRating: number
  
  // Distance & Location
  maxDistance: number
  anywhereInWorld: boolean
  preferredNationality: string[]
  
  // Personal Status
  preferredMaritalStatus: string[]
  hasChildren: string | null
  wantChildren: string | null
  willingToRelocate: string | null
  heightMin: number | null
  
  // Islamic Values
  preferredReligiosity: string[]
  prayerFrequency: string | null
  sect: string | null
  isRevert: string | null
  alcohol: string | null
  smoking: string | null
  psychedelics: string | null
  halalFood: string | null
  
  // Education & Career
  preferredEducation: string[]
  preferredOccupation: string[]
  
  // Finance & Lifestyle
  financeStyle: string[]
  diningFrequency: string | null
  travelFrequency: string | null
  shoppingFrequency: string | null
  selfCareFrequency: string | null
  selfCareBudget: string | null
}

export function ProfileMatchPreferences({ onBack }: { onBack?: () => void }) {
  const router = useRouter()
  const { userId, isAuthenticated } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<MatchPreferences>({
    ageRangeMin: 18,
    ageRangeMax: 40,
    minProfileRating: 0,
    minChatRating: 0,
    maxDistance: 50,
    anywhereInWorld: false,
    preferredNationality: [],
    preferredMaritalStatus: [],
    hasChildren: null,
    wantChildren: null,
    willingToRelocate: null,
    heightMin: null,
    preferredReligiosity: [],
    prayerFrequency: null,
    sect: null,
    isRevert: null,
    alcohol: null,
    smoking: null,
    psychedelics: null,
    halalFood: null,
    preferredEducation: [],
    preferredOccupation: [],
    financeStyle: [],
    diningFrequency: null,
    travelFrequency: null,
    shoppingFrequency: null,
    selfCareFrequency: null,
    selfCareBudget: null,
  })

  // Nationality autocomplete state
  const [nationalitySearch, setNationalitySearch] = useState("")
  const [nationalitySuggestions, setNationalitySuggestions] = useState<string[]>([])
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false)
  
  // Track if user is actively dragging sliders (for smooth UX)
  const [isDraggingSlider, setIsDraggingSlider] = useState<string | null>(null)
  const sliderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Debounced nationality search
  const nationalitySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load preferences from database
  useEffect(() => {
    if (!userId) return

    const loadPreferences = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle()

        if (error) {
          console.error("Error loading preferences:", error)
          return
        }

        if (data) {
          setPreferences({
            ageRangeMin: data.age_range_min || 18,
            ageRangeMax: data.age_range_max || 40,
            minProfileRating: data.min_profile_rating || 0,
            minChatRating: data.min_chat_rating || 0,
            maxDistance: data.max_distance || 50,
            anywhereInWorld: data.anywhere_in_world || false,
            preferredNationality: Array.isArray(data.preferred_nationality) ? data.preferred_nationality : [],
            preferredMaritalStatus: Array.isArray(data.preferred_marital_status) ? data.preferred_marital_status : [],
            hasChildren: data.has_children_preference || null,
            wantChildren: data.want_children_preference || null,
            willingToRelocate: data.willing_to_relocate || null,
            heightMin: data.height_min || null,
            preferredReligiosity: Array.isArray(data.preferred_religiosity) ? data.preferred_religiosity : [],
            prayerFrequency: data.prayer_frequency_preference || null,
            sect: data.sect_preference || null,
            isRevert: data.is_revert_preference || null,
            alcohol: data.alcohol_preference || null,
            smoking: data.smoking_preference || null,
            psychedelics: data.psychedelics_preference || null,
            halalFood: data.halal_food_preference || null,
            preferredEducation: Array.isArray(data.preferred_education) ? data.preferred_education : [],
            preferredOccupation: Array.isArray(data.occupation_preference) ? data.occupation_preference : [],
            financeStyle: Array.isArray(data.finance_style_preference) ? data.finance_style_preference : [],
            diningFrequency: data.dining_frequency_preference || null,
            travelFrequency: data.travel_frequency_preference || null,
            shoppingFrequency: data.shopping_frequency_preference || null,
            selfCareFrequency: data.self_care_frequency_preference || null,
            selfCareBudget: data.self_care_budget_preference || null,
          })
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [userId])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (sliderTimeoutRef.current) {
        clearTimeout(sliderTimeoutRef.current)
      }
      if (nationalitySearchTimeoutRef.current) {
        clearTimeout(nationalitySearchTimeoutRef.current)
      }
    }
  }, [])

  // Save specific section
  const saveSection = async (section: string, data: Partial<MatchPreferences>) => {
    if (!userId) return

    setSavingSection(section)
    try {
      // Map camelCase field names to snake_case database columns
      const dbData: Record<string, any> = { user_id: userId }
      
      // Map each field to its database column name
      if ('ageRangeMin' in data) dbData.age_range_min = data.ageRangeMin
      if ('ageRangeMax' in data) dbData.age_range_max = data.ageRangeMax
      if ('minProfileRating' in data) dbData.min_profile_rating = data.minProfileRating
      if ('minChatRating' in data) dbData.min_chat_rating = data.minChatRating
      if ('maxDistance' in data) dbData.max_distance = data.maxDistance
      if ('anywhereInWorld' in data) dbData.anywhere_in_world = data.anywhereInWorld
      if ('preferredNationality' in data) dbData.preferred_nationality = data.preferredNationality
      if ('preferredMaritalStatus' in data) dbData.preferred_marital_status = data.preferredMaritalStatus
      if ('hasChildren' in data) dbData.has_children_preference = data.hasChildren
      if ('wantChildren' in data) dbData.want_children_preference = data.wantChildren
      if ('willingToRelocate' in data) dbData.willing_to_relocate = data.willingToRelocate
      if ('heightMin' in data) dbData.height_min = data.heightMin
      if ('heightMax' in data) dbData.height_max = data.heightMax
      if ('preferredReligiosity' in data) dbData.preferred_religiosity = data.preferredReligiosity
      if ('prayerFrequency' in data) dbData.prayer_frequency_preference = data.prayerFrequency
      if ('sect' in data) dbData.sect_preference = data.sect
      if ('isRevert' in data) dbData.is_revert_preference = data.isRevert
      if ('education' in data) dbData.education_preference = data.education
      if ('occupation' in data) dbData.occupation_preference = data.occupation
      if ('preferredEthnicity' in data) dbData.preferred_ethnicity = data.preferredEthnicity
      if ('preferredSkinTone' in data) dbData.preferred_skin_tone = data.preferredSkinTone
      if ('smoking' in data) dbData.smoking_preference = data.smoking
      
      const { error } = await supabase
        .from("user_settings")
        .upsert(dbData, {
          onConflict: "user_id"
        })

      if (error) throw error
      
      // Show success toast
      toast({
        title: "Preferences saved",
        description: `Your ${section} preferences have been updated successfully.`,
        duration: 3000,
      })
    } catch (error: any) {
      console.error(`Error saving ${section}:`, error)
      
      // Show error toast
      toast({
        title: "Failed to save",
        description: error.message || `Could not save ${section} preferences. Please try again.`,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSavingSection(null)
    }
  }

  // Nationality autocomplete handlers - debounced for smooth typing
  const handleNationalitySearch = useCallback((value: string) => {
    setNationalitySearch(value)
    
    // Clear previous timeout
    if (nationalitySearchTimeoutRef.current) {
      clearTimeout(nationalitySearchTimeoutRef.current)
    }
    
    // Debounce the suggestions update
    nationalitySearchTimeoutRef.current = setTimeout(() => {
      if (value.length > 0) {
        const filtered = countries
          .filter((country: string) => 
            country.toLowerCase().includes(value.toLowerCase()) &&
            !preferences.preferredNationality.includes(country)
          )
          .slice(0, 8)
        setNationalitySuggestions(filtered)
        setShowNationalityDropdown(true)
      } else {
        setNationalitySuggestions([])
        setShowNationalityDropdown(false)
      }
    }, 150) // 150ms debounce
  }, [preferences.preferredNationality])
  
  // Slider change handlers - update local state only while dragging
  const handleSliderChange = (field: keyof MatchPreferences, value: number) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
    setIsDraggingSlider(field)
    
    // Clear any existing timeout
    if (sliderTimeoutRef.current) {
      clearTimeout(sliderTimeoutRef.current)
    }
    
    // Set a timeout to mark dragging as complete after user stops
    sliderTimeoutRef.current = setTimeout(() => {
      setIsDraggingSlider(null)
    }, 300)
  }
  
  // Toggle helper for array fields - prevents scroll jumps with functional updates
  const toggleArrayValue = useCallback((field: keyof MatchPreferences, value: string) => {
    setPreferences(prev => {
      const currentArray = prev[field] as string[]
      const updated = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value]
      return { ...prev, [field]: updated }
    })
  }, [])

  const addNationality = useCallback((country: string) => {
    setPreferences(prev => {
      if (prev.preferredNationality.includes(country)) return prev
      return { ...prev, preferredNationality: [...prev.preferredNationality, country] }
    })
    setNationalitySearch("")
    setNationalitySuggestions([])
    setShowNationalityDropdown(false)
  }, [])

  const removeNationality = useCallback((country: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredNationality: prev.preferredNationality.filter(n => n !== country)
    }))
  }, [])

  // Stable save handler
  const handleSave = useCallback((section: string, data: Record<string, any>) => {
    saveSection(section, data)
  }, [saveSection])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center"
        >
          <Heart className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <CelestialBackground className="fixed inset-0" intensity="light" />
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <motion.button
            whileHover={{ x: -4 }}
            onClick={onBack || (() => router.back())}
            className="flex items-center gap-2 text-slate-600 hover:text-pink-600 font-queensides transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
            <span>Back to Profile</span>
          </motion.button>

          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500 rounded-3xl mb-6 shadow-xl"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            
            <h1 className="text-4xl font-bold gradient-text font-display mb-3">
              My Match Preferences
            </h1>
            <p className="text-slate-600 font-queensides text-lg">
              Tell us what you're looking for in a partner
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent rounded-full mx-auto mt-6 max-w-md" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Requirements */}
          <SectionCard 
            icon={Settings} 
            title="Basic Requirements" 
            color="pink"
            sectionKey="basic"
            saveData={{
              ageRangeMin: preferences.ageRangeMin,
              ageRangeMax: preferences.ageRangeMax,
              minProfileRating: preferences.minProfileRating,
              minChatRating: preferences.minChatRating,
            }}
            onSave={handleSave}
            isSaving={savingSection === "basic"}
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    value={preferences.ageRangeMin}
                    onChange={(e) => setPreferences(prev => ({ ...prev, ageRangeMin: parseInt(e.target.value) || 18 }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-pink-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400 font-queensides transition-all duration-300"
                    min="18"
                    max={preferences.ageRangeMax}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Maximum Age
                  </label>
                  <input
                    type="number"
                    value={preferences.ageRangeMax}
                    onChange={(e) => setPreferences(prev => ({ ...prev, ageRangeMax: parseInt(e.target.value) || 40 }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-pink-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400 font-queensides transition-all duration-300"
                    min={preferences.ageRangeMin}
                    max="100"
                  />
                </div>
              </div>

              <ScoreSlider 
                label="Minimum Profile Score:"
                value={preferences.minProfileRating}
                onChange={(v) => setPreferences(prev => ({ ...prev, minProfileRating: v }))}
                tooltipTitle="Profile Completeness Score"
                tooltipText="Filter by how complete a user's profile is (photos, bio, interests, etc.). Higher scores indicate more detailed profiles."
              />

              <ScoreSlider 
                label="Minimum Chat Rating:"
                value={preferences.minChatRating}
                onChange={(v) => setPreferences(prev => ({ ...prev, minChatRating: v }))}
                tooltipTitle="Response Score"
                tooltipText="Filter by how responsive users are to messages. Higher scores indicate faster and more consistent message replies."
              />
            </div>
          </SectionCard>

          {/* Distance & Location */}
          <SectionCard 
            icon={MapPin} 
            title="Distance & Location" 
            color="purple"
            sectionKey="distance"
            saveData={{
              maxDistance: preferences.maxDistance,
              anywhereInWorld: preferences.anywhereInWorld,
              preferredNationality: preferences.preferredNationality,
            }}
            onSave={handleSave}
            isSaving={savingSection === "distance"}
          >
            <div className="space-y-6">
              <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100/50 cursor-pointer group hover:bg-purple-100/50 transition-colors">
                <input
                  type="checkbox"
                  id="anywhereInWorld"
                  checked={preferences.anywhereInWorld}
                  onChange={(e) => setPreferences(prev => ({ ...prev, anywhereInWorld: e.target.checked }))}
                  className="w-5 h-5 text-purple-500 border-purple-300 rounded focus:ring-purple-400/30 accent-purple-500"
                />
                <span className="text-sm font-semibold text-slate-700 font-queensides group-hover:text-purple-700 transition-colors">
                  Search anywhere in the world
                </span>
                <Globe className="w-4 h-4 text-purple-400 ml-auto" />
              </label>

              {!preferences.anywhereInWorld && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Maximum Distance: <span className="text-purple-500">{preferences.maxDistance}</span> miles
                  </label>
                  <input
                    type="number"
                    value={preferences.maxDistance}
                    onChange={(e) => setPreferences(prev => ({ ...prev, maxDistance: parseInt(e.target.value) || 50 }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 font-queensides transition-all duration-300"
                    min="1"
                    max="1000"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                  <Globe className="w-4 h-4 inline mr-2 text-purple-500" />
                  Preferred Nationalities
                </label>
                
                {/* Selected nationalities */}
                {preferences.preferredNationality.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {preferences.preferredNationality.map((country) => (
                      <div
                        key={country}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-2xl font-queensides text-sm border border-purple-200/50"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{country}</span>
                        <button
                          onClick={() => removeNationality(country)}
                          className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                  <input
                    type="text"
                    value={nationalitySearch}
                    onChange={(e) => handleNationalitySearch(e.target.value)}
                    onFocus={() => {
                      if (nationalitySearch.length > 0) {
                        setShowNationalityDropdown(true)
                      }
                    }}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 font-queensides transition-all duration-300"
                    placeholder="Search countries..."
                  />
                  
                  {/* Autocomplete dropdown */}
                  {showNationalityDropdown && nationalitySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-purple-200/50 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                      {nationalitySuggestions.map((country) => (
                        <button
                          key={country}
                          onClick={() => addNationality(country)}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors font-queensides text-sm text-slate-700 border-b border-purple-100/50 last:border-b-0 flex items-center gap-3"
                        >
                          <Globe className="w-4 h-4 text-purple-400" />
                          {country}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Personal Status */}
          <SectionCard 
            icon={User} 
            title="Personal Status" 
            color="blue"
            sectionKey="personal"
            saveData={{
              preferredMaritalStatus: preferences.preferredMaritalStatus,
              hasChildren: preferences.hasChildren,
              wantChildren: preferences.wantChildren,
              willingToRelocate: preferences.willingToRelocate,
              heightMin: preferences.heightMin,
            }}
            onSave={handleSave}
            isSaving={savingSection === "personal"}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                  Marital Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Single", "Divorced", "Widowed"].map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArrayValue("preferredMaritalStatus", option)}
                      className={`px-4 py-2.5 rounded-2xl font-queensides text-sm transition-all duration-300 ${
                        preferences.preferredMaritalStatus.includes(option)
                          ? "bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-white shadow-lg border border-white/20"
                          : "bg-blue-50/80 text-blue-700 border border-blue-200/60 hover:bg-blue-100 hover:border-blue-300"
                      }`}
                    >
                      {preferences.preferredMaritalStatus.includes(option) && (
                        <Check className="w-3.5 h-3.5 inline mr-1" />
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Has Children
                  </label>
                  <select
                    value={preferences.hasChildren || ""}
                    onChange={(e) => setPreferences(prev => ({ ...prev, hasChildren: e.target.value || null }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 font-queensides transition-all duration-300 appearance-none"
                  >
                    <option value="">No Preference</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Wants Children
                  </label>
                  <select
                    value={preferences.wantChildren || ""}
                    onChange={(e) => setPreferences(prev => ({ ...prev, wantChildren: e.target.value || null }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 font-queensides transition-all duration-300 appearance-none"
                  >
                    <option value="">No Preference</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Willing to Relocate
                  </label>
                  <select
                    value={preferences.willingToRelocate || ""}
                    onChange={(e) => setPreferences(prev => ({ ...prev, willingToRelocate: e.target.value || null }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 font-queensides transition-all duration-300 appearance-none"
                  >
                    <option value="">No Preference</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    <Ruler className="w-4 h-4 inline mr-2 text-blue-500" />
                    Minimum Height (cm)
                  </label>
                  <input
                    type="number"
                    value={preferences.heightMin || ""}
                    onChange={(e) => setPreferences(prev => ({ ...prev, heightMin: parseInt(e.target.value) || null }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 font-queensides transition-all duration-300"
                    placeholder="e.g., 160"
                    min="100"
                    max="250"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Islamic Values */}
          <SectionCard 
            icon={Moon} 
            title="Islamic Values" 
            color="indigo"
            sectionKey="islamic"
            saveData={{
              preferredReligiosity: preferences.preferredReligiosity,
              prayerFrequency: preferences.prayerFrequency,
              sect: preferences.sect,
              isRevert: preferences.isRevert,
              alcohol: preferences.alcohol,
              smoking: preferences.smoking,
              psychedelics: preferences.psychedelics,
              halalFood: preferences.halalFood,
            }}
            onSave={handleSave}
            isSaving={savingSection === "islamic"}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                  Religiosity Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Very Practicing", "Moderately Practicing", "Somewhat Practicing", "Not Practicing"].map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArrayValue("preferredReligiosity", option)}
                      className={`px-4 py-2.5 rounded-2xl font-queensides text-sm transition-all duration-300 ${
                        preferences.preferredReligiosity.includes(option)
                          ? "bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 text-white shadow-lg border border-white/20"
                          : "bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100 hover:border-indigo-300"
                      }`}
                    >
                      {preferences.preferredReligiosity.includes(option) && (
                        <Check className="w-3.5 h-3.5 inline mr-1" />
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Prayer Frequency
                  </label>
                  <select
                    value={preferences.prayerFrequency || ""}
                    onChange={(e) => setPreferences(prev => ({ ...prev, prayerFrequency: e.target.value || null }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-indigo-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 font-queensides transition-all duration-300 appearance-none"
                  >
                    <option value="">No Preference</option>
                    <option value="all_5">All 5 Prayers</option>
                    <option value="most">Most Prayers</option>
                    <option value="friday">Friday Only</option>
                    <option value="rarely">Rarely</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                    Sect
                  </label>
                  <select
                    value={preferences.sect || ""}
                    onChange={(e) => setPreferences(prev => ({ ...prev, sect: e.target.value || null }))}
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-indigo-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 font-queensides transition-all duration-300 appearance-none"
                  >
                    <option value="">No Preference</option>
                    <option value="sunni">Sunni</option>
                    <option value="shia">Shia</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Education & Career */}
          <SectionCard 
            icon={GraduationCap} 
            title="Education & Career" 
            color="emerald"
            sectionKey="education"
            saveData={{
              preferredEducation: preferences.preferredEducation,
              preferredOccupation: preferences.preferredOccupation,
            }}
            onSave={handleSave}
            isSaving={savingSection === "education"}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                  Education Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {["High School", "College", "Bachelor's", "Master's", "PhD", "Other"].map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArrayValue("preferredEducation", option)}
                      className={`px-4 py-2.5 rounded-2xl font-queensides text-sm transition-all duration-300 ${
                        preferences.preferredEducation.includes(option)
                          ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-white shadow-lg border border-white/20"
                          : "bg-emerald-50/80 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 hover:border-emerald-300"
                      }`}
                    >
                      {preferences.preferredEducation.includes(option) && (
                        <Check className="w-3.5 h-3.5 inline mr-1" />
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 font-queensides mb-3">
                  Occupation
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Employed", "Self-Employed", "Student", "Homemaker", "Retired", "Other"].map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArrayValue("preferredOccupation", option)}
                      className={`px-4 py-2.5 rounded-2xl font-queensides text-sm transition-all duration-300 ${
                        preferences.preferredOccupation.includes(option)
                          ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-white shadow-lg border border-white/20"
                          : "bg-emerald-50/80 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 hover:border-emerald-300"
                      }`}
                    >
                      {preferences.preferredOccupation.includes(option) && (
                        <Check className="w-3.5 h-3.5 inline mr-1" />
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
          <br/> <br/> <br/> <br/>
        </div>
      </div>
    </div>
  )
}
