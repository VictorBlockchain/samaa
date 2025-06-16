import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database types (will be auto-generated in production)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          solana_address: string
          dowry_wallet_address?: string
          purse_wallet_address?: string
          first_name: string
          last_name: string
          age: number
          gender: 'male' | 'female'
          date_of_birth: string
          location: string
          latitude?: number
          longitude?: number
          location_point?: any
          city?: string
          state?: string
          country: string
          education?: 'high_school' | 'bachelors' | 'masters' | 'phd' | 'trade_school' | 'other'
          profession?: string
          employer?: string
          job_title?: string
          ethnicity?: string
          nationality?: string
          languages?: string[]
          religiosity?: 'very_religious' | 'religious' | 'moderate' | 'learning'
          prayer_frequency?: 'five_times_daily' | 'regularly' | 'sometimes' | 'learning'
          hijab_preference?: 'always' | 'sometimes' | 'planning' | 'no'
          marriage_intention?: 'soon' | 'within_year' | 'future'
          marital_status?: 'never_married' | 'divorced' | 'widowed'
          has_children?: boolean
          wants_children?: boolean
          bio?: string
          interests?: string[]
          profile_photo?: string
          profile_photos?: string[]
          voice_intro?: string
          video_intro?: string
          is_verified?: boolean
          bio_rating?: number
          response_rate?: number
          last_active?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          solana_address: string
          first_name: string
          last_name: string
          age: number
          gender: 'male' | 'female'
          date_of_birth: string
          location: string
          country?: string
          // All other fields are optional for insert
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          age_range_min: number
          age_range_max: number
          max_distance: number
          anywhere_in_world: boolean
          show_only_verified: boolean
          show_only_practicing: boolean
          preferred_interests: string[]
          preferred_religiosity: string[]
          preferred_prayer_frequency: string[]
          preferred_hijab: string[]
          preferred_marriage_intention: string[]
          preferred_nationality: string[]
          preferred_height_range: string[]
          preferred_marital_status: string[]
          preferred_children: string[]
          preferred_education: string[]
          require_financial_setup: boolean
          bio_rating_minimum: number
          response_rate_minimum: number
          notifications_matches: boolean
          notifications_messages: boolean
          notifications_profile_views: boolean
          notifications_likes: boolean
          push_notifications: boolean
          email_notifications: boolean
          show_age: boolean
          show_location: boolean
          show_last_seen: boolean
          show_online_status: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          user_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          description?: string
          image_url?: string
          is_active: boolean
          sort_order: number
          created_at?: string
        }
        Insert: {
          name: string
          description?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          [key: string]: any
        }
      }
      shops: {
        Row: {
          id: string
          owner_id: string
          name: string
          description?: string
          shop_image?: string
          rating: number
          total_reviews: number
          total_sales: number
          is_active: boolean
          is_verified: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          owner_id: string
          name: string
          description?: string
          shop_image?: string
          is_active?: boolean
          is_verified?: boolean
        }
        Update: {
          [key: string]: any
        }
      }
      products: {
        Row: {
          id: number
          uuid: string
          shop_id: string
          category_id?: string
          name: string
          description?: string
          price: number
          currency: 'SOL' | 'SAMAA' | 'USD'
          images?: string[]
          video_url?: string
          stock_quantity: number
          is_in_stock: boolean
          is_digital: boolean
          rating: number
          total_reviews: number
          total_sales: number
          view_count: number
          tags?: string[]
          slug?: string
          is_active: boolean
          is_featured: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          shop_id: string
          name: string
          price: number
          currency?: 'SOL' | 'SAMAA' | 'USD'
          category_id?: string
          description?: string
          images?: string[]
          video_url?: string
          stock_quantity?: number
          is_in_stock?: boolean
          is_digital?: boolean
          tags?: string[]
          slug?: string
          is_active?: boolean
          is_featured?: boolean
        }
        Update: {
          [key: string]: any
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender_type: 'male' | 'female'
      religiosity_level: 'very_religious' | 'religious' | 'moderate' | 'learning'
      prayer_frequency: 'five_times_daily' | 'regularly' | 'sometimes' | 'learning'
      hijab_preference: 'always' | 'sometimes' | 'planning' | 'no'
      marriage_intention: 'soon' | 'within_year' | 'future'
      education_level: 'high_school' | 'bachelors' | 'masters' | 'phd' | 'trade_school' | 'other'
      marital_status: 'never_married' | 'divorced' | 'widowed'
      currency_type: 'SOL' | 'SAMAA' | 'USD'
    }
  }
}
