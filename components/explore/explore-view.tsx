"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Play, Pause, Volume2, Wallet, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CelestialBackground } from "@/components/ui/celestial-background"

interface Suitor {
  id: string
  name: string
  age: number
  ethnicity: string
  location: string
  lastActive: string
  photo: string
  video?: string
  audio?: string
  hasDowryWallet: boolean
  isVerified: boolean
  country: string
  bioRating: number
}

const mockSuitors: Suitor[] = [
  {
    id: "1",
    name: "Mo",
    age: 33,
    ethnicity: "African American",
    location: "New York City, US",
    lastActive: "8 hours ago",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    hasDowryWallet: true,
    isVerified: true,
    country: "US",
    bioRating: 92,
  },
  {
    id: "2",
    name: "Mina",
    age: 48,
    ethnicity: "Canadian West African",
    location: "Burlington VT",
    lastActive: "8 hours ago",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    hasDowryWallet: true,
    isVerified: true,
    country: "US",
    bioRating: 88,
  },
  {
    id: "3",
    name: "Basma",
    age: 28,
    ethnicity: "African American Arab",
    location: "New York City, US",
    lastActive: "19 hours ago",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    hasDowryWallet: false,
    isVerified: true,
    country: "US",
    bioRating: 85,
  },
  {
    id: "4",
    name: "Hanan",
    age: 38,
    ethnicity: "African American",
    location: "Maplewood MN",
    lastActive: "3 days ago",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-04.wav",
    hasDowryWallet: false,
    isVerified: true,
    country: "US",
    bioRating: 91,
  },
  {
    id: "5",
    name: "Ahmed",
    age: 29,
    ethnicity: "Middle Eastern",
    location: "San Francisco, CA",
    lastActive: "2 hours ago",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=face",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    hasDowryWallet: true,
    isVerified: true,
    country: "US",
    bioRating: 94,
  },
  {
    id: "6",
    name: "Fatima",
    age: 26,
    ethnicity: "South Asian",
    location: "Chicago, IL",
    lastActive: "1 day ago",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-03.wav",
    hasDowryWallet: false,
    isVerified: true,
    country: "US",
    bioRating: 87,
  },
  {
    id: "7",
    name: "Omar",
    age: 31,
    ethnicity: "Arab American",
    location: "Houston, TX",
    lastActive: "5 hours ago",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    hasDowryWallet: true,
    isVerified: true,
    country: "US",
    bioRating: 89,
  },
  {
    id: "8",
    name: "Aisha",
    age: 24,
    ethnicity: "Pakistani American",
    location: "Los Angeles, CA",
    lastActive: "12 hours ago",
    photo: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop&crop=face",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-02.wav",
    hasDowryWallet: false,
    isVerified: true,
    country: "US",
    bioRating: 93,
  },
  {
    id: "9",
    name: "Yusuf",
    age: 35,
    ethnicity: "Turkish American",
    location: "Seattle, WA",
    lastActive: "1 hour ago",
    photo: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=600&fit=crop&crop=face",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    hasDowryWallet: true,
    isVerified: true,
    country: "US",
    bioRating: 86,
  },
  {
    id: "10",
    name: "Zara",
    age: 27,
    ethnicity: "Moroccan American",
    location: "Miami, FL",
    lastActive: "6 hours ago",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-01.wav",
    hasDowryWallet: false,
    isVerified: true,
    country: "US",
    bioRating: 90,
  },
  {
    id: "11",
    name: "Khalid",
    age: 30,
    ethnicity: "Egyptian American",
    location: "Atlanta, GA",
    lastActive: "4 hours ago",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=face",
    video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
    hasDowryWallet: true,
    isVerified: true,
    country: "US",
    bioRating: 95,
  },
  {
    id: "12",
    name: "Layla",
    age: 25,
    ethnicity: "Lebanese American",
    location: "Boston, MA",
    lastActive: "2 days ago",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
    audio: "https://www.soundjay.com/misc/sounds/bell-ringing-06.wav",
    hasDowryWallet: false,
    isVerified: true,
    country: "US",
    bioRating: 84,
  },
]

