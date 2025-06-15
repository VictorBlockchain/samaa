"use client"

import React from "react"

import { useState } from "react"
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
} from "lucide-react"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { cn } from "@/lib/utils"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { useIsMobile } from "@/app/hooks/use-mobile"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"

interface ProfileData {
  // Basic Info
  firstName: string
  lastName: string
  age: string
  gender: string

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

  // Photos & Bio
  bio: string
  interests: string[]
  profilePhoto: File | null
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
    location: "",
    education: "",
    profession: "",
    religiosity: "",
    prayerFrequency: "",
    hijabPreference: "",
    marriageIntention: "",
    bio: "",
    interests: [],
    profilePhoto: null,
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

  const isMobile = useIsMobile()
  const [currentTab, setCurrentTab] = useState("home")

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const analyzeBio = (bio: string) => {
    const wordCount = bio.trim().split(/\s+/).length
    const sentences = bio.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
    const hasPersonalDetails = /\b(love|enjoy|passionate|dream|goal|value)\b/i.test(bio)
    const hasSpecifics = /\b(travel|cook|read|work|study|volunteer)\b/i.test(bio)

    let rating = 0
    let feedback = ""

    if (wordCount < 20) {
      rating = 2
      feedback = "Your bio is too short. Add more details about yourself!"
    } else if (wordCount < 50) {
      rating = 4
      feedback = "Good start! Add more about your values and interests."
    } else if (wordCount < 100) {
      rating = hasPersonalDetails && hasSpecifics ? 8 : 6
      feedback =
        hasPersonalDetails && hasSpecifics
          ? "Great bio! Very engaging and informative."
          : "Good length! Add more personal touches and specific interests."
    } else {
      rating = hasPersonalDetails && hasSpecifics ? 10 : 7
      feedback =
        hasPersonalDetails && hasSpecifics
          ? "Excellent bio! Perfect balance of personal and specific details."
          : "Good detail! Make sure to include personal values and specific interests."
    }

    setBioRating(rating)
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

  const handleSubmit = () => {
    // Save profile data associated with wallet address
    const profileWithWallet = {
      ...profileData,
      walletAddress: publicKey?.toString(),
      createdAt: new Date().toISOString(),
    }

    // In production, this would be saved to blockchain/IPFS
    localStorage.setItem(`profile_${publicKey?.toString()}`, JSON.stringify(profileWithWallet))

    // Redirect to profile page
    window.location.href = `/profile/${publicKey?.toString()}`
  }

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-4">Wallet Required</h2>
            <p className="text-slate-600 font-queensides">Please connect your wallet to set up your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      <CelestialBackground intensity="light" />

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <DesktopNavigation />
      </div>

      <div className={`py-8 px-4 pt-24`}>
        <div className="max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent font-qurova mb-2">
              Complete Your Profile
            </h1>
            <p className="text-slate-600 font-queensides">Let's create your Samaa profile to find your perfect match</p>

            {/* Wallet Address Display */}
            <div className="mt-4 p-3 bg-white/50 rounded-xl border border-indigo-200/50">
              <p className="text-xs text-slate-500 font-queensides mb-1">Connected Wallet</p>
              <code className="text-sm font-mono text-indigo-700">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </code>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-indigo-400 to-purple-500 border-indigo-400 text-white"
                        : "bg-white border-slate-300 text-slate-400",
                    )}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-16 h-0.5 mx-2 transition-all duration-300",
                        currentStep > step.id ? "bg-indigo-400" : "bg-slate-300",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <p key={step.id} className="text-xs text-slate-500 font-queensides w-20 text-center">
                  {step.title}
                </p>
              ))}
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
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="font-queensides">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => updateProfileData("firstName", e.target.value)}
                            className="mt-1"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="font-queensides">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => updateProfileData("lastName", e.target.value)}
                            className="mt-1"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age" className="font-queensides">
                            Age
                          </Label>
                          <Select value={profileData.age} onValueChange={(value) => updateProfileData("age", value)}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select age" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                                <SelectItem key={age} value={age.toString()}>
                                  {age}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="font-queensides">Gender</Label>
                          <RadioGroup
                            value={profileData.gender}
                            onValueChange={(value) => updateProfileData("gender", value)}
                            className="flex gap-6 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <Label htmlFor="male" className="font-queensides">
                                Male
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <Label htmlFor="female" className="font-queensides">
                                Female
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Location & Education */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location" className="font-queensides">
                          Location
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) => {
                              updateProfileData("location", e.target.value)
                              // Trigger location search suggestions
                              if (e.target.value.length > 2) {
                                searchLocations(e.target.value)
                              }
                            }}
                            className="flex-1"
                            placeholder="Start typing your city or address..."
                            list="location-suggestions"
                          />
                          <datalist id="location-suggestions">
                            {locationSuggestions.map((suggestion, index) => (
                              <option key={index} value={suggestion.display_name} />
                            ))}
                          </datalist>
                          <Button
                            type="button"
                            onClick={getUserLocation}
                            disabled={isGettingLocation}
                            variant="outline"
                            className="px-4 whitespace-nowrap"
                          >
                            {isGettingLocation ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                                Getting...
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 mr-2" />
                                Detect Location
                              </>
                            )}
                          </Button>
                        </div>
                        {locationData.latitude && locationData.longitude && (
                          <p className="text-xs text-green-600 mt-1 font-queensides">
                            ✓ Location captured: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                          </p>
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
                          {profileData.bio && (
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
                            if (e.target.value.length > 10) {
                              analyzeBio(e.target.value)
                            }
                          }}
                          className="mt-1 min-h-[150px] text-base leading-relaxed"
                          placeholder="Share your story... What makes you unique? What are your values? What do you love doing? What are you looking for in a partner? Be authentic and specific!"
                        />

                        {/* AI Rating Button - directly under textarea */}
                        {profileData.bio.length > 50 && !aiRatingComplete && (
                          <div className="mt-4">
                            <Button
                              onClick={() => {
                                setShowAiRating(true)
                                // Mock AI rating - in production this would call actual AI
                                setTimeout(() => {
                                  const mockRating = Math.floor(Math.random() * 30) + 70 // Random rating between 70-100
                                  setBioRating(mockRating)
                                  if (mockRating >= 80) {
                                    setBioFeedback(
                                      `Excellent bio! Your rating is ${mockRating}/100. You're ready to move forward.`,
                                    )
                                    setAiRatingComplete(true)
                                  } else {
                                    setBioFeedback(
                                      `Good start! Your rating is ${mockRating}/100. Try adding more personal details and specific interests to reach 80+.`,
                                    )
                                  }
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
                              bioRating >= 8
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : bioRating >= 6
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              <span className="font-medium">AI Feedback:</span>
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
                        <Label className="font-queensides text-lg mb-4 block">Select Your Interests</Label>
                        <p className="text-slate-600 font-queensides text-sm mb-4">
                          Choose interests that represent you. This helps us find compatible matches who share your
                          passions.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
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

                        {profileData.interests.length > 0 && (
                          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <p className="text-indigo-700 font-queensides text-sm">
                              <strong>{profileData.interests.length}</strong> interests selected. Great! This helps us
                              find better matches for you.
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
                        <Label className="font-queensides text-lg mb-4 block">Profile Photos</Label>
                        <p className="text-slate-600 font-queensides text-sm mb-4">
                          Upload 2-6 photos that show your personality. Include a clear face photo and photos of your
                          interests.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Main Profile Photo */}
                          <div className="col-span-2 p-6 border-2 border-dashed border-indigo-300 rounded-xl text-center">
                            <Camera className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                            <h3 className="font-medium text-slate-800 font-queensides mb-2">Main Profile Photo</h3>
                            <p className="text-sm text-slate-600 font-queensides mb-4">
                              A clear, modest photo of yourself. This will be your primary photo.
                            </p>
                            <Button variant="outline" className="font-queensides">
                              Choose Main Photo
                            </Button>
                          </div>

                          {/* Additional Photos */}
                          {[1, 2, 3, 4].map((index) => (
                            <div
                              key={index}
                              className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center"
                            >
                              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-500 font-queensides mb-2">Photo {index + 1}</p>
                              <Button variant="ghost" size="sm" className="font-queensides text-xs">
                                Add Photo
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Video Introduction */}
                      <div className="p-6 border-2 border-dashed border-purple-300 rounded-xl text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-purple-600 text-xl">🎥</span>
                        </div>
                        <h3 className="font-medium text-slate-800 font-queensides mb-2">
                          Video Introduction (Optional)
                        </h3>
                        <p className="text-sm text-slate-600 font-queensides mb-4">
                          Upload a short 30-60 second video introducing yourself. This helps potential matches get to
                          know your personality.
                        </p>
                        <Button variant="outline" className="font-queensides">
                          Upload Video
                        </Button>
                      </div>

                      {/* Voice Note */}
                      <div className="p-6 border-2 border-dashed border-green-300 rounded-xl text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-green-600 text-xl">🎤</span>
                        </div>
                        <h3 className="font-medium text-slate-800 font-queensides mb-2">
                          Voice Introduction (Optional)
                        </h3>
                        <p className="text-sm text-slate-600 font-queensides mb-4">
                          Record a voice note sharing something about yourself. Your voice adds a personal touch to your
                          profile.
                        </p>
                        <Button variant="outline" className="font-queensides">
                          Record Voice Note
                        </Button>
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
                        className="bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 font-queensides"
                      >
                        Complete Profile
                        <Check className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        disabled={currentStep === 4 && (!aiRatingComplete || bioRating < 80)}
                        className="bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 font-queensides disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentStep === 4 && (!aiRatingComplete || bioRating < 80) ? (
                          <>Need 80+ AI Rating to Continue</>
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

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />}
    </div>
  )
}
