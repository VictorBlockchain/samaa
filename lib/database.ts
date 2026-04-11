import { supabase } from './supabase'
import type { Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']
type UserSettings = Database['public']['Tables']['user_settings']['Row']
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

// Profile Operations
export class ProfileService {
  
  // Get profile by user ID (Supabase Auth user ID)
  static async getProfileByUserId(userId: string): Promise<User | null> {
    try {
      // Guard against null/undefined userId
      if (!userId || userId === 'null' || userId === 'undefined') {
        console.warn('[ProfileService] getProfileByUserId called with invalid userId:', userId)
        return null
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching profile by user ID:', error)
      return null
    }
  }

  // Legacy method - get profile by wallet address (deprecated, use getProfileByUserId)
  static async getProfileByAddress(walletAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_by_principal', {
        p_principal: walletAddress,
      })

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        throw error
      }

      return data as any
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  static async createProfile(profileData: UserInsert): Promise<User | null> {
    try {
      const principal = (profileData as any).principal ?? (profileData as any).wallet ?? (profileData as any).solana_address
      const { data, error } = await supabase.rpc('upsert_user_minimal', {
        p_principal: principal,
        p_first_name: (profileData as any).first_name ?? null,
        p_last_name: (profileData as any).last_name ?? null,
        p_gender: (profileData as any).gender ?? null,
        p_location: (profileData as any).location ?? null,
        p_bio: (profileData as any).bio ?? null,
        p_interests: (profileData as any).interests ?? null,
        p_profile_photo: (profileData as any).profile_photo ?? null,
      })

      if (error) {
        throw error
      }

      return data as any
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }

  static async updateProfile(walletAddress: string, updates: UserUpdate): Promise<User | null> {
    try {
      const principal = walletAddress
      const { data, error } = await supabase.rpc('update_user_profile_json', {
        p_principal: principal,
        p_profile: updates as any,
      })

      if (error) {
        throw error
      }

      return data as any
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  }

  /**
   * Ensure a public.users row exists for this Supabase Auth user (id = auth.users.id).
   * Inserts only when missing so we do not rewrite created_at on every app load.
   */
  static async ensureUserRowForAuthId(userId: string): Promise<User | null> {
    try {
      const existing = await this.getProfileByUserId(userId)
      if (existing) {
        return existing
      }
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          is_active: true,
          last_active: now,
          created_at: now,
          updated_at: now,
        } as any)
        .select()
        .single()

      if (error) {
        if ((error as any).code === '23505') {
          return await this.getProfileByUserId(userId)
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Error ensuring user row:', error)
      return null
    }
  }

  // Update profile by user ID (Supabase Auth user ID). Inserts the row if missing (upsert).
  static async updateProfileByUserId(userId: string, updates: Partial<UserUpdate>): Promise<User | null> {
    try {
      const updatedAt = new Date().toISOString()
      const merged = { ...updates, updated_at: updatedAt }
      const cleaned = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== undefined),
      ) as Record<string, unknown>

      const { data, error } = await supabase
        .from('users')
        .upsert({ id: userId, ...cleaned } as any, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating profile by user ID:', error)
      return null
    }
  }

  // Upsert profile (create or update) using wallet address; accepts legacy solana_address
  static async upsertProfile(profileData: UserInsert & { principal?: string; wallet?: string; solana_address?: string }): Promise<User | null> {
    try {
      const principal = (profileData as any).principal ?? (profileData as any).wallet ?? (profileData as any).solana_address
      if (!principal) {
        throw new Error('upsertProfile requires a principal')
      }

      // Check if profile exists
      const existing = await this.getProfileByAddress(principal)
      
      if (existing) {
        // Update existing profile
        const updatedAt = new Date().toISOString()
        const cleaned = Object.fromEntries(
          Object.entries(profileData).filter(([, v]) => v !== undefined),
        ) as Record<string, unknown>

        const { data, error } = await supabase
          .from('users')
          .update({ ...cleaned, updated_at: updatedAt } as any)
          .eq('principal', principal)
          .select()
          .single()

        if (error) {
          throw error
        }
        return data
      } else {
        // Create new profile
        const now = new Date().toISOString()
        const { data, error } = await supabase
          .from('users')
          .insert({ ...profileData, created_at: now, updated_at: now } as any)
          .select()
          .single()

        if (error) {
          // If duplicate key error, fetch and return existing
          if ((error as any).code === '23505') {
            return await this.getProfileByAddress(principal)
          }
          throw error
        }
        return data
      }
    } catch (error) {
      console.error('Error upserting profile:', error)
      return null
    }
  }

  // Get all profiles for matching (with pagination)
  static async getAllProfiles(limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching all profiles:', error)
      return []
    }
  }

  // Search profiles by criteria
  static async searchProfiles(criteria: {
    gender?: 'male' | 'female'
    ageMin?: number
    ageMax?: number
    location?: string
    religiosity?: string[]
    limit?: number
    offset?: number
  }): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('is_active', true)

      if (criteria.gender) {
        query = query.eq('gender', criteria.gender)
      }

      if (criteria.ageMin) {
        query = query.gte('age', criteria.ageMin)
      }

      if (criteria.ageMax) {
        query = query.lte('age', criteria.ageMax)
      }

      if (criteria.location) {
        query = query.ilike('location', `%${criteria.location}%`)
      }

      if (criteria.religiosity && criteria.religiosity.length > 0) {
        query = query.in('religiosity', criteria.religiosity)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(criteria.offset || 0, (criteria.offset || 0) + (criteria.limit || 50) - 1)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error searching profiles:', error)
      return []
    }
  }

  // Update last active timestamp
  static async updateLastActive(principal: string): Promise<void> {
    try {
      await supabase.rpc('set_last_active', { p_principal: principal })
    } catch (error) {
      console.error('Error updating last active:', error)
    }
  }
}

