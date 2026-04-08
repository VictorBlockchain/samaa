import { supabase } from './supabase'

// Cart item interface - updated for Supabase
export interface CartItem {
  id: string
  productId: string
  productUuid: string
  productName: string
  productImage: string
  price: number
  currency: 'USD'
  quantity: number
  selectedSize?: string
  selectedColor?: string
  shopId: string
  shopName: string
  sellerWallet: string
  addedAt: string
}

// Order interface - updated for Supabase with complete tracking
export interface Order {
  id: string
  orderNumber: string
  userId: string
  shopId: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'on_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'return_in_progress' | 'returned' | 'refunded'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
  refundStatus: 'none' | 'requested' | 'in_progress' | 'partial' | 'full' | 'rejected'
  refundAmount: number
  refundReason?: string
  refundRequestedAt?: string
  refundProcessedAt?: string
  items: CartItem[]
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  currency: 'USD'
  shippingAddress: any
  billingAddress?: any
  promoCodeId?: string
  promoDiscountAmount: number
  paymentMethod: string
  stripeSessionId?: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  paymentCompletedAt?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
  deliveredAt?: string
  deliveryDate?: string
  deliveryStatus: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned_to_sender'
  deliverySignatureName?: string
  deliveryNotes?: string
  deliveryAttempts: number
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled'
  itemsCount: number
  cancelledAt?: string
  cancellationReason?: string
  cancelledBy?: string
  returnTrackingNumber?: string
  returnCarrier?: string
  returnRequestedReason?: string
  returnReceivedAt?: string
  returnConditionNotes?: string
  customerNotified: boolean
  lastNotificationSentAt?: string
  notes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

// Cart service for managing shopping cart - now using Supabase
export class CartService {
  
  // Get cart items for user from Supabase
  static async getCartItems(userId: string): Promise<CartItem[]> {
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

      // Transform to CartItem interface
      return (data || []).map(item => ({
        id: item.id,
        productId: item.product_id,
        productUuid: item.product_id,
        productName: item.products.name,
        productImage: item.products.images?.[0] || '',
        price: item.products.base_price,
        currency: 'USD',
        quantity: item.quantity,
        selectedSize: item.selected_size,
        selectedColor: item.selected_color,
        shopId: item.products.shop_id,
        shopName: item.products.shops?.name || '',
        sellerWallet: '',
        addedAt: item.created_at
      }))
    } catch (error) {
      console.error('Error fetching cart:', error)
      return []
    }
  }

