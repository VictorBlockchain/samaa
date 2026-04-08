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
import { getLikesProducts, getComplimentsProducts, getSubscriptionPlans } from "@/lib/stripe"
import type { AdminSettings } from "@/lib/stripe"
import { 
  ArrowLeft, 
  Crown, 
  Heart, 
  Sparkles,
  History, 
  Check, 
  Loader2,
  Clock,
  DollarSign,
  CheckCircle,
  MessageCircle
} from "lucide-react"

interface PaymentRecord {
  id: string
  user_id: string
  amount: number
  currency: string
  status: string
  type: string
  metadata: {
    likes?: number
    compliments?: number
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
  likes_included: number
  compliments_included: number
}

interface UserProfile {
  available_likes: number
  available_compliments: number
}

interface LikesProduct {
  id: string
  name: string
  likes: number
  price: number
  description: string
}

interface ComplimentsProduct {
  id: string
  name: string
  compliments: number
  price: number
  description: string
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  likesIncluded: number
  complimentsIncluded: number
  features: string[]
}

export default function WalletView() {
  const [activeTab, setActiveTab] = useState("subscription")
  const [isLoading, setIsLoading] = useState(false)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [likesProducts, setLikesProducts] = useState<LikesProduct[]>([])
  const [complimentsProducts, setComplimentsProducts] = useState<ComplimentsProduct[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [communitySplit, setCommunitySplit] = useState<number>(10)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userId, isAuthenticated, signOut } = useAuth()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Payment successful! Your purchase has been processed.')
    } else if (searchParams.get('cancelled') === 'true') {
      setSuccessMessage(null)
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
    const likes = await getLikesProducts()
    const compliments = await getComplimentsProducts()
    const plans = await getSubscriptionPlans()
    
    setLikesProducts(likes)
    setComplimentsProducts(compliments)
    setSubscriptionPlans(plans)
    
    // Get community split from admin settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('community_split_percentage')
      .single()
    
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
      .single()

    if (!error && data) {
      setSubscription(data)
    }
  }

  const fetchProfile = async () => {
    if (!userId) return
    
    const { data, error } = await supabase
      .from('users')
      .select('available_likes, available_compliments')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
  }

  const handlePurchaseLikes = async (productId: string) => {
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
          type: 'likes',
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
      console.error('Error purchasing likes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePurchaseCompliments = async (productId: string) => {
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
          type: 'compliments',
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
      console.error('Error purchasing compliments:', error)
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

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
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
            <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-2">Sign In Required</h2>
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Wallet</h1>
              <p className="text-sm text-slate-600 font-queensides">
                Manage your subscription and purchases
              </p>
            </div>
            <div className="w-10" />
          </div>

          {/* Available Likes & Compliments */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6" />
                    <div>
                      <p className="text-sm opacity-90 font-queensides">Likes</p>
                      <p className="text-2xl font-bold font-qurova">{profile?.available_likes || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-6 h-6" />
                    <div>
                      <p className="text-sm opacity-90 font-queensides">Compliments</p>
                      <p className="text-2xl font-bold font-qurova">{profile?.available_compliments || 0}</p>
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

        {/* Success Message */}
        {successMessage && (
          <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700 font-queensides">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto">
              <ArrowLeft className="w-4 h-4 text-green-600 rotate-45" />
            </button>
          </div>
        )}

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
              <TabsTrigger value="likes" className="font-queensides text-xs sm:text-sm">
                <Heart className="w-4 h-4 mr-1 sm:mr-2" />
                Likes
              </TabsTrigger>
              <TabsTrigger value="compliments" className="font-queensides text-xs sm:text-sm">
                <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Compliments</span>
                <span className="sm:hidden">Comp</span>
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
                        <CardTitle className="font-qurova">Active Subscription</CardTitle>
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
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span className="text-sm text-slate-600 font-queensides">
                              {subscription.likes_included} likes/mo
                            </span>
                          </div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-slate-600 font-queensides">
                              {subscription.compliments_included} comps/mo
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
                          <CardTitle className="font-qurova">{plan.name}</CardTitle>
                          <CardDescription className="font-queensides">
                            <span className="text-2xl font-bold text-slate-800">${plan.price}</span>
                            <span className="text-slate-600">/{plan.interval}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-rose-50 rounded-lg p-2 text-center">
                              <Heart className="w-4 h-4 text-rose-500 mx-auto" />
                              <p className="text-sm font-medium text-slate-700 font-queensides">{plan.likesIncluded}</p>
                              <p className="text-xs text-slate-500 font-queensides">likes</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-2 text-center">
                              <MessageCircle className="w-4 h-4 text-amber-500 mx-auto" />
                              <p className="text-sm font-medium text-slate-700 font-queensides">{plan.complimentsIncluded}</p>
                              <p className="text-xs text-slate-500 font-queensides">compliments</p>
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

            {/* Buy Likes Tab */}
            <TabsContent value="likes">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-slate-600 font-queensides mb-4">
                  Get more likes to increase your visibility
                </p>
                {likesProducts.map((product) => (
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
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                            <Heart className="w-6 h-6 text-rose-500" />
                          </div>
                          <div>
                            <CardTitle className="font-qurova">{product.name}</CardTitle>
                            <CardDescription className="font-queensides">{product.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-800 font-qurova">${product.price}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        onClick={() => handlePurchaseLikes(product.id)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 font-queensides"
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

            {/* Buy Compliments Tab */}
            <TabsContent value="compliments">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-center text-slate-600 font-queensides mb-4">
                  Spread kindness with compliments
                </p>
                {complimentsProducts.map((product) => (
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
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <CardTitle className="font-qurova">{product.name}</CardTitle>
                            <CardDescription className="font-queensides">{product.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-800 font-qurova">${product.price}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        onClick={() => handlePurchaseCompliments(product.id)}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 font-queensides"
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
                                  : payment.type === 'likes' 
                                    ? 'bg-rose-100' 
                                    : payment.type === 'compliments'
                                      ? 'bg-amber-100'
                                      : 'bg-green-100'
                              }`}>
                                {payment.type === 'subscription' ? (
                                  <Crown className="w-5 h-5 text-indigo-600" />
                                ) : payment.type === 'likes' ? (
                                  <Heart className="w-5 h-5 text-rose-600" />
                                ) : payment.type === 'compliments' ? (
                                  <MessageCircle className="w-5 h-5 text-amber-600" />
                                ) : (
                                  <DollarSign className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 font-queensides capitalize">
                                  {payment.type}
                                  {payment.metadata.likes && ` - ${payment.metadata.likes} likes`}
                                  {payment.metadata.compliments && ` - ${payment.metadata.compliments} comps`}
                                </p>
                                <p className="text-sm text-slate-500 font-queensides">
                                  {formatDate(payment.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800 font-qurova">
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
        </div>
      </div>
    </div>
  )
}
