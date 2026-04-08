import { supabase } from './supabase'

// Storage configuration
export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg'],
  BUCKETS: {
    PROFILES: 'profiles',
    PRODUCTS: 'products',
    VOICE_NOTES: 'voice-notes',
    VIDEOS: 'videos'
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

// Get public URL for a file
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Upload file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const url = getPublicUrl(bucket, data.path)
    return { success: true, url }
  } catch (e: any) {
    return { success: false, error: e?.message || 'Upload failed' }
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
  ): Promise<{ success: boolean; url?: string; error?: string }> {
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
  ): Promise<{ success: boolean; url?: string; error?: string }> {
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
  ): Promise<{ success: boolean; url?: string; error?: string }> {
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
    const path = generateFileName(file.name, shopId)
    return await uploadFile(STORAGE_CONFIG.BUCKETS.PRODUCTS, path, file, onProgress)
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
    const path = generateFileName(file.name, shopId)
    return await uploadFile(STORAGE_CONFIG.BUCKETS.PRODUCTS, path, file, onProgress)
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
