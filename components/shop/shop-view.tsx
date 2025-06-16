"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ShoppingBag, Store, Package, Truck, Plus, Edit3, Eye, Trash2, Users, TrendingUp } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CelestialBackground } from "@/components/ui/celestial-background"

interface Product {
  id: string
  name: string
  description: string
  images: string[]
  video?: string
  price: number
  currency: "SOL" | "SAMAA"
  category: string
  seller: string
  rating: number
  reviews: number
  inStock: boolean
  shopId?: string
  sizes?: string[]
  colors?: string[]
}

interface UserShop {
  id: string
  name: string
  description: string
  ownerWallet: string
  logo?: string
  banner?: string
  products: Product[]
  createdAt: string
  isActive: boolean
  // Shipping & Business Info
  shippingPolicy: string
  returnPolicy: string
  contactEmail: string
  contactPhone?: string
  businessAddress?: string
  shippingMethods: string[]
  processingTime: string
}

const SHOP_PRODUCTS: Product[] = []

export function ShopView() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"shop" | "categories" | "myshop" | "orders">("shop")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [userShop, setUserShop] = useState<UserShop | null>(null)
  const [showCreateShop, setShowCreateShop] = useState(false)
  const [showEditShop, setShowEditShop] = useState(false)

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const router = useRouter()
  const { connected, publicKey } = useWallet()

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['shop', 'categories', 'myshop', 'orders'].includes(tab)) {
      setActiveTab(tab as "shop" | "categories" | "myshop" | "orders")
    }
  }, [searchParams])

  const tabs = [
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: Package },
    { id: "myshop", label: "My Shop", icon: Store },
    { id: "orders", label: "Orders", icon: Truck },
  ]

  // Load user's shop on component mount
  useEffect(() => {
    if (connected && publicKey) {
      loadUserShop()
    }
  }, [connected, publicKey])

  const loadUserShop = () => {
    if (!publicKey) return

    const savedShop = localStorage.getItem(`shop_${publicKey.toString()}`)
    if (savedShop) {
      setUserShop(JSON.parse(savedShop))
    }
  }

  const createShop = (shopData: Omit<UserShop, 'id' | 'ownerWallet' | 'products' | 'createdAt'>) => {
    if (!publicKey) return

    const newShop: UserShop = {
      id: `shop_${Date.now()}`,
      ownerWallet: publicKey.toString(),
      products: [],
      createdAt: new Date().toISOString(),
      ...shopData
    }

    localStorage.setItem(`shop_${publicKey.toString()}`, JSON.stringify(newShop))
    setUserShop(newShop)
    setShowCreateShop(false)
  }

  const updateShop = (shopData: Omit<UserShop, 'id' | 'ownerWallet' | 'products' | 'createdAt'>) => {
    if (!publicKey || !userShop) return

    const updatedShop: UserShop = {
      ...userShop,
      ...shopData
    }

    localStorage.setItem(`shop_${publicKey.toString()}`, JSON.stringify(updatedShop))
    setUserShop(updatedShop)
    setShowEditShop(false)
  }



  const updateProduct = (productId: string, productData: Partial<Product>) => {
    if (!userShop || !publicKey) return

    const updatedProducts = userShop.products.map(product =>
      product.id === productId ? { ...product, ...productData } : product
    )

    const updatedShop = {
      ...userShop,
      products: updatedProducts
    }

    localStorage.setItem(`shop_${publicKey.toString()}`, JSON.stringify(updatedShop))
    setUserShop(updatedShop)
    setEditingProduct(null)
  }

  const deleteProduct = (productId: string) => {
    if (!userShop || !publicKey) return

    const updatedProducts = userShop.products.filter(product => product.id !== productId)
    const updatedShop = {
      ...userShop,
      products: updatedProducts
    }

    localStorage.setItem(`shop_${publicKey.toString()}`, JSON.stringify(updatedShop))
    setUserShop(updatedShop)
  }

  // Mock exchange rates (in real app, fetch from API)
  const SOL_TO_USD = 23.45 // 1 SOL = $23.45
  const SAMAA_TO_USD = 0.12 // 1 SAMAA = $0.12

  const convertToUSD = (price: number, currency: "SOL" | "SAMAA") => {
    if (currency === "SOL") {
      return (price * SOL_TO_USD).toFixed(2)
    } else {
      return (price * SAMAA_TO_USD).toFixed(2)
    }
  }

  const getAlternateCurrency = (price: number, currency: "SOL" | "SAMAA") => {
    const usdValue = parseFloat(convertToUSD(price, currency))
    if (currency === "SOL") {
      return `${Math.round(usdValue / SAMAA_TO_USD)} SAMAA`
    } else {
      return `${(usdValue / SOL_TO_USD).toFixed(3)} SOL`
    }
  }

  const handlePurchase = async (productId: string) => {
    // Simulate purchase process
    console.log("Purchasing product:", productId)
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/shop/item/${productId}`)
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Shop</h1>
              <p className="text-sm text-slate-600 font-queensides">Browse & purchase items</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Tabs */}
          <div className="flex px-4 pb-4">
            <div className="grid grid-cols-4 gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-purple-200/20 w-full">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative p-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-purple-400/20 to-indigo-400/20 border border-purple-300/40 shadow-lg"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    <tab.icon className="w-6 h-6 mx-auto" />
                  </div>
                  <div className="text-xs font-queensides font-bold text-slate-700 leading-tight">
                    {tab.label.split(" ").slice(0, 2).join(" ")}
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-purple-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pb-32">
          <AnimatePresence mode="wait">
            {activeTab === "shop" ? (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Search Bar */}
                <Card className="p-4 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search shops, owners, or items..."
                      className="w-full px-4 py-3 pl-12 bg-white rounded-xl border border-indigo-200/50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </Card>

                {/* Elegant Coming Soon Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative group mb-8"
                >
                  <div className="relative rounded-2xl p-8 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                    {/* Arabic-inspired corner decorations */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
                    <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

                    {/* Geometric pattern overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-indigo-300/30 rounded-full opacity-20"></div>
                    <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/20 rounded-full"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>

                    <div className="relative z-10 text-center">
                      {/* Elegant Icon */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200/50"
                      >
                        <Store className="w-10 h-10 text-indigo-600" />
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                        Shopping Coming Soon
                      </h3>

                      {/* Elegant Description */}
                      <p className="text-lg text-slate-600 font-queensides leading-relaxed mb-6 max-w-sm mx-auto">
                        Shopping will be active soon! For now, create your store and start adding products.
                        <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          Soon-to-be brides and grooms
                        </span> will be looking for beautiful wedding outfits.
                      </p>

                      {/* Preparation Steps */}
                      <div className="space-y-4 mb-6">
                        <p className="text-base text-indigo-600 font-queensides font-semibold">
                          Get ready for the launch:
                        </p>

                        <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                <Store className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-queensides text-slate-700 font-semibold">Create your shop profile</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">👗</span>
                              </div>
                              <span className="text-sm font-queensides text-slate-700 font-semibold">Add your wedding products</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Truck className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-queensides text-slate-700 font-semibold">Set up shipping & policies</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trust Indicators */}
                      <div className="flex justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-indigo-600">
                          <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                          <span className="font-queensides">Islamic Values</span>
                        </div>
                        <div className="flex items-center space-x-2 text-purple-600">
                          <div className="w-2 h-2 bg-purple-500/70 rounded-full"></div>
                          <span className="font-queensides">Wedding Focus</span>
                        </div>
                      </div>
                    </div>

                    {/* Arabic-Inspired Card Divider */}
                    <div className="flex items-center justify-center mt-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
                      <div className="mx-4 flex items-center space-x-1">
                        <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
                        <div className="w-2 h-2 border border-indigo-400/40 rounded-full flex items-center justify-center">
                          <div className="w-0.5 h-0.5 bg-indigo-500/70 rounded-full"></div>
                        </div>
                        <div className="w-1 h-1 bg-purple-400/60 rounded-full"></div>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"></div>
                    </div>
                  </div>
                </motion.div>

                {!connected && (
                  <Card className="p-4 mt-6 bg-amber-50 border-amber-200">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-800 font-qurova">Connect Wallet Required</p>
                        <p className="text-sm text-amber-700 font-queensides">
                          Please connect your wallet to make purchases
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ) : activeTab === "categories" ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Bride Fashion", icon: "👰", gradient: "from-pink-100 to-rose-100", iconColor: "text-pink-600" },
                    { name: "Groom Fashion", icon: "🤵", gradient: "from-blue-100 to-indigo-100", iconColor: "text-blue-600" },
                    { name: "Women's Fashion", icon: "👗", gradient: "from-purple-100 to-violet-100", iconColor: "text-purple-600" },
                    { name: "Men's Fashion", icon: "👔", gradient: "from-slate-100 to-gray-100", iconColor: "text-slate-600" },
                    { name: "Wedding Gifts", icon: "🎁", gradient: "from-emerald-100 to-green-100", iconColor: "text-emerald-600" },
                    { name: "Accessories", icon: "💍", gradient: "from-amber-100 to-yellow-100", iconColor: "text-amber-600" }
                  ].map((category) => (
                    <Card
                      key={category.name}
                      className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 border-indigo-200/50 hover:border-indigo-300/60"
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50`}>
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 font-qurova mb-2 text-base">{category.name}</h3>
                      <p className="text-sm text-slate-600 font-queensides">
                        Coming Soon
                      </p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === "myshop" ? (
              <motion.div
                key="myshop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {!connected ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative group mb-8"
                  >
                    <div className="relative rounded-2xl p-8 border-2 border-amber-300/20 hover:border-amber-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-amber-50/50 to-orange-50/30">
                      {/* Arabic-inspired corner decorations */}
                      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-amber-400/60 rounded-tl-xl"></div>
                      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-orange-400/60 rounded-tr-xl"></div>
                      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-orange-400/60 rounded-bl-xl"></div>
                      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-amber-400/60 rounded-br-xl"></div>

                      <div className="relative z-10 text-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200/50"
                        >
                          <Store className="w-10 h-10 text-amber-600" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-amber-800 font-qurova mb-4">Connect Wallet Required</h3>
                        <p className="text-amber-700 font-queensides leading-relaxed">Please connect your wallet to manage your shop and start your Islamic business journey</p>
                      </div>
                    </div>
                  </motion.div>
                ) : !userShop ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative group mb-8"
                  >
                    <div className="relative rounded-2xl p-8 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/5 to-indigo-50/10">
                      {/* Arabic-inspired corner decorations */}
                      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-xl"></div>
                      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400/60 rounded-tr-xl"></div>
                      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400/60 rounded-bl-xl"></div>
                      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-indigo-400/60 rounded-br-xl"></div>

                      <div className="relative z-10 text-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-200/50"
                        >
                          <Store className="w-10 h-10 text-indigo-600" />
                        </motion.div>

                        <h3 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">Create Your Shop</h3>
                        <p className="text-lg text-slate-600 font-queensides leading-relaxed mb-6 max-w-sm mx-auto">
                          Start your Islamic business journey on Samaa marketplace.
                          <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Share your beautiful products
                          </span> with the Muslim community.
                        </p>

                        <div className="space-y-4 mb-6">
                          <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                  <Store className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-queensides text-slate-700 font-semibold">Setup shop profile</span>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                  <Plus className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-queensides text-slate-700 font-semibold">Add your products</span>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200/50 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <Truck className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-queensides text-slate-700 font-semibold">Start selling</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setShowCreateShop(true)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create Shop
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Enhanced Shop Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="relative group"
                    >
                      <div className="relative rounded-2xl p-6 border-2 border-indigo-300/20 hover:border-indigo-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/30">
                        {/* Arabic-inspired corner decorations */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-indigo-400/60 rounded-tl-lg"></div>
                        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-purple-400/60 rounded-tr-lg"></div>
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-purple-400/60 rounded-bl-lg"></div>
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg"></div>

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center border border-indigo-200/50">
                                  <Store className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-bold text-slate-800 font-qurova">{userShop.name}</h2>
                                  <p className="text-sm text-indigo-600 font-queensides">Verified Islamic Business</p>
                                </div>
                              </div>
                              <p className="text-slate-600 font-queensides leading-relaxed">{userShop.description}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-queensides border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => setShowEditShop(true)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Shop
                            </Button>
                          </div>

                          {/* Shop Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-white/50 rounded-xl border border-indigo-100/50">
                              <div className="text-2xl font-bold text-indigo-600 font-qurova">{userShop.products.length}</div>
                              <div className="text-xs text-slate-600 font-queensides">Products</div>
                            </div>
                            <div className="text-center p-3 bg-white/50 rounded-xl border border-purple-100/50">
                              <div className="text-2xl font-bold text-purple-600 font-qurova">0</div>
                              <div className="text-xs text-slate-600 font-queensides">Orders</div>
                            </div>
                            <div className="text-center p-3 bg-white/50 rounded-xl border border-green-100/50">
                              <div className="text-2xl font-bold text-green-600 font-qurova">★ 5.0</div>
                              <div className="text-xs text-slate-600 font-queensides">Rating</div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              onClick={() => router.push("/shop/add")}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-queensides shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Product
                            </Button>
                            <Button
                              variant="outline"
                              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-queensides"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Preview Shop
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Products Grid - Pinterest-style Image-Only Masonry */}
                    {userShop.products.length > 0 ? (
                      <div className="columns-2 gap-4">
                        {userShop.products.map((product) => (
                          <div
                            key={product.id}
                            className="break-inside-avoid group"
                            style={{ marginBottom: '16px' }}
                          >
                            <div className="relative">
                              {/* Natural aspect ratio image - clickable to product page */}
                              <div
                                className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                onClick={() => handleViewProduct(product.id)}
                              >
                                <img
                                  src={product.images?.[0] || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-auto object-cover"
                                  style={{ aspectRatio: 'auto' }}
                                />
                              </div>

                              {/* Subtle overlay on hover */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-xl pointer-events-none" />

                              {/* Management buttons in top left on hover */}
                              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="flex gap-1">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingProduct(product)
                                    }}
                                    size="sm"
                                    className="bg-white/90 text-slate-800 hover:bg-white font-queensides text-xs w-8 h-8 p-0"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteProduct(product.id)
                                    }}
                                    size="sm"
                                    className="bg-red-500/90 text-white hover:bg-red-500 font-queensides text-xs w-8 h-8 p-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Info icon in bottom right */}
                              <div className="absolute bottom-2 right-2">
                                <button
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white w-8 h-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group/info"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Show centered overlay
                                    const overlay = document.getElementById(`myshop-overlay-${product.id}`)
                                    if (overlay) {
                                      overlay.classList.remove('opacity-0', 'pointer-events-none')
                                    }
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              </div>

                              {/* Centered overlay modal */}
                              <div
                                id={`myshop-overlay-${product.id}`}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300 z-50"
                                onClick={(e) => {
                                  if (e.target === e.currentTarget) {
                                    e.currentTarget.classList.add('opacity-0', 'pointer-events-none')
                                  }
                                }}
                              >
                                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
                                  {/* Close button */}
                                  <button
                                    className="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-slate-800 w-8 h-8 rounded-full transition-colors duration-200 flex items-center justify-center"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const overlay = document.getElementById(`myshop-overlay-${product.id}`)
                                      if (overlay) {
                                        overlay.classList.add('opacity-0', 'pointer-events-none')
                                      }
                                    }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>

                                  <h3 className="font-bold text-slate-800 font-qurova mb-2 text-base pr-6">{product.name}</h3>
                                  <p className="text-sm text-slate-600 font-queensides mb-3 line-clamp-3 leading-relaxed">
                                    {product.description}
                                  </p>

                                  <div className="mb-3">
                                    <div className="text-xl font-bold text-indigo-600 font-qurova">
                                      {product.price} {product.currency}
                                    </div>
                                    <div className="text-sm text-slate-500 font-queensides">
                                      ${convertToUSD(product.price, product.currency)} • {getAlternateCurrency(product.price, product.currency)}
                                    </div>
                                  </div>

                                  {/* Show sizes and colors if available */}
                                  {product.sizes && product.sizes.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-sm text-slate-500 font-queensides mb-2">Available Sizes:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {product.sizes.slice(0, 4).map((size, index) => (
                                          <span key={index} className="text-sm bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-queensides">
                                            {size}
                                          </span>
                                        ))}
                                        {product.sizes.length > 4 && (
                                          <span className="text-sm text-slate-400 font-queensides">+{product.sizes.length - 4} more</span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {product.colors && product.colors.length > 0 && (
                                    <div className="mb-3">
                                      <p className="text-sm text-slate-500 font-queensides mb-2">Available Colors:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {product.colors.slice(0, 3).map((color, index) => (
                                          <span key={index} className="text-sm bg-purple-50 text-purple-600 px-2 py-1 rounded font-queensides">
                                            {color}
                                          </span>
                                        ))}
                                        {product.colors.length > 3 && (
                                          <span className="text-sm text-slate-400 font-queensides">+{product.colors.length - 3} more</span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-sm text-slate-500 font-queensides">
                                    <span>⭐ {product.rating} ({product.reviews} reviews)</span>
                                    <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                                      {product.inStock ? 'In Stock' : 'Sold Out'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Stock status indicator */}
                              <div className="absolute top-2 right-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-queensides ${
                                  product.inStock
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}>
                                  {product.inStock ? 'In Stock' : 'Sold Out'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-700 font-qurova mb-2">No Products Yet</h3>
                        <p className="text-slate-600 font-queensides mb-4">Add your first product to start selling</p>
                        <Button
                          onClick={() => router.push("/shop/add")}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-queensides"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                      </Card>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Orders Coming Soon */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative group mb-8"
                >
                  <div className="relative rounded-2xl p-8 border-2 border-blue-300/20 hover:border-blue-400/40 transition-all duration-300 overflow-hidden backdrop-blur-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
                    {/* Arabic-inspired corner decorations */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-blue-400/60 rounded-tl-xl"></div>
                    <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-indigo-400/60 rounded-tr-xl"></div>
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-indigo-400/60 rounded-bl-xl"></div>
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-blue-400/60 rounded-br-xl"></div>

                    {/* Geometric pattern overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-blue-300/30 rounded-full opacity-20"></div>
                    <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-indigo-300/20 rounded-full"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-300/20 rounded-full"></div>

                    <div className="relative z-10 text-center">
                      {/* Elegant Icon */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200/50"
                      >
                        <Package className="w-10 h-10 text-blue-600" />
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-3xl font-bold text-slate-800 mb-4 font-qurova">
                        Orders Coming Soon
                      </h3>

                      {/* Elegant Description */}
                      <p className="text-lg text-slate-600 font-queensides leading-relaxed mb-6 max-w-sm mx-auto">
                        Your order management will be available when shopping launches.
                        <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Get ready for your first customers!
                        </span>
                      </p>

                      {/* Order Management Features */}
                      <div className="space-y-4 mb-6">
                        <p className="text-base text-blue-600 font-queensides font-semibold">
                          What you'll be able to manage:
                        </p>

                        <div className="grid grid-cols-1 gap-3 max-w-xs mx-auto">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-queensides text-slate-700 font-semibold">Track all orders</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200/50 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                <Truck className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-queensides text-slate-700 font-semibold">Manage shipping</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200/50 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-queensides text-slate-700 font-semibold">Customer support</span>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200/50 shadow-sm">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-queensides text-slate-700 font-semibold">Sales analytics</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trust Indicators */}
                      <div className="flex justify-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-blue-600">
                          <div className="w-2 h-2 bg-blue-500/70 rounded-full"></div>
                          <span className="font-queensides">Secure Payments</span>
                        </div>
                        <div className="flex items-center space-x-2 text-indigo-600">
                          <div className="w-2 h-2 bg-indigo-500/70 rounded-full"></div>
                          <span className="font-queensides">Order Protection</span>
                        </div>
                      </div>
                    </div>

                    {/* Arabic-Inspired Card Divider */}
                    <div className="flex items-center justify-center mt-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"></div>
                      <div className="mx-4 flex items-center space-x-1">
                        <div className="w-1 h-1 bg-blue-400/60 rounded-full"></div>
                        <div className="w-2 h-2 border border-blue-400/40 rounded-full flex items-center justify-center">
                          <div className="w-0.5 h-0.5 bg-blue-500/70 rounded-full"></div>
                        </div>
                        <div className="w-1 h-1 bg-indigo-400/60 rounded-full"></div>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create Shop Modal */}
        {showCreateShop && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 font-qurova">Create Your Shop</h3>
                  <button
                    onClick={() => setShowCreateShop(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const shippingMethods = (formData.get('shippingMethods') as string).split(',').map(s => s.trim()).filter(s => s)
                  createShop({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    shippingPolicy: formData.get('shippingPolicy') as string,
                    returnPolicy: formData.get('returnPolicy') as string,
                    contactEmail: formData.get('contactEmail') as string,
                    contactPhone: formData.get('contactPhone') as string || undefined,
                    businessAddress: formData.get('businessAddress') as string || undefined,
                    shippingMethods: shippingMethods,
                    processingTime: formData.get('processingTime') as string,
                    isActive: true
                  })
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="shop-name" className="font-queensides">Shop Name</Label>
                      <Input
                        id="shop-name"
                        name="name"
                        placeholder="Enter your shop name"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shop-description" className="font-queensides">Description</Label>
                      <Textarea
                        id="shop-description"
                        name="description"
                        placeholder="Describe what you sell..."
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-email" className="font-queensides">Contact Email</Label>
                      <Input
                        id="contact-email"
                        name="contactEmail"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-phone" className="font-queensides">Contact Phone (Optional)</Label>
                      <Input
                        id="contact-phone"
                        name="contactPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="business-address" className="font-queensides">Business Address (Optional)</Label>
                      <Textarea
                        id="business-address"
                        name="businessAddress"
                        placeholder="Your business address..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="shipping-methods" className="font-queensides">Shipping Methods</Label>
                      <Input
                        id="shipping-methods"
                        name="shippingMethods"
                        placeholder="Standard, Express, Overnight (comma-separated)"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="processing-time" className="font-queensides">Processing Time</Label>
                      <Input
                        id="processing-time"
                        name="processingTime"
                        placeholder="1-3 business days"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shipping-policy" className="font-queensides">Shipping Policy</Label>
                      <Textarea
                        id="shipping-policy"
                        name="shippingPolicy"
                        placeholder="Describe your shipping policy, costs, and delivery times..."
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="return-policy" className="font-queensides">Return Policy</Label>
                      <Textarea
                        id="return-policy"
                        name="returnPolicy"
                        placeholder="Describe your return and refund policy..."
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateShop(false)}
                      className="flex-1 font-queensides"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
                    >
                      Create Shop
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Shop Modal */}
        {showEditShop && userShop && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 font-qurova">Edit Shop</h3>
                  <button
                    onClick={() => setShowEditShop(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const shippingMethods = (formData.get('shippingMethods') as string).split(',').map(s => s.trim()).filter(s => s)
                  updateShop({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    shippingPolicy: formData.get('shippingPolicy') as string,
                    returnPolicy: formData.get('returnPolicy') as string,
                    contactEmail: formData.get('contactEmail') as string,
                    contactPhone: formData.get('contactPhone') as string || undefined,
                    businessAddress: formData.get('businessAddress') as string || undefined,
                    shippingMethods: shippingMethods,
                    processingTime: formData.get('processingTime') as string,
                    isActive: userShop.isActive
                  })
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-shop-name" className="font-queensides">Shop Name</Label>
                      <Input
                        id="edit-shop-name"
                        name="name"
                        defaultValue={userShop.name}
                        placeholder="Enter your shop name"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-shop-description" className="font-queensides">Description</Label>
                      <Textarea
                        id="edit-shop-description"
                        name="description"
                        defaultValue={userShop.description}
                        placeholder="Describe what you sell..."
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-contact-email" className="font-queensides">Contact Email</Label>
                      <Input
                        id="edit-contact-email"
                        name="contactEmail"
                        type="email"
                        defaultValue={userShop.contactEmail}
                        placeholder="your@email.com"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-contact-phone" className="font-queensides">Contact Phone (Optional)</Label>
                      <Input
                        id="edit-contact-phone"
                        name="contactPhone"
                        type="tel"
                        defaultValue={userShop.contactPhone || ''}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-business-address" className="font-queensides">Business Address (Optional)</Label>
                      <Textarea
                        id="edit-business-address"
                        name="businessAddress"
                        defaultValue={userShop.businessAddress || ''}
                        placeholder="Your business address..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-shipping-methods" className="font-queensides">Shipping Methods</Label>
                      <Input
                        id="edit-shipping-methods"
                        name="shippingMethods"
                        defaultValue={userShop.shippingMethods?.join(', ') || ''}
                        placeholder="Standard, Express, Overnight (comma-separated)"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-processing-time" className="font-queensides">Processing Time</Label>
                      <Input
                        id="edit-processing-time"
                        name="processingTime"
                        defaultValue={userShop.processingTime}
                        placeholder="1-3 business days"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-shipping-policy" className="font-queensides">Shipping Policy</Label>
                      <Textarea
                        id="edit-shipping-policy"
                        name="shippingPolicy"
                        defaultValue={userShop.shippingPolicy}
                        placeholder="Describe your shipping policy, costs, and delivery times..."
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-return-policy" className="font-queensides">Return Policy</Label>
                      <Textarea
                        id="edit-return-policy"
                        name="returnPolicy"
                        defaultValue={userShop.returnPolicy}
                        placeholder="Describe your return and refund policy..."
                        required
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditShop(false)}
                      className="flex-1 font-queensides"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
                    >
                      Update Shop
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}
