"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Heart, MessageCircle, Star, MapPin, Send, Sparkles, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Profile {
  id: string
  name: string
  age: number
  location: string
  bio: string
  image: string
  photos?: string[]
  profileRating: number
  verified: boolean
  distance: string
}

interface SwipeCardProps {
  profiles?: Profile[]
  availableLeads?: number
  availableViews?: number
  onSendLead?: (profileId: string, message: string) => Promise<void>
  onBuyLeads?: () => void
  onBuyViews?: () => void
}

const defaultProfiles: Profile[] = [
  {
    id: '1',
    name: 'Aisha',
    age: 26,
    location: 'New York, NY',
    bio: 'Seeking a pious partner for a blessed marriage journey',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988bab389?w=800&h=1200&fit=crop',
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988bab389?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=1200&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=1200&fit=crop',
    ],
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

export function SwipeCard({ 
  profiles = defaultProfiles, 
  availableLeads = 3,
  availableViews = 5,
  onSendLead,
  onBuyLeads,
  onBuyViews
}: SwipeCardProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<string | null>(null)
  const [showLeadCard, setShowLeadCard] = useState(false)
  const [showViewsCard, setShowViewsCard] = useState(false)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [photoDirection, setPhotoDirection] = useState<string | null>(null)
  
  const currentProfile = profiles[currentIndex]
  const profilePhotos = currentProfile?.photos || [currentProfile?.image]
  const currentPhoto = profilePhotos[currentPhotoIndex] || currentProfile?.image
  
  // Reset photo index when profile changes
  useEffect(() => {
    setCurrentPhotoIndex(0)
  }, [currentIndex])
  
  const handlePass = () => {
    setDirection('left')
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length)
      setDirection(null)
    }, 300)
  }
  
  const handleView = () => {
    if (availableViews <= 0) {
      setShowViewsCard(true)
      return
    }
    router.push(`/profile?userId=${currentProfile.id}`)
  }
  
  const handleChat = () => {
    setShowLeadCard(true)
  }
  
  // Swipe photos within a profile
  const handlePhotoSwipe = (newDirection: 'left' | 'right') => {
    if (profilePhotos.length <= 1) return
    
    setPhotoDirection(newDirection)
    setTimeout(() => {
      if (newDirection === 'left') {
        setCurrentPhotoIndex((prev) => (prev + 1) % profilePhotos.length)
      } else {
        setCurrentPhotoIndex((prev) => (prev - 1 + profilePhotos.length) % profilePhotos.length)
      }
      setPhotoDirection(null)
    }, 200)
  }
  
  const handleSendLead = async () => {
    if (!message.trim() || availableLeads <= 0) return
    
    setIsSending(true)
    try {
      if (onSendLead) {
        await onSendLead(currentProfile.id, message.trim())
      }
      setMessage('')
      setShowLeadCard(false)
    } catch (error) {
      console.error('Error sending lead:', error)
    } finally {
      setIsSending(false)
    }
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
            {/* Background Image with Swipe */}
            <motion.div 
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                const threshold = 50
                if (info.offset.x < -threshold) {
                  handlePhotoSwipe('left')
                } else if (info.offset.x > threshold) {
                  handlePhotoSwipe('right')
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${currentIndex}-${currentPhotoIndex}`}
                  src={currentPhoto}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, x: photoDirection === 'left' ? 100 : photoDirection === 'right' ? -100 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: photoDirection === 'left' ? -100 : photoDirection === 'right' ? 100 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
              

              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </motion.div>
            
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
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 py-6">
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
          onClick={handleView}
          className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
        >
          <Eye className="w-7 h-7 text-emerald-500" />
        </motion.button>
      </div>

      {/* Lead Card Slide Up */}
      <AnimatePresence>
        {showLeadCard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeadCard(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20"
            />
            
            {/* Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-800 font-qurova">Take The Lead</h3>
                </div>
                <button
                  onClick={() => setShowLeadCard(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Profile Preview */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <img
                  src={currentProfile.image}
                  alt={currentProfile.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-semibold text-slate-800 font-queensides">{currentProfile.name}, {currentProfile.age}</p>
                  <p className="text-xs text-slate-500 font-queensides">{currentProfile.location}</p>
                </div>
              </div>

              {/* Leads Count */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-queensides text-amber-700">Available Leads</span>
                </div>
                <span className="text-xl font-bold text-amber-600 font-queensides">{availableLeads}</span>
              </div>

              {/* Message Input */}
              {availableLeads > 0 ? (
                <>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a heartfelt message..."
                    className="w-full h-24 p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent font-queensides text-sm"
                    maxLength={280}
                  />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400 font-queensides">{message.length}/280</span>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendLead}
                    disabled={!message.trim() || isSending}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-queensides font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* Buy Leads */
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="text-slate-600 font-queensides mb-4">You're out of leads!</p>
                  <button
                    onClick={onBuyLeads}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-queensides font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Buy More Leads
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Views Card Slide Up */}
      <AnimatePresence>
        {showViewsCard && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowViewsCard(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20"
            />
            
            {/* Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold text-slate-800 font-qurova">View Profile</h3>
                </div>
                <button
                  onClick={() => setShowViewsCard(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Profile Preview */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                <img
                  src={currentProfile.image}
                  alt={currentProfile.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-semibold text-slate-800 font-queensides">{currentProfile.name}, {currentProfile.age}</p>
                  <p className="text-xs text-slate-500 font-queensides">{currentProfile.location}</p>
                </div>
              </div>

              {/* Views Count */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-queensides text-emerald-700">Available Views</span>
                </div>
                <span className="text-xl font-bold text-emerald-600 font-queensides">{availableViews}</span>
              </div>

              {/* Buy Views */}
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-slate-600 font-queensides mb-4">You're out of views!</p>
                <p className="text-sm text-slate-500 font-queensides mb-4">Purchase more views to see full profiles and connect with potential matches.</p>
                <button
                  onClick={onBuyViews}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-queensides font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Buy More Views
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
