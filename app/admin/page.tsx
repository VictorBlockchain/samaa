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
  X
} from "lucide-react"

interface User {
  id: string
  first_name?: string
  last_name?: string
  email?: string
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [socialVideos, setSocialVideos] = useState<SocialVideo[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  const router = useRouter()
  const { userId, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // TODO: Add admin check
    // For now, allow access - add admin role check later
    
    if (userId) {
      fetchData()
    }
  }, [userId, isAuthenticated])

  const fetchData = async () => {
    await Promise.all([
      fetchUsers(),
      fetchPayments(),
      fetchSocialVideos(),
      fetchShops(),
    ])
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, available_views, available_leads, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setUsers(data)
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
    const { data, error } = await supabase
      .from('user_social_videos')
      .select(`
        *,
        user:users(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setSocialVideos(data)
    }
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
      .from('user_social_videos')
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
      .from('user_social_videos')
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
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="users" className="font-queensides text-xs sm:text-sm">
                <Users className="w-4 h-4 mr-1 sm:mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="payments" className="font-queensides text-xs sm:text-sm">
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                Payments
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
                          <CardTitle className="font-queensides">
                            {user.first_name} {user.last_name}
                          </CardTitle>
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
    </div>
  )
}
