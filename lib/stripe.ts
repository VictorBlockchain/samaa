import Stripe from 'stripe'
import { supabase } from './supabase'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia',
})

// Admin settings interface
export interface AdminSettings {
  premium_monthly_price: number
  premium_yearly_price: number
  premium_monthly_likes: number
  premium_monthly_compliments: number
  premium_yearly_likes: number
  premium_yearly_compliments: number
  likes_25_price: number
  likes_50_price: number
  likes_100_price: number
  likes_250_price: number
  likes_500_price: number
  compliments_25_price: number
  compliments_50_price: number
  compliments_100_price: number
  compliments_250_price: number
  compliments_500_price: number
  community_split_percentage: number
}

// Fetch admin settings from database
export async function getAdminSettings(): Promise<AdminSettings | null> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching admin settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return null
  }
}

// Default likes products (prices will be overridden by admin settings)
export const DEFAULT_LIKES_PRODUCTS = [
  { id: 'likes_25', name: '25 Likes', likes: 25, price: 14.99, description: 'Boost your visibility with 25 likes' },
  { id: 'likes_50', name: '50 Likes', likes: 50, price: 26.99, description: 'Get more matches with 50 likes' },
  { id: 'likes_100', name: '100 Likes', likes: 100, price: 48.99, description: 'Popular choice! 100 likes' },
  { id: 'likes_250', name: '250 Likes', likes: 250, price: 109.99, description: 'Best value! 250 likes' },
  { id: 'likes_500', name: '500 Likes', likes: 500, price: 196.99, description: 'Ultimate package! 500 likes' },
]

// Default compliments products
export const DEFAULT_COMPLIMENTS_PRODUCTS = [
  { id: 'compliments_25', name: '25 Compliments', compliments: 25, price: 14.99, description: 'Spread kindness with 25 compliments' },
  { id: 'compliments_50', name: '50 Compliments', compliments: 50, price: 26.99, description: 'Make someone\'s day with 50 compliments' },
  { id: 'compliments_100', name: '100 Compliments', compliments: 100, price: 48.99, description: 'Popular choice! 100 compliments' },
  { id: 'compliments_250', name: '250 Compliments', compliments: 250, price: 109.99, description: 'Best value! 250 compliments' },
  { id: 'compliments_500', name: '500 Compliments', compliments: 500, price: 196.99, description: 'Ultimate package! 500 compliments' },
]

// Get likes products with dynamic pricing
export async function getLikesProducts() {
  const settings = await getAdminSettings()
  
  if (!settings) {
    return DEFAULT_LIKES_PRODUCTS
  }

  return [
    { id: 'likes_25', name: '25 Likes', likes: 25, price: settings.likes_25_price, description: 'Boost your visibility with 25 likes' },
    { id: 'likes_50', name: '50 Likes', likes: 50, price: settings.likes_50_price, description: 'Get more matches with 50 likes' },
    { id: 'likes_100', name: '100 Likes', likes: 100, price: settings.likes_100_price, description: 'Popular choice! 100 likes' },
    { id: 'likes_250', name: '250 Likes', likes: 250, price: settings.likes_250_price, description: 'Best value! 250 likes' },
    { id: 'likes_500', name: '500 Likes', likes: 500, price: settings.likes_500_price, description: 'Ultimate package! 500 likes' },
  ]
}

// Get compliments products with dynamic pricing
export async function getComplimentsProducts() {
  const settings = await getAdminSettings()
  
  if (!settings) {
    return DEFAULT_COMPLIMENTS_PRODUCTS
  }

  return [
    { id: 'compliments_25', name: '25 Compliments', compliments: 25, price: settings.compliments_25_price, description: 'Spread kindness with 25 compliments' },
    { id: 'compliments_50', name: '50 Compliments', compliments: 50, price: settings.compliments_50_price, description: 'Make someone\'s day with 50 compliments' },
    { id: 'compliments_100', name: '100 Compliments', compliments: 100, price: settings.compliments_100_price, description: 'Popular choice! 100 compliments' },
    { id: 'compliments_250', name: '250 Compliments', compliments: 250, price: settings.compliments_250_price, description: 'Best value! 250 compliments' },
    { id: 'compliments_500', name: '500 Compliments', compliments: 500, price: settings.compliments_500_price, description: 'Ultimate package! 500 compliments' },
  ]
}

// Default subscription plans
export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 19.99,
    interval: 'month' as const,
    likesIncluded: 25,
    complimentsIncluded: 25,
    features: [
      'Unlimited messaging',
      '25 likes per month',
      '25 compliments per month',
      'See who likes you',
      'Advanced filters',
      'Priority support',
      'Read receipts',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 149.99,
    interval: 'year' as const,
    likesIncluded: 300,
    complimentsIncluded: 300,
    features: [
      'Unlimited messaging',
      '300 likes per year',
      '300 compliments per year',
      'See who likes you',
      'Advanced filters',
      'Priority support',
      'Read receipts',
      'Save 37% vs monthly',
    ],
  },
]

// Get subscription plans with dynamic pricing
export async function getSubscriptionPlans() {
  const settings = await getAdminSettings()
  
  if (!settings) {
    return DEFAULT_SUBSCRIPTION_PLANS
  }

  return [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: settings.premium_monthly_price,
      interval: 'month' as const,
      likesIncluded: settings.premium_monthly_likes,
      complimentsIncluded: settings.premium_monthly_compliments,
      features: [
        'Unlimited messaging',
        `${settings.premium_monthly_likes} likes per month`,
        `${settings.premium_monthly_compliments} compliments per month`,
        'See who likes you',
        'Advanced filters',
        'Priority support',
        'Read receipts',
      ],
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      price: settings.premium_yearly_price,
      interval: 'year' as const,
      likesIncluded: settings.premium_yearly_likes,
      complimentsIncluded: settings.premium_yearly_compliments,
      features: [
        'Unlimited messaging',
        `${settings.premium_yearly_likes} likes per year`,
        `${settings.premium_yearly_compliments} compliments per year`,
        'See who likes you',
        'Advanced filters',
        'Priority support',
        'Read receipts',
        'Save 37% vs monthly',
      ],
    },
  ]
}

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
  product: { id: string; name: string; likes: number; price: number; description: string }
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
        type: 'likes',
        likes: product.likes.toString(),
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
  product: { id: string; name: string; compliments: number; price: number; description: string }
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
        type: 'compliments',
        compliments: product.compliments.toString(),
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
              description: `${plan.likesIncluded} likes, ${plan.complimentsIncluded} compliments included`,
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
