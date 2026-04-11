"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { VideoCard } from "@/components/social/video-card"
import { VideoUpload } from "@/components/social/video-upload"
import { SocialService, SocialVideo, SocialCategory } from "@/lib/social"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"
import {
  Video,
  Search,
  Loader2,
  Clock,
  User,
  ArrowUp,
  Settings,
  Check,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { ArabicCard, ArabicCardContent, ArabicCardTitle, ArabicCardDescription } from "@/components/ui/arabic-card"

const VIDEOS_PER_PAGE = 6

interface UserVideoPreferences {
  id: string
  user_id: string
  selected_categories: string[]
  created_at: string
  updated_at: string
}

export default function SocialPage() {
  const { userId, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [videos, setVideos] = useState<SocialVideo[]>([])
  const [categories, setCategories] = useState<SocialCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState("newest")
  const [userPreferences, setUserPreferences] = useState<UserVideoPreferences | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [savingPreferences, setSavingPreferences] = useState(false)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Load categories and user preferences
  useEffect(() => {
    loadCategories()
    if (userId) {
      loadUserPreferences()
    }
  }, [userId])

  // Load videos when tab changes
  useEffect(() => {
    setVideos([])
    setOffset(0)
    setHasMore(true)
    loadVideos(0, true)
  }, [activeTab, userPreferences])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreVideos()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loadingMore, offset])

  const loadCategories = async () => {
    const data = await SocialService.getCategories()
    setCategories(data)
  }

  const loadUserPreferences = async () => {
    if (!userId) return
    
    const { data, error } = await supabase
      .from("user_video_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      if (error.code !== "PGRST116" && error.code !== "406") {
        console.error("Error loading preferences:", error)
      }
      return
    }

    if (data) {
      setUserPreferences(data)
      setSelectedCategories(data.selected_categories || [])
    }
  }

  const saveUserPreferences = async () => {
    if (!userId) return
    
    setSavingPreferences(true)
    
    const { error } = await supabase
      .from("user_video_preferences")
      .upsert({
        user_id: userId,
        selected_categories: selectedCategories,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      })

    if (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Save failed",
        description: "Unable to save your preferences. Please try again.",
        variant: "destructive",
      })
    } else {
      const newPreferences = {
        id: userPreferences?.id || "",
        user_id: userId,
        selected_categories: selectedCategories,
        created_at: userPreferences?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUserPreferences(newPreferences)
      toast({
        title: "Preferences saved",
        description: "Your video preferences have been updated.",
      })
      // Reload videos with new preferences
      setVideos([])
      setOffset(0)
      setHasMore(true)
      loadVideos(0, true)
    }
    
    setSavingPreferences(false)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const loadVideos = async (startOffset: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    let data: SocialVideo[] = []

    if (activeTab === "my-videos" && userId) {
      data = await SocialService.getUserVideos(userId, VIDEOS_PER_PAGE, startOffset)
    } else if (activeTab === "newest") {
      // Only filter by categories if user has explicitly set preferences
      const hasPreferences = userPreferences !== null && userPreferences !== undefined
      const categoryIds = hasPreferences && userPreferences.selected_categories.length > 0 
        ? userPreferences.selected_categories 
        : undefined
      
      if (categoryIds && categoryIds.length > 0) {
        // Fetch videos from selected categories
        for (const catId of categoryIds) {
          const catVideos = await SocialService.getVideos({
            categoryId: catId,
            limit: Math.ceil(VIDEOS_PER_PAGE / categoryIds.length),
            offset: startOffset,
          })
          data.push(...catVideos)
        }
        // Sort by created_at and limit
        data = data
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, VIDEOS_PER_PAGE)
      } else {
        data = await SocialService.getVideos({
          limit: VIDEOS_PER_PAGE,
          offset: startOffset,
        })
      }
    }

    if (reset) {
      setVideos(data)
      setLoading(false)
    } else {
      setVideos((prev) => [...prev, ...data])
      setLoadingMore(false)
    }

    setHasMore(data.length === VIDEOS_PER_PAGE)
    setOffset(startOffset + data.length)
  }

  const loadMoreVideos = () => {
    if (!loadingMore && hasMore) {
      loadVideos(offset)
    }
  }

  const handleLike = (videoId: string, liked: boolean) => {
    // Optimistic update handled in VideoCard
  }

  const handleFlag = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    setVideos([])
    setOffset(0)
    loadVideos(0, true)
  }

  const handleDeleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.user?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.user?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/30 via-white to-rose-50/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-800 font-display">
              Social
            </h1>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <Dialog open={showUpload} onOpenChange={setShowUpload}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-400 to-rose-500 text-white">
                  <ArrowUp className="w-4 h-4 mr-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">Upload Video</DialogTitle>
                </DialogHeader>
                {isAuthenticated && userId ? (
                  <VideoUpload
                    categories={categories}
                    userId={userId}
                    onSuccess={handleUploadSuccess}
                    onCancel={() => setShowUpload(false)}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">Please sign in to upload videos</p>
                    <Button
                      onClick={() => router.push("/auth/login")}
                      className="bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Not Logged In - Show Login Prompt */}
        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <ArabicCard>
              <ArabicCardContent>
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-pink-400" />
                </div>
                <ArabicCardTitle>Sign in to view videos</ArabicCardTitle>
                <ArabicCardDescription className="mb-6">
                  Media content is private and only available to registered members. Please sign in to access videos and connect with the community.
                </ArabicCardDescription>
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                >
                  Sign In
                </Button>
              </ArabicCardContent>
            </ArabicCard>
          </motion.div>
        ) : (
          <>
            {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="newest" className="data-[state=active]:bg-white">
              <Clock className="w-4 h-4 mr-2" />
              Newest
            </TabsTrigger>
            <TabsTrigger value="my-videos" className="data-[state=active]:bg-white">
              <User className="w-4 h-4 mr-2" />
              My Videos
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Settings Tab Content */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-6 border-pink-200/50">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-pink-500" />
                <h2 className="text-lg font-bold text-slate-800 font-display">
                  Video Preferences
                </h2>
              </div>
              <p className="text-slate-600 font-queensides mb-4">
                Select the categories you want to see in your feed. Leave empty to see all categories.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedCategories.includes(category.id)
                        ? `bg-gradient-to-r ${category.color} text-white`
                        : "bg-white text-slate-600 border border-slate-200 hover:border-pink-200"
                    }`}
                  >
                    {selectedCategories.includes(category.id) && (
                      <Check className="w-3 h-3" />
                    )}
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategories([])}
                  className="border-slate-200"
                >
                  Clear All
                </Button>
                <Button
                  onClick={saveUserPreferences}
                  disabled={savingPreferences}
                  className="bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                >
                  {savingPreferences ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Save Preferences
                    </span>
                  )}
                </Button>
              </div>

              {selectedCategories.length > 0 && (
                <p className="text-sm text-slate-500 mt-4">
                  Showing videos from {selectedCategories.length} selected categor{selectedCategories.length === 1 ? "y" : "ies"}
                </p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Videos Grid */}
        {activeTab !== "settings" && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-[9/16] bg-slate-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 bg-slate-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredVideos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 font-display mb-2">
                  No videos yet
                </h3>
                <p className="text-slate-600 font-queensides mb-6 max-w-md mx-auto">
                  {activeTab === "my-videos"
                    ? "You haven't uploaded any videos yet. Share your first video with the community!"
                    : selectedCategories.length > 0
                    ? "No videos found in your selected categories. Try selecting different categories in Settings."
                    : "Be the first to share a video!"}
                </p>
                {activeTab === "my-videos" && (
                  <Button
                    onClick={() => setShowUpload(true)}
                    className="bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upload Your First Video
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="snap-y snap-mandatory overflow-y-auto max-h-[80vh] md:max-h-none md:overflow-visible md:snap-none grid grid-cols-1 md:grid-cols-2 gap-6 scrollbar-hide">
                <AnimatePresence>
                  {filteredVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="snap-start"
                    >
                      <VideoCard
                        video={video}
                        onLike={handleLike}
                        onFlag={handleFlag}
                        onDelete={handleDeleteVideo}
                        isOwner={activeTab === "my-videos" && video.user_id === userId}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More Trigger - inside snap container */}
                <div ref={loadMoreRef} className="snap-start py-8 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading more videos...
                    </div>
                  )}
                  {!hasMore && videos.length > 0 && (
                    <p className="text-slate-400 text-sm">No more videos</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Toaster />
    </div>
  )
}
