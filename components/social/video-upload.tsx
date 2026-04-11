"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, X, Video, ImageIcon, AlertCircle, CheckCircle } from "lucide-react"
import { SocialCategory, SocialService } from "@/lib/social"
import { SocialMediaService } from "@/lib/storage"
import { useToast } from "@/app/hooks/use-toast"

interface VideoUploadProps {
  categories: SocialCategory[]
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function VideoUpload({ categories, userId, onSuccess, onCancel }: VideoUploadProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid video file (MP4, MOV)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video file must be less than 100MB",
        variant: "destructive",
      })
      return
    }

    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoPreview(url)

    // Get video duration
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      setDuration(Math.round(video.duration))
      URL.revokeObjectURL(video.src)
    }
    video.src = url
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Thumbnail must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setThumbnailFile(file)
    const url = URL.createObjectURL(file)
    setThumbnailPreview(url)
  }

  const uploadToStorage = async (file: File, folder: string): Promise<string | null> => {
    // Use SocialMediaService for consistent uploads with proper MIME type handling
    const result = folder === 'videos' 
      ? await SocialMediaService.uploadSocialVideo(file, userId)
      : await SocialMediaService.uploadSocialThumbnail(file, userId)

    if (result.success && result.path) {
      return result.path
    }

    console.error("Upload error:", result.error)
    toast({
      title: "Upload failed",
      description: result.error || "Failed to upload file",
      variant: "destructive",
    })
    return null
  }

  const handleSubmit = async () => {
    if (!title.trim() || !categoryId || !videoFile) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the title, select a category, and upload a video",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      // Upload video
      setUploadProgress(30)
      const videoUrl = await uploadToStorage(videoFile, "videos")
      if (!videoUrl) {
        throw new Error("Failed to upload video")
      }

      // Upload thumbnail if provided
      setUploadProgress(60)
      let thumbnailUrl = null
      if (thumbnailFile) {
        thumbnailUrl = await uploadToStorage(thumbnailFile, "thumbnails")
      }

      // Create video record
      setUploadProgress(80)
      const video = await SocialService.uploadVideo({
        userId,
        categoryId,
        title: title.trim(),
        description: description.trim(),
        videoUrl,
        thumbnailUrl: thumbnailUrl || undefined,
        duration,
      })

      if (!video) {
        throw new Error("Failed to create video record")
      }

      setUploadProgress(100)
      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded successfully.",
        variant: "default",
      })
      onSuccess?.()
    } catch (error) {
      console.error("Error uploading video:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const clearVideo = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setDuration(0)
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const clearThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }

  return (
    <Card className="p-6 border-pink-200/50">
      <h2 className="text-xl font-bold text-slate-800 font-display mb-6">
        Upload Video
      </h2>

      {/* Upload Guidelines Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Upload Guidelines:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>No videos with/off children</li>
              <li>Wear solid color clothes in videos</li>
              <li>No polka dots, leopard prints or busy designs</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Video Upload */}
        <div>
          <Label className="text-slate-700">
            Video <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2">
            {videoPreview ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full aspect-video rounded-xl bg-black"
                  controls
                />
                <button
                  onClick={clearVideo}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {duration > 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    Duration: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")}
                  </p>
                )}
              </div>
            ) : (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-pink-200 rounded-xl p-8 text-center cursor-pointer hover:border-pink-300 hover:bg-pink-50/50 transition-all"
              >
                <Video className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                <p className="text-slate-600 font-queensides">
                  Click to upload video
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  MP4, MOV up to 100MB
                </p>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div>
          <Label className="text-slate-700">Thumbnail (optional)</Label>
          <div className="mt-2">
            {thumbnailPreview ? (
              <div className="relative w-fit">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-40 h-24 object-cover rounded-xl"
                />
                <button
                  onClick={clearThumbnail}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-pink-200 hover:bg-pink-50/30 transition-all w-fit"
              >
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Add thumbnail</p>
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="title" className="text-slate-700">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Give your video a catchy title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="mt-2"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">
            {title.length}/100
          </p>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="text-slate-700">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your video..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-2"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">
            {description.length}/500
          </p>
        </div>

        {/* Category */}
        <div>
          <Label className="text-slate-700">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Uploading...</span>
              <span className="text-pink-600 font-medium">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !categoryId || !videoFile || uploading}
            className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Video
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
