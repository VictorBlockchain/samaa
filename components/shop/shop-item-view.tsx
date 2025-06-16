"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Heart, Star, Play, ShoppingCart, Truck, Shield, RotateCcw, Eye, Edit3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  features?: string[]
  specifications?: Record<string, string>
  stockCount?: number
  sizes?: string[]
  colors?: string[]
}

// Mock global products (same as in shop-view)
const GLOBAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Elegant Hijab Set",
    description: "Beautiful modest hijab set perfect for daily wear. Made from premium breathable fabric with elegant designs inspired by traditional Islamic patterns.",
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=600&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=550&fit=crop",
    ],
    video: "https://example.com/hijab-demo.mp4",
    price: 1.25,
    currency: "SOL",
    category: "Women's Clothes",
    seller: "Modest Fashion Co",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    stockCount: 15,
    sizes: ["S", "M", "L", "XL", "One Size"],
    colors: ["Black", "Navy Blue", "Burgundy", "Cream"],
    features: [
      "Premium breathable fabric",
      "Traditional Islamic patterns",
      "Available in multiple colors",
      "Easy care instructions",
      "Ethically sourced materials"
    ],
    specifications: {
      Material: "100% Cotton",
      Care: "Machine washable",
      Origin: "Made in Turkey"
    }
  },
  {
    id: "2",
    name: "Islamic Calligraphy Art",
    description: "Hand-crafted Islamic calligraphy artwork featuring beautiful Arabic verses in elegant gold lettering on premium canvas",
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop"],
    price: 750,
    currency: "SAMAA",
    category: "Arts & Crafts",
    seller: "Art Gallery",
    rating: 4.9,
    reviews: 89,
    inStock: true,
    stockCount: 5,
    features: ["Hand-crafted", "Authentic calligraphy", "Premium frame"],
    specifications: {
      Size: "24x18 inches",
      Frame: "Wooden frame included",
      Artist: "Master calligrapher"
    }
  },
  {
    id: "3",
    name: "Prayer Beads",
    description: "Traditional prayer beads made from natural materials, perfect for daily prayers and meditation",
    images: ["https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=400&h=400&fit=crop"],
    price: 135,
    currency: "SAMAA",
    category: "Accessories",
    seller: "Spiritual Goods",
    rating: 4.7,
    reviews: 67,
    inStock: true,
    stockCount: 20,
    features: ["Natural materials", "Traditional design", "Blessed by imam"],
    specifications: {
      Material: "Natural wood",
      Beads: "99 beads",
      Origin: "Handmade in Morocco"
    }
  },
  {
    id: "4",
    name: "Men's Thobe",
    description: "Classic white thobe for prayer and formal occasions. Comfortable, breathable fabric perfect for daily wear and special events.",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face"],
    price: 2.15,
    currency: "SOL",
    category: "Men's Clothes",
    seller: "Traditional Wear",
    rating: 4.6,
    reviews: 45,
    inStock: true,
    stockCount: 8,
    sizes: ["M", "L", "XL", "XXL", "58 inches", "60 inches"],
    colors: ["White", "Cream", "Light Gray"],
    features: ["Classic design", "Comfortable fit", "Formal occasions"],
    specifications: {
      Material: "100% Cotton",
      Care: "Machine washable"
    }
  },
  {
    id: "5",
    name: "Bridal Hijab with Pearls",
    description: "Luxurious bridal hijab adorned with hand-sewn pearls and delicate embroidery. Perfect for your special day with elegant Islamic styling.",
    images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=700&fit=crop&crop=face"],
    price: 3.5,
    currency: "SOL",
    category: "Bride Fashion",
    seller: "Bridal Boutique",
    rating: 4.9,
    reviews: 67,
    inStock: true,
    stockCount: 12,
    sizes: ["One Size"],
    colors: ["Ivory", "Champagne", "Blush Pink"],
    features: ["Hand-sewn pearls", "Delicate embroidery", "Premium silk fabric"],
    specifications: {
      Material: "100% Silk",
      Care: "Dry clean only",
      Origin: "Handmade in Lebanon"
    }
  },
  {
    id: "6",
    name: "Groom's Wedding Thobe",
    description: "Premium wedding thobe with gold embroidery and traditional cut",
    images: ["/placeholder.svg?height=400&width=400"],
    price: 4.2,
    currency: "SOL",
    category: "Groom Fashion",
    seller: "Groom's Corner",
    rating: 4.8,
    reviews: 43,
    inStock: true,
    stockCount: 8,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Cream", "Gold", "White"],
    features: ["Gold thread embroidery", "Traditional cut", "Premium fabric"],
    specifications: {
      Material: "Premium Cotton Blend",
      Care: "Dry clean recommended",
      Origin: "Made in Morocco"
    }
  },
  {
    id: "7",
    name: "Islamic Wedding Gift Set",
    description: "Beautiful gift set with Quran, prayer beads, and decorative items",
    images: ["/placeholder.svg?height=400&width=400"],
    price: 850,
    currency: "SAMAA",
    category: "Wedding Gifts",
    seller: "Sacred Gifts",
    rating: 4.7,
    reviews: 89,
    inStock: true,
    stockCount: 25,
    features: ["Complete gift set", "Beautiful packaging", "Blessed items"],
    specifications: {
      Contents: "Quran, Prayer Beads, Decorative Box",
      Language: "Arabic with English translation",
      Origin: "Assembled in UAE"
    }
  }
]

interface ShopItemViewProps {
  itemId: string
}

