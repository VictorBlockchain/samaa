"use client"

import { motion, useScroll } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import { WalletButton } from "@/components/wallet/wallet-button"
import { useAuth } from "@/app/context/AuthContext"
import { User, Search, MessageCircle, Eye, MessageSquare, Camera, Image as ImageIcon, Video, Sparkles, Users, Store, MoonStar, BadgeCheck, Shield, Clapperboard, ShoppingCart, X, Smartphone, Bitcoin, Heart, Wallet, Building, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { MessageTabs } from "./message-tabs"
import { SwipeCard } from "./swipe-card"
import type { MatchProfile } from "@/lib/matching"
import { loadProfile, isProfileComplete } from "@/utils/profile-storage"
import { supabase } from "@/lib/supabase"

export function MobileHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })
  const router = useRouter()

  const [activeTab, setActiveTab] = useState(0)
  const [activeSecondTab, setActiveSecondTab] = useState(0)
  const [hasSecondTabBeenClicked, setHasSecondTabBeenClicked] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileComplete, setProfileComplete] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [availableViews, setAvailableViews] = useState(0)
  const [availableLeads, setAvailableLeads] = useState(0)
  const [isLoadingCredits, setIsLoadingCredits] = useState(false)
  const [mediaType, setMediaType] = useState<'photos' | 'videos'>('photos')
  const [matchProfiles, setMatchProfiles] = useState<MatchProfile[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const { isAuthenticated, userId } = useAuth()

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const walletSlides = [
    {
      id: 'mahr',
      title: 'Mahr Bitcoin Wallet',
      description: 'Time locked bitcoin wallet, show her how much you\'ve set aside for her dowry and her future',
      image: '/images/mahr_wallet.png',
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
    },
    {
      id: 'purse',
      title: 'Purse Bitcoin Wallet',
      description: 'Time locked bitcoin wallet, show him you are financially savvy and have some funds set aside for your future',
      image: '/images/purse_wallet.png',
      icon: Wallet,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'community',
      title: 'Community Bitcoin Wallet',
      description: '% of all purchases go into community wallet, funds will be donated to Mahr, Purse and Masjids',
      image: '/images/community_wallet.png',
      icon: Building,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
    setIsAutoPlaying(false)
  }

  // Load matches when authenticated
  useEffect(() => {
    if (!isAuthenticated || !userId) return
    const fetchMatches = async () => {
      setIsLoadingMatches(true)
      try {
        const res = await fetch('/api/matches?limit=20&offset=0')
        if (res.ok) {
          const data = await res.json()
          setMatchProfiles(data)
        }
      } catch (err) {
        console.error('Error fetching matches:', err)
      } finally {
        setIsLoadingMatches(false)
      }
    }
    fetchMatches()
  }, [isAuthenticated, userId])

  // Detect if user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load user profile when authenticated
  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated && userId) {
        setIsLoadingProfile(true)
        try {
          const profile = await loadProfile(userId)
          setUserProfile(profile)
          setProfileComplete(isProfileComplete(profile))
          
          // Check if user has profile photo
          if (!profile?.profilePhoto && (!profile?.photos || profile.photos.length === 0)) {
            // No profile photos - redirect to profile setup
            console.log('[MobileHero] No profile photos found, redirecting to setup')
            router.push('/profile/setup')
            return
          }
          
          // Load available views and leads
          await loadUserCredits()
        } catch (error) {
          console.error('Error loading profile:', error)
        } finally {
          setIsLoadingProfile(false)
        }
      } else {
        setUserProfile(null)
        setProfileComplete(false)
      }
    }

    checkProfile()
  }, [isAuthenticated, userId])

  // Load user's available views and leads
  const loadUserCredits = async () => {
    if (!userId) return
    
    setIsLoadingCredits(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('available_views, available_leads, referral_code')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('[MobileHero] Error loading credits:', error)
        return
      }
      
      if (data) {
        setAvailableViews(data.available_views || 0)
        setAvailableLeads(data.available_leads || 0)
        setReferralCode(data.referral_code || '')
        console.log('[MobileHero] Loaded credits:', { views: data.available_views, leads: data.available_leads })
      }
    } catch (error) {
      console.error('[MobileHero] Error loading credits:', error)
    } finally {
      setIsLoadingCredits(false)
    }
  }

  const features = [
    {
      id: 0,
      icon: Sparkles,
      title: "25 Leads & Views",
      price: "$24.99",
      priceSubtext: "monthly",
      description:
        "If you like her, take the lead. Do more than like, send her a message. We want connections, marriage & families.",
      color: "indigo",
    },
    {
      id: 1,
      icon: Users,
      title: "Profiles",
      description: "Enhanced profiles with more details and options. Personality showcase profiles with profile rating system.",
      color: "purple",
    },
    {
      id: 2,
      icon: Store,
      title: "Shops + Markets",
      description: "Create a shop or market for your business. Sell your products and connect with customers.",
      color: "blue",
    },
    {
      id: 3,
      icon: MoonStar,
      title: "Islamic Values",
      description:
        "A platform built on Islamic principles, helping you find a spouse the halal way.",
      color: "indigo",
    },
  ]

  const secondFeatures = [
    {
      id: 0,
      icon: BadgeCheck,
      title: "Verified Profiles",
      description:
        "Know who you're talking to with verified profiles and community references.",
      color: "indigo",
    },
    {
      id: 1,
      icon: Shield,
      title: "Privacy First",
      description:
        "Your privacy is protected. Control who sees your profile and information.",
      color: "purple",
    },
    {
      id: 2,
      icon: Clapperboard,
      title: "Video Introductions",
      description:
        "Share video and voice introductions to let others know the real you.",
      color: "blue",
    },
    {
      id: 3,
      icon: ShoppingCart,
      title: "Wedding Shop",
      description:
        "Plan your wedding with our marketplace for Muslim fashion and gifts.",
      color: "green",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      indigo: {
        border: "border-indigo-300/20 hover:border-indigo-400/40",
        bg: "from-indigo-50/5 to-purple-50/5",
        iconBg: "from-indigo-400/80 to-purple-500/80",
        iconBorder: "border-indigo-300/30",
        text: "text-indigo-600",
        divider: "via-indigo-300/30",
        dots: "bg-indigo-400/60",
        dotBorder: "border-indigo-400/40",
        dotCenter: "bg-indigo-500/70",
      },
      purple: {
        border: "border-purple-300/20 hover:border-purple-400/40",
        bg: "from-purple-50/5 to-indigo-50/5",
        iconBg: "from-purple-400/80 to-indigo-500/80",
        iconBorder: "border-purple-300/30",
        text: "text-purple-600",
        divider: "via-purple-300/30",
        dots: "bg-purple-400/60",
        dotBorder: "border-purple-400/40",
        dotCenter: "bg-purple-500/70",
      },
      blue: {
        border: "border-blue-300/20 hover:border-blue-400/40",
        bg: "from-blue-50/5 to-indigo-50/5",
        iconBg: "from-blue-400/80 to-indigo-500/80",
        iconBorder: "border-blue-300/30",
        text: "text-blue-600",
        divider: "via-blue-300/30",
        dots: "bg-blue-400/60",
        dotBorder: "border-blue-400/40",
        dotCenter: "bg-blue-500/70",
      },
      green: {
        border: "border-green-300/20 hover:border-green-400/40",
        bg: "from-green-50/5 to-emerald-50/5",
        iconBg: "from-green-400/80 to-emerald-500/80",
        iconBorder: "border-green-300/30",
        text: "text-green-600",
        divider: "via-green-300/30",
        dots: "bg-green-400/60",
        dotBorder: "border-green-400/40",
        dotCenter: "bg-green-500/70",
      },
    }
    return colors[color as keyof typeof colors] || colors.indigo
  }

  // Add pull-to-refresh handler:
  const handleRefresh = async () => {
    // Refresh profile data
    if (isAuthenticated && userId) {
      setIsLoadingProfile(true)
      try {
        const profile = await loadProfile(userId)
        setUserProfile(profile)
        setProfileComplete(isProfileComplete(profile))
        
        // Reload credits
        await loadUserCredits()
      } catch (error) {
        console.error('Error refreshing profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen relative pt-12">
      <div className="relative z-10 min-h-screen">
        {isAuthenticated ? (
          // Logged in version - Profile Setup or Messages
          <>

            {/* Content with padding */}
            <div className="p-4 pb-32">
              <div className="max-w-lg mx-auto">

                {isLoadingProfile ? (
                  /* Loading Profile */
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-600 font-queensides">Loading your profile...</p>
                    </div>
                  </div>
                ) : profileComplete ? (
                  <>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    {/* Swipe Card Interface */}
                    <SwipeCard 
                      profiles={matchProfiles}
                      availableLeads={availableLeads}
                      availableViews={availableViews}
                      onBuyLeads={() => router.push('/wallet')}
                      onBuyViews={() => router.push('/wallet')}
                    />

                    {/* Media Type Toggle */}
                    {matchProfiles.length > 0 && <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setMediaType('photos')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-queensides font-medium transition-all ${
                          mediaType === 'photos'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                            : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-white'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Photos
                      </button>
                      <button
                        onClick={() => setMediaType('videos')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-queensides font-medium transition-all ${
                          mediaType === 'videos'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                            : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-white'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        Videos
                      </button>
                    </div>}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="space-y-4 mt-10"
                  >
                    {/* Value Proposition Cards */}
                    <div className="grid gap-4">
                      {/* Take the Lead Card */}
                      <div 
                        className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 border border-indigo-200/60 hover:border-indigo-300 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 group"
                        onClick={() => router.push('/inbox')}
                      >
                        <h3 className="text-xl font-bold text-slate-800 font-queensides mb-2">Take the Lead</h3>
                        <p className="text-base text-slate-600 font-queensides leading-relaxed">
                          Samaa encourages real connections. Send the first message and stand out from the crowd.
                        </p>
                      </div>
                  
                      {/* Refer Friends Card */}
                      <div 
                        className="relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-6 border border-emerald-200/60 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300 group"
                        onClick={() => router.push('/referrals')}
                      >
                        <h3 className="text-xl font-bold text-slate-800 font-queensides mb-2">Refer Friends, Earn Rewards</h3>
                        <p className="text-base text-slate-600 font-queensides leading-relaxed mb-3">
                          Invite your friends and earn bonus views when they join. Get cash when they subscribe!
                        </p>
                        {referralCode && (
                          <div className="flex items-center gap-2 bg-white/60 rounded-xl p-3 border border-emerald-200/40">
                            <span className="text-sm text-slate-500 font-queensides">Your code:</span>
                            <span className="font-mono font-bold text-emerald-600">{referralCode}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(`${window.location.origin}/auth/signup?ref=${referralCode}`)
                              }}
                              className="ml-auto text-xs bg-emerald-500 text-white px-3 py-1 rounded-lg font-queensides hover:bg-emerald-600 transition-colors"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                  
                      {/* Community Card */}
                      <div 
                        className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 rounded-3xl p-6 border border-amber-200/60 hover:border-amber-300 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 group"
                        onClick={() => router.push('/community')}
                      >
                        <h3 className="text-xl font-bold text-slate-800 font-queensides mb-2">Community</h3>
                        <p className="text-base text-slate-600 font-queensides leading-relaxed">
                          Samaa is a community for healthy marriages. After you match, shop for your wedding dress, gifts and family items. Sell your goods and services to other community members.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  </>
                ) : (
                  /* Profile Setup Flow */
                  <></>

                )}
              </div>
            </div>    

          </>
        ) : (
          // Original hero content for non-logged in users
          <div className="p-4 pb-32">
            <div className="max-w-lg mx-auto">
            {/* Keep all the existing hero content here */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center mt-12"
            >
              <div className="relative flex items-center justify-center">
                {/* Circular Image with Border */}
                <div className="relative w-64 h-64 rounded-full border-4 border-gradient-to-r from-indigo-400 via-purple-500 to-blue-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full border-2 border-white/50 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                    <img
                      src="/images/futuristic-muslim-couple-hero.jpg"
                      alt="Futuristic Muslim couple in romantic embrace with Islamic cityscape and crescent moon"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Text Below Circle */}
              <div className="mt-6">
                <h1 className="text-4xl font-bold text-slate-800 font-dattermatter text-center leading-tight">
                  Match Made in Heaven
                </h1>
              </div>
            </motion.div>

            {/* Arabic-Inspired Beautiful Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center mt-8 mb-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
              <div className="mx-6 flex items-center space-x-2">
                {/* Arabic geometric pattern */}
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                <div className="w-4 h-4 border-2 border-indigo-400 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                </div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
            </motion.div>

            {/* Tagline Section - Transparent Card with Arabic Borders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
              className="relative group mb-8"
            >
              <div className="relative rounded-2xl p-6 border border-indigo-200/30 hover:border-indigo-300/50 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white/5">
                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-indigo-300/40 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-indigo-300/40 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-indigo-300/40 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-indigo-300/40 rounded-br-lg"></div>

                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/10 to-purple-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 text-center">
                  <p className="text-lg text-slate-600 font-queensides leading-relaxed">
                    Samaa is the marriage for
                    <br />
                    <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-xl">
                      Muslim futurists
                    </span>
                  </p>
                </div>

                {/* Center decorative element */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-indigo-400/30 rounded-full opacity-50"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              {/* Header */}
              <h3 className="text-lg font-bold text-center mb-4 font-queensides bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Crypto infused for those serious about getting married!
              </h3>

              {/* Slider Container */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-amber-200/50 overflow-hidden shadow-xl">
                {/* Slides */}
                <div className="relative h-[320px]">
                  {walletSlides.map((slide, index) => (
                    <motion.div
                      key={slide.id}
                      initial={false}
                      animate={{
                        opacity: index === currentSlide ? 1 : 0,
                        x: index === currentSlide ? 0 : index < currentSlide ? -100 : 100,
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <div className={`h-full bg-gradient-to-br ${slide.bgColor} p-4`}>
                        {/* Image */}
                        <div className="relative mb-3 rounded-2xl overflow-hidden shadow-lg">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-[180px] object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          
                          {/* Icon Badge */}
                          <div className={`absolute top-3 left-3 w-10 h-10 bg-gradient-to-r ${slide.color} rounded-xl flex items-center justify-center shadow-lg`}>
                            <slide.icon className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="text-center">
                          <h4 className={`text-lg font-bold mb-2 font-queensides bg-gradient-to-r ${slide.color} bg-clip-text text-transparent`}>
                            {slide.title}
                          </h4>
                          <p className="text-xs text-slate-700 font-queensides leading-relaxed px-2">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {walletSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index)
                        setIsAutoPlaying(false)
                      }}
                      className={`transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-6 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full'
                          : 'w-2 h-2 bg-slate-300 rounded-full hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Feature Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-indigo-200/20">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      setActiveTab(index)
                    }}
                    className={`relative p-3 rounded-xl transition-all duration-300 ${
                      activeTab === index
                        ? "bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-300/40 shadow-lg"
                        : "hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <div className="mb-1 flex justify-center">
                      {React.createElement(feature.icon, { className: "w-6 h-6 text-indigo-600" })}
                    </div>
                    <div className="text-xs font-queensides text-slate-600 leading-tight">
                      {feature.title.split(" ").slice(0, 2).join(" ")}
                    </div>
                    {activeTab === index && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-indigo-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Active Feature Card */}

            <motion.div
              key={`feature-${activeTab}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative group mb-8"
            >
              <div
                className={`relative rounded-2xl p-8 border-2 ${getColorClasses(features[activeTab].color).border} transition-all duration-300 overflow-hidden backdrop-blur-sm bg-white/5`}
              >
                {/* Arabic corner decorations */}
                <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-indigo-300/30 rounded-full opacity-20"></div>
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>
                <div className="relative z-10 text-center">
                  {/* Price Display (only for first feature) */}
                  {features[activeTab].price && (
                    <div className="mb-4">
                      <div
                        className={`text-4xl font-bold ${getColorClasses(features[activeTab].color).text} font-queensides`}
                      >
                        {features[activeTab].price}
                      </div>
                      <div className={`text-sm ${getColorClasses(features[activeTab].color).text} font-queensides`}>
                        {features[activeTab].priceSubtext}
                      </div>
                    </div>
                  )}

                  {/* Animated Dots (only for conversation feature) */}
                  {features[activeTab].id === 1 && (
                    <div className="flex justify-center space-x-1.5 mb-3">
                      <div className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse"></div>
                      <div
                        className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  )}

                  {/* Wallet Icons (only for financial feature) */}
                  {features[activeTab].id === 2 && (
                    <div className="flex justify-center space-x-2 mb-3">
                      <div className="w-6 h-4 bg-blue-100/50 rounded border border-blue-300/40 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-0.5 h-0.5 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="w-6 h-4 bg-indigo-100/50 rounded border border-indigo-300/40 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-0.5 h-0.5 bg-indigo-500 rounded-full"></div>
                      </div>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-slate-800 mb-4 font-queensides">
                    {features[activeTab].title}
                  </h3>
                  <p className="text-slate-600 font-queensides leading-relaxed text-base">
                    {features[activeTab].description}
                  </p>

                  {/* Trust Indicators (only for future feature) */}
                  {features[activeTab].id === 3 && (
                    <div className="flex justify-center space-x-4 text-sm mt-6">
                      <div className="flex items-center space-x-2 text-indigo-600">
                        <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                        <span className="font-queensides">Blockchain Secured</span>
                      </div>
                      <div className="flex items-center space-x-2 text-purple-600">
                        <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
                        <span className="font-queensides">Islamic Values</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arabic-Inspired Card Divider */}
                <div className="flex items-center justify-center mt-5">
                  <div
                    className={`flex-1 h-px bg-gradient-to-r from-transparent ${getColorClasses(features[activeTab].color).divider} to-transparent`}
                  ></div>
                  <div className="mx-4 flex items-center space-x-1">
                    <div className={`w-1 h-1 ${getColorClasses(features[activeTab].color).dots} rounded-full`}></div>
                    <div
                      className={`w-2 h-2 border ${getColorClasses(features[activeTab].color).dotBorder} rounded-full flex items-center justify-center`}
                    >
                      <div
                        className={`w-0.5 h-0.5 ${getColorClasses(features[activeTab].color).dotCenter} rounded-full`}
                      ></div>
                    </div>
                    <div className={`w-1 h-1 ${getColorClasses(features[activeTab].color).dots} rounded-full`}></div>
                  </div>
                  <div
                    className={`flex-1 h-px bg-gradient-to-r from-transparent ${getColorClasses(features[activeTab].color).divider} to-transparent`}
                  ></div>
                </div>
              </div>
            </motion.div>

            {/* Elegant Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="flex items-center justify-center my-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent"></div>
              <div className="mx-8 flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                <div className="w-6 h-6 border-2 border-indigo-400/50 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"></div>
                </div>
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-400/60 to-purple-400/60"></div>
                <div className="w-6 h-6 border-2 border-purple-400/50 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"></div>
                </div>
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent"></div>
            </motion.div>

            {/* Powered by Crypto Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              className="relative group mb-8"
            >
              <div className="relative rounded-2xl p-6 border-2 border-gradient-to-r from-indigo-300/30 via-purple-300/30 to-blue-300/30 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                {/* Crypto-themed corner decorations */}
                <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-indigo-400/70 rounded-tl-lg"></div>
                <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-purple-400/70 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-purple-400/70 rounded-bl-lg"></div>
                <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-indigo-400/70 rounded-br-lg"></div>

                {/* Blockchain pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-3 h-3 border border-indigo-400/40 transform rotate-45"></div>
                  <div className="absolute top-6 right-6 w-2 h-2 bg-purple-400/30 rounded-full"></div>
                  <div className="absolute bottom-4 left-6 w-2 h-2 bg-indigo-400/30 rounded-full"></div>
                  <div className="absolute bottom-6 right-4 w-3 h-3 border border-purple-400/40 transform rotate-45"></div>
                </div>

                <div className="relative z-10 text-center">
                  {/* Crypto Icons */}

                  <h3 className="text-xl font-bold text-slate-800 mb-3 font-queensides">Get $10</h3>
               <h5 className="text-md font-medium text-slate-600 mb-5 font-queensides">Refer marriage candidates, get $10 with their 1st subscription.</h5>
                  {/* Trust badges */}
                </div>

                {/* Final decorative divider */}
                <div className="flex items-center justify-center mt-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
                  <div className="mx-4 flex items-center space-x-1">
                    <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400/50 rounded-full transform rotate-45"></div>
                    <div className="w-2 h-2 border border-indigo-400/40 rounded-full flex items-center justify-center">
                      <div className="w-0.5 h-0.5 bg-gradient-to-r from-indigo-500/70 to-purple-500/70 rounded-full"></div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-indigo-400/50 rounded-full transform rotate-45"></div>
                    <div className="w-1 h-1 bg-purple-400/60 rounded-full"></div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
              className="mt-8 space-y-4"
            >
              {/* Sign Up / Login Button */}
              <div className="relative w-full">
                <button
                  onClick={() => {
                    if (!isMobile) {
                      setShowMobileModal(true)
                    } else {
                      router.push(isAuthenticated ? "/profile" : "/auth/login")
                    }
                  }}
                  className="relative w-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm overflow-hidden group"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {isAuthenticated ? (
                      <>
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-queensides font-bold">My Profile</div>
                          <div className="text-xs font-queensides opacity-90">View & edit your profile</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-queensides font-bold">Sign Up / Login</div>
                          <div className="text-xs font-queensides opacity-90">Start your journey to marriage</div>
                        </div>
                      </>
                    )}
                  </div>
                </button>

                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-xl pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-xl pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-xl pointer-events-none"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute top-4 left-4 w-3 h-3 border border-white/40 transform rotate-45"></div>
                  <div className="absolute top-6 right-6 w-2 h-2 bg-white/30 rounded-full"></div>
                  <div className="absolute bottom-4 left-6 w-2 h-2 bg-white/30 rounded-full"></div>
                  <div className="absolute bottom-6 right-4 w-3 h-3 border border-white/40 transform rotate-45"></div>
                </div>

                {/* Golden ratio inspired divider */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 pointer-events-none">
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 border border-white/30 rounded-full flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-white/50 rounded-full"></div>
                  </div>
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                </div>
              </div>

              {/* Support Center Button */}
              <button
                onClick={() => router.push("/support")}
                className="relative w-full bg-gradient-to-br from-blue-50 to-slate-50 hover:from-blue-100 hover:to-slate-100 text-slate-800 font-bold py-5 px-7 rounded-2xl border-2 border-blue-200/50 hover:border-blue-300/70 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm overflow-hidden group"
              >
                {/* Arabic-inspired corner decorations */}
                <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-blue-300/50 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-slate-300/50 rounded-tr-lg"></div>
                <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-slate-300/50 rounded-bl-lg"></div>
                <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-blue-300/50 rounded-br-lg"></div>

                {/* Geometric pattern overlay */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="absolute top-3 left-3 w-2 h-2 border border-blue-300/40 transform rotate-45"></div>
                  <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-slate-300/30 rounded-full"></div>
                  <div className="absolute bottom-3 left-5 w-1.5 h-1.5 bg-blue-300/30 rounded-full"></div>
                  <div className="absolute bottom-5 right-3 w-2 h-2 border border-slate-300/40 transform rotate-45"></div>
                </div>

                <div className="relative z-10 flex items-center justify-center space-x-3">
                  <div className="text-2xl">💬</div>
                  <span className="text-lg font-queensides tracking-wide">Support Center</span>
                </div>

                {/* Subtle decorative divider */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-1">
                  <div className="w-0.5 h-0.5 bg-blue-400/40 rounded-full"></div>
                  <div className="w-1 h-1 border border-slate-300/30 rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-slate-400/40 rounded-full"></div>
                </div>
              </button>
            </motion.div>

            {/* Islamic-Inspired Closing Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 2.2, duration: 1, ease: "easeOut" }}
              className="flex items-center justify-center mt-12 mb-8"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
              <div className="mx-8 flex items-center space-x-4">
                {/* Star and crescent motif */}
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transform rotate-45"></div>
                <div className="relative w-8 h-8 border-2 border-indigo-400/60 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400/70 rounded-full"></div>
                </div>
                {/* Central geometric pattern */}
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-400/70 to-purple-400/70"></div>
                  <div className="w-4 h-1 bg-gradient-to-r from-purple-400/60 to-indigo-400/60"></div>
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-400/70 to-indigo-400/70"></div>
                </div>
                {/* Mirror star and crescent */}
                <div className="relative w-8 h-8 border-2 border-purple-400/60 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"></div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-400/70 rounded-full"></div>
                </div>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transform rotate-45"></div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
            </motion.div>

            {/* Final blessing text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.8, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <p className="text-base text-slate-500 font-queensides italic">
                "And among His signs is that He created for you mates from among yourselves"
              </p>
              <p className="text-sm text-slate-400 font-queensides mt-1">- Quran 30:21</p>
            </motion.div>
            </div>
          </div>
        )}


      </div>

      {/* Mobile-Only Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl shadow-2xl overflow-hidden border border-indigo-200/50"
          >
            {/* Close button */}
            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all group z-10"
            >
              <X className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-xl">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-800 font-queensides text-center mb-3">
                Best Experience on Mobile
              </h3>

              {/* Description */}
              <p className="text-slate-600 font-queensides text-center leading-relaxed mb-6">
                Samaa works best on mobile. No app to download—just visit{' '}
                <span className="font-semibold text-indigo-600">Samaa.app</span>{' '}
                on your mobile browser for the full experience.
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 border border-indigo-100">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-700 font-queensides">Swipe through profiles easily</p>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 border border-indigo-100">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-700 font-queensides">Smooth video playback</p>
                </div>
                <div className="flex items-center gap-3 bg-white/60 rounded-xl p-3 border border-indigo-100">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-700 font-queensides">Optimized touch interactions</p>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white rounded-2xl p-4 border border-indigo-100 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-queensides mb-2">Scan on mobile</p>
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border-2 border-dashed border-indigo-200">
                      <Smartphone className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 font-queensides">Samaa.app</p>
                    <p className="text-xs text-slate-500 font-queensides mt-1">Open on your phone</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowMobileModal(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-queensides"
              >
                Got it, thanks!
              </button>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-300/40 rounded-tl-xl"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-300/40 rounded-tr-xl"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-300/40 rounded-bl-xl"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-300/40 rounded-br-xl"></div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
