"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Star, Heart, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function NamesOfAllahPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const names = [
    { number: 1, arabic: "الرَّحْمَنُ", transliteration: "Ar-Rahman", meaning: "The Most Merciful" },
    { number: 2, arabic: "الرَّحِيمُ", transliteration: "Ar-Raheem", meaning: "The Most Compassionate" },
    { number: 3, arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaning: "The King" },
    { number: 4, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Holy" },
    { number: 5, arabic: "السَّلاَمُ", transliteration: "As-Salaam", meaning: "The Source of Peace" },
    { number: 6, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Guardian of Faith" },
    { number: 7, arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning: "The Protector" },
    { number: 8, arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", meaning: "The Mighty" },
    { number: 9, arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", meaning: "The Compeller" },
    { number: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning: "The Supreme" },
    { number: 11, arabic: "الْخَالِقُ", transliteration: "Al-Khaliq", meaning: "The Creator" },
    { number: 12, arabic: "الْبَارِئُ", transliteration: "Al-Bari", meaning: "The Originator" },
    { number: 13, arabic: "الْمُصَوِّرُ", transliteration: "Al-Musawwir", meaning: "The Fashioner" },
    { number: 14, arabic: "الْغَفَّارُ", transliteration: "Al-Ghaffar", meaning: "The Great Forgiver" },
    { number: 15, arabic: "الْقَهَّارُ", transliteration: "Al-Qahhar", meaning: "The Subduer" },
    { number: 16, arabic: "الْوَهَّابُ", transliteration: "Al-Wahhab", meaning: "The Bestower" },
    { number: 17, arabic: "الرَّزَّاقُ", transliteration: "Ar-Razzaq", meaning: "The Provider" },
    { number: 18, arabic: "الْفَتَّاحُ", transliteration: "Al-Fattah", meaning: "The Opener" },
    { number: 19, arabic: "اَلْعَلِيْمُ", transliteration: "Al-Aleem", meaning: "The All-Knowing" },
    { number: 20, arabic: "الْقَابِضُ", transliteration: "Al-Qabid", meaning: "The Restrainer" },
    { number: 21, arabic: "الْبَاسِطُ", transliteration: "Al-Basit", meaning: "The Expander" },
    { number: 22, arabic: "الْخَافِضُ", transliteration: "Al-Khafid", meaning: "The Abaser" },
    { number: 23, arabic: "الرَّافِعُ", transliteration: "Ar-Rafi", meaning: "The Exalter" },
    { number: 24, arabic: "الْمُعِزُّ", transliteration: "Al-Mu'izz", meaning: "The Honorer" },
    { number: 25, arabic: "الْمُذِلُّ", transliteration: "Al-Mudhill", meaning: "The Humiliator" },
    { number: 26, arabic: "السَّمِيعُ", transliteration: "As-Samee", meaning: "The All-Hearing" },
    { number: 27, arabic: "الْبَصِيرُ", transliteration: "Al-Baseer", meaning: "The All-Seeing" },
    { number: 28, arabic: "الْحَكَمُ", transliteration: "Al-Hakam", meaning: "The Judge" },
    { number: 29, arabic: "الْعَدْلُ", transliteration: "Al-Adl", meaning: "The Just" },
    { number: 30, arabic: "اللَّطِيفُ", transliteration: "Al-Lateef", meaning: "The Gentle" },
    { number: 31, arabic: "الْخَبِيرُ", transliteration: "Al-Khabeer", meaning: "The Aware" },
    { number: 32, arabic: "الْحَلِيمُ", transliteration: "Al-Haleem", meaning: "The Forbearing" },
    { number: 33, arabic: "الْعَظِيمُ", transliteration: "Al-Azeem", meaning: "The Magnificent" },
    { number: 34, arabic: "الْغَفُورُ", transliteration: "Al-Ghafoor", meaning: "The Forgiving" },
    { number: 35, arabic: "الشَّكُورُ", transliteration: "Ash-Shakoor", meaning: "The Appreciative" },
    { number: 36, arabic: "الْعَلِيُّ", transliteration: "Al-Ali", meaning: "The Most High" },
    { number: 37, arabic: "الْكَبِيرُ", transliteration: "Al-Kabeer", meaning: "The Most Great" },
    { number: 38, arabic: "الْحَفِيظُ", transliteration: "Al-Hafeedh", meaning: "The Preserver" },
    { number: 39, arabic: "الْمُقِيتُ", transliteration: "Al-Muqeet", meaning: "The Sustainer" },
    { number: 40, arabic: "الْحَسِيبُ", transliteration: "Al-Haseeb", meaning: "The Reckoner" },
    { number: 41, arabic: "الْجَلِيلُ", transliteration: "Al-Jaleel", meaning: "The Majestic" },
    { number: 42, arabic: "الْكَرِيمُ", transliteration: "Al-Kareem", meaning: "The Generous" },
    { number: 43, arabic: "الرَّقِيبُ", transliteration: "Ar-Raqeeb", meaning: "The Watchful" },
    { number: 44, arabic: "الْمُجِيبُ", transliteration: "Al-Mujeeb", meaning: "The Responsive" },
    { number: 45, arabic: "الْوَاسِعُ", transliteration: "Al-Wasi", meaning: "The All-Encompassing" },
    { number: 46, arabic: "الْحَكِيمُ", transliteration: "Al-Hakeem", meaning: "The Wise" },
    { number: 47, arabic: "الْوَدُودُ", transliteration: "Al-Wadood", meaning: "The Loving" },
    { number: 48, arabic: "الْمَجِيدُ", transliteration: "Al-Majeed", meaning: "The Glorious" },
    { number: 49, arabic: "الْبَاعِثُ", transliteration: "Al-Ba'ith", meaning: "The Resurrector" },
    { number: 50, arabic: "الشَّهِيدُ", transliteration: "Ash-Shaheed", meaning: "The Witness" },
    { number: 51, arabic: "الْحَقُّ", transliteration: "Al-Haqq", meaning: "The Truth" },
    { number: 52, arabic: "الْوَكِيلُ", transliteration: "Al-Wakeel", meaning: "The Trustee" },
    { number: 53, arabic: "الْقَوِيُّ", transliteration: "Al-Qawiyy", meaning: "The Strong" },
    { number: 54, arabic: "الْمَتِينُ", transliteration: "Al-Mateen", meaning: "The Firm" },
    { number: 55, arabic: "الْوَلِيُّ", transliteration: "Al-Waliyy", meaning: "The Friend" },
    { number: 56, arabic: "الْحَمِيدُ", transliteration: "Al-Hameed", meaning: "The Praiseworthy" },
    { number: 57, arabic: "الْمُحْصِي", transliteration: "Al-Muhsee", meaning: "The Counter" },
    { number: 58, arabic: "الْمُبْدِئُ", transliteration: "Al-Mubdi", meaning: "The Originator" },
    { number: 59, arabic: "الْمُعِيدُ", transliteration: "Al-Mueed", meaning: "The Restorer" },
    { number: 60, arabic: "الْمُحْيِي", transliteration: "Al-Muhyee", meaning: "The Giver of Life" },
    { number: 61, arabic: "اَلْمُمِيتُ", transliteration: "Al-Mumeet", meaning: "The Taker of Life" },
    { number: 62, arabic: "الْحَيُّ", transliteration: "Al-Hayy", meaning: "The Living" },
    { number: 63, arabic: "الْقَيُّومُ", transliteration: "Al-Qayyoom", meaning: "The Self-Existing" },
    { number: 64, arabic: "الْوَاجِدُ", transliteration: "Al-Wajid", meaning: "The Finder" },
    { number: 65, arabic: "الْمَاجِدُ", transliteration: "Al-Majid", meaning: "The Noble" },
    { number: 66, arabic: "الْواحِدُ", transliteration: "Al-Wahid", meaning: "The One" },
    { number: 67, arabic: "اَلاَحَدُ", transliteration: "Al-Ahad", meaning: "The Unique" },
    { number: 68, arabic: "الصَّمَدُ", transliteration: "As-Samad", meaning: "The Eternal" },
    { number: 69, arabic: "الْقَادِرُ", transliteration: "Al-Qadir", meaning: "The Capable" },
    { number: 70, arabic: "الْمُقْتَدِرُ", transliteration: "Al-Muqtadir", meaning: "The Powerful" },
    { number: 71, arabic: "الْمُقَدِّمُ", transliteration: "Al-Muqaddim", meaning: "The Expediter" },
    { number: 72, arabic: "الْمُؤَخِّرُ", transliteration: "Al-Mu'akhkhir", meaning: "The Delayer" },
    { number: 73, arabic: "الأوَّلُ", transliteration: "Al-Awwal", meaning: "The First" },
    { number: 74, arabic: "الآخِرُ", transliteration: "Al-Akhir", meaning: "The Last" },
    { number: 75, arabic: "الظَّاهِرُ", transliteration: "Az-Zahir", meaning: "The Manifest" },
    { number: 76, arabic: "الْبَاطِنُ", transliteration: "Al-Batin", meaning: "The Hidden" },
    { number: 77, arabic: "الْوَالِي", transliteration: "Al-Walee", meaning: "The Governor" },
    { number: 78, arabic: "الْمُتَعَالِي", transliteration: "Al-Muta'ali", meaning: "The Most Exalted" },
    { number: 79, arabic: "الْبَرُّ", transliteration: "Al-Barr", meaning: "The Source of Goodness" },
    { number: 80, arabic: "التَّوَابُ", transliteration: "At-Tawwab", meaning: "The Acceptor of Repentance" },
    { number: 81, arabic: "الْمُنْتَقِمُ", transliteration: "Al-Muntaqim", meaning: "The Avenger" },
    { number: 82, arabic: "العَفُوُّ", transliteration: "Al-Afuww", meaning: "The Pardoner" },
    { number: 83, arabic: "الرَّؤُوفُ", transliteration: "Ar-Ra'oof", meaning: "The Compassionate" },
    { number: 84, arabic: "مَالِكُ الْمُلْكِ", transliteration: "Malik-ul-Mulk", meaning: "Master of the Kingdom" },
    { number: 85, arabic: "ذُوالْجَلاَلِ وَالإكْرَامِ", transliteration: "Dhul-Jalali wal-Ikram", meaning: "Lord of Majesty and Bounty" },
    { number: 86, arabic: "الْمُقْسِطُ", transliteration: "Al-Muqsit", meaning: "The Equitable" },
    { number: 87, arabic: "الْجَامِعُ", transliteration: "Al-Jami", meaning: "The Gatherer" },
    { number: 88, arabic: "الْغَنِيُّ", transliteration: "Al-Ghaniyy", meaning: "The Independent" },
    { number: 89, arabic: "الْمُغْنِي", transliteration: "Al-Mughni", meaning: "The Enricher" },
    { number: 90, arabic: "الْمَانِعُ", transliteration: "Al-Mani", meaning: "The Preventer" },
    { number: 91, arabic: "الضَّارَّ", transliteration: "Ad-Darr", meaning: "The Distresser" },
    { number: 92, arabic: "النَّافِعُ", transliteration: "An-Nafi", meaning: "The Benefactor" },
    { number: 93, arabic: "النُّورُ", transliteration: "An-Nur", meaning: "The Light" },
    { number: 94, arabic: "الْهَادِي", transliteration: "Al-Hadi", meaning: "The Guide" },
    { number: 95, arabic: "الْبَدِيعُ", transliteration: "Al-Badi", meaning: "The Incomparable" },
    { number: 96, arabic: "الْبَاقِي", transliteration: "Al-Baqi", meaning: "The Everlasting" },
    { number: 97, arabic: "الْوَارِثُ", transliteration: "Al-Warith", meaning: "The Inheritor" },
    { number: 98, arabic: "الرَّشِيدُ", transliteration: "Ar-Rasheed", meaning: "The Guide to Right Path" },
    { number: 99, arabic: "الصَّبُورُ", transliteration: "As-Saboor", meaning: "The Patient" }
  ]

  const filteredNames = names.filter(name => 
    name.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.arabic.includes(searchTerm)
  )

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
          <div className="max-w-6xl mx-auto px-6 py-4">
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
                <h1 className="text-2xl font-bold text-slate-800 font-qurova">99 Names of Allah</h1>
                <p className="text-sm text-slate-600 font-queensides">Asma ul-Husna</p>
              </div>
              
              <div className="w-16" /> {/* Spacer for centering */}
            </div>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 pb-12">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium font-queensides mb-6">
              <Star className="w-4 h-4" />
              <span>The Beautiful Names</span>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 font-qurova mb-4">
              The 99 Beautiful Names of Allah
            </h2>
            <p className="text-lg text-slate-600 font-queensides max-w-3xl mx-auto leading-relaxed mb-6">
              These are the most beautiful names (Asma ul-Husna) that describe the attributes and qualities of Allah. 
              Reciting and reflecting upon these names brings peace, understanding, and closeness to the Divine.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all duration-200 font-queensides"
              />
            </div>
          </motion.div>

          {/* Names Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNames.map((name, index) => (
              <motion.div
                key={name.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index % 20) * 0.05 }}
                className="bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-xl p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{name.number}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-right mb-2">
                      <h3 className="text-xl font-bold text-slate-800 font-arabic leading-relaxed">
                        {name.arabic}
                      </h3>
                    </div>
                    
                    <div className="text-left">
                      <p className="font-semibold text-indigo-600 font-queensides mb-1">
                        {name.transliteration}
                      </p>
                      <p className="text-sm text-slate-600 font-queensides">
                        {name.meaning}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Note about remaining names */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center"
          >
            <Heart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-blue-800 font-queensides">
              <strong>Complete Collection:</strong> All 99 Beautiful Names of Allah (Asma ul-Husna) are listed above.
              Each name represents a divine attribute that helps us understand Allah's infinite mercy, wisdom, and power.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-8 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-slate-800 font-qurova mb-6 text-center">
              Benefits of Reciting the Beautiful Names
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-700 font-queensides mb-3">Spiritual Benefits:</h4>
                <ul className="space-y-2 text-slate-600 font-queensides">
                  <li>• Increases closeness to Allah</li>
                  <li>• Brings peace and tranquility</li>
                  <li>• Strengthens faith and understanding</li>
                  <li>• Provides comfort in difficult times</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-700 font-queensides mb-3">How to Use:</h4>
                <ul className="space-y-2 text-slate-600 font-queensides">
                  <li>• Recite during dhikr (remembrance)</li>
                  <li>• Reflect on their meanings</li>
                  <li>• Use in daily prayers and supplications</li>
                  <li>• Memorize gradually over time</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
