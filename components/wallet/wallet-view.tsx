"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { getViewsProducts, getLeadsProducts, getSubscriptionPlans } from "@/lib/products"
import type { AdminSettings } from "@/lib/products"
import { BitcoinPayment } from "./bitcoin-payment"
import { MahrPurseWallet } from "./mahr-purse-wallet"
import { WithdrawModal } from "./withdraw-modal"
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
  Heart,
  Tag,
  Gift,
  Bitcoin,
  Wallet,
  Copy,
  ArrowUpRight,
  Info,
  Lock,
  Unlock,
  AlertCircle
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
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("")
  const [isRedeemingPromo, setIsRedeemingPromo] = useState(false)
  
  // Bitcoin payment modal state
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false)
  const [bitcoinPaymentType, setBitcoinPaymentType] = useState<"subscription" | "views" | "leads">("subscription")
  const [bitcoinPaymentAmount, setBitcoinPaymentAmount] = useState(0)
  const [bitcoinPaymentDescription, setBitcoinPaymentDescription] = useState("")
  
  // Bitcoin wallet state
  const [btcBalance, setBtcBalance] = useState(0)
  const [btcAddress, setBtcAddress] = useState<string | null>(null)
  const [userGender, setUserGender] = useState<string | null>(null)
  const [mahrData, setMahrData] = useState<any>(null)
  const [purseData, setPurseData] = useState<any>(null)
  const [showTimelockExplainer, setShowTimelockExplainer] = useState(false)
  const [showMahrPurseModal, setShowMahrPurseModal] = useState(false)
  const [btcCopied, setBtcCopied] = useState(false)
  const [isGeneratingBtc, setIsGeneratingBtc] = useState(false)
  
  // Withdraw modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawWalletType, setWithdrawWalletType] = useState<"main" | "mahr" | "purse">("main")
  const [withdrawBalance, setWithdrawBalance] = useState(0)
  const [withdrawAddress, setWithdrawAddress] = useState("")
  
  // Relock modal state
  const [showRelockModal, setShowRelockModal] = useState(false)
  const [relockWalletType, setRelockWalletType] = useState<"mahr" | "purse">("mahr")
  const [relockUnlockDate, setRelockUnlockDate] = useState("")
  const [relockUnlockTime, setRelockUnlockTime] = useState("12:00")
  const [relockError, setRelockError] = useState("")
  const [isRelocking, setIsRelocking] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userId, isAuthenticated, signOut } = useAuth()
  const { toast } = useToast()

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
      fetchBitcoinWallet()
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
    
    console.log('[wallet] Fetching payment history for user:', userId)
    
    const { data, error } = await supabase
      .from('user_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[wallet] Error fetching payment history:', error)
    } else {
      console.log('[wallet] Payment history fetched:', data?.length || 0, 'records')
      setPayments(data || [])
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
      .select('available_views, available_leads, gender, btc_balance_satoshis, btc_address, mahr_principle_address, mahr_balance_satoshis, mahr_unlock_date, mahr_is_active, purse_principle_address, purse_balance_satoshis, purse_unlock_date, purse_is_active')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile({ available_views: data.available_views, available_leads: data.available_leads })
      setBtcBalance(data.btc_balance_satoshis || 0)
      setBtcAddress(data.btc_address || null)
      setUserGender(data.gender || null)
      
      if (data.mahr_is_active) {
        setMahrData({
          address: data.mahr_principle_address,
          balanceSatoshis: data.mahr_balance_satoshis || 0,
          unlockDate: data.mahr_unlock_date,
          isActive: data.mahr_is_active
        })
      }
      
      if (data.purse_is_active) {
        setPurseData({
          address: data.purse_principle_address,
          balanceSatoshis: data.purse_balance_satoshis || 0,
          unlockDate: data.purse_unlock_date,
          isActive: data.purse_is_active
        })
      }
    }
  }

  const handlePurchaseViews = async (productId: string) => {
    if (!userId || !user?.email) {
      router.push('/auth/login')
      return
    }

    // Find the product
    const product = viewsProducts.find(p => p.id === productId)
    if (!product) return

    // Open Bitcoin payment modal
    setBitcoinPaymentType('views')
    setBitcoinPaymentAmount(product.price)
    setBitcoinPaymentDescription(`${product.name} - ${product.views} views`)
    setShowBitcoinPayment(true)
  }

  const handlePurchaseLeads = async (productId: string) => {
    if (!userId || !user?.email) {
      router.push('/auth/login')
      return
    }

    // Find the product
    const product = leadsProducts.find(p => p.id === productId)
    if (!product) return

    // Open Bitcoin payment modal
    setBitcoinPaymentType('leads')
    setBitcoinPaymentAmount(product.price)
    setBitcoinPaymentDescription(`${product.name} - ${product.leads} leads`)
    setShowBitcoinPayment(true)
  }

  const handleSubscribe = async (planId: string) => {
    if (!userId || !user?.email) {
      router.push('/auth/login')
      return
    }

    // Find the plan
    const plan = subscriptionPlans.find(p => p.id === planId)
    if (!plan) return

    // Open Bitcoin payment modal
    setBitcoinPaymentType('subscription')
    setBitcoinPaymentAmount(plan.price)
    setBitcoinPaymentDescription(`${plan.name} - ${plan.interval === 'month' ? 'Monthly' : 'Yearly'} subscription`)
    setShowBitcoinPayment(true)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleRedeemPromo = async () => {
    if (!promoCode.trim() || !userId) {
      toast({
        title: "Missing Information",
        description: "Please enter a promo code",
        variant: "destructive",
      })
      return
    }

    setIsRedeemingPromo(true)
    
    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), userId }),
      })

      const data = await response.json()

      if (data.success) {
        // Success - show appropriate message based on type
        if (data.type === 'subscription') {
          toast({
            title: "✨ Promo Code Redeemed!",
            description: `You received ${data.months} month(s) free subscription with ${data.views} views and ${data.leads} leads!`,
          })
        } else if (data.type === 'views') {
          toast({
            title: "✨ Promo Code Redeemed!",
            description: `You received ${data.amount} free views!`,
          })
        } else if (data.type === 'leads') {
          toast({
            title: "✨ Promo Code Redeemed!",
            description: `You received ${data.amount} free leads!`,
          })
        }
        
        setPromoCode('')
        
        // Refresh data
        await Promise.all([
          fetchPaymentHistory(),
          fetchSubscription(),
          fetchProfile(),
        ])
      } else {
        toast({
          title: "Redemption Failed",
          description: data.error || 'Failed to redeem promo code',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('[promo] Error redeeming promo:', error)
      toast({
        title: "Redemption Failed",
        description: 'Failed to redeem promo code',
        variant: "destructive",
      })
    }
    
    setIsRedeemingPromo(false)
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

  const formatBtc = (satoshis: number) => {
    const btc = satoshis / 100000000
    return btc.toFixed(8)
  }

  const copyBtcAddress = () => {
    if (!btcAddress) return
    navigator.clipboard.writeText(btcAddress)
    setBtcCopied(true)
    setTimeout(() => setBtcCopied(false), 2000)
  }

  const getTimeUntilUnlock = (unlockDate: string) => {
    const unlock = new Date(unlockDate)
    const now = new Date()
    const diff = unlock.getTime() - now.getTime()

    if (diff <= 0) return "Unlocked"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const fetchBitcoinWallet = async () => {
    // Data is fetched in fetchProfile now
  }

  const handleGenerateBtcAddress = async () => {
    if (!userId) return
    
    setIsGeneratingBtc(true)
    
    try {
      const response = await fetch('/api/bitcoin/generate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (result.success) {
        setBtcAddress(result.data.address)
        toast({
          title: "✅ Bitcoin Address Generated",
          description: "Your Bitcoin wallet address has been created successfully",
        })
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || 'Failed to generate Bitcoin address',
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('[wallet] Error generating BTC address:', error)
      toast({
        title: "Generation Failed",
        description: error.message || 'Failed to generate Bitcoin address',
        variant: "destructive",
      })
    } finally {
      setIsGeneratingBtc(false)
    }
  }

  const handleOpenWithdraw = (walletType: "main" | "mahr" | "purse", balance: number, address: string) => {
    setWithdrawWalletType(walletType)
    setWithdrawBalance(balance)
    setWithdrawAddress(address)
    setShowWithdrawModal(true)
  }

  const handleWithdrawSuccess = async () => {
    // Refresh wallet data
    await Promise.all([
      fetchProfile(),
      fetchPaymentHistory(),
    ])
  }

  const validateRelockDate = (date: Date) => {
    const now = new Date()
    const tenYearsFromNow = new Date()
    tenYearsFromNow.setFullYear(now.getFullYear() + 10)

    if (date <= now) {
      setRelockError("Date must be in the future")
      return false
    }

    if (date > tenYearsFromNow) {
      setRelockError("Date cannot be more than 10 years from today")
      return false
    }

    setRelockError("")
    return true
  }

  const handleRelockDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRelockUnlockDate(e.target.value)
    setRelockError("")
  }

  const handleRelockTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRelockUnlockTime(e.target.value)
    setRelockError("")
  }

  const handleOpenRelock = (walletType: "mahr" | "purse") => {
    setRelockWalletType(walletType)
    setRelockUnlockDate("")
    setRelockUnlockTime("12:00")
    setRelockError("")
    setShowRelockModal(true)
  }

  const handleRelock = async () => {
    if (!relockUnlockDate) {
      setRelockError("Please select a valid date")
      return
    }

    const [year, month, day] = relockUnlockDate.split('-').map(Number)
    const [hours, minutes] = relockUnlockTime.split(':').map(Number)
    const newUnlockDate = new Date(year, month - 1, day, hours, minutes)

    if (!validateRelockDate(newUnlockDate)) {
      return
    }

    setIsRelocking(true)

    try {
      const response = await fetch('/api/mahr-purse/relock-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userType: relockWalletType,
          unlockDate: newUnlockDate.toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "✅ Wallet Relocked!",
          description: `Your ${relockWalletType === 'mahr' ? 'Mahr' : 'Purse'} wallet has been relocked successfully`,
        })
        setShowRelockModal(false)
        await fetchProfile()
      } else {
        setRelockError(result.error || 'Failed to relock wallet')
      }
    } catch (error: any) {
      console.error('[wallet] Error relocking wallet:', error)
      setRelockError(error.message || 'Failed to relock wallet')
    } finally {
      setIsRelocking(false)
    }
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

        {/* Bitcoin Wallet Section */}
        <div className="p-4 space-y-4">
          {/* Main Bitcoin Wallet */}
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Bitcoin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-queensides">Bitcoin Wallet</CardTitle>
                    <CardDescription className="font-queensides">Your BTC balance & address</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Balance */}
              <div className="bg-white/80 rounded-xl p-4 border border-amber-100">
                <div className="text-center">
                  <p className="text-sm text-slate-600 font-queensides mb-1">Available Balance</p>
                  <p className="text-3xl font-bold font-mono text-slate-800">
                    {formatBtc(btcBalance)} BTC
                  </p>
                  <p className="text-sm text-slate-500 font-queensides mt-1">
                    {btcBalance.toLocaleString()} satoshis
                  </p>
                </div>
              </div>

              {/* Address */}
              {btcAddress ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 font-queensides">
                    Wallet Address
                  </label>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs font-mono break-all">
                      {btcAddress}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyBtcAddress}
                      className="shrink-0 bg-white"
                    >
                      {btcCopied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-600 font-queensides mb-3">
                    No Bitcoin address generated yet
                  </p>
                  <Button
                    onClick={handleGenerateBtcAddress}
                    disabled={isGeneratingBtc}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-queensides"
                  >
                    {isGeneratingBtc ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Bitcoin className="w-4 h-4 mr-2" />
                        Generate Bitcoin Address
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Withdraw Button */}
              {btcBalance > 0 && (
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-queensides"
                  onClick={() => handleOpenWithdraw('main', btcBalance, btcAddress || '')}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Withdraw BTC
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Mahr/Purse Wallet Section */}
          {userGender && (
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 bg-gradient-to-r ${userGender === 'male' ? 'from-pink-500 to-rose-600' : 'from-purple-500 to-indigo-600'} rounded-xl flex items-center justify-center`}>
                      {userGender === 'male' ? <Heart className="w-6 h-6 text-white" /> : <Wallet className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-queensides">
                        {userGender === 'male' ? 'Mahr Wallet' : 'Purse Wallet'}
                      </CardTitle>
                      <CardDescription className="font-queensides">
                        Timelocked commitment wallet
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowTimelockExplainer(true)}
                    className="shrink-0"
                  >
                    <Info className="w-5 h-5 text-indigo-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!mahrData && userGender === 'male') || (!purseData && userGender === 'female') ? (
                  // No wallet created yet
                  <div className="text-center py-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${userGender === 'male' ? 'from-pink-100 to-rose-100' : 'from-purple-100 to-indigo-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Lock className={`w-8 h-8 ${userGender === 'male' ? 'text-pink-600' : 'text-purple-600'}`} />
                    </div>
                    <h4 className="font-medium text-slate-800 font-queensides mb-2">
                      No {userGender === 'male' ? 'Mahr' : 'Purse'} Wallet Yet
                    </h4>
                    <p className="text-sm text-slate-600 font-queensides mb-4">
                      {userGender === 'male' 
                        ? 'Create a Mahr wallet to show your marriage commitment'
                        : 'Create a Purse wallet to demonstrate financial independence'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowTimelockExplainer(true)}
                        variant="outline"
                        className="flex-1 font-queensides"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                      <Button
                        onClick={() => setShowMahrPurseModal(true)}
                        className={`flex-1 bg-gradient-to-r ${userGender === 'male' ? 'from-pink-500 to-rose-600' : 'from-purple-500 to-indigo-600'} text-white font-queensides`}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Create Wallet
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Wallet exists
                  <>
                    {/* Balance & Status */}
                    <div className={`bg-gradient-to-r ${userGender === 'male' ? 'from-pink-500 to-rose-600' : 'from-purple-500 to-indigo-600'} rounded-xl p-4 text-white`}>
                      <div className="text-center">
                        <p className="text-sm opacity-90 font-queensides mb-1">Balance</p>
                        <p className="text-3xl font-bold font-mono">
                          {formatBtc(userGender === 'male' ? mahrData?.balanceSatoshis || 0 : purseData?.balanceSatoshis || 0)} BTC
                        </p>
                        <p className="text-sm opacity-75 mt-1">
                          {(userGender === 'male' ? mahrData?.balanceSatoshis || 0 : purseData?.balanceSatoshis || 0).toLocaleString()} satoshis
                        </p>
                      </div>
                    </div>

                    {/* Address & Unlock Info */}
                    <div className="bg-white/80 rounded-xl p-4 border border-indigo-100 space-y-3">
                      <div>
                        <p className="text-xs text-slate-500 font-queensides mb-1">Wallet Address</p>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                          <code className="flex-1 text-xs font-mono text-slate-700 break-all">
                            {userGender === 'male' ? mahrData?.address : purseData?.address}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const addr = userGender === 'male' ? mahrData?.address : purseData?.address
                              if (addr) navigator.clipboard.writeText(addr)
                            }}
                            className="shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                        <div>
                          <p className="text-xs text-slate-500 font-queensides">Unlock Date</p>
                          <p className="text-sm font-medium text-slate-800 font-queensides">
                            {new Date(userGender === 'male' ? mahrData?.unlockDate : purseData?.unlockDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-queensides">Status</p>
                          <Badge className={
                            getTimeUntilUnlock(userGender === 'male' ? mahrData?.unlockDate : purseData?.unlockDate) === "Unlocked"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }>
                            {getTimeUntilUnlock(userGender === 'male' ? mahrData?.unlockDate : purseData?.unlockDate) === "Unlocked" ? (
                              <><Unlock className="w-3 h-3 mr-1" /> Unlocked</>
                            ) : (
                              <><Lock className="w-3 h-3 mr-1" /> {getTimeUntilUnlock(userGender === 'male' ? mahrData?.unlockDate : purseData?.unlockDate)}</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowMahrPurseModal(true)}
                      variant="outline"
                      className="w-full font-queensides"
                    >
                      View Full Details
                    </Button>

                    {/* Withdraw and Relock Buttons */}
                    {getTimeUntilUnlock(userGender === 'male' ? mahrData?.unlockDate : purseData?.unlockDate) === "Unlocked" && (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleOpenWithdraw(
                            userGender === 'male' ? 'mahr' : 'purse',
                            userGender === 'male' ? mahrData?.balanceSatoshis || 0 : purseData?.balanceSatoshis || 0,
                            userGender === 'male' ? mahrData?.address : purseData?.address
                          )}
                          className={`w-full bg-gradient-to-r ${userGender === 'male' ? 'from-pink-500 to-rose-600' : 'from-purple-500 to-indigo-600'} text-white font-queensides`}
                        >
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          Withdraw Funds
                        </Button>
                        <Button
                          onClick={() => handleOpenRelock(userGender === 'male' ? 'mahr' : 'purse')}
                          variant="outline"
                          className="w-full font-queensides"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Relock Wallet
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <div className="p-4 pt-0">
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
                
                {/* Promo Code Section */}
                <Card className="border-2 border-dashed border-slate-300 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-slate-800 font-queensides">Have a Promo Code?</h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg font-mono text-sm uppercase"
                        onKeyDown={(e) => e.key === 'Enter' && handleRedeemPromo()}
                      />
                      <Button
                        onClick={handleRedeemPromo}
                        disabled={isRedeemingPromo || !promoCode.trim()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        {isRedeemingPromo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Tag className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
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
                    {product.id === 'views_100' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-queensides">
                        POPULAR
                      </div>
                    )}
                    {product.id === 'views_250' && (
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
                
                {/* Promo Code Section */}
                <Card className="border-2 border-dashed border-slate-300 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-slate-800 font-queensides">Have a Promo Code?</h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg font-mono text-sm uppercase"
                        onKeyDown={(e) => e.key === 'Enter' && handleRedeemPromo()}
                      />
                      <Button
                        onClick={handleRedeemPromo}
                        disabled={isRedeemingPromo || !promoCode.trim()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        {isRedeemingPromo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Tag className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                    {product.id === 'leads_100' && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg font-queensides">
                        POPULAR
                      </div>
                    )}
                    {product.id === 'leads_250' && (
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
                
                {/* Promo Code Section */}
                <Card className="border-2 border-dashed border-slate-300 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-amber-600" />
                      <h3 className="font-bold text-slate-800 font-queensides">Have a Promo Code?</h3>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg font-mono text-sm uppercase"
                        onKeyDown={(e) => e.key === 'Enter' && handleRedeemPromo()}
                      />
                      <Button
                        onClick={handleRedeemPromo}
                        disabled={isRedeemingPromo || !promoCode.trim()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        {isRedeemingPromo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Tag className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
        </div>
      </div>

      <Toaster />

      {/* Timelock Explainer Modal */}
      <AnimatePresence>
        {showTimelockExplainer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTimelockExplainer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 font-queensides mb-2">
                    Timelocked Bitcoin Wallets
                  </h2>
                  <p className="text-slate-600 font-queensides">
                    A revolutionary approach to commitment signals
                  </p>
                </div>

                {/* What is it */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <h3 className="font-bold text-slate-800 font-queensides mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5 text-indigo-600" />
                      What is a Timelocked Wallet?
                    </h3>
                    <p className="text-sm text-slate-700 font-queensides leading-relaxed">
                      A Bitcoin timelocked wallet uses smart contracts to lock funds until a specific future date. 
                      Once created, <strong>nobody</strong> can access the funds before the unlock date - not even you. 
                      This creates a verifiable, tamper-proof commitment signal.
                    </p>
                  </div>

                  {/* How it works */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-800 font-queensides mb-3">How It Works</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-indigo-600">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 font-queensides text-sm">Choose Unlock Date</p>
                          <p className="text-xs text-slate-600 font-queensides">Select when you want the funds to become accessible</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-indigo-600">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 font-queensides text-sm">Send Bitcoin</p>
                          <p className="text-xs text-slate-600 font-queensides">Fund your wallet by sending BTC to the timelocked address</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-indigo-600">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 font-queensides text-sm">Automatic Unlock</p>
                          <p className="text-xs text-slate-600 font-queensides">On the unlock date, Bitcoin's protocol automatically releases the funds</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Why it matters */}
                  <div className={`${userGender === 'male' ? 'bg-pink-50 border-pink-100' : 'bg-purple-50 border-purple-100'} rounded-xl p-4 border`}>
                    <h3 className="font-bold text-slate-800 font-queensides mb-2 flex items-center gap-2">
                      {userGender === 'male' ? (
                        <><Heart className="w-5 h-5 text-pink-600" /> Why Mahr?</>
                      ) : (
                        <><Wallet className="w-5 h-5 text-purple-600" /> Why Purse?</>
                      )}
                    </h3>
                    {userGender === 'male' ? (
                      <ul className="space-y-2 text-sm text-slate-700 font-queensides">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
                          <span>Show serious marriage intentions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
                          <span>Demonstrate financial readiness</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
                          <span>Visible commitment badge on your profile</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
                          <span>Stand out to potential matches</span>
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-2 text-sm text-slate-700 font-queensides">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>Show financial independence</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>Demonstrate planning & foresight</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>Attract serious, committed suitors</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                          <span>Build trust through transparency</span>
                        </li>
                      </ul>
                    )}
                  </div>

                  {/* Security */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <h3 className="font-bold text-slate-800 font-queensides mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      Security & Trust
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700 font-queensides">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Secured by Bitcoin's blockchain technology</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>No third-party custody required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Mathematically enforced timelocks</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <span>Verifiable by anyone on the blockchain</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowTimelockExplainer(false)
                      setShowMahrPurseModal(true)
                    }}
                    className={`w-full bg-gradient-to-r ${userGender === 'male' ? 'from-pink-500 to-rose-600' : 'from-purple-500 to-indigo-600'} text-white font-queensides text-lg py-6`}
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Create Your {userGender === 'male' ? 'Mahr' : 'Purse'} Wallet
                  </Button>
                  <Button
                    onClick={() => setShowTimelockExplainer(false)}
                    variant="outline"
                    className="w-full font-queensides"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mahr/Purse Wallet Modal */}
      <AnimatePresence>
        {showMahrPurseModal && userGender && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMahrPurseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] overflow-y-auto"
            >
              <MahrPurseWallet
                userId={userId || ''}
                userGender={userGender}
                userType={userGender === 'male' ? 'mahr' : 'purse'}
              />
              <Button
                onClick={() => setShowMahrPurseModal(false)}
                variant="outline"
                className="w-full mt-4 bg-white font-queensides"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bitcoin Payment Modal */}
      <AnimatePresence>
        {showBitcoinPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBitcoinPayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <BitcoinPayment
                userId={userId || ''}
                paymentType={bitcoinPaymentType}
                amountUSD={bitcoinPaymentAmount}
                description={bitcoinPaymentDescription}
                onSuccess={() => setShowBitcoinPayment(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <WithdrawModal
                userId={userId || ''}
                walletType={withdrawWalletType}
                balanceSatoshis={withdrawBalance}
                address={withdrawAddress}
                onSuccess={handleWithdrawSuccess}
                onClose={() => setShowWithdrawModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Relock Modal */}
      <AnimatePresence>
        {showRelockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRelockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${relockWalletType === 'mahr' ? 'from-pink-500 to-rose-600' : 'from-purple-500 to-indigo-600'} p-6 text-white`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-queensides">Relock {relockWalletType === 'mahr' ? 'Mahr' : 'Purse'} Wallet</h2>
                    <p className="text-sm opacity-90 font-queensides">Set a new unlock date and time</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 font-queensides mb-2 block">
                      New Unlock Date & Time
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500 font-queensides">Date</label>
                        <input
                          type="date"
                          value={relockUnlockDate}
                          min={new Date().toISOString().split('T')[0]}
                          max={(() => {
                            const maxDate = new Date()
                            maxDate.setFullYear(maxDate.getFullYear() + 10)
                            return maxDate.toISOString().split('T')[0]
                          })()}
                          onChange={handleRelockDateChange}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-queensides text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-500 font-queensides">Time</label>
                        <input
                          type="time"
                          value={relockUnlockTime}
                          onChange={handleRelockTimeChange}
                          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-queensides text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    {relockError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                        <AlertCircle className="w-3 h-3" />
                        {relockError}
                      </p>
                    )}
                    {relockUnlockDate && !relockError && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                        <CheckCircle className="w-3 h-3" />
                        New unlock: {new Date(relockUnlockDate + 'T' + relockUnlockTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800 space-y-2">
                      <p className="font-medium">Important - New Wallet Address Will Be Created</p>
                      <p>Relocking will:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Create a <strong>new timelocked Bitcoin address</strong> with your selected unlock date</li>
                        <li>Transfer all funds from your current address to the new address</li>
                        <li>Deduct a small network fee (~2000 satoshis) for the blockchain transaction</li>
                      </ul>
                      <p className="font-medium mt-2">This action cannot be undone.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleRelock}
                    disabled={!relockUnlockDate || isRelocking}
                    className={`w-full bg-gradient-to-r ${relockWalletType === 'mahr' ? 'from-pink-500 to-rose-600' : 'from-purple-500 to-indigo-600'} text-white font-queensides py-6 text-lg disabled:opacity-50`}
                  >
                    {isRelocking ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Relocking...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Relock Wallet
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setShowRelockModal(false)}
                    variant="outline"
                    className="w-full font-queensides"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <br/><br/><br/><br/><br/>
    </div>
  )
}
