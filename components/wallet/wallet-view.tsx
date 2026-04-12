"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { getViewsProducts, getLeadsProducts, getSubscriptionPlans } from "@/lib/products"
import type { AdminSettings } from "@/lib/products"
import { 
  ArrowLeft, 
  Crown, 
  Eye, 
  Sparkles,
  History, 
  Check, 
  Loader2,
  Clock,
  DollarSign,
  CheckCircle,
  MessageCircle,
  Heart
} from "lucide-react"

interface PaymentRecord {
  id: string
  user_id: string
  amount: number
  currency: string
  status: string
  type: string
  metadata: {
    views?: number
    leads?: number
    planId?: string
    orderId?: string
  }
  created_at: string
}

interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  current_period_end: string
  views_included: number
  leads_included: number
}

interface UserProfile {
  available_views: number
  available_leads: number
}

interface ViewsProduct {
  id: string
  name: string
  views: number
  price: number
  description: string
}

interface LeadsProduct {
  id: string
  name: string
  leads: number
  price: number
  description: string
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  viewsIncluded: number
  leadsIncluded: number
  features: string[]
}

export default function WalletView() {
  const [activeTab, setActiveTab] = useState("subscription")
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [viewsProducts, setViewsProducts] = useState<ViewsProduct[]>([])
  const [leadsProducts, setLeadsProducts] = useState<LeadsProduct[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [communitySplit, setCommunitySplit] = useState<number>(10)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userId, isAuthenticated, signOut } = useAuth()

  useEffect(() => {
    // Remove success/cancelled handling - now using dedicated success page
    if (searchParams.get('cancelled') === 'true') {
      // Could show a toast here in the future
      console.log('Payment cancelled')
    }
  }, [searchParams])

  useEffect(() => {
    if (userId) {
      fetchPaymentHistory()
      fetchSubscription()
      fetchProfile()
      fetchProducts()
    }
  }, [userId])

  const fetchProducts = async () => {
    const likes = await getViewsProducts()
    const compliments = await getLeadsProducts()
    const plans = await getSubscriptionPlans()
    
    setViewsProducts(likes)
    setLeadsProducts(compliments)
    setSubscriptionPlans(plans)
    
    // Get community split from admin settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('community_split_percentage')
      .limit(1)
      .maybeSingle()
    
    if (settings) {
      setCommunitySplit(settings.community_split_percentage)
    }
  }

  const fetchPaymentHistory = async () => {
    if (!userId) return
    
    const { data, error } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setPayments(data)
    }
  }

  const fetchSubscription = async () => {
    if (!userId) return
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (!error && data) {
      setSubscription(data)
    }
  }

  const fetchProfile = async () => {
    if (!userId) return
    
    const { data, error } = await supabase
      .from('users')
      .select('available_views, available_leads')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  const handlePurchaseViews = async (productId: string) => {
    if (!userId || !user?.email) {
      router.push('/auth/login')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail: user.email,
          type: 'views',
          productId,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error purchasing views:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseLeads = async (productId: string) => {
    if (!userId || !user?.email) {
      router.push('/auth/login')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail: user.email,
          type: 'leads',
          productId,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error purchasing leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!userId || !user?.email) {
      router.push('/auth/login')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail: user.email,
          type: 'subscription',
          planId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Error subscribing:', error)
      alert(`Subscription error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-100/50 p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 font-queensides mb-2">Sign In Required</h2>
            <p className="text-slate-600 font-queensides mb-6">
              Please sign in to access your wallet and purchase features.
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-queensides">Wallet</h1>
              <p className="text-sm text-slate-600 font-queensides">
                Manage your subscription and purchases
              </p>
            </div>
            <div className="w-10" />
          </div>

          {/* Available Likes & Compliments */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-6 h-6" />
                    <div>
                      <p className="text-sm opacity-90 font-queensides">Views</p>
                      <p className="text-2xl font-bold font-queensides">{profile?.available_views || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-6 h-6" />
                    <div>
                      <p className="text-sm opacity-90 font-queensides">Leads</p>
                      <p className="text-2xl font-bold font-queensides">{profile?.available_leads || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {subscription && (
              <div className="mt-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-white" />
                  <span className="text-white font-queensides">
                    {subscriptionPlans.find(p => p.id === subscription.plan_id)?.name || 'Premium'}
                  </span>
                </div>
                <Badge className="bg-white/20 text-white border-0">Active</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Community Contribution Banner */}
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800 font-queensides">
                {communitySplit}% of your purchase supports our community fund
              </p>
              <p className="text-xs text-emerald-600 font-queensides">
                Donations help masjids and Nikah celebrations
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="subscription" className="font-queensides text-xs sm:text-sm">
                <Crown className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Subscription</span>
                <span className="sm:hidden">Sub</span>
              </TabsTrigger>
              <TabsTrigger value="views" className="font-queensides text-xs sm:text-sm">
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Views</span>
                <span className="sm:hidden">Views</span>
              </TabsTrigger>
              <TabsTrigger value="leads" className="font-queensides text-xs sm:text-sm">
                <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Leads</span>
                <span className="sm:hidden">Leads</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="font-queensides text-xs sm:text-sm">
                <History className="w-4 h-4 mr-1 sm:mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {subscription ? (
                  <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-queensides">Active Subscription</CardTitle>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <CardDescription className="font-queensides">
                        {subscriptionPlans.find(p => p.id === subscription.plan_id)?.name || 'Premium Plan'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm text-slate-600 font-queensides">
                              {subscription.views_included} views/mo
                            </span>
                          </div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-slate-600 font-queensides">
                              {subscription.leads_included} leads/mo
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 font-queensides">
                        <Clock className="w-4 h-4" />
                        <span>Renews on {formatDate(subscription.current_period_end)}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full font-queensides">
                        Manage Subscription
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <>
                    <p className="text-center text-slate-600 font-queensides mb-4">
                      Choose a plan that works for you
                    </p>
                    {subscriptionPlans.map((plan) => (
                      <Card key={plan.id} className="relative overflow-hidden">
                        {plan.id === 'premium_yearly' && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-queensides">
                            SAVE 37%
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="font-queensides">{plan.name}</CardTitle>
                          <CardDescription className="font-queensides">
                            <span className="text-2xl font-bold text-slate-800">${plan.price}</span>
                            <span className="text-slate-600">/{plan.interval}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-emerald-50 rounded-lg p-2 text-center">
                              <Eye className="w-4 h-4 text-emerald-500 mx-auto" />
                              <p className="text-sm font-medium text-slate-700 font-queensides">{plan.viewsIncluded}</p>
                              <p className="text-xs text-slate-500 font-queensides">views</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-2 text-center">
                              <MessageCircle className="w-4 h-4 text-amber-500 mx-auto" />
                              <p className="text-sm font-medium text-slate-700 font-queensides">{plan.leadsIncluded}</p>
                              <p className="text-xs text-slate-500 font-queensides">leads</p>
                            </div>
                          </div>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center space-x-2 font-queensides text-sm text-slate-600">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-queensides"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Subscribe'
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </>
                )}
              </motion.div>
            </TabsContent>

            {/* Buy Views Tab */}
            <TabsContent value="views">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-slate-600 font-queensides mb-4">
                  Get more views
                </p>
                {viewsProducts.map((product) => (
                  <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    {product.id === 'likes_100' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-queensides">
                        POPULAR
                      </div>
                    )}
                    {product.id === 'likes_250' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-queensides">
                        BEST VALUE
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                            <Eye className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="font-queensides">{product.name}</CardTitle>
                            <CardDescription className="font-queensides">{product.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-800 font-queensides">${product.price}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        onClick={() => handlePurchaseViews(product.id)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-queensides"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Purchase ${product.price}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            {/* Buy Leads Tab */}
            <TabsContent value="leads">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-slate-600 font-queensides mb-4">
                  Take the lead and start meaningful conversations
                </p>
                {leadsProducts.map((product) => (
                  <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    {product.id === 'compliments_100' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-queensides">
                        POPULAR
                      </div>
                    )}
                    {product.id === 'compliments_250' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-queensides">
                        BEST VALUE
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="font-queensides">{product.name}</CardTitle>
                            <CardDescription className="font-queensides">{product.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-800 font-queensides">${product.price}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        onClick={() => handlePurchaseLeads(product.id)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-queensides"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Purchase ${product.price}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="history">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {payments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-queensides">No payment history yet</p>
                      <p className="text-sm text-slate-400 font-queensides mt-1">
                        Your purchases will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <Card key={payment.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                payment.type === 'subscription' 
                                  ? 'bg-indigo-100' 
                                  : payment.type === 'views' 
                                    ? 'bg-emerald-100' 
                                    : payment.type === 'leads'
                                      ? 'bg-purple-100'
                                      : 'bg-green-100'
                              }`}>
                                {payment.type === 'subscription' ? (
                                  <Crown className="w-5 h-5 text-indigo-600" />
                                ) : payment.type === 'views' ? (
                                  <Eye className="w-5 h-5 text-emerald-600" />
                                ) : payment.type === 'leads' ? (
                                  <MessageCircle className="w-5 h-5 text-purple-600" />
                                ) : (
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 font-queensides capitalize">
                                  {payment.type}
                                  {payment.metadata.views && ` - ${payment.metadata.views} views`}
                                  {payment.metadata.leads && ` - ${payment.metadata.leads} leads`}
                                </p>
                                <p className="text-sm text-slate-500 font-queensides">
                                  {formatDate(payment.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800 font-queensides">
                                {formatCurrency(payment.amount, payment.currency)}
                              </p>
                              <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'} className={
                                payment.status === 'succeeded' 
                                  ? 'bg-green-100 text-green-700' 
                                  : payment.status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
          <br/><br/><br/><br/><br/><br/>
        </div>
      </div>
    </div>
  )
}
