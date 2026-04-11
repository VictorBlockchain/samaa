import { supabase } from "./supabase"
import { getSignedUrlForPath, storagePathFromUrlOrPath } from "./storage"

// Social video bucket name (private bucket — use signed URLs)
const SOCIAL_BUCKET = "social-videos"

export interface SocialCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  is_active: boolean
  display_order: number
}

export interface SocialVideo {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  views: number
  likes: number
  comments_count: number
  flags_count: number
  is_flagged: boolean
  is_available: boolean
  created_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    profile_photo: string
  }
  category?: SocialCategory
  hasShop?: boolean
  shopId?: string
}

export interface VideoComment {
  id: string
  video_id: string
  user_id: string
  content: string
  likes: number
  parent_id: string | null
  is_deleted: boolean
  created_at: string
  user?: {
    id: string
    first_name: string
    last_name: string
    profile_photo: string
  }
  replies?: VideoComment[]
}

export interface VideoFlag {
  id: string
  video_id: string
  user_id: string
  reason: string
  description: string
  created_at: string
}

export const SocialService = {
  // Categories
  async getCategories(): Promise<SocialCategory[]> {
    const { data, error } = await supabase
      .from("social_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    return data || []
  },

  // Videos
  async getVideos(options: {
    categoryId?: string
    limit?: number
    offset?: number
    userId?: string
  } = {}): Promise<SocialVideo[]> {
    const { categoryId, limit = 10, offset = 0, userId } = options

    let query = supabase
      .from("social_videos")
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_photo,
          profile_photos
        ),
        category:category_id (*)
      `)
      .eq("is_available", true)
      .eq("is_flagged", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching videos:", error)
      return []
    }

    // Check if users have shops and convert storage paths to signed URLs
    const videosWithShopInfo = await Promise.all(
      (data || []).map(async (video: any) => {
        const hasShop = await this.userHasShop(video.user_id)
        
        // Convert storage paths/URLs to signed URLs (private bucket)
        // DB may contain either a path or a full public URL — handle both
        let videoUrl = video.video_url
        if (video.video_url) {
          const path = storagePathFromUrlOrPath(SOCIAL_BUCKET, video.video_url)
          const signed = await getSignedUrlForPath(SOCIAL_BUCKET, path, 7200)
          if (signed) {
            videoUrl = signed
          } else {
            console.warn("Failed to get signed URL for video:", video.video_url, "path:", path)
          }
        }
        
        let thumbnailUrl = video.thumbnail_url
        if (video.thumbnail_url) {
          const path = storagePathFromUrlOrPath(SOCIAL_BUCKET, video.thumbnail_url)
          const signed = await getSignedUrlForPath(SOCIAL_BUCKET, path, 7200)
          if (signed) thumbnailUrl = signed
        }

        // Resolve user's profile photo to a signed URL for thumbnail fallback
        let userProfilePhoto: string | undefined
        const rawPhoto = video.user?.profile_photos?.[0] || video.user?.profile_photo
        if (rawPhoto) {
          const photoPath = storagePathFromUrlOrPath("profile-photos", rawPhoto)
          userProfilePhoto = await getSignedUrlForPath("profile-photos", photoPath, 7200) || undefined
        }

        return {
          ...video,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          user: video.user ? {
            ...video.user,
            profile_photo: userProfilePhoto || video.user.profile_photo,
          } : video.user,
          hasShop: hasShop.hasShop,
          shopId: hasShop.shopId,
        }
      })
    )

    return videosWithShopInfo
  },

  async getVideoById(videoId: string): Promise<SocialVideo | null> {
    const { data, error } = await supabase
      .from("social_videos")
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_photo,
          profile_photos
        ),
        category:category_id (*)
      `)
      .eq("id", videoId)
      .single()

    if (error) {
      console.error("Error fetching video:", error)
      return null
    }

    const hasShop = await this.userHasShop(data.user_id)
    
    // Convert storage paths/URLs to signed URLs (private bucket)
    let videoUrl = data.video_url
    if (data.video_url) {
      const path = storagePathFromUrlOrPath(SOCIAL_BUCKET, data.video_url)
      const signed = await getSignedUrlForPath(SOCIAL_BUCKET, path, 7200)
      if (signed) {
        videoUrl = signed
      } else {
        console.warn("Failed to get signed URL for video:", data.video_url, "path:", path)
      }
    }
    
    let thumbnailUrl = data.thumbnail_url
    if (data.thumbnail_url) {
      const path = storagePathFromUrlOrPath(SOCIAL_BUCKET, data.thumbnail_url)
      const signed = await getSignedUrlForPath(SOCIAL_BUCKET, path, 7200)
      if (signed) thumbnailUrl = signed
    }

    // Resolve user's profile photo to a signed URL for thumbnail fallback
    let userProfilePhoto: string | undefined
    const rawPhoto = data.user?.profile_photos?.[0] || data.user?.profile_photo
    if (rawPhoto) {
      const photoPath = storagePathFromUrlOrPath("profile-photos", rawPhoto)
      userProfilePhoto = await getSignedUrlForPath("profile-photos", photoPath, 7200) || undefined
    }

    return {
      ...data,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      user: data.user ? {
        ...data.user,
        profile_photo: userProfilePhoto || data.user.profile_photo,
      } : data.user,
      hasShop: hasShop.hasShop,
      shopId: hasShop.shopId,
    }
  },

  async uploadVideo(videoData: {
    userId: string
    categoryId: string
    title: string
    description: string
    videoUrl: string
    thumbnailUrl?: string
    duration?: number
  }): Promise<SocialVideo | null> {
    const { data, error } = await supabase
      .from("social_videos")
      .insert({
        user_id: videoData.userId,
        category_id: videoData.categoryId,
        title: videoData.title,
        description: videoData.description,
        video_url: videoData.videoUrl,
        thumbnail_url: videoData.thumbnailUrl,
        duration: videoData.duration,
      })
      .select()
      .single()

    if (error) {
      console.error("Error uploading video:", error)
      return null
    }

    return data
  },

  async incrementViews(videoId: string): Promise<void> {
    await supabase.rpc("increment_video_views", { video_id: videoId })
  },

  async deleteVideo(videoId: string, userId: string): Promise<boolean> {
    // First, get the video to find the storage paths
    const { data: video, error: fetchError } = await supabase
      .from("social_videos")
      .select("video_url, thumbnail_url")
      .eq("id", videoId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !video) {
      console.error("Error fetching video for deletion:", fetchError)
      return false
    }

    // Delete video file from storage
    if (video.video_url) {
      const videoPath = storagePathFromUrlOrPath(SOCIAL_BUCKET, video.video_url)
      const { error: deleteVideoError } = await supabase.storage
        .from(SOCIAL_BUCKET)
        .remove([videoPath])
      if (deleteVideoError) {
        console.warn("Failed to delete video file from storage:", deleteVideoError.message)
        // Continue anyway - we still want to delete the DB record
      }
    }

    // Delete thumbnail from storage
    if (video.thumbnail_url) {
      const thumbnailPath = storagePathFromUrlOrPath(SOCIAL_BUCKET, video.thumbnail_url)
      const { error: deleteThumbError } = await supabase.storage
        .from(SOCIAL_BUCKET)
        .remove([thumbnailPath])
      if (deleteThumbError) {
        console.warn("Failed to delete thumbnail from storage:", deleteThumbError.message)
        // Continue anyway
      }
    }

    // Delete the database record
    const { error: deleteDbError } = await supabase
      .from("social_videos")
      .delete()
      .eq("id", videoId)
      .eq("user_id", userId)

    if (deleteDbError) {
      console.error("Error deleting video from database:", deleteDbError)
      return false
    }

    return true
  },

  // Comments
  async getComments(videoId: string): Promise<VideoComment[]> {
    const { data, error } = await supabase
      .from("video_comments")
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_photo
        )
      `)
      .eq("video_id", videoId)
      .eq("is_deleted", false)
      .is("parent_id", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching comments:", error)
      return []
    }

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment: any) => {
        const replies = await this.getReplies(comment.id)
        return { ...comment, replies }
      })
    )

    return commentsWithReplies
  },

  async getReplies(commentId: string): Promise<VideoComment[]> {
    const { data, error } = await supabase
      .from("video_comments")
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_photo
        )
      `)
      .eq("parent_id", commentId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching replies:", error)
      return []
    }

    return data || []
  },

  async addComment(commentData: {
    videoId: string
    userId: string
    content: string
    parentId?: string
  }): Promise<VideoComment | null> {
    const { data, error } = await supabase
      .from("video_comments")
      .insert({
        video_id: commentData.videoId,
        user_id: commentData.userId,
        content: commentData.content,
        parent_id: commentData.parentId || null,
      })
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_photo
        )
      `)
      .single()

    if (error) {
      console.error("Error adding comment:", error)
      return null
    }

    return { ...data, replies: [] }
  },

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("video_comments")
      .update({ is_deleted: true })
      .eq("id", commentId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error deleting comment:", error)
      return false
    }

    return true
  },

  // Flags
  async flagVideo(flagData: {
    videoId: string
    userId: string
    reason: string
    description?: string
  }): Promise<boolean> {
    const { error } = await supabase.from("video_flags").insert({
      video_id: flagData.videoId,
      user_id: flagData.userId,
      reason: flagData.reason,
      description: flagData.description || "",
    })

    if (error) {
      console.error("Error flagging video:", error)
      return false
    }

    return true
  },

  async hasUserFlagged(videoId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("video_flags")
      .select("id")
      .eq("video_id", videoId)
      .eq("user_id", userId)
      .maybeSingle()

    // PGRST116 = no rows found, which means not flagged
    // 406 = not acceptable, also means no rows found with strict filters
    if (error && error.code !== "PGRST116") {
      // Ignore 406 errors which occur when no rows match
      if (error.code !== "406") {
        console.error("Error checking flag status:", error)
      }
      return false
    }

    return !!data
  },

  // Likes
  async toggleLike(videoId: string, userId: string): Promise<boolean> {
    const { data: existingLike } = await supabase
      .from("video_likes")
      .select("id")
      .eq("video_id", videoId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", userId)

      if (error) {
        console.error("Error unliking video:", error)
        return false
      }

      // Decrement likes count
      await supabase
        .from("social_videos")
        .update({ likes: supabase.rpc("decrement", { x: 1 }) })
        .eq("id", videoId)

      return false
    } else {
      // Like
      const { error } = await supabase.from("video_likes").insert({
        video_id: videoId,
        user_id: userId,
      })

      if (error) {
        console.error("Error liking video:", error)
        return false
      }

      // Increment likes count
      await supabase
        .from("social_videos")
        .update({ likes: supabase.rpc("increment", { x: 1 }) })
        .eq("id", videoId)

      return true
    }
  },

  async hasUserLiked(videoId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("video_likes")
      .select("id")
      .eq("video_id", videoId)
      .eq("user_id", userId)
      .maybeSingle()

    // PGRST116 = no rows found, which means not liked
    // 406 = not acceptable, also means no rows found with strict filters
    if (error && error.code !== "PGRST116") {
      // Ignore 406 errors which occur when no rows match
      if (error.code !== "406") {
        console.error("Error checking like status:", error)
      }
      return false
    }

    return !!data
  },

  // Helper: Check if user has a shop
  async userHasShop(userId: string): Promise<{ hasShop: boolean; shopId?: string }> {
    const { data, error } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (error) {
      // Ignore 406 errors which occur when no rows match
      if (error.code !== "406" && error.code !== "PGRST116") {
        console.error("Error checking shop status:", error)
      }
      return { hasShop: false }
    }

    if (!data) {
      return { hasShop: false }
    }

    return { hasShop: true, shopId: data.id }
  },

  // Get videos by user
  async getUserVideos(userId: string, limit = 10, offset = 0): Promise<SocialVideo[]> {
    const { data, error } = await supabase
      .from("social_videos")
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          profile_photo,
          profile_photos
        ),
        category:category_id (*)
      `)
      .eq("user_id", userId)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching user videos:", error)
      return []
    }

    // Convert storage paths to signed URLs (private bucket)
    const resolved = await Promise.all(
      (data || []).map(async (video: any) => {
        let videoUrl = video.video_url
        let thumbnailUrl = video.thumbnail_url
        
        if (video.video_url) {
          const path = storagePathFromUrlOrPath(SOCIAL_BUCKET, video.video_url)
          const signed = await getSignedUrlForPath(SOCIAL_BUCKET, path, 7200)
          if (signed) videoUrl = signed
        }
        
        if (video.thumbnail_url) {
          const path = storagePathFromUrlOrPath(SOCIAL_BUCKET, video.thumbnail_url)
          const signed = await getSignedUrlForPath(SOCIAL_BUCKET, path, 7200)
          if (signed) thumbnailUrl = signed
        }

        let userProfilePhoto: string | undefined
        const rawPhoto = video.user?.profile_photos?.[0] || video.user?.profile_photo
        if (rawPhoto) {
          const photoPath = storagePathFromUrlOrPath("profile-photos", rawPhoto)
          userProfilePhoto = await getSignedUrlForPath("profile-photos", photoPath, 7200) || undefined
        }

        return {
          ...video,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          user: video.user ? {
            ...video.user,
            profile_photo: userProfilePhoto || video.user.profile_photo,
          } : video.user,
        }
      })
    )

    return resolved
  },
}
