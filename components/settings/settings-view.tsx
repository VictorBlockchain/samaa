"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Heart, Users, Bell, Shield, BookOpen, User, Target, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CelestialBackground } from "@/components/ui/celestial-background"

export function SettingsView() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    ageRange: [22, 35],
    maxDistance: 50,
    showOnlyVerified: true,
    showOnlyPracticing: true,
    interests: [] as string[],
    faithAndPractice: {
      religiousPractice: "No preference",
      islamicDress: "No preference",
      diet: "No preference",
      alcohol: "No preference",
      smoking: "No preference",
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
      profession: "No preference",
    },
    futurePlans: {
      wantChildren: "No preference",
      relocate: "No preference",
      marriageTimeline: "No preference",
      familyPlans: "No preference",
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

  const interestOptions = [
    "Reading Quran",
    "Prayer",
    "Charity Work",
    "Islamic Studies",
    "Halal Cooking",
    "Travel",
    "Sports",
    "Art",
    "Music",
    "Photography",
    "Volunteering",
    "Education",
  ]

  const toggleInterest = (interest: string) => {
    setSettings((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

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

      <div className="relative z-10 p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold font-qurova text-slate-800">Match Settings</h1>
          <Button variant="ghost" size="sm" className="text-indigo-600 font-semibold">
            Clear all
          </Button>
        </div>

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
              <h3 className="font-semibold font-qurova">Maximum Distance</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center text-sm text-slate-600">{settings.maxDistance} km</div>
              <Slider
                value={[settings.maxDistance]}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, maxDistance: value[0] }))}
                min={5}
                max={500}
                step={5}
                className="w-full"
              />
            </div>
          </motion.div>

          {/* Dowry/Purse Requirements */}
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
                <Label className="font-queensides">
                  Require {settings.userGender === "female" ? "Dowry Wallet" : "Purse Setup"}
                </Label>
                <Switch
                  checked={settings.requireFinancialSetup || false}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, requireFinancialSetup: checked }))}
                />
              </div>
              {settings.requireFinancialSetup && (
                <div className="mt-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/30">
                  <p className="text-sm text-amber-700 font-queensides">
                    {settings.userGender === "female"
                      ? "Only show matches who have set up a dowry wallet for Islamic marriage traditions."
                      : "Only show matches who have set up a purse for receiving dowry according to Islamic customs."}
                  </p>
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
                label="Religious practice"
                value={settings.faithAndPractice.religiousPractice}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, religiousPractice: value },
                  }))
                }
                options={["No preference", "Very religious", "Religious", "Somewhat religious", "Not religious"]}
              />
              <FilterSelect
                label="Islamic dress"
                value={settings.faithAndPractice.islamicDress}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    faithAndPractice: { ...prev.faithAndPractice, islamicDress: value },
                  }))
                }
                options={["No preference", "Always", "Usually", "Sometimes", "Never"]}
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
              <FilterSelect
                label="Profession"
                value={settings.aboutThem.profession}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    aboutThem: { ...prev.aboutThem, profession: value },
                  }))
                }
                options={[
                  "No preference",
                  "Healthcare",
                  "Education",
                  "Technology",
                  "Business",
                  "Engineering",
                  "Arts",
                  "Other",
                ]}
              />
            </div>
          </motion.div>

          {/* Future Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-100/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold font-qurova text-amber-700">Future Plans</h3>
            </div>
            <div className="space-y-1">
              <FilterSelect
                label="Want children"
                value={settings.futurePlans.wantChildren}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    futurePlans: { ...prev.futurePlans, wantChildren: value },
                  }))
                }
                options={["No preference", "Yes", "No", "Maybe", "Already have enough"]}
              />
              <FilterSelect
                label="Willing to relocate"
                value={settings.futurePlans.relocate}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    futurePlans: { ...prev.futurePlans, relocate: value },
                  }))
                }
                options={["No preference", "Yes", "No", "For the right person", "Within same country"]}
              />
              <FilterSelect
                label="Marriage timeline"
                value={settings.futurePlans.marriageTimeline}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    futurePlans: { ...prev.futurePlans, marriageTimeline: value },
                  }))
                }
                options={["No preference", "Within 6 months", "Within 1 year", "Within 2 years", "No rush"]}
              />
              <FilterSelect
                label="Family plans"
                value={settings.futurePlans.familyPlans}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    futurePlans: { ...prev.futurePlans, familyPlans: value },
                  }))
                }
                options={["No preference", "Traditional roles", "Both work", "Flexible", "Discuss later"]}
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
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-xl text-sm font-queensides transition-all ${
                    settings.interests.includes(interest)
                      ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-200"
                      : "bg-white/50 text-slate-600 border-2 border-transparent hover:bg-white/80"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
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
            <Button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl">
              Save Settings
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