  // Add item to cart
  static async addToCart(
    userId: string,
    item: {
      productId: string
      quantity: number
      selectedSize?: string
      selectedColor?: string
    }
  ): Promise<boolean> {
    try {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', item.productId)
        .eq('selected_size', item.selectedSize || null)
        .eq('selected_color', item.selectedColor || null)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({
            quantity: existingItem.quantity + item.quantity,
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
            product_id: item.productId,
            quantity: item.quantity,
            selected_size: item.selectedSize || null,
            selected_color: item.selectedColor || null
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
  static async updateCartItemQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(userId, itemId)
      }

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error updating cart item:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating cart item:', error)
      return false
    }
  }

  // Remove item from cart
  static async removeFromCart(userId: string, itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
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

  // Get cart total
  static getCartTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
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

// Order service for managing orders
export class OrderService {
  
  // Create order from cart
  static async createOrder(
    userId: string,
    cartItems: CartItem[],
    shippingAddress: any,
    options?: {
      promoCodeId?: string
      promoDiscountAmount?: number
    }
  ): Promise<Order | null> {
    try {
      // Calculate totals
      const subtotal = CartService.getCartTotal(cartItems)
      const promoDiscountAmount = options?.promoDiscountAmount || 0
      const shippingAmount = 0 // Can be calculated based on shipping method
      const taxAmount = 0 // Can be calculated based on location
      const totalAmount = subtotal - promoDiscountAmount + shippingAmount + taxAmount

      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          shop_id: cartItems[0]?.shopId, // First item's shop (simplified)
          status: 'pending',
          subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          discount_amount: promoDiscountAmount,
          total_amount: totalAmount,
          currency: 'USD',
          shipping_address: shippingAddress,
          promo_code_id: options?.promoCodeId || null,
          promo_discount_amount: promoDiscountAmount,
          payment_method: 'stripe',
          notes: shippingAddress.notes || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        return null
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        variant_title: [item.selectedSize, item.selectedColor].filter(Boolean).join(' - ') || 'Standard',
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // Rollback order
        await supabase.from('orders').delete().eq('id', order.id)
        return null
      }

      // Return order with items
      return {
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        shopId: order.shop_id,
        items: cartItems,
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        shippingAmount: order.shipping_amount,
        discountAmount: order.discount_amount,
        totalAmount: order.total_amount,
        currency: 'USD',
        status: order.status,
        paymentStatus: order.payment_status || 'pending',
        refundStatus: order.refund_status || 'none',
        refundAmount: order.refund_amount || 0,
        shippingAddress: order.shipping_address,
        promoCodeId: order.promo_code_id,
        promoDiscountAmount: order.promo_discount_amount,
        paymentMethod: order.payment_method,
        stripeSessionId: order.stripe_session_id,
        stripePaymentIntentId: order.stripe_payment_intent_id,
        deliveryStatus: order.delivery_status || 'pending',
        deliveryAttempts: order.delivery_attempts || 0,
        fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
        itemsCount: cartItems.length,
        customerNotified: order.customer_notified || false,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  // Get user orders
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return []
      }

      // Fetch order items for each order
      const orders = await Promise.all(
        (data || []).map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id)

          return {
            id: order.id,
            orderNumber: order.order_number,
            userId: order.user_id,
            shopId: order.shop_id,
            items: items || [],
            subtotal: order.subtotal,
            taxAmount: order.tax_amount,
            shippingAmount: order.shipping_amount,
            discountAmount: order.discount_amount,
            totalAmount: order.total_amount,
            currency: order.currency,
            status: order.status,
            paymentStatus: order.payment_status || 'pending',
            refundStatus: order.refund_status || 'none',
            refundAmount: order.refund_amount || 0,
            shippingAddress: order.shipping_address,
            promoCodeId: order.promo_code_id,
            promoDiscountAmount: order.promo_discount_amount,
            paymentMethod: order.payment_method,
            stripeSessionId: order.stripe_session_id,
            stripePaymentIntentId: order.stripe_payment_intent_id,
            stripeChargeId: order.stripe_charge_id,
            paymentCompletedAt: order.payment_completed_at,
            trackingNumber: order.tracking_number,
            trackingUrl: order.tracking_url,
            estimatedDelivery: order.estimated_delivery,
            deliveredAt: order.delivered_at,
            deliveryDate: order.delivery_date,
            deliveryStatus: order.delivery_status || 'pending',
            deliverySignatureName: order.delivery_signature_name,
            deliveryNotes: order.delivery_notes,
            deliveryAttempts: order.delivery_attempts || 0,
            fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
            itemsCount: items?.length || 0,
            cancelledAt: order.cancelled_at,
            cancellationReason: order.cancellation_reason,
            cancelledBy: order.cancelled_by,
            returnTrackingNumber: order.return_tracking_number,
            returnCarrier: order.return_carrier,
            returnRequestedReason: order.return_requested_reason,
            returnReceivedAt: order.return_received_at,
            returnConditionNotes: order.return_condition_notes,
            customerNotified: order.customer_notified || false,
            lastNotificationSentAt: order.last_notification_sent_at,
            notes: order.notes,
            adminNotes: order.admin_notes,
            createdAt: order.created_at,
            updatedAt: order.updated_at
          }
        })
      )

      return orders
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  // Update order status and related fields
  static async updateOrderStatus(
    orderId: string,
    updates: {
      status?: Order['status']
      paymentStatus?: Order['paymentStatus']
      refundStatus?: Order['refundStatus']
      refundAmount?: number
      refundReason?: string
      deliveryStatus?: Order['deliveryStatus']
      trackingNumber?: string
      trackingUrl?: string
      deliveryDate?: string
      deliveryNotes?: string
      fulfillmentStatus?: Order['fulfillmentStatus']
      cancellationReason?: string
      cancelledBy?: string
      returnTrackingNumber?: string
      returnCarrier?: string
      returnReceivedAt?: string
      returnConditionNotes?: string
      customerNotified?: boolean
      adminNotes?: string
    }
  ): Promise<boolean> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      // Map frontend fields to database columns
      if (updates.status) updateData.status = updates.status
      if (updates.paymentStatus) updateData.payment_status = updates.paymentStatus
      if (updates.refundStatus) updateData.refund_status = updates.refundStatus
      if (updates.refundAmount !== undefined) updateData.refund_amount = updates.refundAmount
      if (updates.refundReason !== undefined) updateData.refund_reason = updates.refundReason
      if (updates.deliveryStatus) updateData.delivery_status = updates.deliveryStatus
      if (updates.trackingNumber !== undefined) updateData.tracking_number = updates.trackingNumber
      if (updates.trackingUrl !== undefined) updateData.tracking_url = updates.trackingUrl
      if (updates.deliveryDate !== undefined) updateData.delivery_date = updates.deliveryDate
      if (updates.deliveryNotes !== undefined) updateData.delivery_notes = updates.deliveryNotes
      if (updates.fulfillmentStatus) updateData.fulfillment_status = updates.fulfillmentStatus
      if (updates.cancellationReason !== undefined) updateData.cancellation_reason = updates.cancellationReason
      if (updates.cancelledBy !== undefined) updateData.cancelled_by = updates.cancelledBy
      if (updates.returnTrackingNumber !== undefined) updateData.return_tracking_number = updates.returnTrackingNumber
      if (updates.returnCarrier !== undefined) updateData.return_carrier = updates.returnCarrier
      if (updates.returnReceivedAt !== undefined) updateData.return_received_at = updates.returnReceivedAt
      if (updates.returnConditionNotes !== undefined) updateData.return_condition_notes = updates.returnConditionNotes
      if (updates.customerNotified !== undefined) updateData.customer_notified = updates.customerNotified
      if (updates.adminNotes !== undefined) updateData.admin_notes = updates.adminNotes

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating order:', error)
      return false
    }
  }
}