export function ExploreView() {
  const [activeTab, setActiveTab] = useState<"visited" | "favourited" | "passed">("favourited")
  const [playingMedia, setPlayingMedia] = useState<{ id: string; type: "video" | "audio" } | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})
  const router = useRouter()

  const handleMediaPlay = async (suitorId: string, type: "video" | "audio") => {
    // Stop any currently playing media
    if (playingMedia) {
      try {
        if (playingMedia.type === "video" && videoRefs.current[playingMedia.id]) {
          videoRefs.current[playingMedia.id].pause()
        } else if (playingMedia.type === "audio" && audioRefs.current[playingMedia.id]) {
          audioRefs.current[playingMedia.id].pause()
        }
      } catch (error) {
        // Ignore pause errors
      }
    }

    // Start new media with error handling
    try {
      if (type === "video" && videoRefs.current[suitorId]) {
        await videoRefs.current[suitorId].play()
      } else if (type === "audio" && audioRefs.current[suitorId]) {
        await audioRefs.current[suitorId].play()
      }
      setPlayingMedia({ id: suitorId, type })
    } catch (error) {
      // Handle play errors (user interaction required, network issues, etc.)
      console.log("Media play failed:", error)
    }
  }

  const handleMediaPause = (suitorId: string, type: "video" | "audio") => {
    try {
      if (type === "video" && videoRefs.current[suitorId]) {
        videoRefs.current[suitorId].pause()
      } else if (type === "audio" && audioRefs.current[suitorId]) {
        audioRefs.current[suitorId].pause()
      }
    } catch (error) {
      // Ignore pause errors
    }
    setPlayingMedia(null)
  }

  const handleProfileClick = (suitorId: string) => {
    router.push(`/profile/${suitorId}`)
  }

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      US: "🇺🇸",
      CA: "🇨🇦",
      UK: "🇬🇧",
    }
    return flags[country] || "🌍"
  }

  const getBioRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-600 bg-green-100"
    if (rating >= 80) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm border border-purple-200/30 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-purple-700" />
            </button>
            <h1 className="text-xl font-bold text-purple-900">Explore</h1>
            {/* Remove this spacer div: <div className="w-9 h-9" /> */}
          </div>

          {/* Tabs */}
          <div className="flex justify-center space-x-8 px-4 pb-4">
            <button
              onClick={() => setActiveTab("visited")}
              className={`text-lg font-medium pb-2 transition-colors ${
                activeTab === "visited" ? "text-purple-900 border-b-2 border-purple-500" : "text-purple-400"
              }`}
            >
              Visited you
            </button>
            <button
              onClick={() => setActiveTab("favourited")}
              className={`text-lg font-medium pb-2 transition-colors ${
                activeTab === "favourited" ? "text-purple-900 border-b-2 border-purple-500" : "text-purple-400"
              }`}
            >
              Favourited
            </button>
            <button
              onClick={() => setActiveTab("passed")}
              className={`text-lg font-medium pb-2 transition-colors ${
                activeTab === "passed" ? "text-purple-900 border-b-2 border-purple-500" : "text-purple-400"
              }`}
            >
              Passed
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Suitors Grid - Two Columns */}
              <div className="grid grid-cols-2 gap-3">
                {mockSuitors.map((suitor, index) => (
                  <motion.div
                    key={suitor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      className={`overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                        suitor.video ? "ring-2 ring-blue-400" : suitor.audio ? "ring-2 ring-purple-400" : ""
                      }`}
                    >
                      <div className="relative">
                        {/* Dowry Wallet Badge */}
                        {suitor.hasDowryWallet && (
                          <div className="absolute top-3 left-3 z-10 bg-green-600 text-white p-2 rounded-full shadow-lg">
                            <Wallet className="w-4 h-4" />
                          </div>
                        )}

                        {/* Country Flag */}
                        <div className="absolute top-3 right-3 z-10 text-2xl">{getCountryFlag(suitor.country)}</div>

                        {/* Bio Rating */}
                        <div
                          className={`absolute top-12 right-3 z-10 px-2 py-1 rounded-full text-xs font-bold ${getBioRatingColor(suitor.bioRating)}`}
                        >
                          {suitor.bioRating}%
                        </div>

                        {/* Media Play Button - Top Right Corner */}
                        {(suitor.video || suitor.audio) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const mediaType = suitor.video ? "video" : "audio"
                              if (playingMedia?.id === suitor.id && playingMedia?.type === mediaType) {
                                handleMediaPause(suitor.id, mediaType)
                              } else {
                                handleMediaPlay(suitor.id, mediaType)
                              }
                            }}
                            className="absolute bottom-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors shadow-lg"
                          >
                            {playingMedia?.id === suitor.id ? (
                              <Pause className="w-4 h-4" />
                            ) : suitor.video ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Profile Image */}
                        <div className="relative cursor-pointer group" onClick={() => handleProfileClick(suitor.id)}>
                          <img
                            src={suitor.photo || "/placeholder.svg"}
                            alt={suitor.name}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Video Overlay */}
                          {suitor.video && (
                            <video
                              ref={(el) => {
                                if (el) videoRefs.current[suitor.id] = el
                              }}
                              className="absolute inset-0 w-full h-full object-cover"
                              muted
                              loop
                              style={{
                                display:
                                  playingMedia?.id === suitor.id && playingMedia?.type === "video" ? "block" : "none",
                              }}
                            >
                              <source src={suitor.video} type="video/mp4" />
                            </video>
                          )}

                          {/* Audio Element */}
                          {suitor.audio && (
                            <audio
                              ref={(el) => {
                                if (el) audioRefs.current[suitor.id] = el
                              }}
                              loop
                            >
                              <source src={suitor.audio} type="audio/mpeg" />
                            </audio>
                          )}
                        </div>

                        {/* Profile Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-bold">{suitor.name}</h3>
                            <span className="text-sm">{suitor.age}</span>
                            {suitor.isVerified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs opacity-90 mb-1">{suitor.ethnicity}</p>
                          <p className="text-xs opacity-90 mb-1">{suitor.location}</p>
                          <p className="text-xs opacity-75">{suitor.lastActive}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
