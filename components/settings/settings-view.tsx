"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Heart, Users, Bell, Shield, BookOpen, User, Target, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CelestialBackground } from "@/components/ui/celestial-background"

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

export function SettingsView() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const [customInterests, setCustomInterests] = useState("")
  const [settings, setSettings] = useState({
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
    userGender: "female", // This should come from user profile
    requireFinancialSetup: false,
    bioRatingMinimum: 70,
    responseRateMinimum: 50,
  })



  // Add custom interests
  const addCustomInterests = () => {
    if (customInterests.trim()) {
      const newInterests = customInterests
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest && !settings.interests.includes(interest))

      if (newInterests.length > 0) {
        setSettings(prev => ({
          ...prev,
          interests: [...prev.interests, ...newInterests]
        }))
        setCustomInterests("")
      }
    }
  }

  // Load settings and user profile data
  useEffect(() => {
    // First load saved settings
    const savedSettings = localStorage.getItem("userSettings")
    console.log("Loading saved settings:", savedSettings) // Debug log
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      console.log("Parsed saved settings:", parsedSettings) // Debug log
      setSettings(parsedSettings)
    }

    // Then get user gender from profile using wallet address
    if (publicKey) {
      const userProfile = localStorage.getItem(`profile_${publicKey.toString()}`)
      if (userProfile) {
        const profile = JSON.parse(userProfile)
        console.log("Loaded profile:", profile) // Debug log
        console.log("Profile gender:", profile.gender) // Debug log
        setSettings(prev => ({ ...prev, userGender: profile.gender || "female" }))
      }
    }
  }, [publicKey])

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
          </motion.div>

          {/* Financial Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Wallet className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold font-qurova text-amber-700">Financial Requirements</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-queensides font-semibold text-slate-800">
                    {settings.userGender === "male"
                      ? "Require Purse Setup"
                      : "Require Dowry Wallet"}
                  </Label>
                  <p className="text-xs text-slate-600 font-queensides mt-1">
                    {settings.userGender === "male"
                      ? "Only show women who have set up a purse for receiving dowry"
                      : "Only show men who have set up a dowry wallet for Islamic marriage traditions"}
                  </p>
                </div>
                <Switch
                  checked={settings.requireFinancialSetup || false}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, requireFinancialSetup: checked }))}
                />
              </div>

              {settings.requireFinancialSetup && (
                <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">💰</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 font-qurova mb-1">
                        {settings.userGender === "male" ? "Purse Requirement Active" : "Dowry Requirement Active"}
                      </p>
                      <p className="text-sm text-amber-700 font-queensides">
                        {settings.userGender === "male"
                          ? "You'll only see women who have set up a purse wallet to receive dowry payments according to Islamic customs. This ensures both parties are prepared for traditional Islamic marriage financial arrangements."
                          : "You'll only see men who have set up a dowry wallet to provide mahr according to Islamic marriage traditions. This ensures your potential matches are financially prepared for Islamic marriage customs."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bio & Response Quality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold font-qurova text-emerald-700">Profile Quality</h3>
            </div>
            <div className="space-y-6">
              {/* Bio Rating Requirement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-queensides text-slate-700">Minimum Bio Rating</Label>
                  <span className="text-sm font-semibold text-emerald-600">{settings.bioRatingMinimum}%+</span>
                </div>
                <Slider
                  value={[settings.bioRatingMinimum]}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, bioRatingMinimum: value[0] }))}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">Only show matches with well-written, complete profiles</p>
              </div>

              {/* Response Rate Requirement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-queensides text-slate-700">Minimum Response Rate</Label>
                  <span className="text-sm font-semibold text-emerald-600">{settings.responseRateMinimum}%+</span>
                </div>
                <Slider
                  value={[settings.responseRateMinimum]}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, responseRateMinimum: value[0] }))}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">Only show matches who actively respond to messages</p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/30">
                <p className="text-sm text-emerald-700 font-queensides">
                  These filters help you find more engaged and serious matches with quality profiles.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Faith & Practice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold font-qurova text-amber-700">Faith & Practice</h3>
            </div>
            <div className="space-y-1">
              <FilterSelect
                label="Prayer frequency"
                value={settings.faithAndPractice.prayerFrequency}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, prayerFrequency: value },
                  }))
                }
                options={["No preference", "Five times daily", "Regularly", "Sometimes", "Learning to pray"]}
              />
              {settings.userGender === "male" && (
                <FilterSelect
                  label="Hijab preference"
                  value={settings.faithAndPractice.hijabPreference}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      faithAndPractice: { ...prev.faithAndPractice, hijabPreference: value },
                    }))
                  }
                  options={["No preference", "Always wear hijab", "Sometimes", "Planning to wear", "Never"]}
                />
              )}
              <FilterSelect
                label="Marriage intention"
                value={settings.faithAndPractice.marriageIntention}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, marriageIntention: value },
                  }))
                }
                options={["No preference", "Ready to marry soon", "Within a year", "In the future"]}
              />
              <FilterSelect
                label="Halal food"
                value={settings.faithAndPractice.halalFood}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, halalFood: value },
                  }))
                }
                options={["No preference", "Always halal", "Mostly halal", "Sometimes"]}
              />
              <FilterSelect
                label="Diet"
                value={settings.faithAndPractice.diet}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, diet: value },
                  }))
                }
                options={["No preference", "Halal only", "Mostly halal", "Kosher", "Vegetarian", "Vegan", "Other"]}
              />
              <FilterSelect
                label="Alcohol"
                value={settings.faithAndPractice.alcohol}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, alcohol: value },
                  }))
                }
                options={["No preference", "Never", "Rarely", "Socially", "Regularly"]}
              />
              <FilterSelect
                label="Smoking"
                value={settings.faithAndPractice.smoking}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, smoking: value },
                  }))
                }
                options={["No preference", "Never", "Rarely", "Socially", "Regularly"]}
              />
              <FilterSelect
                label="Psychedelics"
                value={settings.faithAndPractice.psychedelics}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, psychedelics: value },
                  }))
                }
                options={["No preference", "Never", "Rarely", "Socially", "Regularly"]}
              />
              <FilterSelect
                label="Born Muslim"
                value={settings.faithAndPractice.bornMuslim}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, bornMuslim: value },
                  }))
                }
                options={["No preference", "Yes", "No - converted"]}
              />
            </div>
          </motion.div>

          {/* About Them */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold font-qurova text-amber-700">About them</h3>
            </div>
            <div className="space-y-1">
              <FilterSelect
                label="Nationality"
                value={settings.aboutThem.nationality}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, nationality: value },
                  }))
                }
                options={[
                  "No preference",
                  "Same as mine",
                  "American",
                  "British",
                  "Canadian",
                  "Pakistani",
                  "Indian",
                  "Turkish",
                  "Egyptian",
                  "Other",
                ]}
              />
              <FilterSelect
                label="Height"
                value={settings.aboutThem.height}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, height: value },
                  }))
                }
                options={[
                  "No preference",
                  "Under 5'0\"",
                  "5'0\" - 5'4\"",
                  "5'5\" - 5'9\"",
                  "5'10\" - 6'2\"",
                  "Over 6'2\"",
                ]}
              />
              <FilterSelect
                label="Marital status"
                value={settings.aboutThem.maritalStatus}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, maritalStatus: value },
                  }))
                }
                options={["No preference", "Never married", "Divorced", "Widowed"]}
              />
              <FilterSelect
                label="Children"
                value={settings.aboutThem.children}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, children: value },
                  }))
                }
                options={["No preference", "No children", "Has children", "Wants children", "Doesn't want children"]}
              />
              <FilterSelect
                label="Grew up in"
                value={settings.aboutThem.grewUpIn}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, grewUpIn: value },
                  }))
                }
                options={["No preference", "Same country", "Western country", "Muslim-majority country", "Other"]}
              />
              <FilterSelect
                label="Languages"
                value={settings.aboutThem.languages}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, languages: value },
                  }))
                }
                options={["No preference", "English", "Arabic", "Urdu", "Turkish", "French", "Spanish", "Other"]}
              />
              <FilterSelect
                label="Willing to relocate"
                value={settings.aboutThem.willingToRelocate || "No preference"}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, willingToRelocate: value },
                  }))
                }
                options={[
                  "No preference",
                  "Yes",
                  "No",
                  "For the right person",
                  "Within same country",
                  "Internationally",
                ]}
              />
              <FilterSelect
                label="Education"
                value={settings.aboutThem.education}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, education: value },
                  }))
                }
                options={[
                  "No preference",
                  "High school",
                  "Some college",
                  "Bachelor's degree",
                  "Master's degree",
                  "PhD",
                  "Trade school",
                ]}
              />

            </div>
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

            {/* Progress Feedback */}
            {settings.interests.length > 0 && (
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-indigo-700 font-queensides text-sm">
                  <strong>{settings.interests.length}</strong> interests selected. These help find better matches.
                </p>
              </div>
            )}
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
          </motion.div>

          {/* Save Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 }}>
            <Button
              onClick={() => {
                console.log("Saving settings:", settings) // Debug log
                localStorage.setItem("userSettings", JSON.stringify(settings))
                console.log("Settings saved to localStorage") // Debug log
                router.back()
              }}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl font-queensides mb-12"
            >
              Save Settings
            </Button>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  )
}
