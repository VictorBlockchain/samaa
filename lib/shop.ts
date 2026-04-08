import { supabase } from './supabase'

// Product interface matching Supabase schema
export interface Product {
  id: string
  shop_id: string
  category_id?: string
  name: string
  description?: string
  short_description?: string
  base_price: number
  compare_at_price?: number
  images?: string[]
  tags?: string[]
  is_active: boolean
  is_featured: boolean
  requires_shipping: boolean
  is_digital: boolean
  condition?: 'new' | 'like_new' | 'good' | 'fair'
  rating: number
  total_reviews: number
  total_sold: number
  view_count: number
  created_at: string
  updated_at: string
  // Joined fields
  shop_name?: string
  shop_logo?: string
  category_name?: string
}

// Cart item interface
export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  selected_size?: string
  selected_color?: string
  created_at: string
  updated_at: string
  // Joined product fields
  product?: {
    id: string
    name: string
    images: string[]
    base_price: number
    shop_id: string
    shop_name?: string
  }
}

// Promo code interface
export interface PromoCode {
  id: string
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount?: number
  usage_limit?: number
  used_count: number
  valid_from: string
  valid_until?: string
  applicable_categories?: string[]
  applicable_products?: string[]
  is_active: boolean
}

// Validation result
export interface PromoValidationResult {
  valid: boolean
  error?: string
  promo_code?: PromoCode
  discount_amount: number
}

