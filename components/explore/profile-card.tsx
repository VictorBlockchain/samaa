"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  Calendar, 
  GraduationCap,
  MessageCircle,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "@/lib/matching"

interface ProfileCardProps {
  profile: UserProfile
  onViewProfile: () => void
  onSendMessage: () => void
  showMessageButton?: boolean
  isInMessagedTab?: boolean
}

export function ProfileCard({
  profile,
  onViewProfile,
  onSendMessage,
  showMessageButton = true,
  isInMessagedTab = false
}: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === profile.photos.length - 1 ? 0 : prev + 1
    )
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? profile.photos.length - 1 : prev - 1
    )
  }

  const calculateAge = (birthDate: string) => {
    // For demo, we'll use the age directly from profile
    return profile.age
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 80) return "text-blue-600 bg-blue-100"
    if (score >= 70) return "text-yellow-600 bg-yellow-100"
    return "text-gray-600 bg-gray-100"
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden max-w-sm mx-auto border-2 border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300"
    >
      {/* Arabic-inspired corner decorations */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-lg z-10"></div>
      <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg z-10"></div>
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg z-10"></div>
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg z-10"></div>
      {/* Photo Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
        <img
          src={profile.photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Geometric pattern overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-white/20 rounded-full opacity-30"></div>
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-white/20 rounded-full"></div>
        
        {/* Photo Navigation */}
        {profile.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
            
            {/* Photo Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {profile.photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Compatibility Score */}
        {profile.compatibility_score && (
          <div className="absolute top-4 right-4">
            <Badge className={`${getCompatibilityColor(profile.compatibility_score)} font-bold`}>
              {profile.compatibility_score}% Match
            </Badge>
          </div>
        )}

        {/* Verification Badge */}
        {profile.is_verified && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-blue-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}

        {/* Media Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {profile.video_intro && (
            <button
              onClick={() => setIsPlayingVideo(!isPlayingVideo)}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <Play className="w-4 h-4 text-white" />
            </button>
          )}
          {profile.voice_intro && (
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlayingAudio ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        {/* Name and Age */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-slate-800 font-qurova">
            {profile.name}
          </h2>
          <div className="flex items-center space-x-1 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span className="font-queensides">{profile.age}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 text-slate-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="font-queensides">
            {profile.location.city}, {profile.location.country}
          </span>
        </div>

        {/* Bio */}
        <p className="text-slate-700 font-queensides leading-relaxed mb-4 line-clamp-3">
          {profile.bio}
        </p>

        {/* Islamic Values */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-800 font-queensides mb-2">
            Islamic Values
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Prays {profile.islamic_values.prayer_frequency}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {profile.islamic_values.islamic_education} Islamic education
            </Badge>
            <Badge variant="outline" className="text-xs">
              Marriage {profile.islamic_values.marriage_timeline.replace('_', ' ')}
            </Badge>
            {profile.islamic_values.hijab_preference && (
              <Badge variant="outline" className="text-xs">
                Hijab: {profile.islamic_values.hijab_preference}
              </Badge>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-800 font-queensides mb-2">
            Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 4).map((interest, index) => (
              <Badge key={index} className="bg-indigo-100 text-indigo-700 text-xs">
                {interest}
              </Badge>
            ))}
            {profile.interests.length > 4 && (
              <Badge className="bg-slate-100 text-slate-600 text-xs">
                +{profile.interests.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Elegant Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
            <div className="w-2 h-2 border border-indigo-400/40 rounded-full flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-indigo-500/70 rounded-full"></div>
            </div>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>
            <div className="w-1 h-1 bg-purple-400/60 rounded-full"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {/* View Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewProfile}
            className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 py-3 px-6 rounded-xl font-queensides font-medium transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>View Profile</span>
          </motion.button>

          {/* Send Message */}
          {showMessageButton && !isInMessagedTab && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSendMessage}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-queensides font-medium transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Message</span>
            </motion.button>
          )}

          {/* Already Messaged Indicator */}
          {isInMessagedTab && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 py-3 px-6 rounded-xl font-queensides font-medium flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message Sent</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
