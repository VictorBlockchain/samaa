import { supabase } from './supabase'

// Storage configuration
export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  // Must match buckets created by POST /api/setup-storage (and schema.sql)
  BUCKETS: {
    PROFILES: 'profile-photos',
    SHOP_IMAGES: 'shop-images',
    SHOP_VIDEOS: 'shop-videos',
    VOICE_NOTES: 'profile-audio',
    VIDEOS: 'profile-videos',
    SOCIAL_VIDEOS: 'social-videos',
  }
}

// File validation
export function validateFile(file: File, type: 'image' | 'video' | 'audio'): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  // Check file type
  let allowedTypes: string[]
  switch (type) {
    case 'image':
      allowedTypes = STORAGE_CONFIG.ALLOWED_IMAGE_TYPES
      break
    case 'video':
      allowedTypes = STORAGE_CONFIG.ALLOWED_VIDEO_TYPES
      break
    case 'audio':
      allowedTypes = STORAGE_CONFIG.ALLOWED_AUDIO_TYPES
      break
    default:
      return { valid: false, error: 'Invalid file type' }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  return { valid: true }
}

// Generate unique file name
export function generateFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  return `${userId}/${timestamp}.${extension}`
}

/** Extract object path within `bucket` from a storage path or full Supabase URL. */
export function storagePathFromUrlOrPath(bucket: string, urlOrPath: string): string {
  const t = urlOrPath.trim()
  if (!t.startsWith("http")) {
    return t.replace(/^\/+/, "")
  }
  const escaped = bucket.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`/${escaped}/(.+?)(?:\\?|$)`)
  const m = t.match(re)
  if (m?.[1]) {
    try {
      return decodeURIComponent(m[1])
    } catch {
      return m[1]
    }
  }
  return t
}

/**
 * Time-limited URL for private buckets (use in the app with an authenticated session).
 * Persist `path` in the database, not this URL.
 */
export async function getSignedUrlForPath(
  bucket: string,
  pathOrUrl: string,
  expiresIn = 3600,
): Promise<string | null> {
  const path = storagePathFromUrlOrPath(bucket, pathOrUrl)
  if (!path) return null
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error || !data?.signedUrl) {
    return null
  }
  return data.signedUrl
}

/** @deprecated Use getSignedUrlForPath for private buckets or public shop static URLs only */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export type UploadResult = {
  success: boolean
  /** Storage object path to store in Postgres, e.g. `<userId>/<timestamp>.jpg` */
  path?: string
  /** Short-lived URL for immediate UI; do not persist */
  signedUrl?: string
  /** Alias of signedUrl for backward compatibility */
  url?: string
  error?: string
}

// Upload file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 3600)

    if (signError || !signed?.signedUrl) {
      return {
        success: true,
        path: data.path,
        error: signError?.message || "Upload succeeded but could not create signed URL",
      }
    }

    return {
      success: true,
      path: data.path,
      signedUrl: signed.signedUrl,
      url: signed.signedUrl,
    }
  } catch (e: any) {
    return { success: false, error: e?.message || "Upload failed" }
  }
}

// Delete file from Supabase Storage
export async function deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message || 'Delete failed' }
  }
}

// Profile-specific upload functions
export class ProfileMediaService {
  
  // Upload profile photo
  static async uploadProfilePhoto(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const validation = validateFile(file, 'image')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    const path = generateFileName(file.name, userId)
    return await uploadFile(STORAGE_CONFIG.BUCKETS.PROFILES, path, file, onProgress)
  }

  // Upload profile video
  static async uploadProfileVideo(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const validation = validateFile(file, 'video')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    const path = generateFileName(file.name, userId)
    return await uploadFile(STORAGE_CONFIG.BUCKETS.VIDEOS, path, file, onProgress)
  }

  // Upload profile audio
  static async uploadProfileAudio(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const validation = validateFile(file, 'audio')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    const path = generateFileName(file.name, userId)
    return await uploadFile(STORAGE_CONFIG.BUCKETS.VOICE_NOTES, path, file, onProgress)
  }

  // Delete profile media
  static async deleteProfileMedia(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    return await deleteFile(bucket, path)
  }
}

// Social media upload functions
export class SocialMediaService {
  
  // Upload social video
  static async uploadSocialVideo(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const validation = validateFile(file, 'video')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`
    const path = `${userId}/videos/${fileName}`
    return await uploadFile(STORAGE_CONFIG.BUCKETS.SOCIAL_VIDEOS, path, file, onProgress)
  }

  // Upload social video thumbnail
  static async uploadSocialThumbnail(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const validation = validateFile(file, 'image')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`
    const path = `${userId}/thumbnails/${fileName}`
    return await uploadFile(STORAGE_CONFIG.BUCKETS.SOCIAL_VIDEOS, path, file, onProgress)
  }
}

// Shop-specific upload functions
export class ShopMediaService {
  
  // Upload shop image
  static async uploadShopImage(
    file: File,
    shopId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const validation = validateFile(file, 'image')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    const path = generateFileName(file.name, shopId)
    return await uploadFile(STORAGE_CONFIG.BUCKETS.SHOP_IMAGES, path, file, onProgress)
  }

  // Upload shop video
  static async uploadShopVideo(
    file: File,
    shopId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const validation = validateFile(file, 'video')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }
    const path = generateFileName(file.name, shopId)
    return await uploadFile(STORAGE_CONFIG.BUCKETS.SHOP_VIDEOS, path, file, onProgress)
  }
}

// Utility function to get file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