// Product Service
export class ProductService {
  // Fetch products with optional filters and search
  static async fetchProducts(options?: {
    search?: string
    category_id?: string
    shop_id?: string
    min_price?: number
    max_price?: number
    is_featured?: boolean
    limit?: number
    offset?: number
  }): Promise<{ products: Product[]; count: number }> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          shops!inner(name, logo_url),
          product_categories(name)
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Apply filters
      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%,tags.cs.{${options.search}}`)
      }

      if (options?.category_id) {
        query = query.eq('category_id', options.category_id)
      }

      if (options?.shop_id) {
        query = query.eq('shop_id', options.shop_id)
      }

      if (options?.min_price !== undefined) {
        query = query.gte('base_price', options.min_price)
      }

      if (options?.max_price !== undefined) {
        query = query.lte('base_price', options.max_price)
      }

      if (options?.is_featured) {
        query = query.eq('is_featured', true)
      }

      // Pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, (options.offset) + (options.limit || 20) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching products:', error)
        return { products: [], count: 0 }
      }

      // Transform data
      const products: Product[] = (data || []).map(item => ({
        ...item,
        shop_name: item.shops?.name,
        shop_logo: item.shops?.logo_url,
        category_name: item.product_categories?.name,
        shops: undefined,
        product_categories: undefined
      }))

      return { products, count: count || 0 }
    } catch (error) {
      console.error('Error fetching products:', error)
      return { products: [], count: 0 }
    }
  }

  // Fetch single product by ID
  static async fetchProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops!inner(name, logo_url),
          product_categories(name)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return null
      }

      return {
        ...data,
        shop_name: data.shops?.name,
        shop_logo: data.shops?.logo_url,
        category_name: data.product_categories?.name,
        shops: undefined,
        product_categories: undefined
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  // Create product
  static async createProduct(product: {
    shop_id: string
    name: string
    description?: string
    base_price: number
    compare_at_price?: number
    category_id?: string
    images?: string[]
    tags?: string[]
    condition?: string
    requires_shipping?: boolean
    is_digital?: boolean
  }): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          is_active: true,
          is_featured: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  }

  // Update product
  static async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)

      if (error) {
        console.error('Error updating product:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating product:', error)
      return false
    }
  }

  // Upload product image to Supabase Storage
  static async uploadProductImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return null
      }

      // Get public URL
      const { data } = supabase.storage
        .from('shop-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  // Delete product image
  static async deleteProductImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/shop-images/')
      if (urlParts.length < 2) return false

      const filePath = urlParts[1]

      const { error } = await supabase.storage
        .from('shop-images')
        .remove([filePath])

      if (error) {
        console.error('Error deleting image:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }
}

// Cart Service
export class CartService {
  // Get user's cart items
  static async getCart(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products!inner(id, name, images, base_price, shop_id, shops(name))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching cart:', error)
        return []
      }

      // Transform data
      return (data || []).map(item => ({
        ...item,
        product: {
          id: item.products.id,
          name: item.products.name,
          images: item.products.images || [],
          base_price: item.products.base_price,
          shop_id: item.products.shop_id,
          shop_name: item.products.shops?.name
        },
        products: undefined
      }))
    } catch (error) {
      console.error('Error fetching cart:', error)
      return []
    }
  }

  // Add item to cart
  static async addToCart(
    userId: string,
    productId: string,
    quantity: number = 1,
    options?: { selected_size?: string; selected_color?: string }
  ): Promise<boolean> {
    try {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('selected_size', options?.selected_size || null)
        .eq('selected_color', options?.selected_color || null)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)

        if (error) {
          console.error('Error updating cart item:', error)
          return false
        }
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
            selected_size: options?.selected_size || null,
            selected_color: options?.selected_color || null
          })

        if (error) {
          console.error('Error adding to cart:', error)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error adding to cart:', error)
      return false
    }
  }

  // Update cart item quantity
  static async updateQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(userId, cartItemId)
      }

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating cart quantity:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating cart quantity:', error)
      return false
    }
  }

  // Remove item from cart
  static async removeFromCart(userId: string, cartItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing from cart:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      return false
    }
  }

  // Clear entire cart
  static async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error clearing cart:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      return false
    }
  }

  // Get cart item count
  static async getCartItemCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (error) {
        console.error('Error counting cart items:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Error counting cart items:', error)
      return 0
    }
  }
}

// Promo Code Service
export class PromoService {
  // Validate promo code
  static async validatePromoCode(
    code: string,
    cartTotal: number,
    productIds?: string[],
    categoryIds?: string[]
  ): Promise<PromoValidationResult> {
    try {
      // Fetch promo code from database
      const { data: promoCode, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !promoCode) {
        return {
          valid: false,
          error: 'Invalid promo code',
          discount_amount: 0
        }
      }

      // Check validity period
      const now = new Date()
      const validFrom = new Date(promoCode.valid_from)
      const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null

      if (now < validFrom) {
        return {
          valid: false,
          error: 'This promo code is not yet active',
          discount_amount: 0
        }
      }

      if (validUntil && now > validUntil) {
        return {
          valid: false,
          error: 'This promo code has expired',
          discount_amount: 0
        }
      }

      // Check usage limit
      if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
        return {
          valid: false,
          error: 'This promo code has reached its usage limit',
          discount_amount: 0
        }
      }

      // Check minimum order amount
      if (cartTotal < promoCode.min_order_amount) {
        return {
          valid: false,
          error: `Minimum order amount is $${promoCode.min_order_amount.toFixed(2)}`,
          discount_amount: 0
        }
      }

      // Check applicable products/categories
      if (promoCode.applicable_products && promoCode.applicable_products.length > 0) {
        const hasApplicableProduct = productIds?.some(id =>
          promoCode.applicable_products!.includes(id)
        )

        if (!hasApplicableProduct) {
          return {
            valid: false,
            error: 'This promo code is not applicable to items in your cart',
            discount_amount: 0
          }
        }
      }

      if (promoCode.applicable_categories && promoCode.applicable_categories.length > 0) {
        const hasApplicableCategory = categoryIds?.some(id =>
          promoCode.applicable_categories!.includes(id)
        )

        if (!hasApplicableCategory) {
          return {
            valid: false,
            error: 'This promo code is not applicable to items in your cart',
            discount_amount: 0
          }
        }
      }

      // Calculate discount
      let discountAmount = 0

      if (promoCode.discount_type === 'percentage') {
        discountAmount = (cartTotal * promoCode.discount_value) / 100

        // Apply max discount cap if set
        if (promoCode.max_discount_amount && discountAmount > promoCode.max_discount_amount) {
          discountAmount = promoCode.max_discount_amount
        }
      } else {
        // Fixed discount
        discountAmount = promoCode.discount_value

        // Don't exceed cart total
        if (discountAmount > cartTotal) {
          discountAmount = cartTotal
        }
      }

      return {
        valid: true,
        promo_code: promoCode,
        discount_amount: discountAmount
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      return {
        valid: false,
        error: 'Failed to validate promo code',
        discount_amount: 0
      }
    }
  }

  // Apply promo code to order (called after successful payment)
  static async applyPromoToOrder(promoCodeId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_promo_usage', {
        p_promo_code_id: promoCodeId
      })

      if (error) {
        console.error('Error applying promo code:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error applying promo code:', error)
      return false
    }
  }
}
