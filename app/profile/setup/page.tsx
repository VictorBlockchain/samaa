"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, User, Camera, Heart, Search, MapPin, Calendar, Briefcase, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CelestialBackground } from "@/components/ui/celestial-background"

interface ProfileData {
  basicInfo: {
    name: string
    age: string
    location: string
    bio: string
  }
  photos: string[]
  interests: string[]
  preferences: {
    ageRange: { min: number; max: number }
    maxDistance: number
    education: string[]
    occupation: string[]
  }
}

export default function ProfileSetupPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [profileData, setProfileData] = useState<ProfileData>({
    basicInfo: {
      name: "",
      age: "",
      location: "",
      bio: ""
    },
    photos: [],
    interests: [],
    preferences: {
      ageRange: { min: 22, max: 35 },
      maxDistance: 50,
      education: [],
      occupation: []
    }
  })

  const router = useRouter()
  const { connected, publicKey } = useWallet()

  const steps = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "photos", label: "Photos", icon: Camera },
    { id: "interests", label: "Interests", icon: Heart },
    { id: "preferences", label: "Preferences", icon: Search },
  ]

  const handleBasicInfoChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }))
  }

  const saveProfileData = () => {
    // Save to JSON file (mock implementation)
    const profileWithId = {
      id: `user_${Date.now()}`,
      walletAddress: publicKey?.toString(),
      ...profileData,
      createdAt: new Date().toISOString(),
      isVerified: false,
      bioRating: 0
    }
    
    console.log("Saving profile data:", profileWithId)
    // In real implementation, this would save to our JSON file or database
    localStorage.setItem('userProfile', JSON.stringify(profileWithId))
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      saveProfileData()
      router.push('/') // Redirect to home after completion
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header - Same style as explore page */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={handleBack} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Profile Setup</h1>
              <p className="text-sm text-slate-600 font-queensides">Step {activeStep + 1} of {steps.length}</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Progress Steps */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20 w-full">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    activeStep === index
                      ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                      : index < activeStep
                      ? "bg-gradient-to-br from-green-400/20 to-emerald-400/20 border border-green-300/40"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    <step.icon className="w-6 h-6 mx-auto" />
                  </div>
                  <div className="text-xs font-queensides font-bold text-slate-700 leading-tight">
                    {step.label}
                  </div>
                  {activeStep === index && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                  )}
                  {index < activeStep && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
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
                    <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-2">Basic Information</h2>
                    <p className="text-slate-600 font-queensides">Tell us about yourself</p>
                  </div>

                  {/* Single Column Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.basicInfo.name}
                        onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Age
                      </label>
                      <input
                        type="number"
                        value={profileData.basicInfo.age}
                        onChange={(e) => handleBasicInfoChange('age', e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="Enter your age"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.basicInfo.location}
                        onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides"
                        placeholder="City, State, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 font-queensides mb-2">
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        Bio
                      </label>
                      <textarea
                        value={profileData.basicInfo.bio}
                        onChange={(e) => handleBasicInfoChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/80 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 font-queensides resize-none"
                        placeholder="Tell us about yourself, your interests, and what you're looking for..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="px-6 py-3 font-queensides"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 font-queensides"
                      disabled={!profileData.basicInfo.name || !profileData.basicInfo.age || !profileData.basicInfo.location}
                    >
                      Next: Photos
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Placeholder for other steps */}
            {activeStep === 1 && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 text-center">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-700 font-qurova mb-2">Photo Upload</h3>
                  <p className="text-slate-600 font-queensides mb-4">Coming soon...</p>
                  <div className="flex justify-between">
                    <Button onClick={handleBack} variant="outline">Back</Button>
                    <Button onClick={handleNext}>Next: Interests</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 text-center">
                  <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-700 font-qurova mb-2">Interests & Values</h3>
                  <p className="text-slate-600 font-queensides mb-4">Coming soon...</p>
                  <div className="flex justify-between">
                    <Button onClick={handleBack} variant="outline">Back</Button>
                    <Button onClick={handleNext}>Next: Preferences</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-700 font-qurova mb-2">Preferences</h3>
                  <p className="text-slate-600 font-queensides mb-4">Coming soon...</p>
                  <div className="flex justify-between">
                    <Button onClick={handleBack} variant="outline">Back</Button>
                    <Button onClick={handleNext}>Complete Profile</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
