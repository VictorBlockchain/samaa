import { supabase } from './supabase'

// Cart item interface
export interface CartItem {
  id: string
  productId: string
  productUuid: string
  productName: string
  productImage: string
  price: number
  currency: 'SOL' | 'SAMAA' | 'USD'
  quantity: number
  selectedSize?: string
  selectedColor?: string
  shopId: string
  shopName: string
  sellerWallet: string
  addedAt: string
}

// Order interface
export interface Order {
  id: string
  buyerWallet: string
  items: CartItem[]
  totalAmount: number
  currency: 'SOL' | 'SAMAA'
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: any
  paymentTxHash?: string
  createdAt: string
  updatedAt: string
}

// Cart service for managing shopping cart
export class CartService {
  
  // Get cart items for user
  static getCartItems(userWallet: string): CartItem[] {
    try {
      const cartData = localStorage.getItem(`cart_${userWallet}`)
      return cartData ? JSON.parse(cartData) : []
    } catch (error) {
      console.error('Error loading cart:', error)
      return []
    }
  }

  // Add item to cart
  static addToCart(userWallet: string, item: Omit<CartItem, 'id' | 'addedAt'>): boolean {
    try {
      const cartItems = this.getCartItems(userWallet)
      
      // Check if item already exists (same product, size, color)
      const existingItemIndex = cartItems.findIndex(cartItem => 
        cartItem.productUuid === item.productUuid &&
        cartItem.selectedSize === item.selectedSize &&
        cartItem.selectedColor === item.selectedColor
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        cartItems[existingItemIndex].quantity += item.quantity
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          id: crypto.randomUUID(),
          addedAt: new Date().toISOString()
        }
        cartItems.push(newItem)
      }

      localStorage.setItem(`cart_${userWallet}`, JSON.stringify(cartItems))
      return true
    } catch (error) {
      console.error('Error adding to cart:', error)
      return false
    }
  }

  // Update cart item quantity
  static updateCartItemQuantity(userWallet: string, itemId: string, quantity: number): boolean {
    try {
      const cartItems = this.getCartItems(userWallet)
      const itemIndex = cartItems.findIndex(item => item.id === itemId)
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cartItems.splice(itemIndex, 1)
        } else {
          cartItems[itemIndex].quantity = quantity
        }
        localStorage.setItem(`cart_${userWallet}`, JSON.stringify(cartItems))
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating cart item:', error)
      return false
    }
  }

  // Remove item from cart
  static removeFromCart(userWallet: string, itemId: string): boolean {
    try {
      const cartItems = this.getCartItems(userWallet)
      const filteredItems = cartItems.filter(item => item.id !== itemId)
      localStorage.setItem(`cart_${userWallet}`, JSON.stringify(filteredItems))
      return true
    } catch (error) {
      console.error('Error removing from cart:', error)
      return false
    }
  }

  // Clear entire cart
  static clearCart(userWallet: string): boolean {
    try {
      localStorage.removeItem(`cart_${userWallet}`)
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      return false
    }
  }

  // Get cart total
  static getCartTotal(cartItems: CartItem[]): { SOL: number; SAMAA: number; USD: number } {
    const totals = { SOL: 0, SAMAA: 0, USD: 0 }
    
    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity
      totals[item.currency] += itemTotal
    })

    return totals
  }

  // Get cart item count
  static getCartItemCount(userWallet: string): number {
    const cartItems = this.getCartItems(userWallet)
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }
}

// Order service for managing orders
export class OrderService {
  
  // Create order from cart
  static async createOrder(
    buyerWallet: string, 
    cartItems: CartItem[], 
    shippingAddress: any,
    currency: 'SOL' | 'SAMAA'
  ): Promise<Order | null> {
    try {
      // Calculate total in the specified currency
      const totals = CartService.getCartTotal(cartItems)
      let totalAmount = 0

      if (currency === 'SOL') {
        totalAmount = totals.SOL
        // Convert SAMAA to SOL if needed (simplified conversion)
        if (totals.SAMAA > 0) {
          totalAmount += totals.SAMAA * 0.005 // 1 SAMAA = 0.005 SOL (example rate)
        }
      } else {
        totalAmount = totals.SAMAA
        // Convert SOL to SAMAA if needed
        if (totals.SOL > 0) {
          totalAmount += totals.SOL * 200 // 1 SOL = 200 SAMAA (example rate)
        }
      }

      const order: Order = {
        id: crypto.randomUUID(),
        buyerWallet,
        items: cartItems,
        totalAmount,
        currency,
        status: 'pending',
        shippingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          buyer_wallet: order.buyerWallet,
          items: order.items,
          total_amount: order.totalAmount,
          currency: order.currency,
          status: order.status,
          shipping_address: order.shippingAddress,
          created_at: order.createdAt,
          updated_at: order.updatedAt
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating order in database:', error)
        // Fallback to localStorage
        const orders = this.getOrdersFromStorage(buyerWallet)
        orders.push(order)
        localStorage.setItem(`orders_${buyerWallet}`, JSON.stringify(orders))
      }

      return order
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  // Get orders from localStorage (fallback)
  static getOrdersFromStorage(userWallet: string): Order[] {
    try {
      const ordersData = localStorage.getItem(`orders_${userWallet}`)
      return ordersData ? JSON.parse(ordersData) : []
    } catch (error) {
      console.error('Error loading orders:', error)
      return []
    }
  }

  // Get user orders
  static async getUserOrders(userWallet: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_wallet', userWallet)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        // Fallback to localStorage
        return this.getOrdersFromStorage(userWallet)
      }

      // Convert database format to Order interface
      return data.map(order => ({
        id: order.id,
        buyerWallet: order.buyer_wallet,
        items: order.items,
        totalAmount: order.total_amount,
        currency: order.currency,
        status: order.status,
        shippingAddress: order.shipping_address,
        paymentTxHash: order.payment_tx_hash,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }))
    } catch (error) {
      console.error('Error fetching orders:', error)
      return this.getOrdersFromStorage(userWallet)
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status'], paymentTxHash?: string): Promise<boolean> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (paymentTxHash) {
        updates.payment_tx_hash = paymentTxHash
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }
}

// Exchange rate service (mock - in production, fetch from API)
export class ExchangeRateService {
  static SOL_TO_USD = 23.45
  static SAMAA_TO_USD = 0.12

  static convertToUSD(amount: number, currency: 'SOL' | 'SAMAA'): number {
    if (currency === 'SOL') {
      return amount * this.SOL_TO_USD
    } else {
      return amount * this.SAMAA_TO_USD
    }
  }

  static convertBetweenCrypto(amount: number, fromCurrency: 'SOL' | 'SAMAA', toCurrency: 'SOL' | 'SAMAA'): number {
    if (fromCurrency === toCurrency) return amount
    
    const usdValue = this.convertToUSD(amount, fromCurrency)
    
    if (toCurrency === 'SOL') {
      return usdValue / this.SOL_TO_USD
    } else {
      return usdValue / this.SAMAA_TO_USD
    }
  }
}
