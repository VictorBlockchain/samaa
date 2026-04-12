"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { 
  ArrowLeft, 
  Users, 
  Eye, 
  MessageCircle, 
  Video, 
  Store,
  Search,
  Edit,
  Trash2,
  Flag,
  ExternalLink,
  Loader2,
  Check,
  X,
  Tag,
  Plus,
  Copy,
  Gift,
  Shield,
  UserCog
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface User {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  available_views: number
  available_leads: number
  created_at: string
}

interface PaymentRecord {
  id: string
  user_id: string
  amount: number
  currency: string
  status: string
  type: string
  metadata: any
  created_at: string
  user?: {
    first_name?: string
    last_name?: string
  }
}

interface SocialVideo {
  id: string
  user_id: string
  video_url: string
  thumbnail_url?: string
  description?: string
  is_flagged: boolean
  created_at: string
  user?: {
    first_name?: string
    last_name?: string
  }
}

interface Shop {
  id: string
  owner_id: string
  name: string
  description?: string
  status: string
  verified: boolean
  created_at: string
}

interface PromoCode {
  id: string
  code: string
  promo_type: string
  subscription_months?: number
  amount?: number
  max_uses: number
  used_count: number
  is_active: boolean
  notes?: string
  created_at: string
  expires_at?: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [socialVideos, setSocialVideos] = useState<SocialVideo[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // Promo code form state
  const [promoType, setPromoType] = useState("subscription_monthly_free")
  const [promoQuantity, setPromoQuantity] = useState(100)
  const [promoViewsAmount, setPromoViewsAmount] = useState(25)
  const [promoLeadsAmount, setPromoLeadsAmount] = useState(25)
  const [promoNotes, setPromoNotes] = useState("")
  
  // Role editing modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState("user")
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  
  const router = useRouter()
  const { userId, isAuthenticated } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      // Don't redirect yet, wait for auth to load
      return
    }

