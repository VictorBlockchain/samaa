import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Accept': 'application/json',
    },
  },
})

// Database types (will be auto-generated in production)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          // Wallets
          wallet?: string
          mahr_wallet_address?: string
          purse_wallet_address?: string
          mahr_xftId?: string
          purse_xftId?: string
          // Name
          first_name?: string
          last_name?: string
          full_name?: string
          // Basic profile
          age?: number
          gender?: "male" | "female"
          date_of_birth?: string
          location?: string
          latitude?: number
          longitude?: number
          location_point?: any
          city?: string
          state?: string
          country?: string
          bio?: string
          // Media & interests
          bio_tagline?: string
          education?: "high_school" | "bachelors" | "masters" | "phd" | "trade_school" | "other"
          profession?: string
          employer?: string
          job_title?: string
          ethnicity?: string
          nationality?: string
          languages?: string[]
          religiosity?: "very_religious" | "religious" | "moderate" | "learning"
          prayer_frequency?: "five_times_daily" | "regularly" | "sometimes" | "learning"
          hijab_preference?: "always" | "sometimes" | "planning" | "no"
          marriage_intention?: "soon" | "within_year" | "future"
          marital_status?: "never_married" | "divorced" | "widowed" | "seeking_2nd_wife" | "seeking_3rd_wife" | "seeking_4th_wife"
          has_children?: boolean
          wants_children?: boolean
          want_children?: string
          willing_to_relocate?: boolean
          mahr_max_amount?: number
          mahr_requirement?: number
          work_preference?: "home_maker" | "self_employed" | "career"
          style_preference?: "traditional" | "modern" | "feminist"
          is_revert?: boolean
          alcohol?: string
          smoking?: string
          psychedelics?: string
          halal_food?: string
          interests?: string[]
          profile_photo?: string
          profile_photos?: string[]
          additional_photos?: string[]
          voice_intro?: string
          video_intro?: string
          is_verified?: boolean
          profile_rating?: number
          pictures_rating?: number
          response_rate?: number
          communication_rating?: number
          last_active?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          // All fields are optional per current schema defaults
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
          profile_rating_minimum: number
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
          category_type: string
          parent_id?: string
          description?: string
          image_url?: string
          is_active: boolean
          sort_order: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          name: string
          category_type: string
          parent_id?: string
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
          logo_url?: string
          banner_url?: string
          status?: string
          verified?: boolean
          address?: any
          contact_info?: any
          business_info?: any
          policies?: any
          rating: number
          total_reviews: number
          total_sales?: number
          total_sold?: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          owner_id: string
          name: string
          description?: string
          logo_url?: string
          banner_url?: string
          status?: string
          verified?: boolean
          address?: any
          contact_info?: any
          business_info?: any
          policies?: any
        }
        Update: {
          [key: string]: any
        }
      }
      products: {
        Row: {
          id: string
          shop_id: string
          category_id?: string
          name: string
          description?: string
          short_description?: string
          sku?: string
          brand?: string
          condition?: "new" | "like_new" | "good" | "fair"
          base_price: number
          compare_at_price?: number
          cost_price?: number
          weight?: number
          dimensions?: any
          images?: any
          tags?: string[]
          requires_shipping?: boolean
          is_digital: boolean
          meta_description?: string
          seo_handle?: string
          rating: number
          total_reviews: number
          total_sold?: number
          view_count: number
          is_active: boolean
          is_featured: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: { [key: string]: any }
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
      gender_type: "male" | "female"
      religiosity_level: "very_religious" | "religious" | "moderate" | "learning"
      prayer_frequency: "five_times_daily" | "regularly" | "sometimes" | "learning"
      hijab_preference: "always" | "sometimes" | "planning" | "no"
      marriage_intention: "soon" | "within_year" | "future"
      education_level: "high_school" | "bachelors" | "masters" | "phd" | "trade_school" | "other"
      marital_status: "never_married" | "divorced" | "widowed"
      currency_type: "SAKK" | "SEI"
      product_condition: "new" | "like_new" | "good" | "fair"
      shop_status: "pending" | "active" | "suspended" | "closed"
      product_category:
        | "womens_fashion"
        | "mens_formal"
        | "hijabs_scarves"
        | "abayas_jilbabs"
        | "thobes_kaftans"
        | "prayer_items"
        | "home_decor"
        | "gifts"
        | "books"
        | "perfumes_oils"
        | "children_clothing"
        | "modest_swimwear"
        | "undergarments"
    }
  }
}
