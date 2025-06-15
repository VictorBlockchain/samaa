"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Video, Mic, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface RandomMatchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface MatchProfile {
  id: string
  name: string
  age: number
  location: string
  image: string
  hasVideo: boolean
  hasAudio: boolean
  bio: string
  interests: string[]
  bioRating: number // Add this
  audioRating: number // Add this
  otherImages: string[] // Add this
}

// Mock data for random matches
const mockProfiles: MatchProfile[] = [
  {
    id: "1",
    name: "Aisha",
    age: 26,
    location: "London, UK",
    image: "/placeholder.svg?height=400&width=300",
    hasVideo: true,
    hasAudio: false,
    bio: "Seeking a meaningful connection built on faith and shared values.",
    interests: ["Reading", "Travel", "Cooking"],
    bioRating: 4.8,
    audioRating: 4.5,
    otherImages: [
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
    ],
  },
  {
    id: "2",
    name: "Fatima",
    age: 24,
    location: "Dubai, UAE",
    image: "/placeholder.svg?height=400&width=300",
    hasVideo: false,
    hasAudio: true,
    bio: "Love exploring new cultures and deepening my understanding of Islam.",
    interests: ["Art", "Photography", "Volunteering"],
    bioRating: 4.9,
    audioRating: 4.7,
    otherImages: ["/placeholder.svg?height=100&width=100", "/placeholder.svg?height=100&width=100"],
  },
  {
    id: "3",
    name: "Zara",
    age: 28,
    location: "Toronto, Canada",
    image: "/placeholder.svg?height=400&width=300",
    hasVideo: true,
    hasAudio: true,
    bio: "Doctor by profession, seeking someone who values family and faith.",
    interests: ["Medicine", "Fitness", "Community Service"],
    bioRating: 4.6,
    audioRating: 4.8,
    otherImages: [
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
    ],
  },
]

export function RandomMatchModal({ isOpen, onClose }: RandomMatchModalProps) {
  const [currentMatch, setCurrentMatch] = useState<MatchProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      // Get random match
      const randomIndex = Math.floor(Math.random() * mockProfiles.length)
      setCurrentMatch(mockProfiles[randomIndex])
    }
  }, [isOpen])

  const handleProfileClick = () => {
    if (currentMatch) {
      router.push(`/profile/${currentMatch.id}`)
      onClose()
    }
  }

  if (!currentMatch) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Profile Image */}
            <div className="relative">
              <motion.img
                src={currentMatch.image}
                alt={currentMatch.name}
                className="w-full h-80 object-cover cursor-pointer"
                onClick={handleProfileClick}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />

              {/* Media Icons */}
              <div className="absolute top-4 left-4 flex gap-2">
                {currentMatch.hasVideo && (
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                )}
                {currentMatch.hasAudio && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Other Images Thumbnails */}
              {currentMatch.otherImages.length > 0 && (
                <div className="absolute top-4 right-4 flex flex-col gap-1">
                  {currentMatch.otherImages.slice(0, 3).map((img, index) => (
                    <div key={index} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${currentMatch.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {currentMatch.otherImages.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-black/60 border-2 border-white shadow-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">+{currentMatch.otherImages.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Basic Info Overlay */}
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold">
                  {currentMatch.name}, {currentMatch.age}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{currentMatch.location}</span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              {/* Ratings */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-700">Bio Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-purple-800">{currentMatch.bioRating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={
                            i < Math.floor(currentMatch.bioRating) ? "w-3 h-3 text-yellow-400" : "w-3 h-3 text-gray-300"
                          }
                        >
                          ⭐
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {currentMatch.hasAudio && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700">Audio Rating</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-blue-800">{currentMatch.audioRating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={
                              i < Math.floor(currentMatch.audioRating)
                                ? "w-3 h-3 text-yellow-400"
                                : "w-3 h-3 text-gray-300"
                            }
                          >
                            ⭐
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interests */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentMatch.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              {/* Custom View Profile Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProfileClick}
                className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <span>View Full Profile</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    →
                  </motion.div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
