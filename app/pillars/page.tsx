"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Heart, Users, Coins, Plane, Star, Book } from "lucide-react"
import { useRouter } from "next/navigation"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function PillarsPage() {
  const router = useRouter()

  const pillars = [
    {
      number: 1,
      name: "Shahada",
      arabicName: "الشهادة",
      title: "Declaration of Faith",
      description: "The testimony that there is no god but Allah, and Muhammad is His messenger. This is the foundation of Islamic belief.",
      details: "La ilaha illa Allah, Muhammadun rasul Allah",
      icon: Heart,
      color: "from-red-400 to-pink-400",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      number: 2,
      name: "Salah",
      arabicName: "الصلاة", 
      title: "Prayer",
      description: "The five daily prayers that connect Muslims directly with Allah throughout the day.",
      details: "Fajr, Dhuhr, Asr, Maghrib, and Isha prayers",
      icon: Users,
      color: "from-blue-400 to-indigo-400",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      number: 3,
      name: "Zakat",
      arabicName: "الزكاة",
      title: "Charity",
      description: "Giving a portion of one's wealth to those in need, purifying both wealth and soul.",
      details: "Usually 2.5% of savings annually to eligible recipients",
      icon: Coins,
      color: "from-green-400 to-emerald-400",
      bgColor: "bg-green-50", 
      borderColor: "border-green-200"
    },
    {
      number: 4,
      name: "Sawm",
      arabicName: "الصوم",
      title: "Fasting",
      description: "Fasting during the month of Ramadan from dawn to sunset, developing self-discipline and empathy.",
      details: "Abstaining from food, drink, and intimate relations during daylight hours",
      icon: Star,
      color: "from-purple-400 to-violet-400",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      number: 5,
      name: "Hajj",
      arabicName: "الحج",
      title: "Pilgrimage",
      description: "The pilgrimage to Mecca that every Muslim should perform once in their lifetime if able.",
      details: "A spiritual journey to the holy city during the Islamic month of Dhul Hijjah",
      icon: Plane,
      color: "from-amber-400 to-orange-400",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
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
                <h1 className="text-2xl font-bold text-slate-800 font-qurova">Pillars of Islam</h1>
                <p className="text-sm text-slate-600 font-queensides">The Foundation of Faith</p>
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
              <Book className="w-4 h-4" />
              <span>Islamic Foundations</span>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 font-qurova mb-4">
              The Five Pillars of Islam
            </h2>
            <p className="text-lg text-slate-600 font-queensides max-w-2xl mx-auto leading-relaxed">
              These five fundamental practices form the foundation of a Muslim's faith and practice. 
              They provide structure, purpose, and spiritual growth in a believer's life.
            </p>
          </motion.div>

          {/* Pillars */}
          <div className="space-y-6">
            {pillars.map((pillar, index) => {
              const IconComponent = pillar.icon
              
              return (
                <motion.div
                  key={pillar.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`${pillar.bgColor} border ${pillar.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center shadow-lg relative`}>
                      <IconComponent className="w-8 h-8 text-white" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-xs font-bold text-slate-700">{pillar.number}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-slate-800 font-qurova">{pillar.name}</h3>
                        <span className="text-xl text-slate-600 font-arabic">{pillar.arabicName}</span>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-slate-700 font-queensides mb-3">
                        {pillar.title}
                      </h4>
                      
                      <p className="text-slate-700 font-queensides leading-relaxed mb-3">
                        {pillar.description}
                      </p>
                      
                      <div className="bg-white/70 p-3 rounded-xl">
                        <p className="text-sm text-slate-600 font-queensides italic">
                          {pillar.details}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Prophet Muhammad Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-slate-800 font-qurova mb-6 text-center">
              Prophet Muhammad (Peace Be Upon Him)
            </h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium font-queensides mb-4">
                  <Star className="w-4 h-4" />
                  <span>The Final Messenger</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-700 font-queensides mb-3">His Life:</h4>
                  <ul className="space-y-2 text-slate-600 font-queensides">
                    <li>• Born in Mecca around 570 CE</li>
                    <li>• Known for his honesty and trustworthiness</li>
                    <li>• Received the first revelation at age 40</li>
                    <li>• Migrated to Medina in 622 CE (Hijra)</li>
                    <li>• Established the first Muslim community</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-700 font-queensides mb-3">His Character:</h4>
                  <ul className="space-y-2 text-slate-600 font-queensides">
                    <li>• Known as "Al-Amin" (The Trustworthy)</li>
                    <li>• Showed mercy and compassion to all</li>
                    <li>• Advocated for justice and equality</li>
                    <li>• Protected the rights of women and minorities</li>
                    <li>• Emphasized education and knowledge</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 font-queensides text-center">
                  <strong>"Indeed in the Messenger of Allah you have a good example to follow"</strong>
                  <br />
                  <span className="text-sm">- Quran 33:21</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6"
          >
            <h4 className="font-semibold text-green-800 font-queensides mb-3 text-center">
              New to Islam?
            </h4>
            <p className="text-green-700 font-queensides text-center leading-relaxed">
              Take your time learning about these pillars. Islam is a journey of gradual growth and understanding. 
              Connect with your local mosque or Islamic center for guidance and support. 
              Remember, Allah is Most Merciful and Patient with those who seek Him sincerely.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
