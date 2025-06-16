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
  
  // Get profile by Solana address
  static async getProfileByAddress(solanaAddress: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('solana_address', solanaAddress)
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
      console.error('Error fetching profile:', error)
      return null
    }
  }

  // Create new profile
  static async createProfile(profileData: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }

  // Update existing profile
  static async updateProfile(solanaAddress: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('solana_address', solanaAddress)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  }

  // Upsert profile (create or update)
  static async upsertProfile(profileData: UserInsert & { solana_address: string }): Promise<User | null> {
    try {
      // Check if profile exists
      const existingProfile = await this.getProfileByAddress(profileData.solana_address)
      
      if (existingProfile) {
        // Update existing profile
        return await this.updateProfile(profileData.solana_address, profileData)
      } else {
        // Create new profile
        return await this.createProfile(profileData)
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
  static async updateLastActive(solanaAddress: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('solana_address', solanaAddress)
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
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
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
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw error
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

// Shop Operations
export class ShopService {

  // Get shop by owner wallet address
  static async getShopByOwner(ownerWallet: string) {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_wallet', ownerWallet)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching shop:', error)
      return null
    }
  }

  // Get shop by ID
  static async getShopById(shopId: string) {
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

      return data
    } catch (error) {
      console.error('Error fetching shop:', error)
      return null
    }
  }

  // Create new shop
  static async createShop(shopData: any) {
    try {
      const { data, error } = await supabase
        .from('shops')
        .insert(shopData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating shop:', error)
      return null
    }
  }

  // Update shop
  static async updateShop(shopId: string, updates: any) {
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

      return data
    } catch (error) {
      console.error('Error updating shop:', error)
      return null
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
