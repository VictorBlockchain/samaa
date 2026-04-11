import Stripe from 'stripe'
import { supabase } from './supabase'
import { getAdminSettings } from './products'
import type { AdminSettings } from './products'

// Lazy-initialize Stripe only when needed (server-side only)
let _stripe: Stripe | null = null

function getStripe(): Stripe | null {
  // Only initialize on server side
  if (typeof window !== 'undefined') {
    return null
  }
  
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      console.warn('STRIPE_SECRET_KEY is not configured')
      return null
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Export stripe instance (will be null on client side)
export const stripe = {
  get checkout() { return getStripe()?.checkout },
  get customers() { return getStripe()?.customers },
  get paymentIntents() { return getStripe()?.paymentIntents },
  get subscriptions() { return getStripe()?.subscriptions },
  get products() { return getStripe()?.products },
  get prices() { return getStripe()?.prices },
  get billingPortal() { return getStripe()?.billingPortal },
  get promotionCodes() { return getStripe()?.promotionCodes },
  get coupons() { return getStripe()?.coupons },
} as Stripe

// Re-export from products.ts for backward compatibility
export { 
  getViewsProducts, 
  getLeadsProducts, 
  getSubscriptionPlans,
  getAdminSettings,
  DEFAULT_SUBSCRIPTION_PLANS
} from './products'
export type { AdminSettings } from './products'

// Payment status types
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled'

export interface PaymentRecord {
  id: string
  userId: string
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  amount: number
  currency: string
  status: PaymentStatus
  type: 'subscription' | 'likes' | 'compliments' | 'product'
  communityContribution: number
  platformFee: number
  metadata: {
    likes?: number
    compliments?: number
    planId?: string
    orderId?: string
  }
  createdAt: string
  updatedAt: string
}

// Create a Stripe checkout session for likes purchase
export async function createLikesCheckoutSession(
  userId: string,
  userEmail: string,
  product: { id: string; name: string; views: number; price: number; description: string }
): Promise<string | null> {
  try {
    // Get community split percentage
    const settings = await getAdminSettings()
    const communitySplit = settings?.community_split_percentage || 10

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?cancelled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        type: 'views',
        views: product.views.toString(),
        productId: product.id,
        communitySplit: communitySplit.toString(),
      },
    })

    return session.url
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return null
  }
}

// Create a Stripe checkout session for compliments purchase
export async function createComplimentsCheckoutSession(
  userId: string,
  userEmail: string,
  product: { id: string; name: string; leads: number; price: number; description: string }
): Promise<string | null> {
  try {
    const settings = await getAdminSettings()
    const communitySplit = settings?.community_split_percentage || 10

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?cancelled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        type: 'leads',
        leads: product.leads.toString(),
        productId: product.id,
        communitySplit: communitySplit.toString(),
      },
    })

    return session.url
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return null
  }
}

// Create a Stripe checkout session for subscription
export async function createSubscriptionCheckoutSession(
  userId: string,
  userEmail: string,
  plan: {
    id: string
    name: string
    price: number
    interval: 'month' | 'year'
    likesIncluded: number
    complimentsIncluded: number
  }
): Promise<string | null> {
  try {
    const settings = await getAdminSettings()
    const communitySplit = settings?.community_split_percentage || 10

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `${plan.likesIncluded} views, ${plan.complimentsIncluded} leads included`,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/wallet?cancelled=true`,
      customer_email: userEmail,
      metadata: {
        userId,
        type: 'subscription',
        planId: plan.id,
        likesIncluded: plan.likesIncluded.toString(),
        complimentsIncluded: plan.complimentsIncluded.toString(),
        communitySplit: communitySplit.toString(),
      },
    })

    return session.url
  } catch (error) {
    console.error('Error creating subscription session:', error)
    return null
  }
}

// Create a payment intent for shop checkout
export async function createPaymentIntent(
  amount: number,
  orderId: string,
  userId: string
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        orderId,
        userId,
        type: 'product',
      },
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return null
  }
}
