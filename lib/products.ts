import { supabase } from './supabase'

// Admin settings interface
export interface AdminSettings {
  premium_monthly_price: number
  premium_yearly_price: number
  premium_monthly_views: number
  premium_monthly_leads: number
  premium_yearly_views: number
  premium_yearly_leads: number
  views_25_price: number
  views_50_price: number
  views_100_price: number
  views_250_price: number
  views_500_price: number
  leads_25_price: number
  leads_50_price: number
  leads_100_price: number
  leads_250_price: number
  leads_500_price: number
  community_split_percentage: number
  referral_views_bonus: number
  referral_cash_bonus: number
  // Stripe Price IDs for subscriptions
  stripe_subscription_monthly_price_id?: string
  stripe_subscription_yearly_price_id?: string
}

// Fetch admin settings from database
export async function getAdminSettings(): Promise<AdminSettings | null> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

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

// Default views products
const DEFAULT_VIEWS_PRODUCTS = [
  { id: 'views_25', name: '25 Views', views: 25, price: 14.99, description: 'Boost your profile views with 25 views' },
  { id: 'views_50', name: '50 Views', views: 50, price: 26.99, description: 'See more profiles with 50 views' },
  { id: 'views_100', name: '100 Views', views: 100, price: 48.99, description: 'Popular choice! 100 views' },
  { id: 'views_250', name: '250 Views', views: 250, price: 109.99, description: 'Best value! 250 views' },
  { id: 'views_500', name: '500 Views', views: 500, price: 196.99, description: 'Ultimate package! 500 views' },
]

// Default leads products
const DEFAULT_LEADS_PRODUCTS = [
  { id: 'leads_25', name: '25 Leads', leads: 25, price: 14.99, description: 'Take the lead 25 times' },
  { id: 'leads_50', name: '50 Leads', leads: 50, price: 26.99, description: 'Start 50 meaningful conversations' },
  { id: 'leads_100', name: '100 Leads', leads: 100, price: 48.99, description: 'Popular choice! 100 leads' },
  { id: 'leads_250', name: '250 Leads', leads: 250, price: 109.99, description: 'Best value! 250 leads' },
  { id: 'leads_500', name: '500 Leads', leads: 500, price: 196.99, description: 'Ultimate package! 500 leads' },
]

// Get views products with dynamic pricing
export async function getViewsProducts() {
  const settings = await getAdminSettings()
  
  if (!settings) {
    return DEFAULT_VIEWS_PRODUCTS
  }

  return [
    { id: 'views_25', name: '25 Views', views: 25, price: settings.views_25_price, description: 'Boost your profile views with 25 views' },
    { id: 'views_50', name: '50 Views', views: 50, price: settings.views_50_price, description: 'See more profiles with 50 views' },
    { id: 'views_100', name: '100 Views', views: 100, price: settings.views_100_price, description: 'Popular choice! 100 views' },
    { id: 'views_250', name: '250 Views', views: 250, price: settings.views_250_price, description: 'Best value! 250 views' },
    { id: 'views_500', name: '500 Views', views: 500, price: settings.views_500_price, description: 'Ultimate package! 500 views' },
  ]
}

// Get leads products with dynamic pricing
export async function getLeadsProducts() {
  const settings = await getAdminSettings()
  
  if (!settings) {
    return DEFAULT_LEADS_PRODUCTS
  }

  return [
    { id: 'leads_25', name: '25 Leads', leads: 25, price: settings.leads_25_price, description: 'Take the lead 25 times' },
    { id: 'leads_50', name: '50 Leads', leads: 50, price: settings.leads_50_price, description: 'Start 50 meaningful conversations' },
    { id: 'leads_100', name: '100 Leads', leads: 100, price: settings.leads_100_price, description: 'Popular choice! 100 leads' },
    { id: 'leads_250', name: '250 Leads', leads: 250, price: settings.leads_250_price, description: 'Best value! 250 leads' },
    { id: 'leads_500', name: '500 Leads', leads: 500, price: settings.leads_500_price, description: 'Ultimate package! 500 leads' },
  ]
}

// Default subscription plans
export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 19.99,
    interval: 'month' as const,
    viewsIncluded: 25,
    leadsIncluded: 25,
    features: [
      'Unlimited messaging',
      '25 views per month',
      '25 leads per month',
      'See who viewed you',
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
    viewsIncluded: 300,
    leadsIncluded: 300,
    features: [
      'Unlimited messaging',
      '300 views per year',
      '300 leads per year',
      'See who viewed you',
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
      viewsIncluded: settings.premium_monthly_views,
      leadsIncluded: settings.premium_monthly_leads,
      features: [
        'Unlimited messaging',
        `${settings.premium_monthly_views} views per month`,
        `${settings.premium_monthly_leads} leads per month`,
        'See who viewed you',
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
      viewsIncluded: settings.premium_yearly_views,
      leadsIncluded: settings.premium_yearly_leads,
      features: [
        'Unlimited messaging',
        `${settings.premium_yearly_views} views per year`,
        `${settings.premium_yearly_leads} leads per year`,
        'See who viewed you',
        'Advanced filters',
        'Priority support',
        'Read receipts',
        'Save 37% vs monthly',
      ],
    },
  ]
}
