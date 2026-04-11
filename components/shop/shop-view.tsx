"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, ShoppingBag, Store, Package, Truck, Plus, Edit3, Eye, Trash2, 
  Users, TrendingUp, Calendar, CreditCard, CheckCircle, Clock, X, Search, 
  Star, Heart, Share2, MapPin, Mail, Phone, Globe, AlertCircle, Sparkles, 
  HeartHandshake, Bitcoin, Wallet, ChevronDown, MessageCircle, Play, Bookmark
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { ShopService, Shop, CreateShopData, ProductService, WishlistService, ProfileService } from "@/lib/database"
import { CartService, CartItem, OrderService } from "@/lib/cart"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { getMediaUrl, STORAGE_CONFIG } from "@/lib/storage"
import { Toaster } from "@/components/ui/toaster"
import { AddToCartSheet } from "@/components/shop/add-to-cart-sheet"
import { ArabicEmptyStateCard, ArabicEmptyStateCardTitle, ArabicEmptyStateCardDescription } from "@/components/ui/arabic-empty-state-card"

// Product interface
interface Product {
  id: string
  name: string
  description: string
  images: string[]
  price: number
  currency: "USD" | "SAMAA"
  category: string
  seller: string
  rating: number
  reviews: number
  inStock: boolean
  shop_id?: string
  sizes?: string[]
  colors?: string[]
}

// Shop category options
const SHOP_CATEGORIES = [
  { value: 'bride_fashion', label: 'Bride Fashion', icon: '👰', gradient: 'from-pink-100 to-rose-100' },
  { value: 'groom_fashion', label: 'Groom Fashion', icon: '🤵', gradient: 'from-blue-100 to-indigo-100' },
  { value: 'womens_fashion', label: 'Women\'s Fashion', icon: '👗', gradient: 'from-purple-100 to-violet-100' },
  { value: 'mens_fashion', label: 'Men\'s Fashion', icon: '👔', gradient: 'from-slate-100 to-gray-100' },
  { value: 'wedding_gifts', label: 'Wedding Gifts', icon: '🎁', gradient: 'from-emerald-100 to-green-100' },
  { value: 'accessories', label: 'Accessories', icon: '💍', gradient: 'from-amber-100 to-yellow-100' },
  { value: 'islamic_art', label: 'Islamic Art', icon: '🖼️', gradient: 'from-cyan-100 to-teal-100' },
  { value: 'home_decor', label: 'Home Decor', icon: '🏠', gradient: 'from-orange-100 to-red-100' },
  { value: 'jewelry', label: 'Jewelry', icon: '💎', gradient: 'from-indigo-100 to-purple-100' },
  { value: 'books_media', label: 'Books & Media', icon: '📚', gradient: 'from-teal-100 to-cyan-100' },
  { value: 'beauty_personal_care', label: 'Beauty & Personal Care', icon: '✨', gradient: 'from-pink-100 to-purple-100' },
  { value: 'food_beverages', label: 'Food & Beverages', icon: '🍽️', gradient: 'from-green-100 to-emerald-100' },
  { value: 'other', label: 'Other', icon: '📦', gradient: 'from-gray-100 to-slate-100' }
]

// Mock products for search demonstration
const SHOP_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Elegant White Wedding Dress",
    description: "Beautiful modest wedding dress with intricate lace details and long sleeves.",
    images: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400"],
    price: 299.99,
    currency: "USD",
    category: "Bride Fashion",
    seller: "Modest Bridal",
    rating: 4.8,
    reviews: 24,
    inStock: true,
    shop_id: "shop1"
  },
  {
    id: "2",
    name: "Traditional Thobe for Men",
    description: "Classic white thobe made from premium cotton. Comfortable and elegant.",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
    price: 89.99,
    currency: "USD",
    category: "Men's Fashion",
    seller: "Islamic Clothing Co",
    rating: 4.6,
    reviews: 18,
    inStock: true,
    shop_id: "shop2"
  },
  {
    id: "3",
    name: "Hijab Collection Set",
    description: "Set of 5 premium hijabs in different colors. Made from breathable fabric.",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400"],
    price: 45.99,
    currency: "USD",
    category: "Women's Fashion",
    seller: "Hijab House",
    rating: 4.9,
    reviews: 42,
    inStock: true,
    shop_id: "shop3"
  }
]

// Order status types
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  order_number: string
  status: OrderStatus
  total_amount: number
  currency: string
  created_at: string
  items: {
    product_name: string
    product_image: string
    quantity: number
    price: number
  }[]
  user_id: string
  shop_id?: string
  tracking_number?: string
  shipped_by?: string
  shop_message?: string
}

