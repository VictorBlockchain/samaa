import { supabase } from './supabase'

// Storage configuration
export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB in bytes (configurable)
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  BUCKETS: {
    PROFILE_PHOTOS: 'profile-photos',
    PROFILE_VIDEOS: 'profile-videos', 
    PROFILE_AUDIO: 'profile-audio',
    SHOP_IMAGES: 'shop-images',
    SHOP_VIDEOS: 'shop-videos'
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
export function generateFileName(originalName: string, userId: string, type: string): string {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  return `${userId}/${type}/${timestamp}.${extension}`
}

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Delete file from Supabase Storage
export async function deleteFile(bucket: string, fileName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

// Profile-specific upload functions
export class ProfileMediaService {
  
  // Upload profile photo
  static async uploadProfilePhoto(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const validation = validateFile(file, 'image')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const fileName = generateFileName(file.name, userId, 'photos')
    return await uploadFile(file, STORAGE_CONFIG.BUCKETS.PROFILE_PHOTOS, fileName, onProgress)
  }

  // Upload profile video
  static async uploadProfileVideo(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const validation = validateFile(file, 'video')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const fileName = generateFileName(file.name, userId, 'videos')
    return await uploadFile(file, STORAGE_CONFIG.BUCKETS.PROFILE_VIDEOS, fileName, onProgress)
  }

  // Upload profile audio
  static async uploadProfileAudio(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const validation = validateFile(file, 'audio')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const fileName = generateFileName(file.name, userId, 'audio')
    return await uploadFile(file, STORAGE_CONFIG.BUCKETS.PROFILE_AUDIO, fileName, onProgress)
  }

  // Delete profile media
  static async deleteProfileMedia(
    url: string,
    type: 'photo' | 'video' | 'audio'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract file path from URL
      const urlParts = url.split('/')
      const fileName = urlParts.slice(-3).join('/') // userId/type/filename

      let bucket: string
      switch (type) {
        case 'photo':
          bucket = STORAGE_CONFIG.BUCKETS.PROFILE_PHOTOS
          break
        case 'video':
          bucket = STORAGE_CONFIG.BUCKETS.PROFILE_VIDEOS
          break
        case 'audio':
          bucket = STORAGE_CONFIG.BUCKETS.PROFILE_AUDIO
          break
        default:
          return { success: false, error: 'Invalid media type' }
      }

      return await deleteFile(bucket, fileName)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  }
}

// Shop-specific upload functions
export class ShopMediaService {
  
  // Upload shop image
  static async uploadShopImage(
    file: File,
    shopId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const validation = validateFile(file, 'image')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const fileName = generateFileName(file.name, shopId, 'images')
    return await uploadFile(file, STORAGE_CONFIG.BUCKETS.SHOP_IMAGES, fileName, onProgress)
  }

  // Upload shop video
  static async uploadShopVideo(
    file: File,
    shopId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    const validation = validateFile(file, 'video')
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    const fileName = generateFileName(file.name, shopId, 'videos')
    return await uploadFile(file, STORAGE_CONFIG.BUCKETS.SHOP_VIDEOS, fileName, onProgress)
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
