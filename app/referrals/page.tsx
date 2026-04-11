"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Users, 
  Eye, 
  DollarSign, 
  Copy, 
  Share2, 
  Gift, 
  Trophy,
  CheckCircle,
  Clock,
  Wallet
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { ArabicEmptyStateCard, ArabicEmptyStateCardTitle, ArabicEmptyStateCardDescription } from "@/components/ui/arabic-empty-state-card"

interface Referral {
  id: string
  referred_id: string | null
  referral_code: string
  status: 'pending' | 'signed_up' | 'subscribed'
  views_awarded: number
  cash_awarded: number
  created_at: string
  signed_up_at: string | null
}

interface LeaderboardEntry {
  user_id: string
  name: string
  total_referrals: number
  total_views_earned: number
  total_cash_earned: number
}

export default function ReferralsPage() {
  const router = useRouter()
  const { userId, isAuthenticated } = useAuth()
  
  const [referralCode, setReferralCode] = useState("")
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [paypalEmail, setPaypalEmail] = useState("")
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [availableViews, setAvailableViews] = useState(0)
  const [viewsBonus, setViewsBonus] = useState(10)
  const [cashBonus, setCashBonus] = useState(10)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'referrals' | 'leaderboard' | 'payouts'>('referrals')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (userId) {
      loadReferralData()
    }
  }, [userId, isAuthenticated])

  const loadReferralData = async () => {
    setIsLoading(true)
    try {
      // Get user's referral code
      const { data: userData } = await supabase
        .from('users')
        .select('referral_code, available_views')
        .eq('id', userId)
        .single()
      
      if (userData) {
        setReferralCode(userData.referral_code || '')
        setAvailableViews(userData.available_views || 0)
      }

      // Get referrals
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })
      
      if (referralsData) {
        setReferrals(referralsData)
        const totalCash = referralsData.reduce((sum, r) => sum + Number(r.cash_awarded), 0)
        setTotalEarnings(totalCash)
      }

      // Get payout settings
      const { data: payoutSettings } = await supabase
        .from('user_payout_settings')
        .select('paypal_email')
        .eq('user_id', userId)
        .single()
      
      if (payoutSettings) {
        setPaypalEmail(payoutSettings.paypal_email || '')
      }

      // Get admin settings
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('referral_views_bonus, referral_cash_bonus')
        .single()
      
      if (adminSettings) {
        setViewsBonus(adminSettings.referral_views_bonus || 10)
        setCashBonus(adminSettings.referral_cash_bonus || 10)
      }

      // Get leaderboard (top referrers)
      const { data: leaderboardData } = await supabase
        .rpc('get_referral_leaderboard')
        .limit(10)
      
      if (leaderboardData) {
        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error('Error loading referral data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralCode = async () => {
    const shareUrl = `${window.location.origin}/auth/signup?ref=${referralCode}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = async () => {
    const shareUrl = `${window.location.origin}/auth/signup?ref=${referralCode}`
    const shareText = `Join Samaa - the Muslim marriage community! Use my referral link to get started: ${shareUrl}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Samaa',
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      copyReferralCode()
    }
  }

  const savePaypalEmail = async () => {
    if (!paypalEmail) return
    
    await supabase
      .from('user_payout_settings')
      .upsert({
        user_id: userId,
        paypal_email: paypalEmail,
        updated_at: new Date().toISOString()
      })
  }

  const requestPayout = async () => {
    if (totalEarnings < 10) {
      alert('Minimum payout is $10')
      return
    }
    
    await supabase
      .from('referral_payouts')
      .insert({
        user_id: userId,
        amount: totalEarnings,
        status: 'pending',
        paypal_email: paypalEmail
      })
    
    loadReferralData()
  }

  const stats = {
    totalReferrals: referrals.length,
    signedUp: referrals.filter(r => r.status === 'signed_up').length,
    subscribed: referrals.filter(r => r.status === 'subscribed').length,
    viewsEarned: referrals.reduce((sum, r) => sum + r.views_awarded, 0),
    cashEarned: totalEarnings
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <CelestialBackground />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-indigo-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 font-queensides">Referrals</h1>
            <p className="text-xs text-slate-500 font-queensides">Invite friends, earn rewards</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold font-queensides text-lg">Your Referral Code</h2>
              <p className="text-sm opacity-90 font-queensides">Share with friends</p>
            </div>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4 mb-4">
            <p className="text-3xl font-bold font-mono tracking-wider text-center">{referralCode || 'Loading...'}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={copyReferralCode}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 rounded-xl font-queensides font-medium hover:bg-indigo-50 transition-colors"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={shareReferral}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 text-white rounded-xl font-queensides font-medium hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </motion.div>

        {/* Rewards Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-queensides text-emerald-700">Sign Up Bonus</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 font-queensides">{viewsBonus} Views</p>
            <p className="text-xs text-emerald-600/70 font-queensides mt-1">Per referral signup</p>
          </div>
          
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-queensides text-amber-700">Subscription Bonus</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 font-queensides">${cashBonus}</p>
            <p className="text-xs text-amber-600/70 font-queensides mt-1">When they subscribe</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-2xl font-bold text-indigo-600 font-queensides">{stats.totalReferrals}</p>
            <p className="text-xs text-slate-500 font-queensides">Total Referrals</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-2xl font-bold text-emerald-600 font-queensides">{stats.viewsEarned}</p>
            <p className="text-xs text-slate-500 font-queensides">Views Earned</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <p className="text-2xl font-bold text-amber-600 font-queensides">${stats.cashEarned}</p>
            <p className="text-xs text-slate-500 font-queensides">Cash Earned</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: 'referrals', label: 'My Referrals' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'payouts', label: 'Payouts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-queensides font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'referrals' && (
          <div className="space-y-3">
            {referrals.length === 0 ? (
              <ArabicEmptyStateCard icon={<Users className="w-12 h-12" />}>
                <ArabicEmptyStateCardTitle>No referrals yet</ArabicEmptyStateCardTitle>
                <ArabicEmptyStateCardDescription>Share your code to get started!</ArabicEmptyStateCardDescription>
              </ArabicEmptyStateCard>
            ) : (
              referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      referral.status === 'subscribed' 
                        ? 'bg-emerald-100' 
                        : referral.status === 'signed_up'
                        ? 'bg-blue-100'
                        : 'bg-slate-100'
                    }`}>
                      {referral.status === 'subscribed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : referral.status === 'signed_up' ? (
                        <Users className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 font-queensides text-sm capitalize">
                        {referral.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-slate-500 font-queensides">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {referral.views_awarded > 0 && (
                      <p className="text-sm font-medium text-emerald-600 font-queensides">
                        +{referral.views_awarded} views
                      </p>
                    )}
                    {referral.cash_awarded > 0 && (
                      <p className="text-sm font-medium text-amber-600 font-queensides">
                        +${referral.cash_awarded}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-800 font-queensides">Top Referrers</h3>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-center text-slate-500 font-queensides py-8">No data yet</p>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`bg-white rounded-xl p-4 border flex items-center gap-4 ${
                    index < 3 ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-slate-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-queensides ${
                    index === 0 ? 'bg-amber-400 text-white' :
                    index === 1 ? 'bg-slate-300 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 font-queensides">{entry.name}</p>
                    <p className="text-xs text-slate-500 font-queensides">{entry.total_referrals} referrals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-amber-600 font-queensides">${entry.total_cash_earned}</p>
                    <p className="text-xs text-slate-500 font-queensides">{entry.total_views_earned} views</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 font-queensides">Payout Settings</h3>
              </div>
              
              <label className="block mb-2">
                <span className="text-sm text-slate-600 font-queensides">PayPal Email</span>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  onBlur={savePaypalEmail}
                  placeholder="your@email.com"
                  className="w-full mt-1 px-4 py-3 border border-slate-200 rounded-xl font-queensides focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </label>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-amber-700 font-queensides">Available Balance</p>
                  <p className="text-3xl font-bold text-amber-600 font-queensides">${totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-amber-400" />
              </div>
              
              <button
                onClick={requestPayout}
                disabled={totalEarnings < 10 || !paypalEmail}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-queensides font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                {totalEarnings < 10 ? `Minimum $10 required` : 'Request Payout'}
              </button>
              {!paypalEmail && (
                <p className="text-xs text-amber-600 font-queensides mt-2 text-center">
                  Add your PayPal email to request payouts
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
