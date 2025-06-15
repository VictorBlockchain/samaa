"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ShoppingBag, Store, Package, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CelestialBackground } from "@/components/ui/celestial-background"

interface Product {
  id: string
  name: string
  description: string
  image: string
  price: number
  currency: "SOL" | "SAMAA"
  category: string
  seller: string
  rating: number
  reviews: number
  inStock: boolean
}

const SHOP_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Elegant Hijab Set",
    description: "Beautiful modest hijab set perfect for daily wear",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.05,
    currency: "SOL",
    category: "Women's Clothes",
    seller: "Modest Fashion Co",
    rating: 4.8,
    reviews: 124,
    inStock: true,
  },
  {
    id: "2",
    name: "Islamic Calligraphy Art",
    description: "Hand-crafted Islamic calligraphy artwork",
    image: "/placeholder.svg?height=200&width=200",
    price: 250,
    currency: "SAMAA",
    category: "Arts & Crafts",
    seller: "Art Gallery",
    rating: 4.9,
    reviews: 89,
    inStock: true,
  },
  {
    id: "3",
    name: "Prayer Beads",
    description: "Traditional prayer beads made from natural materials",
    image: "/placeholder.svg?height=200&width=200",
    price: 150,
    currency: "SAMAA",
    category: "Accessories",
    seller: "Spiritual Goods",
    rating: 4.7,
    reviews: 67,
    inStock: true,
  },
  {
    id: "4",
    name: "Men's Thobe",
    description: "Classic white thobe for prayer and formal occasions",
    image: "/placeholder.svg?height=200&width=200",
    price: 0.08,
    currency: "SOL",
    category: "Men's Clothes",
    seller: "Traditional Wear",
    rating: 4.6,
    reviews: 45,
    inStock: true,
  },
]

export function ShopView() {
  const [activeTab, setActiveTab] = useState<"shop" | "categories" | "customers" | "orders">("shop")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [userShop, setUserShop] = useState<any>(null)
  const [showCreateShop, setShowCreateShop] = useState(false)

  const router = useRouter()
  const { connected, publicKey } = useWallet()

  const tabs = [
    { id: "shop", label: "Shop", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: Package },
    { id: "customers", label: "Customers", icon: Store },
    { id: "orders", label: "Orders", icon: Truck },
  ]

  const handlePurchase = async (productId: string) => {
    // Simulate purchase process
    console.log("Purchasing product:", productId)
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

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {SHOP_PRODUCTS.map((product) => (
                    <motion.div key={product.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card className="p-4 hover:shadow-lg transition-all duration-300 border-indigo-200/50">
                        <div className="aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <h3 className="font-bold text-slate-800 font-qurova mb-1">{product.name}</h3>
                        <p className="text-xs text-slate-600 font-queensides mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-indigo-600 font-qurova">
                            {product.price} {product.currency}
                          </span>
                          <Button
                            onClick={() => handlePurchase(product.id)}
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
                            disabled={!connected || !product.inStock}
                          >
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            Buy
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

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
                  {["Women's Clothes", "Men's Clothes", "Arts & Crafts", "Accessories"].map((category) => (
                    <Card
                      key={category}
                      className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 border-indigo-200/50"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h3 className="font-bold text-slate-800 font-qurova mb-2">{category}</h3>
                      <p className="text-sm text-slate-600 font-queensides">
                        {SHOP_PRODUCTS.filter((p) => p.category === category).length} items
                      </p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === "customers" ? (
              <motion.div
                key="customers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 text-center">
                  <Store className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-700 font-qurova mb-2">Customer Management</h3>
                  <p className="text-slate-600 font-queensides mb-4">View and manage your customers</p>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides">
                    <Store className="w-4 h-4 mr-2" />
                    View Customers
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 text-center">
                  <Truck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-700 font-qurova mb-2">Order Management</h3>
                  <p className="text-slate-600 font-queensides mb-4">Track and manage your orders</p>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides">
                    <Truck className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