    const checkAdminRole = async () => {
      if (!userId) return
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single()
        
        if (error || !data) {
          console.error('[admin] Error checking role:', error)
          router.push('/')
          return
        }
        
        if (data.role !== 'admin') {
          console.log('[admin] User is not admin, showing access denied')
          setIsAdmin(false)
          setIsCheckingAdmin(false)
          return
        }
        
        console.log('[admin] User is admin, granting access')
        setIsAdmin(true)
        fetchData()
      } catch (error) {
        console.error('[admin] Error checking admin role:', error)
        router.push('/')
      } finally {
        setIsCheckingAdmin(false)
      }
    }
    
    checkAdminRole()
  }, [userId, isAuthenticated])

  const fetchData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchPayments(),
      fetchSocialVideos(),
      fetchShops(),
      fetchPromoCodes(),
    ])
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, role, available_views, available_leads, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[admin] Error fetching users:', error)
    } else {
      console.log('[admin] Fetched users:', data?.length || 0)
      // Ensure views/leads default to 0 if null
      const usersWithDefaults = (data || []).map(user => ({
        ...user,
        available_views: user.available_views || 0,
        available_leads: user.available_leads || 0,
      }))
      setUsers(usersWithDefaults)
    }
  }

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('user_payments')
      .select(`
        *,
        user:users(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setPayments(data)
    }
  }

  const fetchSocialVideos = async () => {
    // Fetch videos without join first
    const { data: videos, error: videosError } = await supabase
      .from('social_videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (videosError) {
      console.error('[admin] Error fetching social videos:', videosError)
      return
    }

    if (!videos || videos.length === 0) {
      setSocialVideos([])
      return
    }

    // Fetch user details separately
    const userIds = videos.map(v => v.user_id).filter(Boolean)
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .in('id', userIds)

    // Combine the data
    const usersMap = new Map()
    users?.forEach(u => usersMap.set(u.id, u))

    const videosWithUsers = videos.map(video => ({
      ...video,
      user: usersMap.get(video.user_id) || null,
    }))

    setSocialVideos(videosWithUsers)
  }

  const fetchShops = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setShops(data)
    }
  }

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch('/api/admin/promo')
      const result = await response.json()

      if (result.success) {
        setPromoCodes(result.data)
      } else {
        console.error('[admin] Error fetching promos:', result.error)
      }
    } catch (error) {
      console.error('[admin] Error fetching promos:', error)
    }
  }

  const handleCreatePromoCode = async () => {
    setIsLoading(true)
    
    try {
      // Generate promo code
      const prefix = promoType.includes('subscription') ? 'SUB' : promoType === 'views' ? 'VIEW' : 'LEAD'
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = prefix + '-'
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      const promoData = {
        code,
        promo_type: promoType,
        max_uses: promoQuantity,
        notes: promoNotes || null,
        userId,
      }

      // Add amount for views/leads
      if (promoType === 'views') {
        promoData.amount = promoViewsAmount
      } else if (promoType === 'leads') {
        promoData.amount = promoLeadsAmount
      }

      const response = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoData),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Promo code created: ${code}`)
        setPromoNotes('')
        fetchPromoCodes()
      } else {
        alert('Error creating promo code: ' + result.error)
      }
    } catch (error) {
      alert('Error creating promo code')
    }
    
    setIsLoading(false)
  }

  const handleTogglePromoActive = async (promoId: string, currentStatus: boolean) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/promo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: promoId,
          is_active: !currentStatus,
        }),
      })

      const result = await response.json()

      if (result.success) {
        fetchPromoCodes()
      } else {
        alert('Error updating promo code: ' + result.error)
      }
    } catch (error) {
      alert('Error updating promo code')
    }
    
    setIsLoading(false)
  }

  const handleDeletePromoCode = async (promoId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/admin/promo?id=${promoId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('Promo code deleted')
        fetchPromoCodes()
      } else {
        alert('Error deleting promo code: ' + result.error)
      }
    } catch (error) {
      alert('Error deleting promo code')
    }
    
    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user)
    setSelectedRole(user.role || 'user')
    setIsRoleModalOpen(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    setIsUpdatingRole(true)
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: selectedRole })
        .eq('id', selectedUser.id)

      if (error) {
        alert('Error updating user role: ' + error.message)
      } else {
        alert(`User role updated to ${selectedRole}`)
        setIsRoleModalOpen(false)
        fetchUsers()
      }
    } catch (error) {
      alert('Error updating user role')
    }
    
    setIsUpdatingRole(false)
  }

  const handleEditViews = async (userId: string, currentViews: number) => {
    const newViews = prompt(`Enter new views count (current: ${currentViews}):`)
    if (newViews === null) return

    const viewsCount = parseInt(newViews)
    if (isNaN(viewsCount) || viewsCount < 0) {
      alert('Invalid number')
      return
    }

    setIsLoading(true)
    const { error } = await supabase
      .from('users')
      .update({ available_views: viewsCount })
      .eq('id', userId)

    if (error) {
      alert('Error updating views')
    } else {
      alert('Views updated successfully')
      fetchUsers()
    }
    setIsLoading(false)
  }

  const handleEditLeads = async (userId: string, currentLeads: number) => {
    const newLeads = prompt(`Enter new leads count (current: ${currentLeads}):`)
    if (newLeads === null) return

    const leadsCount = parseInt(newLeads)
    if (isNaN(leadsCount) || leadsCount < 0) {
      alert('Invalid number')
      return
    }

    setIsLoading(true)
    const { error } = await supabase
      .from('users')
      .update({ available_leads: leadsCount })
      .eq('id', userId)

    if (error) {
      alert('Error updating leads')
    } else {
      alert('Leads updated successfully')
      fetchUsers()
    }
    setIsLoading(false)
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    setIsLoading(true)
    const { error } = await supabase
      .from('social_videos')
      .delete()
      .eq('id', videoId)

    if (error) {
      alert('Error deleting video')
    } else {
      alert('Video deleted successfully')
      fetchSocialVideos()
    }
    setIsLoading(false)
  }

  const handleFlagVideo = async (videoId: string, currentFlagStatus: boolean) => {
    setIsLoading(true)
    const { error } = await supabase
      .from('social_videos')
      .update({ is_flagged: !currentFlagStatus })
      .eq('id', videoId)

    if (error) {
      alert('Error updating video')
    } else {
      alert(currentFlagStatus ? 'Video unflagged' : 'Video flagged')
      fetchSocialVideos()
    }
    setIsLoading(false)
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

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 font-queensides">Checking admin access...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground />
        <div className="relative z-10 bg-gradient-to-br from-indigo-50/80 via-white/80 to-purple-50/80 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-100/50 p-8 text-center max-w-md w-full"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 font-queensides mb-3">
              Admin Access Required
            </h2>
            <p className="text-slate-600 font-queensides mb-6 leading-relaxed">
              This area is restricted to administrators only. If you believe you should have access, please contact support.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-500 font-queensides">
                Current user does not have admin privileges
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-queensides"
              >
                Go to Home
              </Button>
              <Button
                onClick={() => router.push("/support")}
                variant="outline"
                className="w-full font-queensides"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPayments = payments.filter(payment => 
    payment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return null
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
              <h1 className="text-xl font-bold text-slate-800 font-queensides">Admin Panel</h1>
              <p className="text-sm text-slate-600 font-queensides">
                Manage users, payments, and content
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Tabs */}
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="users" className="font-queensides text-xs sm:text-sm">
                <Users className="w-4 h-4 mr-1 sm:mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="payments" className="font-queensides text-xs sm:text-sm">
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="promos" className="font-queensides text-xs sm:text-sm">
                <Tag className="w-4 h-4 mr-1 sm:mr-2" />
                Promos
              </TabsTrigger>
              <TabsTrigger value="social" className="font-queensides text-xs sm:text-sm">
                <Video className="w-4 h-4 mr-1 sm:mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger value="shops" className="font-queensides text-xs sm:text-sm">
                <Store className="w-4 h-4 mr-1 sm:mr-2" />
                Shops
              </TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-queensides"
                />
              </div>
            </div>

            {/* Users Tab */}
            <TabsContent value="users">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="font-queensides">
                              {user.first_name} {user.last_name}
                            </CardTitle>
                            <Badge className={
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : user.role === 'moderator'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-slate-100 text-slate-700'
                            }>
                              <Shield className="w-3 h-3 mr-1" />
                              {user.role || 'user'}
                            </Badge>
                          </div>
                          <CardDescription className="font-queensides">
                            ID: {user.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/profile?id=${user.id}`)}
                          className="font-queensides"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-medium text-slate-700 font-queensides">Views</span>
                            </div>
                            <span className="text-lg font-bold text-emerald-600 font-queensides">
                              {user.available_views}
                            </span>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-slate-700 font-queensides">Leads</span>
                            </div>
                            <span className="text-lg font-bold text-purple-600 font-queensides">
                              {user.available_leads}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-queensides">
                        Joined: {formatDate(user.created_at)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        onClick={() => handleOpenRoleModal(user)}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1 font-queensides border-indigo-200 hover:bg-indigo-50"
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        Edit Role
                      </Button>
                      <Button
                        onClick={() => handleEditViews(user.id, user.available_views)}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1 font-queensides"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Views
                      </Button>
                      <Button
                        onClick={() => handleEditLeads(user.id, user.available_leads)}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1 font-queensides"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Leads
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payment.type === 'subscription' 
                              ? 'bg-indigo-100' 
                              : payment.type === 'views' 
                                ? 'bg-emerald-100' 
                                : 'bg-purple-100'
                          }`}>
                            {payment.type === 'subscription' ? (
                              <Eye className="w-5 h-5 text-indigo-600" />
                            ) : payment.type === 'views' ? (
                              <Eye className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <MessageCircle className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 font-queensides capitalize">
                              {payment.type}
                              {payment.metadata?.views && ` - ${payment.metadata.views} views`}
                              {payment.metadata?.leads && ` - ${payment.metadata.leads} leads`}
                            </p>
                            <p className="text-sm text-slate-500 font-queensides">
                              {(payment as any).user?.first_name} {(payment as any).user?.last_name} • {formatDate(payment.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 font-queensides">
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <Badge className={
                            payment.status === 'succeeded' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            {/* Promos Tab */}
            <TabsContent value="promos">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Create Promo Form */}
                <Card className="border-2 border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-slate-700" />
                      Create Promo Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 font-queensides">
                        Promo Type
                      </label>
                      <select
                        value={promoType}
                        onChange={(e) => setPromoType(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl font-queensides"
                      >
                        <option value="subscription_monthly_free">1 Month Free Subscription</option>
                        <option value="subscription_yearly_free">1 Year Free Subscription</option>
                        <option value="views">Free Views</option>
                        <option value="leads">Free Leads</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 font-queensides">
                        Max Uses (Quantity)
                      </label>
                      <input
                        type="number"
                        value={promoQuantity}
                        onChange={(e) => setPromoQuantity(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl font-queensides"
                        min="1"
                        max="10000"
                      />
                    </div>

                    {promoType === 'views' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 font-queensides">
                          Number of Views
                        </label>
                        <input
                          type="number"
                          value={promoViewsAmount}
                          onChange={(e) => setPromoViewsAmount(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl font-queensides"
                          min="1"
                        />
                      </div>
                    )}

                    {promoType === 'leads' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 font-queensides">
                          Number of Leads
                        </label>
                        <input
                          type="number"
                          value={promoLeadsAmount}
                          onChange={(e) => setPromoLeadsAmount(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl font-queensides"
                          min="1"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 font-queensides">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={promoNotes}
                        onChange={(e) => setPromoNotes(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl font-queensides"
                        rows={2}
                        placeholder="Campaign name, notes, etc."
                      />
                    </div>

                    <Button
                      onClick={handleCreatePromoCode}
                      disabled={isLoading}
                      className="w-full font-queensides"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Generate Promo Code
                    </Button>
                  </CardContent>
                </Card>

                {/* Promo Codes List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-800 font-queensides">
                    Promo Codes ({promoCodes.length})
                  </h3>
                  {promoCodes.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Tag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-queensides">No promo codes created yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    promoCodes.map((promo) => (
                      <Card key={promo.id} className="border-2 border-slate-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => copyToClipboard(promo.code)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-mono text-sm font-bold flex items-center gap-2"
                                >
                                  {promo.code}
                                  <Copy className="w-3 h-3" />
                                </button>
                                <Badge className={
                                  promo.promo_type.includes('subscription')
                                    ? 'bg-purple-100 text-purple-700'
                                    : promo.promo_type === 'views'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                                }>
                                  {promo.promo_type.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <Badge className={
                                promo.is_active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }>
                                {promo.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="text-slate-600 font-queensides">
                                <span className="font-medium">Used:</span> {promo.used_count} / {promo.max_uses}
                                {promo.amount && ` • ${promo.amount} ${promo.promo_type}`}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTogglePromoActive(promo.id, promo.is_active)}
                                  disabled={isLoading}
                                >
                                  {promo.is_active ? 'Disable' : 'Enable'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeletePromoCode(promo.id)}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  promo.used_count >= promo.max_uses
                                    ? 'bg-red-500'
                                    : promo.used_count > promo.max_uses * 0.8
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((promo.used_count / promo.max_uses) * 100, 100)}%` }}
                              />
                            </div>

                            {promo.notes && (
                              <p className="text-xs text-slate-500 font-queensides">
                                {promo.notes}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </motion.div>
            </TabsContent>

            {/* Social Videos Tab */}
            <TabsContent value="social">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {socialVideos.map((video) => (
                  <Card key={video.id} className={`hover:shadow-lg transition-shadow ${
                    video.is_flagged ? 'border-red-200 bg-red-50/50' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-medium text-slate-800 font-queensides">
                              {(video as any).user?.first_name} {(video as any).user?.last_name}
                            </p>
                            {video.is_flagged && (
                              <Badge className="bg-red-100 text-red-700">
                                <Flag className="w-3 h-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                          {video.description && (
                            <p className="text-sm text-slate-600 font-queensides mb-2">
                              {video.description}
                            </p>
                          )}
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline font-queensides flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Watch Video
                          </a>
                          <p className="text-xs text-slate-500 mt-1 font-queensides">
                            {formatDate(video.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleFlagVideo(video.id, video.is_flagged)}
                            disabled={isLoading}
                            variant={video.is_flagged ? "default" : "outline"}
                            size="sm"
                            className={video.is_flagged ? "bg-red-500 hover:bg-red-600" : ""}
                          >
                            <Flag className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteVideo(video.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>

            {/* Shops Tab */}
            <TabsContent value="shops">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {shops.map((shop) => (
                  <Card key={shop.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-queensides">{shop.name}</CardTitle>
                          <CardDescription className="font-queensides">
                            Owner: {shop.owner_id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={
                            shop.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }>
                            {shop.status}
                          </Badge>
                          {shop.verified && (
                            <Badge className="bg-indigo-100 text-indigo-700">
                              <Check className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {shop.description && (
                        <p className="text-sm text-slate-600 font-queensides mb-2">
                          {shop.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 font-queensides">
                        Created: {formatDate(shop.created_at)}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => router.push(`/shop?id=${shop.id}`)}
                        variant="outline"
                        className="w-full font-queensides"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Shop
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Role Editing Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-queensides">
              <UserCog className="w-5 h-5 text-indigo-600" />
              Edit User Role
            </DialogTitle>
            <DialogDescription className="font-queensides">
              Change the role for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Role Display */}
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 font-queensides mb-2">Current Role</p>
              <Badge className={
                selectedUser?.role === 'admin'
                  ? 'bg-red-100 text-red-700 text-sm'
                  : selectedUser?.role === 'moderator'
                  ? 'bg-yellow-100 text-yellow-700 text-sm'
                  : 'bg-slate-100 text-slate-700 text-sm'
              }>
                <Shield className="w-3 h-3 mr-1" />
                {selectedUser?.role || 'user'}
              </Badge>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 font-queensides">
                Select New Role
              </label>
              
              {/* User Role */}
              <button
                onClick={() => setSelectedRole('user')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === 'user'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 font-queensides">User</p>
                    <p className="text-sm text-slate-600 font-queensides">Regular user access</p>
                  </div>
                  {selectedRole === 'user' && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </button>

              {/* Moderator Role */}
              <button
                onClick={() => setSelectedRole('moderator')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === 'moderator'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 font-queensides">Moderator</p>
                    <p className="text-sm text-slate-600 font-queensides">Can manage content and users</p>
                  </div>
                  {selectedRole === 'moderator' && (
                    <Check className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </button>

              {/* Admin Role */}
              <button
                onClick={() => setSelectedRole('admin')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === 'admin'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 font-queensides">Admin</p>
                    <p className="text-sm text-slate-600 font-queensides">Full system access</p>
                  </div>
                  {selectedRole === 'admin' && (
                    <Check className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            </div>

            {/* Warning for admin role */}
            {selectedRole === 'admin' && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-queensides">
                  ⚠️ Admin users have full access to the admin panel and can modify all data.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRoleModalOpen(false)}
              className="font-queensides"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isUpdatingRole || selectedRole === selectedUser?.role}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-queensides"
            >
              {isUpdatingRole ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Update Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <br/><br/><br/><br/>
    </div>
    
  )
}
