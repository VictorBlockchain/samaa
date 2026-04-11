"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArabicEmptyStateCard, ArabicEmptyStateCardTitle, ArabicEmptyStateCardDescription } from "@/components/ui/arabic-empty-state-card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Flag,
  Store,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Eye,
  Trash2,
  Star,
  Sparkles,
  X
} from "lucide-react"
import { SocialVideo, SocialService, VideoComment } from "@/lib/social"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface VideoCardProps {
  video: SocialVideo
  onLike?: (videoId: string, liked: boolean) => void
  onFlag?: (videoId: string) => void
  onDelete?: (videoId: string) => void
  isOwner?: boolean
}

export function VideoCard({ video, onLike, onFlag, onDelete, isOwner = false }: VideoCardProps) {
  const { userId, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(video.likes)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<VideoComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasFlagged, setHasFlagged] = useState(false)
  const [showFlagDialog, setShowFlagDialog] = useState(false)
  const [flagReason, setFlagReason] = useState("")
  const [flagDescription, setFlagDescription] = useState("")
  const [viewsCount, setViewsCount] = useState(video.views)
  const [hasViewed, setHasViewed] = useState(false)

  // Intersection Observer - autoplay when visible, pause when not
  useEffect(() => {
    const videoEl = videoRef.current
    const containerEl = containerRef.current
    if (!videoEl || !containerEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is visible - try to play
            videoEl.play().then(() => {
              setIsPlaying(true)
              if (!hasViewed) {
                SocialService.incrementViews(video.id)
                setViewsCount((prev) => prev + 1)
                setHasViewed(true)
              }
            }).catch((err) => {
              // Autoplay may be blocked by browser, that's ok
              if (err.name !== 'AbortError') {
                console.warn("[VideoCard] Autoplay blocked:", err.name)
              }
            })
          } else {
            // Video is off screen - pause
            videoEl.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.6 } // 60% visible to trigger
    )

    observer.observe(containerEl)

    return () => {
      observer.disconnect()
    }
  }, [video.video_url, video.id, hasViewed])

  const flagReasons = [
    "Inappropriate content",
    "Spam",
    "Harassment",
    "Misinformation",
    "Copyright violation",
    "Other",
  ]

  useEffect(() => {
    if (userId) {
      checkLikeStatus()
      checkFlagStatus()
    }
  }, [userId, video.id])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    const handleError = () => {
      console.error("[VideoCard] Video error:", videoEl.error?.code, videoEl.error?.message)
    }

    videoEl.addEventListener('error', handleError)

    return () => {
      videoEl.removeEventListener('error', handleError)
    }
  }, [video.video_url])

  const checkLikeStatus = async () => {
    if (!userId) return
    const liked = await SocialService.hasUserLiked(video.id, userId)
    setIsLiked(liked)
  }

  const checkFlagStatus = async () => {
    if (!userId) return
    const flagged = await SocialService.hasUserFlagged(video.id, userId)
    setHasFlagged(flagged)
  }

  const handlePlayPause = async () => {
    if (!videoRef.current) return
    
    try {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        await videoRef.current.play()
        setIsPlaying(true)
        if (!hasViewed) {
          SocialService.incrementViews(video.id)
          setViewsCount((prev) => prev + 1)
          setHasViewed(true)
        }
      }
    } catch (error: any) {
      // AbortError is expected if play is interrupted — safe to ignore
      if (error.name !== 'AbortError') {
        console.error("Video play error:", error)
      }
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    const newLikedState = await SocialService.toggleLike(video.id, userId!)
    setIsLiked(newLikedState)
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1))
    onLike?.(video.id, newLikedState)
  }

  const handleFlag = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (!flagReason) return

    const success = await SocialService.flagVideo({
      videoId: video.id,
      userId: userId!,
      reason: flagReason,
      description: flagDescription,
    })

    if (success) {
      setHasFlagged(true)
      setShowFlagDialog(false)
      onFlag?.(video.id)
    }
  }

  const loadComments = async () => {
    const data = await SocialService.getComments(video.id)
    setComments(data)
  }

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !newComment.trim()) return

    setIsSubmitting(true)
    const comment = await SocialService.addComment({
      videoId: video.id,
      userId: userId!,
      content: newComment.trim(),
    })

    if (comment) {
      setComments((prev) => [comment, ...prev])
      setNewComment("")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!isAuthenticated || !isOwner) return
    
    const success = await SocialService.deleteVideo(video.id, userId!)
    if (success) {
      toast({
        title: "Video deleted",
        description: "Your video has been removed successfully.",
      })
      onDelete?.(video.id)
    } else {
      toast({
        title: "Delete failed",
        description: "Unable to delete video. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShopClick = () => {
    if (video.shopId) {
      router.push(`/shop/item?shopId=${video.shopId}`)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card ref={containerRef} className="overflow-hidden border-pink-200/50 hover:border-pink-300/60 transition-all min-h-[75vh] md:min-h-0 flex flex-col">
      {/* Video Player */}
      <div className="relative aspect-[9/16] md:aspect-[9/16] flex-1 bg-black">
        <video
          ref={videoRef}
          poster={video.thumbnail_url?.startsWith('http') ? video.thumbnail_url : (video.user?.profile_photo?.startsWith('http') ? video.user.profile_photo : undefined)}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
          onClick={handlePlayPause}
        >
          <source src={video.video_url} type="video/mp4" />
          Your browser does not support the video element.
        </video>

        {/* Play/Pause Overlay - hide when video is playing */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={handlePlayPause}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"
            >
              <Play className="w-8 h-8 text-pink-600 ml-1" />
            </motion.div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-slate-700" />
              ) : (
                <Play className="w-5 h-5 text-slate-700 ml-0.5" />
              )}
            </button>
            <button
              onClick={handleMuteToggle}
              className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-slate-700" />
              ) : (
                <Volume2 className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>

          {video.duration > 0 && (
            <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>

        {/* More Options */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-700" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete video
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowFlagDialog(true)} disabled={hasFlagged || isOwner}>
                <Flag className="w-4 h-4 mr-2" />
                {hasFlagged ? "Already flagged" : "Flag video"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        {/* User Info */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={video.user?.profile_photo} />
            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white">
              {video.user?.first_name?.[0]}
              {video.user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 font-queensides line-clamp-1">
              {video.title}
            </h3>
            <p className="text-sm text-slate-500 font-queensides">
              {video.user?.first_name} {video.user?.last_name}
            </p>
          </div>
          {video.hasShop && video.shopId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShopClick}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Store className="w-4 h-4 mr-1" />
              Shop
            </Button>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 font-queensides mb-3 line-clamp-2">
          {video.description}
        </p>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {video.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
                {video.category.icon} {video.category.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {viewsCount.toLocaleString()}
            </span>
            <span>{formatDistanceToNow(new Date(video.created_at))}</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
                isLiked
                  ? "bg-pink-100 text-pink-600"
                  : "bg-slate-100 text-slate-600 hover:bg-pink-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </motion.button>

            <Dialog open={showComments} onOpenChange={setShowComments}>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowComments(true)
                    loadComments()
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-pink-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{video.comments_count}</span>
                </motion.button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                {/* Header with glassmorphism */}
                <div className="relative bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-b border-pink-200/50 p-6">
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }} />
                  <div className="relative z-10">
                    {/* Close button */}
                    <button
                      onClick={() => setShowComments(false)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all group"
                    >
                      <X className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                    </button>
                    
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <DialogHeader>
                        <DialogTitle className="font-queensides text-xl font-bold text-slate-800">Comments</DialogTitle>
                      </DialogHeader>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-3">
                        <Star className="w-3 h-3 text-pink-300" />
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                        <Sparkles className="w-3 h-3 text-purple-300" />
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                        <Star className="w-3 h-3 text-blue-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white">
                  {comments.length === 0 ? (
                    <ArabicEmptyStateCard icon={<MessageCircle className="w-12 h-12" />}>
                      <ArabicEmptyStateCardTitle>No comments yet</ArabicEmptyStateCardTitle>
                      <ArabicEmptyStateCardDescription>Be the first to share your thoughts!</ArabicEmptyStateCardDescription>
                    </ArabicEmptyStateCard>
                  ) : (
                    comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-3 group"
                      >
                        <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-pink-100 group-hover:ring-pink-200 transition-all">
                          <AvatarImage src={comment.user?.profile_photo} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-sm font-semibold">
                            {comment.user?.first_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gradient-to-br from-slate-50 to-pink-50/50 rounded-2xl p-4 border border-slate-100 group-hover:border-pink-200 transition-all">
                            <p className="font-semibold text-sm text-slate-800 font-queensides mb-1">
                              {comment.user?.first_name} {comment.user?.last_name}
                            </p>
                            <p className="text-slate-600 text-sm font-queensides leading-relaxed">{comment.content}</p>
                          </div>
                          <p className="text-xs text-slate-400 font-queensides mt-2 ml-1">
                            {formatDistanceToNow(new Date(comment.created_at))}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Add Comment - Glass Footer */}
                {isAuthenticated && (
                  <div className="border-t border-pink-100 bg-gradient-to-r from-pink-50/50 via-white to-rose-50/50 p-6 space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="resize-none bg-white/80 backdrop-blur-sm border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 rounded-2xl font-queensides"
                        rows={3}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      />
                      <span className="relative z-10 font-queensides">
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Posting...
                          </span>
                        ) : (
                          "Post Comment"
                        )}
                      </span>
                    </motion.button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Flag Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Flag Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Reason for flagging</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {flagReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setFlagReason(reason)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      flagReason === reason
                        ? "bg-pink-100 border-pink-300 text-pink-700"
                        : "bg-white border-slate-200 hover:border-pink-200"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Additional details (optional)</Label>
              <Textarea
                placeholder="Describe the issue..."
                value={flagDescription}
                onChange={(e) => setFlagDescription(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            <Button
              onClick={handleFlag}
              disabled={!flagReason}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-white"
            >
              Submit Flag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