// User Settings Operations
export class UserSettingsService {
  
  // Get user settings
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        return null
      }
      
      if (!session) {
        console.warn('No active session when fetching user settings')
        return null
      }

      // Verify the userId matches the authenticated user
      if (userId !== session.user.id) {
        console.error('User ID mismatch: attempting to fetch settings for different user', {
          providedUserId: userId,
          sessionUserId: session.user.id
        })
        return null
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        // Log detailed error for debugging
        console.error('Error fetching user settings:', {
          error,
          userId,
          sessionUserId: session.user.id,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        })
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user settings:', error)
      return null
    }
  }

  // Create or update user settings
  static async upsertUserSettings(userId: string, settings: Partial<UserSettingsInsert>): Promise<UserSettings | null> {
    try {
      // First check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session:', sessionError)
        return null
      }
      
      if (!session) {
        console.error('No active session when upserting user settings')
        return null
      }

      // Verify the userId matches the authenticated user
      if (userId !== session.user.id) {
        console.error('User ID mismatch: attempting to update settings for different user', {
          providedUserId: userId,
          sessionUserId: session.user.id
        })
        return null
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error('Error upserting user settings:', {
          error,
          userId,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        })
        return null
      }

      return data
    } catch (error) {
      console.error('Error upserting user settings:', error)
      return null
    }
  }
}

// Statistics Operations
export class StatsService {
  
  // Get platform statistics
  static async getPlatformStats() {
    try {
      const [
        { count: totalWomen },
        { count: totalMen },
        { count: totalMarriages },
        { count: dowryWallets },
        { count: purseWallets }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('gender', 'female').eq('is_active', true),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('gender', 'male').eq('is_active', true),
        // For now, marriages will be 0 until we implement the matching system
        Promise.resolve({ count: 0 }),
        supabase.from('users').select('*', { count: 'exact', head: true }).not('dowry_wallet_address', 'is', null),
        supabase.from('users').select('*', { count: 'exact', head: true }).not('purse_wallet_address', 'is', null)
      ])

      return {
        totalWomen: totalWomen || 0,
        totalMen: totalMen || 0,
        totalMarriages: totalMarriages || 0,
        dowryWalletsMinted: dowryWallets || 0,
        purseWalletsMinted: purseWallets || 0
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      return {
        totalWomen: 0,
        totalMen: 0,
        totalMarriages: 0,
        dowryWalletsMinted: 0,
        purseWalletsMinted: 0
      }
    }
  }
}

// Product Categories Operations
export class ProductCategoryService {

  // Get all active categories
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }
}