export function ShopView() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"shop" | "categories" | "myshop" | "orders">("shop")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [userShop, setUserShop] = useState<Shop | null>(null)
  const [shopProducts, setShopProducts] = useState<Product[]>([])
  const [showCreateShop, setShowCreateShop] = useState(false)
  const [showEditShop, setShowEditShop] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Orders state
  const [ordersView, setOrdersView] = useState<"received" | "placed" | "cart">("cart")
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([])
  const [placedOrders, setPlacedOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: ''
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Shop tab state
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [shopProductsLoading, setShopProductsLoading] = useState(false)
  const [featuredShopsLoading, setFeaturedShopsLoading] = useState(false)

  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const userId = user?.id || null
  const { toast } = useToast()

  // Wishlist state
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  // Video modal state
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null)

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['shop', 'categories', 'myshop', 'orders'].includes(tab)) {
      setActiveTab(tab as "shop" | "categories" | "myshop" | "orders")
    }
  }, [searchParams])

  const tabs = [
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: Package },
    { id: "myshop", label: "My Shop", icon: Store },
    { id: "orders", label: "Orders", icon: Truck },
  ]

  // Load user's shop on component mount
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserShop()
      // Load wishlist IDs
      WishlistService.getUserWishlistProductIds(userId).then(ids => {
        setWishlistIds(new Set(ids))
      })
    }
  }, [isAuthenticated, userId])

  // Load orders and cart when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated && userId) {
      loadOrders()
      loadCart()
    }
  }, [activeTab, isAuthenticated, userId])

  // Load products and featured shops when shop tab is active
  useEffect(() => {
    if (activeTab === "shop") {
      loadAllProducts()
      loadFeaturedShops()
    }
  }, [activeTab])

  const loadUserShop = async () => {
    if (!userId) return
    
    setIsLoading(true)
    try {
      const shop = await ShopService.getShopByOwner(userId)
      if (shop) {
        setUserShop(shop)
        // Load shop products
        const products = await ProductService.getProductsByShop(shop.id)
        setShopProducts(products as unknown as Product[])
      }
    } catch (error) {
      console.error('Error loading shop:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrders = async () => {
    if (!userId) return

    setOrdersLoading(true)
    try {
      // Load orders placed by this user (as customer)
      const { data: userOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (ordersError) {
        console.error('Error loading user orders:', ordersError)
      }
      
      // Fetch order items separately for each order
      const ordersWithItems = await Promise.all(
        (userOrders || []).map(async (order) => {
          try {
            console.log(`[loadOrders] Fetching items for order ${order.order_number} (${order.id})`)
            const { data: items, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id)
            
            if (itemsError) {
              console.error(`Error loading items for order ${order.id}:`, itemsError)
              return { ...order, items: [] }  // Return order with empty items
            }
            
            // Fetch product images for each item
            if (items && items.length > 0) {
              const productIds = items.map(item => item.product_id).filter(Boolean)
              if (productIds.length > 0) {
                const { data: products } = await supabase
                  .from('products')
                  .select('id, name, images, shop_id')
                  .in('id', productIds)
                
                const productMap = new Map(products?.map(p => [p.id, p]) || [])
                
                // Enrich items with product data
                items.forEach(item => {
                  const product = productMap.get(item.product_id)
                  if (product) {
                    item.product_image = product.images?.[0] || null
                    item.shop_id = product.shop_id
                  }
                })
              }
            }
            
            console.log(`[loadOrders] Found ${items?.length || 0} items for order ${order.order_number}`)
            return { ...order, items: items || [] }
          } catch (err) {
            console.error(`Failed to load items for order ${order.id}:`, err)
            return { ...order, items: [] }  // Return order with empty items
          }
        })
      )
      
      console.log('[loadOrders] Final orders with items:', ordersWithItems.map((o: any) => ({ 
        order_number: o.order_number, 
        itemsCount: o.items?.length || 0 
      })))
      
      setPlacedOrders(ordersWithItems as Order[])

      // Load orders received by this user's shop (as seller)
      if (userShop) {
        const { data: shopOrders, error: shopOrdersError } = await supabase
          .from('orders')
          .select('*')
          .eq('shop_id', userShop.id)
          .order('created_at', { ascending: false })
        
        if (shopOrdersError) {
          console.error('Error loading shop orders:', shopOrdersError)
        }
        
        // Fetch order items separately for each shop order
        const shopOrdersWithItems = await Promise.all(
          (shopOrders || []).map(async (order) => {
            try {
              const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id)
              
              if (itemsError) {
                console.error(`Error loading items for shop order ${order.id}:`, itemsError)
                return { ...order, items: [] }
              }
              
              // Fetch product images for each item
              if (items && items.length > 0) {
                const productIds = items.map(item => item.product_id).filter(Boolean)
                if (productIds.length > 0) {
                  const { data: products } = await supabase
                    .from('products')
                    .select('id, name, images, shop_id')
                    .in('id', productIds)
                  
                  const productMap = new Map(products?.map(p => [p.id, p]) || [])
                  
                  // Enrich items with product data
                  items.forEach(item => {
                    const product = productMap.get(item.product_id)
                    if (product) {
                      item.product_image = product.images?.[0] || null
                      item.shop_id = product.shop_id
                    }
                  })
                }
              }
              
              return { ...order, items: items || [] }
            } catch (err) {
              console.error(`Failed to load items for shop order ${order.id}:`, err)
              return { ...order, items: [] }
            }
          })
        )
        
        setReceivedOrders(shopOrdersWithItems as Order[])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  // Load user cart
  const loadCart = async () => {
    if (!userId) return
    
    setCartLoading(true)
    try {
      const items = await CartService.getCartItems(userId)
      setCartItems(items)
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setCartLoading(false)
    }
  }

  // Load user's profile for pre-populating checkout form
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return
      
      try {
        const profile = await ProfileService.getProfileByUserId(userId)
        if (profile) {
          // Pre-populate shipping address from profile
          setShippingAddress({
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            street: (profile as any).address || '',
            city: (profile as any).city || '',
            state: (profile as any).state || '',
            postalCode: (profile as any).postal_code || '',
            country: (profile as any).country || 'US',
            phone: (profile as any).phone || ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    
    if (isAuthenticated && userId) {
      loadUserProfile()
    }
  }, [userId, isAuthenticated])

  // Handle payment success/cancelled from Stripe redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('order_id')
    
    if (paymentStatus === 'success' && sessionId) {
      console.log('[shop-view] Payment successful!', { sessionId, orderId })
      toast({
        title: "Payment Successful! 🎉",
        description: "Your order has been placed successfully. Check your email for confirmation.",
        variant: "default",
      })
      
      // Clear cart after successful payment
      if (userId) {
        CartService.clearCart(userId).then(() => {
          loadCart() // Reload cart state
        })
      }
      
      // Reload orders to show the new order
      if (userId) {
        loadOrders()
      }
      
      // Switch to orders tab to show the new order
      setTimeout(() => {
        setActiveTab('orders')
        setOrdersView('placed')
      }, 1000)
    } else if (paymentStatus === 'cancelled') {
      console.log('[shop-view] Payment cancelled')
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. Your cart items are still saved.",
        variant: "destructive",
      })
    }
  }, [searchParams, userId])

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    if (!userId) return
    
    try {
      await CartService.removeFromCart(userId, itemId)
      await loadCart()
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  // Update cart item quantity
  const updateCartQuantity = async (itemId: string, quantity: number) => {
    if (!userId) return
    
    try {
      await CartService.updateCartItemQuantity(userId, itemId, quantity)
      await loadCart()
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  // Proceed to checkout
  const proceedToCheckout = async () => {
    if (!userId || cartItems.length === 0) {
      console.error('Checkout failed: Missing userId or cart items', { userId, cartItemsCount: cartItems.length })
      return
    }
    
    setCheckoutLoading(true)
    try {
      console.log('Creating order from cart...', { 
        userId, 
        itemsCount: cartItems.length,
        shippingAddress 
      })
      
      // Create order from cart
      const order = await OrderService.createOrder(
        userId,
        cartItems,
        shippingAddress
      )
      
      console.log('Order creation result:', order)
      
      if (!order) {
        throw new Error('Failed to create order - order is null')
      }

      console.log('Creating Stripe checkout session for order:', order.id)

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: cartItems.map(item => ({
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.productImage,
            productId: item.productId,
            shopId: item.shopId
          })),
          totalAmount: order.totalAmount,
          shippingAddress
        })
      })

      console.log('Stripe API response status:', response.status)
      const responseData = await response.json()
      console.log('Stripe API response:', responseData)

      const { checkoutUrl, error } = responseData
      
      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe checkout
      if (checkoutUrl) {
        console.log('Redirecting to Stripe checkout:', checkoutUrl)
        window.location.href = checkoutUrl
      } else {
        throw new Error('No checkout URL received from Stripe')
      }
    } catch (error: any) {
      console.error('Error during checkout:', error)
      // You could add a toast notification here
      alert(`Checkout failed: ${error.message}`)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const createShop = async (formData: FormData) => {
    if (!userId) return

    setIsLoading(true)
    try {
      const shopData: CreateShopData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        shop_type: formData.get('shopType') as string,
        contact_email: formData.get('contactEmail') as string,
        contact_phone: formData.get('contactPhone') as string || undefined,
        paypal_email: formData.get('paypalEmail') as string || undefined,
        bitcoin_address: formData.get('bitcoinAddress') as string || undefined,
        address_street: formData.get('addressStreet') as string || undefined,
        address_city: formData.get('addressCity') as string || undefined,
        address_state: formData.get('addressState') as string || undefined,
        address_country: formData.get('addressCountry') as string || undefined,
        address_postal_code: formData.get('addressPostalCode') as string || undefined,
        return_policy: formData.get('returnPolicy') as string || undefined,
        return_policy_days: parseInt(formData.get('returnPolicyDays') as string) || 14,
        shipping_policy: formData.get('shippingPolicy') as string || undefined,
        processing_time: formData.get('processingTime') as string || '1-3 business days',
        free_shipping_threshold: formData.get('freeShippingThreshold') 
          ? parseFloat(formData.get('freeShippingThreshold') as string) 
          : undefined,
      }

      const newShop = await ShopService.createShop(userId, shopData)
      if (newShop) {
        setUserShop(newShop)
        setShowCreateShop(false)
      }
    } catch (error) {
      console.error('Error creating shop:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateShop = async (formData: FormData) => {
    if (!userId || !userShop) return

    setIsLoading(true)
    try {
      const updates: Partial<Shop> = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        shop_type: formData.get('shopType') as string,
        contact_email: formData.get('contactEmail') as string,
        contact_phone: formData.get('contactPhone') as string || undefined,
        paypal_email: formData.get('paypalEmail') as string || undefined,
        bitcoin_address: formData.get('bitcoinAddress') as string || undefined,
        address_street: formData.get('addressStreet') as string || undefined,
        address_city: formData.get('addressCity') as string || undefined,
        address_state: formData.get('addressState') as string || undefined,
        address_country: formData.get('addressCountry') as string || undefined,
        address_postal_code: formData.get('addressPostalCode') as string || undefined,
        return_policy: formData.get('returnPolicy') as string || undefined,
        return_policy_days: parseInt(formData.get('returnPolicyDays') as string) || 14,
        shipping_policy: formData.get('shippingPolicy') as string || undefined,
        processing_time: formData.get('processingTime') as string || '1-3 business days',
        free_shipping_threshold: formData.get('freeShippingThreshold') 
          ? parseFloat(formData.get('freeShippingThreshold') as string) 
          : undefined,
      }

      const updatedShop = await ShopService.updateShop(userShop.id, updates)
      if (updatedShop) {
        setUserShop(updatedShop)
        setShowEditShop(false)
      }
    } catch (error) {
      console.error('Error updating shop:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProduct = (productId: string) => {
    // TODO: Implement product deletion
    console.log('Delete product:', productId)
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/shop/item?id=${productId}`)
  }

  // Load all active products from all shops
  const loadAllProducts = async () => {
    setShopProductsLoading(true)
    try {
      // Fetch active shops first to get their names
      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id, name, logo_url')
        .eq('status', 'active')

      if (shopsError) throw shopsError

      // Create a map of shop_id to shop data
      const shopMap = new Map(shopsData?.map(s => [s.id, s]) || [])

      // Fetch active products
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const formattedProducts: Product[] = (products || []).map((p: any) => {
        const shop = shopMap.get(p.shop_id)
        return {
          id: p.uuid || p.id,
          name: p.name,
          description: p.description || '',
          images: (p.images || []).map((img: string) => getMediaUrl(STORAGE_CONFIG.BUCKETS.SHOP_IMAGES, img) || img),
          price: p.base_price,
          currency: 'USD',
          category: p.category_name || 'Other',
          seller: shop?.name || 'Unknown Shop',
          rating: p.rating || 0,
          reviews: p.total_reviews || 0,
          inStock: true,
          shop_id: p.shop_id
        }
      })

      setAllProducts(formattedProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setShopProductsLoading(false)
    }
  }

  // Load featured shops with randomization/curation
  const loadFeaturedShops = async () => {
    setFeaturedShopsLoading(true)
    try {
      // Randomize which criteria to use for featured shops
      const criteria = Math.random()
      let query = supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')

      if (criteria < 0.33) {
        // 33% chance: Best rated shops
        query = query.order('rating', { ascending: false })
      } else if (criteria < 0.66) {
        // 33% chance: Most sales
        query = query.order('total_sales', { ascending: false })
      } else {
        // 34% chance: Recently updated (new items or activity)
        query = query.order('updated_at', { ascending: false })
      }

      const { data: shops, error } = await query.limit(5)

      if (error) throw error

      // Shuffle the results for additional randomness
      const shuffled = (shops || []).sort(() => Math.random() - 0.5)
      setFeaturedShops(shuffled as Shop[])
    } catch (error) {
      console.error('Error loading featured shops:', error)
    } finally {
      setFeaturedShopsLoading(false)
    }
  }

  // Load products from a specific shop
  const loadShopProducts = async (shop: Shop) => {
    setSelectedShop(shop)
    setShopProductsLoading(true)
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedProducts: Product[] = (products || []).map((p: any) => ({
        id: p.uuid || p.id,
        name: p.name,
        description: p.description || '',
        images: p.images || ['/placeholder.svg'],
        price: p.base_price,
        currency: 'USD',
        category: p.category_name || 'Other',
        seller: shop.name,
        rating: p.rating || 0,
        reviews: p.total_reviews || 0,
        inStock: true,
        shop_id: p.shop_id
      }))

      setAllProducts(formattedProducts)
    } catch (error) {
      console.error('Error loading shop products:', error)
    } finally {
      setShopProductsLoading(false)
    }
  }

  // Helper functions for orders
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Package className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Search function
  const handleSearch = (term: string) => {
    setSearchTerm(term)

    if (!term.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Simulate API delay
    setTimeout(() => {
      const results = SHOP_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.description.toLowerCase().includes(term.toLowerCase()) ||
        product.seller.toLowerCase().includes(term.toLowerCase()) ||
        product.category.toLowerCase().includes(term.toLowerCase())
      )

      setSearchResults(results)
      setIsSearching(false)
    }, 300)
  }

  // Get products to display (search results or filtered by category)
  const getDisplayProducts = () => {
    if (searchTerm.trim()) {
      return searchResults
    }

    if (selectedCategory === "All") {
      return allProducts
    }

    return allProducts.filter(product => product.category === selectedCategory)
  }

  // Render Categories Tab Content
  const renderCategoriesTab = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-200/50"
          >
            <Package className="w-8 h-8 text-pink-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">Shop Categories</h2>
          <p className="text-slate-600 font-queensides mt-2">Explore products by category</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4">
          {SHOP_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCategory(category.label)
                setActiveTab("shop")
              }}
              className="cursor-pointer group"
            >
              <Card className="relative overflow-hidden border-pink-200/30 hover:border-pink-300/50 transition-all duration-300 h-full">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                
                {/* Islamic Pattern Overlay */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <pattern
                      id={`pattern-${category.value}`}
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="10" cy="10" r="1" fill="currentColor" />
                      <path d="M5 10 L10 5 L15 10 L10 15 Z" fill="currentColor" opacity="0.3" />
                    </pattern>
                    <rect width="100%" height="100%" fill={`url(#pattern-${category.value})`} />
                  </svg>
                </div>

                <CardContent className="relative z-10 p-6 text-center">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl mb-3"
                  >
                    {category.icon}
                  </motion.div>
                  <h3 className="font-bold text-slate-800 font-display text-sm mb-1">{category.label}</h3>
                  <p className="text-xs text-slate-500 font-queensides">Explore items</p>
                  
                  {/* Hover Arrow */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  // Render Shop Tab Content (Browse Products)
  const renderShopTab = () => {
    const displayProducts = getDisplayProducts()
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Search Bar */}
        <Card className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200/50">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products by name, description, seller, or category..."
              className="w-full px-4 py-3 pl-12 pr-10 bg-white rounded-xl border border-pink-200/50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all duration-300"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </div>
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-3 text-sm text-slate-600 font-queensides">
              {isSearching ? (
                "Searching..."
              ) : (
                <>
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
                  {searchResults.length === 0 && (
                    <span className="block mt-1 text-slate-500">
                      Try searching for wedding dress, hijab, thobe, or calligraphy
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </Card>

        {/* Selected Shop Header */}
        {selectedShop && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                  {selectedShop.logo_url ? (
                    <img src={selectedShop.logo_url} alt={selectedShop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-6 h-6 text-pink-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 font-display">{selectedShop.name}</h3>
                  <p className="text-sm text-slate-500 font-queensides">Showing products from this shop</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedShop(null)
                  loadAllProducts()
                }}
                className="font-queensides border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Show All
              </Button>
            </div>
          </motion.div>
        )}


        {/* Products Grid */}
        {shopProductsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border-pink-200/30">
                <div className="aspect-square bg-gradient-to-br from-pink-100/50 to-rose-100/50 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-pink-100/50 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-pink-100/50 rounded w-full animate-pulse" />
                  <div className="h-3 bg-pink-100/50 rounded w-1/2 animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 gap-4">
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        )}

        {/* No Results */}
        {searchTerm && searchResults.length === 0 && !isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 font-display mb-2">No products found</h3>
            <p className="text-slate-600 font-queensides mb-4">
              Try adjusting your search terms or browse by category
            </p>
            <Button
              onClick={() => handleSearch("")}
              variant="outline"
              className="font-queensides border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Clear Search
            </Button>
          </motion.div>
        )}

        {/* Empty State - No Products */}
        {!shopProductsLoading && !searchTerm && allProducts.length === 0 && (
          <ArabicEmptyStateCard icon={<Package className="w-12 h-12" />}>
            <ArabicEmptyStateCardTitle>No products available</ArabicEmptyStateCardTitle>
            <ArabicEmptyStateCardDescription className="mb-4">
              Be the first to add products to the marketplace!
            </ArabicEmptyStateCardDescription>
            <Button
              onClick={() => setActiveTab("myshop")}
              className="font-queensides bg-gradient-to-r from-pink-400 to-rose-500 text-white"
            >
              <Store className="w-4 h-4 mr-2" />
              Open My Shop
            </Button>
          </ArabicEmptyStateCard>
        )}

        {/* Featured Shops Section */}
        {!searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 font-display">Featured Shops</h3>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadFeaturedShops}
                  className="text-xs text-pink-600 hover:text-pink-700 font-queensides flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Refresh
                </motion.button>
                <Badge className="bg-gradient-to-r from-pink-400 to-rose-500 text-white border-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Curated
                </Badge>
              </div>
            </div>
            
            {featuredShopsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 border-pink-200/30">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-100/50 to-rose-100/50 animate-pulse flex-shrink-0" />
                      <div className="ml-4 flex-1 space-y-2">
                        <div className="h-4 bg-pink-100/50 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-pink-100/50 rounded w-24 animate-pulse" />
                        <div className="h-3 bg-pink-100/50 rounded w-20 animate-pulse" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {featuredShops.map((shop, index) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => loadShopProducts(shop)}
                  >
                    <Card className={`overflow-hidden border-pink-200/30 hover:border-pink-300/50 transition-all duration-300 ${selectedShop?.id === shop.id ? 'ring-2 ring-pink-400 shadow-lg' : ''}`}>
                      <div className="flex items-center p-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 flex-shrink-0">
                          {shop.logo_url ? (
                            <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Store className="w-8 h-8 text-pink-300" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-bold text-slate-800 font-display">{shop.name}</h4>
                          <p className="text-sm text-slate-500 font-queensides">{shop.shop_type || 'General Store'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-slate-600">{(shop.rating || 0).toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{shop.total_sales || 0} sales</span>
                            {shop.total_products !== undefined && (
                              <>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">{shop.total_products} items</span>
                              </>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <ArrowLeft className="w-5 h-5 text-white rotate-180" />
                        </motion.button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                
                {featuredShops.length === 0 && !featuredShopsLoading && (
                  <Card className="p-6 text-center border-pink-200/30">
                    <Store className="w-12 h-12 text-pink-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-queensides">No featured shops available</p>
                    <p className="text-sm text-slate-500 font-queensides mt-1">Check back later for curated shops</p>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Toggle wishlist for a product
  const toggleWishlist = async (productId: string) => {
    if (!userId) {
      router.push("/auth/login")
      return
    }
    const isWished = wishlistIds.has(productId)
    if (isWished) {
      const success = await WishlistService.removeFromWishlist(userId, productId)
      if (success) {
        setWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next })
        toast({ title: "Removed from wishlist", duration: 3000 })
      }
    } else {
      const success = await WishlistService.addToWishlist(userId, productId)
      if (success) {
        setWishlistIds(prev => new Set(prev).add(productId))
        toast({ title: "Added to wishlist", description: "You can find it in your wishlist", duration: 3000 })
      }
    }
  }

  // Share a product link
  const shareProduct = async (productId: string, productName: string) => {
    const url = `${window.location.origin}/shop/item?id=${productId}`
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      toast({ title: "Link copied!", description: "Product link copied to clipboard", duration: 3000 })
    }
  }

  // Product Card Component with Add to Cart
  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const [addingToCart, setAddingToCart] = useState(false)
    const [showSheet, setShowSheet] = useState(false)

    const hasOptions = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)
    const isWished = wishlistIds.has(product.id)

    const handleAddToCart = async () => {
      if (!userId) {
        router.push("/auth/login")
        return
      }
      if (hasOptions) {
        setShowSheet(true)
        return
      }
      setAddingToCart(true)
      try {
        const success = await CartService.addToCart(userId, { productId: product.id, quantity: 1 })
        if (success) {
          toast({ title: "Added to cart!", description: product.name, duration: 3000 })
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        toast({ title: "Failed to add to cart", variant: "destructive", duration: 5000 })
      } finally {
        setAddingToCart(false)
      }
    }

    const handleSheetConfirm = async (qty: number, size?: string, color?: string) => {
      setAddingToCart(true)
      try {
        const success = await CartService.addToCart(userId!, { productId: product.id, quantity: qty, selectedSize: size, selectedColor: color })
        if (success) {
          setShowSheet(false)
          toast({ title: "Added to cart!", description: `${qty}x ${product.name}`, duration: 3000 })
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        toast({ title: "Failed to add to cart", variant: "destructive", duration: 5000 })
      } finally {
        setAddingToCart(false)
      }
    }

    return (
      <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-pink-200/50 hover:border-pink-300/60">
          {/* Product Image - clickable */}
          <div
            className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 cursor-pointer"
            onClick={() => handleViewProduct(product.id)}
          >
            <img
              src={product.images[0] ? `https://qwnukvbeoglvynyrhuey.supabase.co/storage/v1/object/public/shop-images/${product.images[0]}` : `https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop`}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop`
              }}
            />

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-1">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWishlist(product.id)}
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isWished ? "text-pink-500 fill-pink-500" : "text-slate-600"}`} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => shareProduct(product.id, product.name)}
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title="Share product"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                </motion.button>
                {(product as any).video && (
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setVideoModalUrl((product as any).video)}
                    className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    title="Watch video"
                  >
                    <Play className="w-4 h-4 text-slate-600" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-2 left-2">
              <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg">
                <span className="text-sm font-bold text-pink-600 font-display">
                  ${product.price}
                </span>
              </div>
            </div>

            {/* Multiple images indicator */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-2 right-2">
                <div className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <span className="text-[10px] text-white font-medium">{product.images.length} photos</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-slate-800 font-queensides mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-slate-600 font-queensides mb-2 line-clamp-2">
              {product.description}
            </p>

            {/* Seller and Rating */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-queensides">
                by {product.seller}
              </span>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-slate-600 font-queensides">
                  {product.rating}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {addingToCart ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  {hasOptions ? "Select Options" : "Add to Cart"}
                </span>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Add to Cart Sheet */}
      <AddToCartSheet
        product={product}
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        onConfirm={handleSheetConfirm}
        loading={addingToCart}
      />
      </>
    )
  }

  // Order Card Component
  const OrderCard = ({ order, index, isReceived, onUpdateStatus }: {
    order: Order; 
    index: number;
    isReceived: boolean;
    onUpdateStatus?: (orderId: string, status: OrderStatus, trackingNumber?: string, message?: string, shippedBy?: string) => void;
  }) => {
    const [showDetails, setShowDetails] = useState(false)
    const [trackingInput, setTrackingInput] = useState(order.tracking_number || "")
    const [messageInput, setMessageInput] = useState("")
      
    // Ensure items is always an array (defensive coding)
    const orderItems = Array.isArray(order.items) ? order.items : []
    
    // Debug logging
    useEffect(() => {
      if (showDetails) {
        console.log(`[OrderCard] Expanding order ${order.order_number}:`, {
          orderId: order.id,
          hasItems: !!order.items,
          itemsType: typeof order.items,
          itemsIsArray: Array.isArray(order.items),
          itemsCount: orderItems.length,
          items: order.items
        })
      }
    }, [showDetails, order.id, order.order_number, order.items, orderItems.length])
    const statusColors: Record<OrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    }

    const statusIcons: Record<OrderStatus, React.ReactNode> = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />
    }

    const canUpdateStatus = isReceived && onUpdateStatus && ["pending", "confirmed", "processing"].includes(order.status)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="overflow-hidden border-pink-200/50 hover:border-pink-300/60 transition-all duration-300">
          {/* Order Header */}
          <div 
            className="p-4 cursor-pointer"
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 font-display">{order.order_number}</h4>
                  <p className="text-sm text-slate-500 font-queensides">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${statusColors[order.status]} border`}>
                  <span className="flex items-center gap-1">
                    {statusIcons[order.status]}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </Badge>
                <p className="text-lg font-bold text-pink-600 font-display mt-1">
                  ${order.total_amount}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-pink-100"
              >
                <div className="p-4 space-y-4">
                  {/* Items */}
                  <div className="space-y-2">
                    <h5 className="font-semibold text-slate-700 font-display text-sm">Items</h5>
                    {(() => {
                      try {
                        // Extra safety - ensure orderItems exists and is array
                        const safeItems = Array.isArray(orderItems) ? orderItems : []
                        console.log('[OrderCard] Rendering items, count:', safeItems.length)
                        
                        if (safeItems.length > 0) {
                          return safeItems.map((item: any, idx: number) => {
                            // Use product_name as primary, variant_title as fallback
                            const displayName = item?.product_name || item?.variant_title || 'Unknown Item'
                            const displayPrice = parseFloat(item?.unit_price || 0)
                            const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'N/A'
                            
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-white rounded-xl border border-pink-100 hover:border-pink-200 hover:shadow-sm transition-all cursor-pointer"
                                onClick={() => item?.product_id && router.push(`/shop/item?id=${item.product_id}`)}
                              >
                                {/* Product Image */}
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {item?.product_image ? (
                                    <img 
                                      src={item.product_image.startsWith('http') ? item.product_image : `https://qwnukvbeoglvynyrhuey.supabase.co/storage/v1/object/public/shop-images/${item.product_image}`}
                                      alt={displayName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-8 h-8 text-pink-300" />
                                  )}
                                </div>
                                
                                {/* Item Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h6 className="text-sm font-semibold text-slate-800 truncate">{displayName}</h6>
                                    <span className="text-sm font-bold text-pink-600 whitespace-nowrap">${displayPrice.toFixed(2)}</span>
                                  </div>
                                  
                                  {/* Variant Info */}
                                  {item?.variant_title && item.variant_title !== 'Standard' && (
                                    <p className="text-xs text-slate-500 mb-1">{item.variant_title}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <ShoppingBag className="w-3 h-3" />
                                      Qty: {item?.quantity || 1}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {orderDate}
                                    </span>
                                  </div>
                                  
                                  {/* Tracking & Delivery Info */}
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-2 pt-2 border-t border-slate-100">
                                    {order.tracking_number ? (
                                      <span className="flex items-center gap-1 text-blue-600">
                                        <Truck className="w-3 h-3" />
                                        {order.shipped_by && (
                                          <span className="font-semibold uppercase">{order.shipped_by}:</span>
                                        )}
                                        Tracking: {order.tracking_number}
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-slate-400">
                                        <Truck className="w-3 h-3" />
                                        Tracking: Pending
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <Calendar className="w-3 h-3" />
                                      Delivery: TBD
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })
                        } else {
                          return (
                            <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 rounded-lg">
                              <Package className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                              <p>Order items will appear here once payment is confirmed</p>
                            </div>
                          )
                        }
                      } catch (err) {
                        console.error('[OrderCard] Error rendering items:', err)
                        return (
                          <div className="p-4 text-center text-sm text-red-500 bg-red-50 rounded-lg">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p>Error loading items</p>
                          </div>
                        )
                      }
                    })()}
                  </div>

                  {/* Tracking Info */}
                  {order.tracking_number && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Truck className="w-4 h-4" />
                        <span className="font-medium">Tracking: {order.tracking_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Shop Message */}
                  {order.shop_message && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200/50">
                      <div className="flex items-start gap-2 text-sm text-emerald-700">
                        <MessageCircle className="w-4 h-4 mt-0.5" />
                        <div>
                          <span className="font-medium">Message from shop:</span>
                          <p className="mt-1">{order.shop_message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shop Owner Actions */}
                  {canUpdateStatus && (
                    <div className="space-y-3 pt-3 border-t border-pink-100">
                      <h5 className="font-semibold text-slate-700 font-display text-sm">Update Order</h5>
                      
                      {/* Shipping Carrier Selection */}
                      {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                        <div>
                          <Label className="text-xs text-slate-600 font-queensides">Shipping Carrier</Label>
                          <select
                            id={`shipped_by_${order.id}`}
                            className="mt-1 w-full px-3 py-2 border border-pink-200/50 rounded-lg bg-white text-sm"
                            defaultValue=""
                          >
                            <option value="" disabled>Select carrier</option>
                            <option value="ups">UPS</option>
                            <option value="usps">USPS</option>
                            <option value="fedex">FedEx</option>
                            <option value="dhl">DHL</option>
                            <option value="other">Other (manual entry)</option>
                          </select>
                        </div>
                      )}
                      
                      {/* Tracking Number Input */}
                      <div>
                        <Label className="text-xs text-slate-600 font-queensides">Tracking Number {canUpdateStatus ? '(required for shipping)' : ''}</Label>
                        <Input
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="Enter tracking number"
                          className="mt-1 border-pink-200/50"
                        />
                      </div>

                      {/* Custom Message */}
                      <div>
                        <Label className="text-xs text-slate-600 font-queensides">Message to Customer (optional)</Label>
                        <Textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Add a message for the customer"
                          className="mt-1 border-pink-200/50 min-h-[80px]"
                        />
                      </div>

                      {/* Status Update Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {order.status === "pending" && (
                          <Button
                            onClick={() => {
                              const shippedByEl = document.getElementById(`shipped_by_${order.id}`) as HTMLSelectElement
                              onUpdateStatus(order.id, "processing", trackingInput, messageInput, shippedByEl?.value || undefined)
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm Order
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            onClick={() => {
                              const shippedByEl = document.getElementById(`shipped_by_${order.id}`) as HTMLSelectElement
                              onUpdateStatus(order.id, "processing", trackingInput, messageInput, shippedByEl?.value || undefined)
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-sm"
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Start Processing
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            onClick={() => {
                              const shippedByEl = document.getElementById(`shipped_by_${order.id}`) as HTMLSelectElement
                              onUpdateStatus(order.id, "shipped", trackingInput, messageInput, shippedByEl?.value || undefined)
                            }}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Mark as Shipped
                          </Button>
                        )}
                        {["pending", "confirmed", "processing"].includes(order.status) && (
                          <Button
                            variant="outline"
                            onClick={() => onUpdateStatus(order.id, "cancelled", trackingInput, messageInput)}
                            className="border-red-200 text-red-600 hover:bg-red-50 text-sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel Order
                          </Button>
                        )}
                      </div>
                      
                      {/* Help text */}
                      <p className="text-xs text-slate-500 italic">
                        💡 Tip: Adding a tracking number will automatically mark the order as shipped.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand/Collapse Indicator */}
          <div 
            className="px-4 py-2 bg-pink-50/30 border-t border-pink-100 cursor-pointer flex items-center justify-center"
            onClick={() => setShowDetails(!showDetails)}
          >
            <motion.div
              animate={{ rotate: showDetails ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-pink-400" />
            </motion.div>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, trackingNumber?: string, message?: string, shippedBy?: string) => {
    try {
      console.log('[handleUpdateOrderStatus] Updating order:', { orderId, status, trackingNumber, shippedBy })
      
      const updates: any = { status }
      if (trackingNumber) updates.tracking_number = trackingNumber
      if (message) updates.shop_message = message
      if (shippedBy) updates.shipped_by = shippedBy
      
      // If status is 'shipped' and no tracking number, show error
      if (status === 'shipped' && !trackingNumber) {
        toast({
          title: "Tracking Number Required",
          description: "Please provide a tracking number before marking as shipped.",
          variant: "destructive",
        })
        return
      }
      
      // If tracking number is provided, auto-update to 'shipped'
      if (trackingNumber && !['cancelled', 'delivered'].includes(status)) {
        updates.status = 'shipped'
      }
      
      console.log('[handleUpdateOrderStatus] Applying updates:', updates)
      
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)

      if (error) {
        console.error('[handleUpdateOrderStatus] Error:', error)
        throw error
      }

      console.log('[handleUpdateOrderStatus] Order updated successfully')
      
      toast({
        title: "Order Updated",
        description: `Order status changed to ${status}.`,
      })

      // Refresh orders
      loadOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update order. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render Orders Tab Content
  const renderOrdersTab = () => {
    if (!isAuthenticated) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group mb-8"
        >
          <div className="relative rounded-2xl p-8 border-2 border-pink-300/20 hover:border-pink-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-pink-50/50 to-rose-50/30">
            {/* Elegant corner decorations */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-pink-400/60 rounded-tl-xl"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-rose-400/60 rounded-tr-xl"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-rose-400/60 rounded-bl-xl"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-pink-400/60 rounded-br-xl"></div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-200/50"
              >
                <Store className="w-10 h-10 text-pink-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-pink-800 font-display mb-4">Sign In Required</h3>
              <p className="text-pink-700 font-queensides leading-relaxed">Please sign in to review your orders</p>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/auth/login')}
                className="mt-6 relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10">Sign In</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )
    }

    const hasShop = !!userShop
    const displayOrders = ordersView === "received" ? receivedOrders : placedOrders

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-200/50"
          >
            <Truck className="w-8 h-8 text-pink-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 font-display">My Orders</h2>
          <p className="text-slate-600 font-queensides mt-2">Track and manage your orders</p>
        </div>

        {/* Toggle Between Cart/Received/Placed Orders */}
        <div className="flex gap-2 p-1 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOrdersView("cart")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-queensides transition-all duration-300 ${
              ordersView === "cart"
                ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Cart ({cartItems.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setOrdersView("placed")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-queensides transition-all duration-300 ${
              ordersView === "placed"
                ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            <Package className="w-4 h-4" />
            Orders ({placedOrders.length})
          </motion.button>
          {hasShop && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOrdersView("received")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-queensides transition-all duration-300 ${
                ordersView === "received"
                  ? "bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg"
                  : "text-slate-600 hover:bg-white/50"
              }`}
            >
              <Store className="w-4 h-4" />
              Received ({receivedOrders.length})
            </motion.button>
          )}
        </div>

        {/* Cart View */}
        {ordersView === "cart" && (
          <>
            {cartLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-4 border-pink-200/30">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-pink-100/50 to-rose-100/50 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-pink-100/50 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-pink-100/50 rounded w-24 animate-pulse" />
                        <div className="h-3 bg-pink-100/50 rounded w-20 animate-pulse" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : cartItems.length > 0 ? (
              <div className="space-y-4">
                {/* Cart Items */}
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 border-pink-200/50">
                      <div className="flex gap-4">
                        <img
                          src={item.productImage || "/placeholder.svg"}
                          alt={item.productName}
                          className="w-20 h-20 rounded-xl object-cover bg-gradient-to-br from-pink-100 to-rose-100"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 font-queensides">{item.productName}</h4>
                          <p className="text-sm text-slate-500 font-queensides">{item.shopName}</p>
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-xs text-slate-400 mt-1">
                              {[item.selectedSize, item.selectedColor].filter(Boolean).join(' • ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-pink-600 font-display">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {/* Cart Total & Checkout */}
                <Card className="p-4 border-pink-200/50 bg-gradient-to-br from-pink-50/50 to-rose-50/30">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-queensides">Subtotal</span>
                      <span className="font-bold text-slate-800 font-display">
                        ${CartService.getCartTotal(cartItems).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Shipping Address Form */}
                    <div className="space-y-3 pt-4 border-t border-pink-200/50">
                      <h4 className="font-semibold text-slate-800 font-display">Delivery Address</h4>
                      <Input
                        placeholder="Full Name"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                        className="border-pink-200/50"
                      />
                      <Input
                        placeholder="Street Address"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className="border-pink-200/50"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="border-pink-200/50"
                        />
                        <Input
                          placeholder="State"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                          className="border-pink-200/50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Postal Code"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                          className="border-pink-200/50"
                        />
                        <Input
                          placeholder="Phone"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                          className="border-pink-200/50"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={proceedToCheckout}
                      disabled={checkoutLoading || !shippingAddress.name || !shippingAddress.street}
                      className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {checkoutLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Proceed to Checkout
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 font-display mb-2">Your Cart is Empty</h3>
                <p className="text-slate-600 font-queensides mb-4">Add items to your cart to get started</p>
                <Button
                  onClick={() => setActiveTab("shop")}
                  className="font-queensides bg-gradient-to-r from-pink-400 to-rose-500 text-white"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Shop
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Orders List */}
        {ordersView !== "cart" && (ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 border-pink-200/30">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-100/50 to-rose-100/50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-pink-100/50 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-pink-100/50 rounded w-24 animate-pulse" />
                    <div className="h-3 bg-pink-100/50 rounded w-20 animate-pulse" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : displayOrders.length > 0 ? (
          <div className="space-y-4">
            {displayOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                isReceived={ordersView === "received"}
                onUpdateStatus={ordersView === "received" ? handleUpdateOrderStatus : undefined}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 font-display mb-2">
              No {ordersView === "received" ? "Received" : "Placed"} Orders
            </h3>
            <p className="text-slate-600 font-queensides mb-4">
              {ordersView === "received"
                ? "Orders from your shop will appear here"
                : "Your purchase history will appear here"}
            </p>
            <Button
              onClick={() => ordersView === "received" ? router.push("/shop/add") : setActiveTab("shop")}
              className="font-queensides bg-gradient-to-r from-pink-400 to-rose-500 text-white"
            >
              {ordersView === "received" ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Products
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Shop
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  // Render My Shop Tab Content
  const renderMyShopTab = () => {
    if (!isAuthenticated) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group mb-8"
        >
          <div className="relative rounded-2xl p-8 border-2 border-pink-300/20 hover:border-pink-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-pink-50/50 to-rose-50/30">
            {/* Elegant corner decorations */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-pink-400/60 rounded-tl-xl"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-rose-400/60 rounded-tr-xl"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-rose-400/60 rounded-bl-xl"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-pink-400/60 rounded-br-xl"></div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-200/50"
              >
                <Store className="w-10 h-10 text-pink-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-pink-800 font-display mb-4">Sign In Required</h3>
              <p className="text-pink-700 font-queensides leading-relaxed">Please sign in to manage your shop and start your Islamic business journey</p>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/auth/login')}
                className="mt-6 relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10">Sign In</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      )
    }

    if (!userShop) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group mb-8"
        >
          <div className="relative rounded-2xl p-8 border-2 border-pink-300/20 hover:border-pink-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/80 to-pink-50/50">
            {/* Elegant corner decorations */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-pink-400/60 rounded-tl-xl"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-rose-400/60 rounded-tr-xl"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-rose-400/60 rounded-bl-xl"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-pink-400/60 rounded-br-xl"></div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-200/50"
              >
                <HeartHandshake className="w-10 h-10 text-pink-600" />
              </motion.div>

              <h3 className="text-3xl font-bold text-slate-800 mb-4 font-display">Create Your Shop</h3>
              <p className="text-lg text-slate-600 font-queensides leading-relaxed mb-6 max-w-sm mx-auto">
                Start your Islamic business journey on Samaa marketplace.
                <span className="font-semibold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  Share your beautiful products
                </span> with the Muslim community.
              </p>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200/50 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                        <Store className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-queensides text-slate-700 font-semibold">Setup shop profile</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-queensides text-slate-700 font-semibold">Add your products</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200/50 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-queensides text-slate-700 font-semibold">Start selling</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateShop(true)}
                className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Shop
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )
    }

    // Shop exists - show shop dashboard
    return (
      <div className="space-y-6">
        {/* Shop Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <div className="relative rounded-2xl p-6 border-2 border-pink-300/20 hover:border-pink-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-pink-50/50 to-rose-50/30">
            {/* Elegant corner decorations */}
            <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-pink-400/60 rounded-tl-lg"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-rose-400/60 rounded-tr-lg"></div>
            <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-rose-400/60 rounded-bl-lg"></div>
            <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-pink-400/60 rounded-br-lg"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center border border-pink-200/50">
                      {userShop.logo_url ? (
                        <img src={userShop.logo_url} alt={userShop.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <Store className="w-7 h-7 text-pink-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 font-display">{userShop.name}</h2>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-pink-400 to-rose-500 text-white border-0">
                          {userShop.status === 'active' ? 'Active' : 'Pending'}
                        </Badge>
                        {userShop.verified && (
                          <Badge className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 font-queensides leading-relaxed mt-3">{userShop.description}</p>
                  
                  {/* Shop Type & Contact Info */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                    {userShop.shop_type && (
                      <div className="flex items-center gap-1">
                        <span className="text-lg">
                          {SHOP_CATEGORIES.find(c => c.value === userShop.shop_type)?.icon}
                        </span>
                        <span className="font-queensides capitalize">
                          {SHOP_CATEGORIES.find(c => c.value === userShop.shop_type)?.label}
                        </span>
                      </div>
                    )}
                    {userShop.contact_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-pink-400" />
                        <span className="font-queensides">{userShop.contact_email}</span>
                      </div>
                    )}
                    {userShop.contact_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-pink-400" />
                        <span className="font-queensides">{userShop.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditShop(true)}
                  className="relative overflow-hidden bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 font-medium px-4 py-2 rounded-xl border border-pink-200 hover:border-pink-300 transition-all duration-300 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="font-queensides">Edit Shop</span>
                </motion.button>
              </div>

              {/* Shop Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-white/60 rounded-xl border border-pink-100/50">
                  <div className="text-2xl font-bold text-pink-600 font-display">{shopProducts.length}</div>
                  <div className="text-xs text-slate-600 font-queensides">Products</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl border border-rose-100/50">
                  <div className="text-2xl font-bold text-rose-600 font-display">{userShop.total_sales || 0}</div>
                  <div className="text-xs text-slate-600 font-queensides">Sales</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl border border-purple-100/50">
                  <div className="text-2xl font-bold text-purple-600 font-display">{userShop.rating?.toFixed(1) || '0.0'}</div>
                  <div className="text-xs text-slate-600 font-queensides">Rating</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl border border-emerald-100/50">
                  <div className="text-2xl font-bold text-emerald-600 font-display">{userShop.total_reviews || 0}</div>
                  <div className="text-xs text-slate-600 font-queensides">Reviews</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/shop/add")}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Product
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 font-medium px-6 py-3 rounded-xl border border-pink-200 hover:border-pink-300 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Info Card */}
        {(userShop.paypal_email || userShop.bitcoin_address) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-pink-200/50 bg-gradient-to-br from-white/80 to-pink-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800 font-display">
                  <Wallet className="w-5 h-5 text-pink-500" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userShop.paypal_email && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200/50">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Pay</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">PayPal</p>
                      <p className="text-xs text-slate-500 font-queensides">{userShop.paypal_email}</p>
                    </div>
                  </div>
                )}
                {userShop.bitcoin_address && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200/50">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Bitcoin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Bitcoin</p>
                      <p className="text-xs text-slate-500 font-queensides truncate max-w-[200px]">
                        {userShop.bitcoin_address.slice(0, 12)}...{userShop.bitcoin_address.slice(-8)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 font-display">Your Products</h3>
            <Badge className="bg-pink-100 text-pink-700 border-pink-200">
              {shopProducts.length} items
            </Badge>
          </div>

          {shopProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {shopProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => handleViewProduct(product.id)}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-pink-200/50 hover:border-pink-300/60">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100">
                      <img
                        src={product.images?.[0] ? `https://qwnukvbeoglvynyrhuey.supabase.co/storage/v1/object/public/shop-images/${product.images[0]}` : "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Management buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingProduct(product)
                            }}
                            size="sm"
                            className="bg-white/90 text-slate-800 hover:bg-white w-8 h-8 p-0"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteProduct(product.id)
                            }}
                            size="sm"
                            className="bg-red-500/90 text-white hover:bg-red-500 w-8 h-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-800 font-queensides line-clamp-1">{product.name}</h4>
                      <p className="text-lg font-bold text-pink-600 font-display mt-1">
                        ${product.price}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-pink-200/50 bg-gradient-to-br from-pink-50/30 to-rose-50/30">
              <Package className="w-12 h-12 text-pink-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 font-display mb-2">No Products Yet</h3>
              <p className="text-slate-600 font-queensides mb-4">Add your first product to start selling</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/shop/add")}
                className="relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Product
                </span>
              </motion.button>
            </Card>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-pink-50/80 via-white/80 to-rose-50/80 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-pink-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-pink-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-pink-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-display">Shop</h1>
              <p className="text-sm text-slate-600 font-queensides">Browse & purchase items</p>
            </div>
            <div className="w-10" />
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-pink-200/20 w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-pink-400/20 to-rose-400/20 border border-pink-300/40 shadow-lg"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    <tab.icon className="w-6 h-6 mx-auto" />
                  </div>
                  <div className="text-xs font-queensides font-bold text-slate-700 leading-tight">
                    {tab.label.split(" ").slice(0, 2).join(" ")}
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-pink-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          <AnimatePresence mode="wait">
            {activeTab === "shop" && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderShopTab()}
              </motion.div>
            )}
            {activeTab === "categories" && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderCategoriesTab()}
              </motion.div>
            )}
            {activeTab === "myshop" && (
              <motion.div
                key="myshop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderMyShopTab()}
              </motion.div>
            )}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderOrdersTab()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create Shop Modal */}
        {showCreateShop && (
          <CreateShopModal 
            onClose={() => setShowCreateShop(false)} 
            onSubmit={createShop}
            isLoading={isLoading}
          />
        )}

        {/* Edit Shop Modal */}
        {showEditShop && userShop && (
          <EditShopModal 
            shop={userShop}
            onClose={() => setShowEditShop(false)} 
            onSubmit={updateShop}
            isLoading={isLoading}
          />
        )}

        {/* Video Modal */}
        <AnimatePresence>
          {videoModalUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setVideoModalUrl(null)}
            >
              <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setVideoModalUrl(null)}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <video controls autoPlay className="w-full rounded-lg" src={videoModalUrl}>
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Toaster />
      </div>
    </div>
  )
}

// Create Shop Modal Component
function CreateShopModal({ 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  onClose: () => void
  onSubmit: (formData: FormData) => void
  isLoading: boolean
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 font-display">Create Your Shop</h3>
                <p className="text-sm text-slate-500 font-queensides">Start your Islamic business journey</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Basic Information
              </h4>
              
              <div>
                <Label htmlFor="shop-name" className="font-queensides text-slate-700">Shop Name *</Label>
                <Input
                  id="shop-name"
                  name="name"
                  placeholder="Enter your shop name"
                  required
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div>
                <Label htmlFor="shop-description" className="font-queensides text-slate-700">Description *</Label>
                <Textarea
                  id="shop-description"
                  name="description"
                  placeholder="Describe what you sell..."
                  required
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="shop-type" className="font-queensides text-slate-700">Shop Category *</Label>
                <select
                  id="shop-type"
                  name="shopType"
                  required
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 bg-white"
                >
                  <option value="">Select a category</option>
                  {SHOP_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-500" />
                Contact Information
              </h4>
              
              <div>
                <Label htmlFor="contact-email" className="font-queensides text-slate-700">Contact Email *</Label>
                <Input
                  id="contact-email"
                  name="contactEmail"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div>
                <Label htmlFor="contact-phone" className="font-queensides text-slate-700">Contact Phone</Label>
                <Input
                  id="contact-phone"
                  name="contactPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-500" />
                Business Address
              </h4>
              
              <div>
                <Label htmlFor="address-street" className="font-queensides text-slate-700">Street Address</Label>
                <Input
                  id="address-street"
                  name="addressStreet"
                  placeholder="123 Main Street"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address-city" className="font-queensides text-slate-700">City</Label>
                  <Input
                    id="address-city"
                    name="addressCity"
                    placeholder="City"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="address-state" className="font-queensides text-slate-700">State/Province</Label>
                  <Input
                    id="address-state"
                    name="addressState"
                    placeholder="State"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address-country" className="font-queensides text-slate-700">Country</Label>
                  <Input
                    id="address-country"
                    name="addressCountry"
                    placeholder="Country"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="address-postal" className="font-queensides text-slate-700">Postal Code</Label>
                  <Input
                    id="address-postal"
                    name="addressPostalCode"
                    placeholder="Postal Code"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <Wallet className="w-4 h-4 text-pink-500" />
                Payment Information (for payouts)
              </h4>
              
              <div>
                <Label htmlFor="paypal-email" className="font-queensides text-slate-700">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  name="paypalEmail"
                  type="email"
                  placeholder="paypal@yourdomain.com"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div>
                <Label htmlFor="bitcoin-address" className="font-queensides text-slate-700">Bitcoin Address</Label>
                <Input
                  id="bitcoin-address"
                  name="bitcoinAddress"
                  placeholder="bc1..."
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-pink-500" />
                Policies
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="return-policy-days" className="font-queensides text-slate-700">Return Policy (days)</Label>
                  <Input
                    id="return-policy-days"
                    name="returnPolicyDays"
                    type="number"
                    defaultValue="14"
                    min="0"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="processing-time" className="font-queensides text-slate-700">Processing Time</Label>
                  <Input
                    id="processing-time"
                    name="processingTime"
                    placeholder="1-3 business days"
                    defaultValue="1-3 business days"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="return-policy" className="font-queensides text-slate-700">Return Policy</Label>
                <Textarea
                  id="return-policy"
                  name="returnPolicy"
                  placeholder="Describe your return and refund policy..."
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="shipping-policy" className="font-queensides text-slate-700">Shipping Policy</Label>
                <Textarea
                  id="shipping-policy"
                  name="shippingPolicy"
                  placeholder="Describe your shipping policy, costs, and delivery times..."
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="free-shipping-threshold" className="font-queensides text-slate-700">Free Shipping Threshold ($)</Label>
                <Input
                  id="free-shipping-threshold"
                  name="freeShippingThreshold"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
                <p className="text-xs text-slate-500 mt-1 font-queensides">Leave empty for no free shipping</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 font-queensides border-pink-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-queensides"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Create Shop'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// Edit Shop Modal Component
function EditShopModal({ 
  shop, 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  shop: Shop
  onClose: () => void
  onSubmit: (formData: FormData) => void
  isLoading: boolean
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 font-display">Edit Shop</h3>
                <p className="text-sm text-slate-500 font-queensides">Update your shop information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Basic Information
              </h4>
              
              <div>
                <Label htmlFor="edit-shop-name" className="font-queensides text-slate-700">Shop Name *</Label>
                <Input
                  id="edit-shop-name"
                  name="name"
                  defaultValue={shop.name}
                  placeholder="Enter your shop name"
                  required
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div>
                <Label htmlFor="edit-shop-description" className="font-queensides text-slate-700">Description *</Label>
                <Textarea
                  id="edit-shop-description"
                  name="description"
                  defaultValue={shop.description || ''}
                  placeholder="Describe what you sell..."
                  required
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-shop-type" className="font-queensides text-slate-700">Shop Category *</Label>
                <select
                  id="edit-shop-type"
                  name="shopType"
                  required
                  defaultValue={shop.shop_type}
                  className="w-full mt-1 px-4 py-2 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 bg-white"
                >
                  <option value="">Select a category</option>
                  {SHOP_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-500" />
                Contact Information
              </h4>
              
              <div>
                <Label htmlFor="edit-contact-email" className="font-queensides text-slate-700">Contact Email *</Label>
                <Input
                  id="edit-contact-email"
                  name="contactEmail"
                  type="email"
                  defaultValue={shop.contact_email || ''}
                  placeholder="your@email.com"
                  required
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div>
                <Label htmlFor="edit-contact-phone" className="font-queensides text-slate-700">Contact Phone</Label>
                <Input
                  id="edit-contact-phone"
                  name="contactPhone"
                  type="tel"
                  defaultValue={shop.contact_phone || ''}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-500" />
                Business Address
              </h4>
              
              <div>
                <Label htmlFor="edit-address-street" className="font-queensides text-slate-700">Street Address</Label>
                <Input
                  id="edit-address-street"
                  name="addressStreet"
                  defaultValue={shop.address_street || ''}
                  placeholder="123 Main Street"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-address-city" className="font-queensides text-slate-700">City</Label>
                  <Input
                    id="edit-address-city"
                    name="addressCity"
                    defaultValue={shop.address_city || ''}
                    placeholder="City"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address-state" className="font-queensides text-slate-700">State/Province</Label>
                  <Input
                    id="edit-address-state"
                    name="addressState"
                    defaultValue={shop.address_state || ''}
                    placeholder="State"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-address-country" className="font-queensides text-slate-700">Country</Label>
                  <Input
                    id="edit-address-country"
                    name="addressCountry"
                    defaultValue={shop.address_country || ''}
                    placeholder="Country"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address-postal" className="font-queensides text-slate-700">Postal Code</Label>
                  <Input
                    id="edit-address-postal"
                    name="addressPostalCode"
                    defaultValue={shop.address_postal_code || ''}
                    placeholder="Postal Code"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <Wallet className="w-4 h-4 text-pink-500" />
                Payment Information (for payouts)
              </h4>
              
              <div>
                <Label htmlFor="edit-paypal-email" className="font-queensides text-slate-700">PayPal Email</Label>
                <Input
                  id="edit-paypal-email"
                  name="paypalEmail"
                  type="email"
                  defaultValue={shop.paypal_email || ''}
                  placeholder="paypal@yourdomain.com"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>

              <div>
                <Label htmlFor="edit-bitcoin-address" className="font-queensides text-slate-700">Bitcoin Address</Label>
                <Input
                  id="edit-bitcoin-address"
                  name="bitcoinAddress"
                  defaultValue={shop.bitcoin_address || ''}
                  placeholder="bc1..."
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 font-display flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-pink-500" />
                Policies
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-return-policy-days" className="font-queensides text-slate-700">Return Policy (days)</Label>
                  <Input
                    id="edit-return-policy-days"
                    name="returnPolicyDays"
                    type="number"
                    defaultValue={shop.return_policy_days || 14}
                    min="0"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-processing-time" className="font-queensides text-slate-700">Processing Time</Label>
                  <Input
                    id="edit-processing-time"
                    name="processingTime"
                    defaultValue={shop.processing_time || '1-3 business days'}
                    placeholder="1-3 business days"
                    className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-return-policy" className="font-queensides text-slate-700">Return Policy</Label>
                <Textarea
                  id="edit-return-policy"
                  name="returnPolicy"
                  defaultValue={shop.return_policy || ''}
                  placeholder="Describe your return and refund policy..."
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-shipping-policy" className="font-queensides text-slate-700">Shipping Policy</Label>
                <Textarea
                  id="edit-shipping-policy"
                  name="shippingPolicy"
                  defaultValue={shop.shipping_policy || ''}
                  placeholder="Describe your shipping policy, costs, and delivery times..."
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-free-shipping-threshold" className="font-queensides text-slate-700">Free Shipping Threshold ($)</Label>
                <Input
                  id="edit-free-shipping-threshold"
                  name="freeShippingThreshold"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={shop.free_shipping_threshold || ''}
                  placeholder="50.00"
                  className="mt-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400/20"
                />
                <p className="text-xs text-slate-500 mt-1 font-queensides">Leave empty for no free shipping</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 font-queensides border-pink-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white font-queensides"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Update Shop'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}