export function ShopItemView({ itemId }: ShopItemViewProps) {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showVideo, setShowVideo] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")

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

  useEffect(() => {
    loadProduct()
  }, [itemId, publicKey])

  const isClothingCategory = (category: string) => {
    return category === "Women's Clothes" ||
           category === "Men's Clothes" ||
           category === "Bride Fashion" ||
           category === "Groom Fashion"
  }

  const loadProduct = () => {
    // First check global products
    let foundProduct = GLOBAL_PRODUCTS.find(p => p.id === itemId)
    
    if (!foundProduct && publicKey) {
      // Check user shops for the product
      const userShop = localStorage.getItem(`shop_${publicKey.toString()}`)
      if (userShop) {
        const shop = JSON.parse(userShop)
        foundProduct = shop.products.find((p: Product) => p.id === itemId)
        if (foundProduct) {
          setIsOwner(true)
        }
      }
    }

    if (foundProduct) {
      setProduct(foundProduct)
    }
  }

  const handlePurchase = () => {
    if (!connected) {
      alert("Please connect your wallet to make a purchase")
      return
    }

    // Validate size and color selection for clothing items
    if (product && isClothingCategory(product.category)) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        alert("Please select a size")
        return
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        alert("Please select a color")
        return
      }
    }

    console.log("Purchasing product:", {
      id: product?.id,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    })
    // Implement purchase logic here
  }

  const handleEdit = () => {
    // Navigate to edit product page or open edit modal
    console.log("Edit product:", product?.id)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative">
        <CelestialBackground intensity="light" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md mx-4">
            <h2 className="text-xl font-bold text-slate-800 font-qurova mb-4">Product Not Found</h2>
            <p className="text-slate-600 font-queensides mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => router.push("/shop")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Card>
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
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Product Details</h1>
              <p className="text-sm text-slate-600 font-queensides">{product.category}</p>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                </button>
              )}
              <button className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
                <Heart className="w-5 h-5 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 pb-32">

          {/* Product Images */}
          <Card className="overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-indigo-200/50 mb-6">
            <div className="relative">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-80 object-cover"
              />

              {/* Stock Badge */}
              {product.stockCount && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-full font-queensides">
                  {product.stockCount} in stock
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="p-4 border-t border-indigo-100">
                <div className="flex space-x-3 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                        selectedImage === index
                          ? "border-indigo-500 shadow-md scale-105"
                          : "border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <img src={image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Video Section */}
          {product.video && (
            <Card className="overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-indigo-200/50 mb-6">
              <div className="p-4">
                <h3 className="font-bold text-slate-800 font-qurova mb-3 flex items-center">
                  <Play className="w-5 h-5 mr-2 text-indigo-600" />
                  Product Video
                </h3>
                <button
                  onClick={() => setShowVideo(true)}
                  className="relative w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>
                </button>
              </div>
            </Card>
          )}

          {/* Seller & Store Info */}
          <Card className="overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-indigo-200/50 p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-indigo-600 font-qurova">
                  {product.seller.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 font-qurova">{product.seller}</h3>
                <p className="text-sm text-slate-600 font-queensides">Verified Seller</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-queensides"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Store
              </Button>
            </div>
          </Card>

          {/* Product Info */}
          <Card className="overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-indigo-200/50 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-3 font-qurova text-slate-800">{product.name}</h2>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-base font-medium text-slate-700">{product.rating}</span>
                <span className="text-sm text-slate-500 font-queensides">({product.reviews} reviews)</span>
              </div>
              <span className="text-sm text-slate-500 font-queensides bg-slate-100 px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-3xl font-bold text-indigo-600 font-qurova">
                  {product.price} {product.currency}
                </div>
                <div className="text-base text-slate-500 font-queensides">
                  ${convertToUSD(product.price, product.currency)} • {getAlternateCurrency(product.price, product.currency)}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-200 transition-colors font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-lg text-slate-700">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-200 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

          <p className="text-slate-700 text-base mb-6 font-queensides leading-relaxed">{product.description}</p>

          {/* Available Sizes - Show all available sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 font-qurova text-slate-800">Available Sizes:</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 font-queensides"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Colors - Show all available colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 font-qurova text-slate-800">Available Colors:</h4>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg border border-purple-200 font-queensides"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection - Only for clothing */}
          {isClothingCategory(product.category) && product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 font-qurova text-slate-800">Select Size:</h4>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-2 text-sm rounded-lg border transition-colors font-queensides ${
                      selectedSize === size
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection - Only for clothing */}
          {isClothingCategory(product.category) && product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 font-qurova text-slate-800">Select Color:</h4>
              <div className="grid grid-cols-2 gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`p-3 text-sm rounded-lg border transition-colors font-queensides ${
                      selectedColor === color
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="flex justify-around py-4 border-t border-gray-200">
            <div className="text-center">
              <Truck className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600 font-queensides">Free Shipping</span>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600 font-queensides">Secure Payment</span>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600 font-queensides">Easy Returns</span>
            </div>
          </div>
        </Card>

          {/* Action Buttons */}
          {!isOwner && (
            <div className="space-y-4">
              <Button
                onClick={handlePurchase}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold font-queensides shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                {product.inStock ? "Buy Now" : "Out of Stock"}
              </Button>
              <Button
                variant="outline"
                className="w-full py-4 border-2 border-indigo-500 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors font-queensides text-lg"
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
            </div>
          )}

          {/* Bottom Spacing */}
          <div className="h-16"></div>
        </div>

        {/* Video Modal */}
        {showVideo && product.video && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute -top-10 right-0 text-white text-xl hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
              <video controls autoPlay className="w-full rounded-lg" src={product.video}>
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
