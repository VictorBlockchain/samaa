"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Clock, Sun, Sunset, Moon, Star, Sunrise } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function PrayerGuidePage() {
  const router = useRouter()

  const prayers = [
    {
      name: "Fajr",
      arabicName: "الفجر",
      time: "Dawn",
      rakats: 2,
      description: "The dawn prayer, performed before sunrise. A blessed time when the world is quiet and peaceful.",
      icon: Sunrise,
      color: "from-orange-400 to-pink-400",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      name: "Dhuhr", 
      arabicName: "الظهر",
      time: "Midday",
      rakats: 4,
      description: "The midday prayer, performed after the sun passes its zenith. A moment of reflection during the busy day.",
      icon: Sun,
      color: "from-yellow-400 to-orange-400",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      name: "Asr",
      arabicName: "العصر", 
      time: "Afternoon",
      rakats: 4,
      description: "The afternoon prayer, performed in the late afternoon. A time to remember Allah before the day ends.",
      icon: Sun,
      color: "from-amber-400 to-yellow-400",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    {
      name: "Maghrib",
      arabicName: "المغرب",
      time: "Sunset", 
      rakats: 3,
      description: "The sunset prayer, performed just after sunset. A beautiful time when day transitions to night.",
      icon: Sunset,
      color: "from-red-400 to-pink-400",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      name: "Isha",
      arabicName: "العشاء",
      time: "Night",
      rakats: 4,
      description: "The night prayer, performed after twilight disappears. A peaceful end to the day in worship.",
      icon: Moon,
      color: "from-indigo-400 to-purple-400", 
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-nav border-b border-indigo-100/30 mb-8"
        >
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.button
                onClick={() => router.back()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium font-queensides">Back</span>
              </motion.button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800 font-qurova">Prayer Guide</h1>
                <p className="text-sm text-slate-600 font-queensides">The Five Daily Prayers</p>
              </div>
              
              <div className="w-16" /> {/* Spacer for centering */}
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-6 pb-12">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium font-queensides mb-6">
              <Star className="w-4 h-4" />
              <span>Essential Islamic Practice</span>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 font-qurova mb-4">
              The Five Daily Prayers (Salah)
            </h2>
            <p className="text-lg text-slate-600 font-queensides max-w-2xl mx-auto leading-relaxed">
              Prayer is the second pillar of Islam and a direct connection between you and Allah. 
              These five daily prayers structure the Muslim day and provide moments of peace, reflection, and spiritual renewal.
            </p>
          </motion.div>

          {/* Prayer Cards */}
          <div className="space-y-6">
            {prayers.map((prayer, index) => {
              const IconComponent = prayer.icon
              
              return (
                <motion.div
                  key={prayer.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`${prayer.bgColor} border ${prayer.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${prayer.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-slate-800 font-qurova">{prayer.name}</h3>
                        <span className="text-xl text-slate-600 font-arabic">{prayer.arabicName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium font-queensides">{prayer.time}</span>
                        </div>
                        <div className="bg-white/70 px-3 py-1 rounded-full">
                          <span className="text-sm font-bold text-slate-700 font-queensides">
                            {prayer.rakats} Rakats
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-slate-700 font-queensides leading-relaxed">
                        {prayer.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-slate-800 font-qurova mb-4">
              Getting Started with Prayer
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 font-queensides mb-2">Before You Pray:</h4>
                <ul className="space-y-1 text-slate-600 font-queensides">
                  <li>• Perform Wudu (ablution)</li>
                  <li>• Face the Qibla (direction of Mecca)</li>
                  <li>• Ensure you're in a clean place</li>
                  <li>• Have the intention (Niyyah) to pray</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-700 font-queensides mb-2">Learning Resources:</h4>
                <ul className="space-y-1 text-slate-600 font-queensides">
                  <li>• Local mosque classes</li>
                  <li>• Islamic learning apps</li>
                  <li>• YouTube prayer tutorials</li>
                  <li>• Ask knowledgeable Muslims for help</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-queensides text-center">
                <strong>Remember:</strong> Allah is Most Merciful. If you're new to Islam, start gradually and be patient with yourself. 
                Every step towards Allah is blessed, no matter how small.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