// Shop Types
export interface Shop {
  id: string
  owner_id: string
  name: string
  description?: string
  logo_url?: string
  banner_url?: string
  status: 'pending' | 'active' | 'suspended' | 'closed'
  verified: boolean
  
  // Address
  address_street?: string
  address_city?: string
  address_state?: string
  address_country?: string
  address_postal_code?: string
  
  // Contact
  contact_email?: string
  contact_phone?: string
  website_url?: string
  instagram_handle?: string
  facebook_url?: string
  
  // Business/Payment
  paypal_email?: string
  bitcoin_address?: string
  ethereum_address?: string
  bank_account_info?: {
    account_name?: string
    bank_name?: string
    account_number?: string
    routing_number?: string
    swift_code?: string
  }
  
  // Category & Type
  shop_type: string
  shop_category_id?: string
  
  // Policies
  return_policy?: string
  return_policy_days: number
  shipping_policy?: string
  shipping_costs?: {
    domestic?: { standard?: number; express?: number }
    international?: { standard?: number; express?: number }
  }
  processing_time: string
  free_shipping_threshold?: number
  
  // Stats
  rating: number
  total_reviews: number
  total_sales: number
  total_products: number
  response_time_hours?: number
  response_rate: number
  on_time_delivery_rate: number
  
  // Settings
  vacation_mode: boolean
  vacation_message?: string
  auto_accept_orders: boolean
  minimum_order_amount: number
  
  created_at: string
  updated_at: string
}

export interface ShopReview {
  id: string
  shop_id: string
  user_id: string
  order_id?: string
  rating: number
  title?: string
  review_text?: string
  is_verified_purchase: boolean
  helpful_count: number
  reply_text?: string
  replied_at?: string
  created_at: string
  user?: {
    first_name?: string
    last_name?: string
    profile_photo?: string
  }
}

export interface CreateShopData {
  name: string
  description?: string
  shop_type: string
  
  // Address
  address_street?: string
  address_city?: string
  address_state?: string
  address_country?: string
  address_postal_code?: string
  
  // Contact
  contact_email: string
  contact_phone?: string
  
  // Payment
  paypal_email?: string
  bitcoin_address?: string
  
  // Policies
  return_policy?: string
  return_policy_days?: number
  shipping_policy?: string
  shipping_costs?: Shop['shipping_costs']
  processing_time?: string
  free_shipping_threshold?: number
}

// Shop Operations
export class ShopService {

