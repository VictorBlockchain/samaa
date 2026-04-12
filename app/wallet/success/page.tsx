"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { 
  CheckCircle, 
  Crown, 
  Eye, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  Wallet,
  Clock,
  Loader2,
  XCircle
} from "lucide-react"

interface UserProfile {
  available_views: number
  available_leads: number
}

interface PaymentVerification {
  verified: boolean
  type?: string
  amount?: number
  status?: string
}

export default function WalletSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [purchaseType, setPurchaseType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(true)
  const [verification, setVerification] = useState<PaymentVerification | null>(null)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    if (!userId) {
      // Not authenticated, redirect to login
      router.push('/auth/login')
      return
    }

    const sessionId = searchParams.get('session_id')
    const type = searchParams.get('type') || 'subscription'
    
    setPurchaseType(type)

    // Verify payment with backend
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      // No session ID - might be direct access
      setIsVerifying(false)
      setVerification({ verified: false })
      setIsLoading(false)
    }
  }, [userId, searchParams, authLoading])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      const data = await response.json()

      if (response.ok && data.verified) {
        setVerification({
          verified: true,
          type: data.type,
          amount: data.amount,
          status: data.status,
        })
        
        // Refresh profile to get updated balance
        if (userId) {
          await fetchProfile()
        }
      } else {
        setVerification({ verified: false })
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setVerification({ verified: false })
    } finally {
      setIsVerifying(false)
      setIsLoading(false)
    }
  }

  const fetchProfile = async () => {
    if (!userId) return
    
    const { data, error } = await supabase
      .from('users')
      .select('available_views, available_leads')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      setProfile(data)
    }
  }

  const getPurchaseInfo = () => {
    switch (purchaseType) {
      case 'subscription':
        return {
          icon: Crown,
          title: 'Subscription Activated!',
          subtitle: 'Welcome to Premium',
          description: 'Your premium subscription is now active. Enjoy unlimited messaging, advanced filters, and priority support.',
          color: 'from-indigo-500 to-purple-600',
          bgColor: 'from-indigo-50 to-purple-50',
          borderColor: 'border-indigo-200',
        }
      case 'views':
        return {
          icon: Eye,
          title: 'Views Purchased!',
          subtitle: 'Boost your visibility',
          description: 'Your views have been added to your wallet. Start exploring more profiles and see who\'s interested in you.',
          color: 'from-emerald-500 to-teal-600',
          bgColor: 'from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-200',
        }
      case 'leads':
        return {
          icon: MessageCircle,
          title: 'Leads Purchased!',
          subtitle: 'Start meaningful conversations',
          description: 'Your leads have been added to your wallet. Take the lead and start connecting with your matches.',
          color: 'from-indigo-500 to-purple-600',
          bgColor: 'from-indigo-50 to-purple-50',
          borderColor: 'border-indigo-200',
        }
      default:
        return {
          icon: CheckCircle,
          title: 'Purchase Successful!',
          subtitle: 'Thank you for your purchase',
          description: 'Your purchase has been processed successfully.',
          color: 'from-emerald-500 to-teal-600',
          bgColor: 'from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-200',
        }
    }
  }

  const purchaseInfo = getPurchaseInfo()
  const Icon = purchaseInfo.icon

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 font-queensides mb-2">
              Loading...
            </h2>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  // Show verification loading
  if (isVerifying) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 font-queensides mb-2">
              Verifying Payment...
            </h2>
            <p className="text-slate-600 font-queensides">
              Please wait while we confirm your purchase
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show error if verification failed
  if (!verification?.verified) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <XCircle className="w-12 h-12 text-white" />
                </motion.div>
                <CardTitle className="text-3xl font-bold text-slate-800 font-queensides mb-2">
                  Payment Not Verified
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 font-queensides">
                  We couldn't verify your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-slate-700 font-queensides">
                  If you made a purchase, please contact support with your payment confirmation email.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 pt-6">
                <Button
                  onClick={() => router.push('/wallet')}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-queensides py-6 text-lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  <span>Go to Wallet</span>
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full font-queensides"
                >
                  Go Home
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Success Card */}
          <Card className={`border-2 ${purchaseInfo.borderColor} bg-gradient-to-br ${purchaseInfo.bgColor} shadow-2xl`}>
            <CardHeader className="text-center pb-6">
              {/* Animated Check Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2 
                }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold text-slate-800 font-queensides mb-2">
                  {purchaseInfo.title}
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 font-queensides">
                  {purchaseInfo.subtitle}
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-slate-700 font-queensides leading-relaxed"
              >
                {purchaseInfo.description}
              </motion.p>

              {/* Current Balance */}
              {!isLoading && profile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-queensides">Views</p>
                        <p className="text-2xl font-bold text-slate-800 font-queensides">
                          {profile.available_views || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-queensides">Leads</p>
                        <p className="text-2xl font-bold text-slate-800 font-queensides">
                          {profile.available_leads || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* What's Next */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200"
              >
                <h3 className="font-queensides font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  What's Next?
                </h3>
                <ul className="space-y-2">
                  {purchaseType === 'subscription' && (
                    <>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Explore profiles with advanced filters</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Send unlimited messages to your matches</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>See who viewed your profile</span>
                      </li>
                    </>
                  )}
                  {purchaseType === 'views' && (
                    <>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Browse more profiles in explore</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Increase your visibility to others</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Get more matches and connections</span>
                      </li>
                    </>
                  )}
                  {purchaseType === 'leads' && (
                    <>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Start conversations with your matches</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Take the lead and make meaningful connections</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700 font-queensides">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Build relationships that matter</span>
                      </li>
                    </>
                  )}
                </ul>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-6">
              {/* Primary Action */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="w-full"
              >
                <Button
                  onClick={() => router.push('/explore')}
                  className={`w-full bg-gradient-to-r ${purchaseInfo.color} hover:opacity-90 text-white font-queensides py-6 text-lg`}
                >
                  <span>Start Exploring</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Secondary Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-2 gap-3 w-full"
              >
                <Button
                  onClick={() => router.push('/wallet')}
                  variant="outline"
                  className="font-queensides"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  <span>View Wallet</span>
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="font-queensides"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Go Home</span>
                </Button>
              </motion.div>
            </CardFooter>
          </Card>

          {/* Community Fund Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800 font-queensides">
                  Your purchase supports our community
                </p>
                <p className="text-xs text-emerald-600 font-queensides">
                  A portion goes to masjids and Nikah celebrations
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
