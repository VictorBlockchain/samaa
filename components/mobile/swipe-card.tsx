"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Heart, MessageCircle, Star, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Profile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  image: string
  profileRating: number
  verified: boolean
  distance: string
}

interface SwipeCardProps {
  profiles?: Profile[]
}

const defaultProfiles: Profile[] = [
  {
    id: '1',
    name: 'Aisha',
    age: 26,
    location: 'New York, NY',
    bio: 'Seeking a pious partner for a blessed marriage journey',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop',
    profileRating: 92,
    verified: true,
    distance: '5 miles away',
  },
  {
    id: '2',
    name: 'Fatima',
    age: 24,
    location: 'Brooklyn, NY',
    bio: 'Dedicated to my faith and looking for someone who shares Islamic values',
    image: 'https://images.unsplash.com/photo-1517841905240-472988bab389?w=800&h=1200&fit=crop',
    profileRating: 88,
    verified: true,
    distance: '8 miles away',
  },
  {
    id: '3',
    name: 'Maryam',
    age: 28,
    location: 'Queens, NY',
    bio: 'Practicing Muslim seeking a righteous spouse for halal marriage',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop',
    profileRating: 95,
    verified: false,
    distance: '12 miles away',
  },
]

export function SwipeCard({ profiles = defaultProfiles }: SwipeCardProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<string | null>(null)
  
  const currentProfile = profiles[currentIndex]
  
  const handlePass = () => {
    setDirection('left')
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length)
      setDirection(null)
    }, 300)
  }
  
  const handleLike = () => {
    setDirection('right')
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length)
      setDirection(null)
    }, 300)
  }
  
  const handleChat = () => {
    router.push('/explore')
  }
  
  return (
    <div className="relative w-full h-full flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
      {/* Card Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {profiles.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-pink-500 w-6' : 'bg-pink-300'
            }`}
          />
        ))}
      </div>
      
      {/* Profile Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
            rotate: direction === 'left' ? -20 : direction === 'right' ? 20 : 0
          }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full h-full max-w-sm mx-auto"
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-pink-200">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={currentProfile.image}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
            
            {/* Profile Info */}
            <div className="absolute bottom-36 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold text-white font-queensides">
                  {currentProfile.name}, {currentProfile.age}
                </h2>
                {currentProfile.verified && (
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-300 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="font-queensides text-sm">{currentProfile.location}</span>
                <span className="text-pink-400 text-xs">• {currentProfile.distance}</span>
              </div>
              
              <p className="text-gray-200 font-queensides text-sm leading-relaxed mb-3">
                {currentProfile.bio}
              </p>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                  <Star className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-white text-xs font-queensides font-semibold">
                    {currentProfile.profileRating}% Profile Score
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 py-6 bg-gradient-to-t from-white via-white to-transparent">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePass}
          className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 border-2 border-rose-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        >
          <X className="w-7 h-7 text-rose-500" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleChat}
          className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="w-6 h-6 text-blue-500" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        >
          <Heart className="w-7 h-7 text-emerald-500" />
        </motion.button>
      </div>
    </div>
  )
}
