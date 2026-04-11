"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { ArabicEmptyStateCard, ArabicEmptyStateCardTitle, ArabicEmptyStateCardDescription } from "@/components/ui/arabic-empty-state-card"
import {
  ArrowLeft,
  Heart,
  Users,
  Building,
  MapPin,
  Mail,
  Phone,
  User,
  DollarSign,
  Loader2,
  CheckCircle,
  ThumbsUp,
  TrendingUp,
  PiggyBank,
  Gift,
  Plus,
  X,
} from "lucide-react"

interface CommunityFund {
  total_balance: number
  total_donated: number
  total_subscriptions_contrib: number
  total_likes_contrib: number
  total_compliments_contrib: number
}

interface Masjid {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  country: string
  imam_name: string
  email: string
  phone: string
  website: string
  requested_amount: number
  donation_purpose: string
  photos: string[]
  status: string
  vote_count: number
  amount_donated: number
  donation_date: string
  created_at: string
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [communityFund, setCommunityFund] = useState<CommunityFund | null>(null)
  const [masjids, setMasjids] = useState<Masjid[]>([])
  const [votedMasjids, setVotedMasjids] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  
  // Form state for masjid application
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    imam_name: '',
    email: '',
    phone: '',
    website: '',
    requested_amount: '',
    donation_purpose: '',
  })

  const router = useRouter()
  const { userId, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchCommunityFund()
    fetchMasjids()
    if (userId) {
      fetchUserVotes()
    }
  }, [userId])

  const fetchCommunityFund = async () => {
    const { data, error } = await supabase
      .from('community_fund')
      .select('*')
      .limit(1)
      .single()

    if (!error && data) {
      setCommunityFund(data)
    }
  }

  const fetchMasjids = async () => {
    const { data, error } = await supabase
      .from('masjids')
      .select('*')
      .in('status', ['approved', 'donated'])
      .order('vote_count', { ascending: false })

    if (!error && data) {
      setMasjids(data)
    }
  }

  const fetchUserVotes = async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('masjid_votes')
      .select('masjid_id')
      .eq('user_id', userId)

    if (!error && data) {
      setVotedMasjids(data.map(v => v.masjid_id))
    }
  }

  const handleVote = async (masjidId: string) => {
    if (!userId || !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setIsLoading(true)
    const hasVoted = votedMasjids.includes(masjidId)

    try {
      const { error } = await supabase.rpc(
        hasVoted ? 'remove_vote_for_masjid' : 'vote_for_masjid',
        {
          p_user_id: userId,
          p_masjid_id: masjidId,
        }
      )

      if (!error) {
        setVotedMasjids(prev => 
          hasVoted 
            ? prev.filter(id => id !== masjidId)
            : [...prev, masjidId]
        )
        
        // Update local vote count
        setMasjids(prev => prev.map(m => {
          if (m.id === masjidId) {
            return {
              ...m,
              vote_count: hasVoted ? m.vote_count - 1 : m.vote_count + 1
            }
          }
          return m
        }))
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplySubmit = async () => {
    if (!userId || !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('masjids')
        .insert({
          ...formData,
          requested_amount: parseFloat(formData.requested_amount),
          submitted_by: userId,
          status: 'pending',
        })

      if (!error) {
        setShowApplyModal(false)
        setFormData({
          name: '',
          description: '',
          address: '',
          city: '',
          state: '',
          country: 'United States',
          imam_name: '',
          email: '',
          phone: '',
          website: '',
          requested_amount: '',
          donation_purpose: '',
        })
        // Show success message or refetch
        fetchMasjids()
      }
    } catch (error) {
      console.error('Error submitting application:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="min-h-screen relative">
      <CelestialBackground />
      <div className="relative z-10 bg-gradient-to-br from-emerald-50/80 via-white/80 to-teal-50/80 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-emerald-50 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-emerald-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-queensides">Community Fund</h1>
              <p className="text-sm text-slate-600 font-queensides">
                Supporting masjids and Mahr
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Community Fund Balance Card */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90 font-queensides">Community Balance</p>
                  <p className="text-3xl font-bold font-queensides">
                    {formatCurrency(communityFund?.total_balance || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-sm opacity-90 font-queensides">Total Donated</p>
                <p className="text-xl font-bold font-queensides">
                  {formatCurrency(communityFund?.total_donated || 0)}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-sm opacity-90 font-queensides">Members Helped</p>
                <p className="text-xl font-bold font-queensides">
                  {masjids.filter(m => m.status === 'donated').length}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs opacity-75 font-queensides">From Subs</p>
                <p className="text-sm font-bold font-queensides">
                  {formatCurrency(communityFund?.total_subscriptions_contrib || 0)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs opacity-75 font-queensides">From Leads</p>
                <p className="text-sm font-bold font-queensides">
                  {formatCurrency(communityFund?.total_likes_contrib || 0)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <p className="text-xs opacity-75 font-queensides">From Views</p>
                <p className="text-sm font-bold font-queensides">
                  {formatCurrency(communityFund?.total_compliments_contrib || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="overview" className="font-queensides">
                <Building className="w-4 h-4 mr-2" />
                Masjids
              </TabsTrigger>
              <TabsTrigger value="apply" className="font-queensides">
                <Plus className="w-4 h-4 mr-2" />
                Apply
              </TabsTrigger>
            </TabsList>

            {/* Masjids List */}
            <TabsContent value="overview">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 font-queensides">
                    Vote for Donations
                  </h2>
                  <p className="text-sm text-slate-500 font-queensides">
                    {masjids.length} masjids
                  </p>
                </div>

                {masjids.length === 0 ? (
                  <ArabicEmptyStateCard icon={<Building className="w-12 h-12" />}>
                    <ArabicEmptyStateCardTitle>No masjids yet</ArabicEmptyStateCardTitle>
                    <ArabicEmptyStateCardDescription>Be the first to apply!</ArabicEmptyStateCardDescription>
                  </ArabicEmptyStateCard>
                ) : (
                  <div className="space-y-4">
                    {masjids.map((masjid, index) => (
                      <motion.div
                        key={masjid.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`overflow-hidden ${
                          masjid.status === 'donated' 
                            ? 'border-green-200 bg-green-50/50' 
                            : votedMasjids.includes(masjid.id)
                              ? 'border-emerald-200 bg-emerald-50/50'
                              : ''
                        }`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="font-queensides text-lg">{masjid.name}</CardTitle>
                                <CardDescription className="font-queensides flex items-center mt-1">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {masjid.city}, {masjid.state}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                {masjid.status === 'donated' ? (
                                  <Badge className="bg-green-100 text-green-700">
                                    <Gift className="w-3 h-3 mr-1" />
                                    Donated
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-emerald-600">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {masjid.vote_count} votes
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-slate-600 font-queensides mb-3">
                              {masjid.description}
                            </p>
                            
                            <div className="bg-slate-50 rounded-lg p-3 mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-slate-500 font-queensides">Requested</span>
                                <span className="font-bold text-slate-800 font-queensides">
                                  {formatCurrency(masjid.requested_amount)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-queensides">
                                Purpose: {masjid.donation_purpose}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div className="flex items-center space-x-2 text-slate-600">
                                <User className="w-4 h-4" />
                                <span className="font-queensides">Imam: {masjid.imam_name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-slate-600">
                                <Mail className="w-4 h-4" />
                                <span className="font-queensides truncate">{masjid.email}</span>
                              </div>
                            </div>

                            {masjid.status !== 'donated' && (
                              <Button
                                onClick={() => handleVote(masjid.id)}
                                disabled={isLoading}
                                className={`w-full font-queensides ${
                                  votedMasjids.includes(masjid.id)
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                                }`}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : votedMasjids.includes(masjid.id) ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Voted
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="w-4 h-4 mr-2" />
                                    Vote for this Masjid
                                  </>
                                )}
                              </Button>
                            )}

                            {masjid.status === 'donated' && (
                              <div className="text-center text-green-600 font-queensides text-sm">
                                <Gift className="w-4 h-4 inline mr-1" />
                                {formatCurrency(masjid.amount_donated)} donated on {' '}
                                {new Date(masjid.donation_date).toLocaleDateString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Apply Tab */}
            <TabsContent value="apply">
              <Card>
                <CardHeader>
                  <CardTitle className="font-queensides">Apply for Donation</CardTitle>
                  <CardDescription className="font-queensides">
                    Submit your masjid for community funding consideration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label className="font-queensides">Masjid Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Islamic Center of..."
                        className="font-queensides"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="font-queensides">Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell us about your masjid..."
                        className="font-queensides"
                        rows={3}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="font-queensides">Address *</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main Street"
                        className="font-queensides"
                      />
                    </div>

                    <div>
                      <Label className="font-queensides">City *</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        className="font-queensides"
                      />
                    </div>

                    <div>
                      <Label className="font-queensides">State *</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        className="font-queensides"
                      />
                    </div>

                    <div>
                      <Label className="font-queensides">Country</Label>
                      <Input
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="font-queensides"
                      />
                    </div>

                    <div>
                      <Label className="font-queensides">Requested Amount *</Label>
                      <Input
                        type="number"
                        value={formData.requested_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, requested_amount: e.target.value }))}
                        placeholder="5000"
                        className="font-queensides"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="font-queensides">Donation Purpose *</Label>
                      <Textarea
                        value={formData.donation_purpose}
                        onChange={(e) => setFormData(prev => ({ ...prev, donation_purpose: e.target.value }))}
                        placeholder="How will the donation be used?"
                        className="font-queensides"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2 border-t pt-4 mt-2">
                      <p className="text-sm text-slate-500 font-queensides mb-3">Contact Information</p>
                    </div>

                    <div>
                      <Label className="font-queensides">Imam Name *</Label>
                      <Input
                        value={formData.imam_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, imam_name: e.target.value }))}
                        placeholder="Imam Name"
                        className="font-queensides"
                      />
                    </div>

                    <div>
                      <Label className="font-queensides">Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="masjid@example.com"
                        className="font-queensides"
                      />
                    </div>

                    <div>
                      <Label className="font-queensides">Phone *</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                        className="font-queensides"
                      />
                    </div>

                    <div>
                      <Label className="font-queensides">Website</Label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://..."
                        className="font-queensides"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleApplySubmit}
                    disabled={isLoading || !formData.name || !formData.address || !formData.email}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-queensides"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Building className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