  // Get shop by owner user ID (Supabase Auth)
  static async getShopByOwner(userId: string): Promise<Shop | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data as Shop
    } catch (error) {
      console.error('Error fetching shop by owner:', error)
      return null
    }
  }

  // Legacy: Get shop by owner wallet address
  static async getShopByOwnerWallet(ownerWallet: string): Promise<Shop | null> {
    try {
      // First get user by principal/wallet
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_principal', { p_principal: ownerWallet })
      
      if (userError || !userData) {
        return null
      }
      
      return this.getShopByOwner((userData as any).id)
    } catch (error) {
      console.error('Error fetching shop by wallet:', error)
      return null
    }
  }

  // Get shop by ID
  static async getShopById(shopId: string): Promise<Shop | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data as Shop
    } catch (error) {
      console.error('Error fetching shop by ID:', error)
      return null
    }
  }

  // Get shop with reviews
  static async getShopWithReviews(shopId: string): Promise<{ shop: Shop | null; reviews: ShopReview[] }> {
    try {
      const [shopResult, reviewsResult] = await Promise.all([
        supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single(),
        supabase
          .from('shop_reviews')
          .select(`
            *,
            user:users(first_name, last_name, profile_photo)
          `)
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false })
      ])

      return {
        shop: shopResult.data as Shop || null,
        reviews: (reviewsResult.data || []) as ShopReview[]
      }
    } catch (error) {
      console.error('Error fetching shop with reviews:', error)
      return { shop: null, reviews: [] }
    }
  }

  // Create new shop
  static async createShop(userId: string, shopData: CreateShopData): Promise<Shop | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .insert({
          owner_id: userId,
          status: 'pending',
          verified: false,
          rating: 0,
          total_reviews: 0,
          total_sales: 0,
          total_products: 0,
          response_rate: 100,
          on_time_delivery_rate: 100,
          vacation_mode: false,
          auto_accept_orders: true,
          minimum_order_amount: 0,
          return_policy_days: 14,
          processing_time: '1-3 business days',
          ...shopData
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as Shop
    } catch (error) {
      console.error('Error creating shop:', error)
      return null
    }
  }

  // Update shop
  static async updateShop(shopId: string, updates: Partial<Shop>): Promise<Shop | null> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as Shop
    } catch (error) {
      console.error('Error updating shop:', error)
      return null
    }
  }

  // Upload shop logo
  static async uploadShopLogo(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/logo-${Date.now()}.${fileExt}`
      const filePath = `shop-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading logo:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('shop-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading shop logo:', error)
      return null
    }
  }

  // Upload shop banner
  static async uploadShopBanner(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/banner-${Date.now()}.${fileExt}`
      const filePath = `shop-banners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading banner:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('shop-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading shop banner:', error)
      return null
    }
  }

  // Get all active shops
  static async getActiveShops(limit: number = 50, offset: number = 0): Promise<Shop[]> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return (data || []) as Shop[]
    } catch (error) {
      console.error('Error fetching active shops:', error)
      return []
    }
  }

  // Search shops
  static async searchShops(query: string, limit: number = 20): Promise<Shop[]> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit)

      if (error) {
        throw error
      }

      return (data || []) as Shop[]
    } catch (error) {
      console.error('Error searching shops:', error)
      return []
    }
  }

  // Create shop review
  static async createReview(reviewData: {
    shop_id: string
    user_id: string
    rating: number
    title?: string
    review_text?: string
    order_id?: string
  }): Promise<ShopReview | null> {
    try {
      const { data, error } = await supabase
        .from('shop_reviews')
        .insert({
          ...reviewData,
          is_verified_purchase: !!reviewData.order_id,
          helpful_count: 0
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as ShopReview
    } catch (error) {
      console.error('Error creating shop review:', error)
      return null
    }
  }

  // Reply to review (shop owner only)
  static async replyToReview(reviewId: string, replyText: string, ownerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shop_reviews')
        .update({
          reply_text: replyText,
          replied_at: new Date().toISOString(),
          replied_by: ownerId
        })
        .eq('id', reviewId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error replying to review:', error)
      return false
    }
  }

  // Toggle vacation mode
  static async toggleVacationMode(shopId: string, enabled: boolean, message?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          vacation_mode: enabled,
          vacation_message: enabled ? message : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error toggling vacation mode:', error)
      return false
    }
  }

  // Delete shop (soft delete by setting status to closed)
  static async deleteShop(shopId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting shop:', error)
      return false
    }
  }
}

// Wishlist Operations
export class WishlistService {

  static async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('add_to_wishlist', {
        p_user_id: userId,
        p_product_id: productId,
      })
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return false
    }
  }

  static async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('remove_from_wishlist', {
        p_user_id: userId,
        p_product_id: productId,
      })
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return false
    }
  }

  static async getUserWishlist(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_wishlist', {
        p_user_id: userId,
      })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      return []
    }
  }

  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle()
      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error checking wishlist:', error)
      return false
    }
  }

  static async getUserWishlistProductIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', userId)
      if (error) throw error
      return (data || []).map((row: any) => row.product_id)
    } catch (error) {
      console.error('Error fetching wishlist IDs:', error)
      return []
    }
  }
}

// Product Operations
export class ProductService {

  // Get all products with pagination
  static async getAllProducts(limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops!inner(name, owner_wallet),
          product_categories(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops!inner(name, owner_wallet),
          product_categories(name)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  // Get products by shop
  static async getProductsByShop(shopId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(name)
        `)
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching shop products:', error)
      return []
    }
  }

  // Get single product by ID
  static async getProductById(productId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops!inner(name, owner_wallet, contact_email, contact_phone),
          product_categories(name)
        `)
        .eq('uuid', productId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  // Create new product
  static async createProduct(productData: any) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          uuid: crypto.randomUUID(),
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  }

  // Update product
  static async updateProduct(productId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('uuid', productId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating product:', error)
      return null
    }
  }

  // Delete product
  static async deleteProduct(productId: string) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('uuid', productId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }
}
