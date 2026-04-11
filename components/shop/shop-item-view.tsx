"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Heart, Star, Play, ShoppingCart, Truck, Shield, RotateCcw, Eye, Edit3, Plus, Minus, Share2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { CartService } from "@/lib/cart"
import { WishlistService, ProductService } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AddToCartSheet } from "@/components/shop/add-to-cart-sheet"

interface Product {
  id: string
  name: string
  description: string
  images: string[]
  video?: string
  price: number
  currency: "USD"
  category: string
  seller: string
  rating: number
  reviews: number
  inStock: boolean
  shopId?: string
  shopName?: string
  shopLogo?: string
  features?: string[]
  specifications?: Record<string, string>
  stockCount?: number
  sizes?: string[]
  colors?: string[]
}

interface ShopItemViewProps {
  itemId: string
}

export function ShopItemView({ itemId }: ShopItemViewProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const userId = user?.id || null
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showVideo, setShowVideo] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isWished, setIsWished] = useState(false)
  const [showCartSheet, setShowCartSheet] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showShopDetails, setShowShopDetails] = useState(false)
  const { toast } = useToast()

  // Mock exchange rates removed - all prices now in USD

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null) return "$0.00"
    return `$${price.toFixed(2)}`
  }

  const isClothingCategory = (category: string) => {
    return category === "Women's Clothes" ||
           category === "Men's Clothes" ||
           category === "Bride Fashion" ||
           category === "Groom Fashion"
  }

  useEffect(() => {
    loadProduct()
  }, [itemId, userId])

  // Load wishlist status
  useEffect(() => {
    if (userId && product?.id) {
      WishlistService.isInWishlist(userId, product.id).then(setIsWished)
    }
  }, [userId, product?.id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      // Fetch product from Supabase
      const productData = await ProductService.getProductById(itemId)
      console.log(productData.images)
      if (productData) {
        // Separate images and videos from the images array
        const imagePaths: string[] = []
        let videoPath: string | undefined = productData.video
        
        ;(productData.images || []).forEach((img: string) => {
          if (img.startsWith('video:')) {
            // Extract video path
            videoPath = img.slice(6)
          } else if (!img.endsWith('.mp4') && !img.endsWith('.webm') && !img.endsWith('.mov')) {
            // Only include actual image files
            imagePaths.push(img)
          }
        })
        
        // Transform Supabase data to component format
        const transformedProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description || "",
          images: imagePaths,
          video: videoPath ? `https://qwnukvbeoglvynyrhuey.supabase.co/storage/v1/object/public/shop-videos/${videoPath}` : undefined,
          price: parseFloat(productData.base_price) || 0,
          currency: "USD",
          category: productData.product_categories?.name || productData.category || "",
          seller: productData.shops?.name || "Unknown Seller",
          rating: productData.rating || 0,
          reviews: productData.total_reviews || 0,
          inStock: productData.stock_count > 0,
          shopId: productData.shops?.id,
          shopName: productData.shops?.name,
          shopLogo: productData.shops?.logo_url,
          features: productData.features || [],
          specifications: productData.specifications || {},
          stockCount: productData.stock_count || 0,
          sizes: productData.sizes || [],
          colors: productData.colors || [],
        }
        
        setProduct(transformedProduct)
        
        // Check if user owns this shop
        if (userId && productData.shops?.owner_id === userId) {
          setIsOwner(true)
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast({ 
        title: "Failed to load product", 
        description: "Please try again later.", 
        variant: "destructive", 
        duration: 5000 
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast({ title: "Please sign in to make a purchase", variant: "destructive", duration: 5000 })
      return
    }
    setShowCartSheet(true)
  }

  const handleAddToCart = () => {
    if (!isAuthenticated || !userId || !product) {
      toast({ title: "Please sign in to add items to cart", variant: "destructive", duration: 5000 })
      return
    }
    setShowCartSheet(true)
  }

  const handleCartSheetConfirm = async (qty: number, size?: string, color?: string) => {
    if (!userId || !product) return
    setAddingToCart(true)
    try {
      const success = await CartService.addToCart(userId, {
        productId: product.id,
        quantity: qty,
        selectedSize: size,
        selectedColor: color,
      })
      if (success) {
        setShowCartSheet(false)
        toast({ title: "Added to cart!", description: `${qty}x ${product.name}`, duration: 3000 })
      } else {
        toast({ title: "Failed to add item to cart", description: "Please try again.", variant: "destructive", duration: 5000 })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({ title: "Failed to add item to cart", variant: "destructive", duration: 5000 })
    } finally {
      setAddingToCart(false)
    }
  }

  const toggleWishlist = async () => {
    if (!userId || !product) {
      toast({ title: "Please sign in", variant: "destructive", duration: 5000 })
      return
    }
    if (isWished) {
      const ok = await WishlistService.removeFromWishlist(userId, product.id)
      if (ok) { setIsWished(false); toast({ title: "Removed from wishlist", duration: 3000 }) }
    } else {
      const ok = await WishlistService.addToWishlist(userId, product.id)
      if (ok) { setIsWished(true); toast({ title: "Added to wishlist", duration: 3000 }) }
    }
  }

  const shareProduct = async () => {
    if (!product) return
    const url = `${window.location.origin}/shop/item?id=${product.id}`
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      toast({ title: "Link copied!", description: "Product link copied to clipboard", duration: 3000 })
    }
  }

  const handleEdit = () => {
    // Navigate to edit product page or open edit modal
    console.log("Edit product:", product?.id)
  }

  const handleViewStore = () => {
    if (product?.shopId) {
      router.push(`/shop?shopId=${product.shopId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative">
        <CelestialBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 font-queensides">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative">
        <CelestialBackground intensity="light" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md mx-4">
            <h2 className="text-xl font-bold text-slate-800 font-queensides mb-4">Product Not Found</h2>
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
              <h1 className="text-xl font-bold text-slate-800 font-queensides">Product Details</h1>
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
              <button
                onClick={toggleWishlist}
                className="p-2 hover:bg-indigo-50 rounded-xl transition-colors"
                title={isWished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWished ? "text-pink-500 fill-pink-500" : "text-indigo-600"}`} />
              </button>
              <button
                onClick={shareProduct}
                className="p-2 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Share product"
              >
                <Share2 className="w-5 h-5 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 pb-32">

          {/* Product Images */}
          <Card className="overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-indigo-200/50 mb-6">
            <div className="relative">
              <img
                src={'https://qwnukvbeoglvynyrhuey.supabase.co/storage/v1/object/public/shop-images/' + product.images[selectedImage]}
                alt={product.name}
                className="w-full h-80 object-cover"
              />

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
                      <img src={'https://qwnukvbeoglvynyrhuey.supabase.co/storage/v1/object/public/shop-images/' + image} alt="" className="w-full h-full object-cover" />
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
                <h3 className="font-bold text-slate-800 font-queensides mb-3 flex items-center">
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
                <span className="text-lg font-bold text-indigo-600 font-queensides">
                  {product.seller.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 font-queensides">{product.seller}</h3>
                <p className="text-sm text-slate-600 font-queensides">Verified Seller</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewStore}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-queensides"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Store
              </Button>
            </div>
          </Card>

          {/* Product Info */}
          <Card className="overflow-hidden bg-white/95 backdrop-blur-sm shadow-lg border border-indigo-200/50 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-3 font-queensides text-slate-800">{product.name}</h2>

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
                <div className="text-3xl font-bold text-indigo-600 font-queensides">
                  {formatPrice(product.price)}
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
              <h4 className="font-semibold mb-3 font-queensides text-slate-800">Available Sizes:</h4>
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
              <h4 className="font-semibold mb-3 font-queensides text-slate-800">Available Colors:</h4>
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
              <h4 className="font-semibold mb-3 font-queensides text-slate-800">Select Size:</h4>
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
              <h4 className="font-semibold mb-3 font-queensides text-slate-800">Select Color:</h4>
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
                onClick={handleAddToCart}
                variant="outline"
                className="w-full py-4 border-2 border-indigo-500 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors font-queensides text-lg"
                disabled={!product.inStock}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}

          {/* Bottom Spacing */}
          <div className="h-16"></div>
        </div>

        {/* Video Modal */}
        <AnimatePresence>
          {showVideo && product.video && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowVideo(false)}
            >
              <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <video controls autoPlay className="w-full rounded-lg" src={product.video}>
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add to Cart Sheet */}
        {product && (
          <AddToCartSheet
            product={product}
            isOpen={showCartSheet}
            onClose={() => setShowCartSheet(false)}
            onConfirm={handleCartSheetConfirm}
            loading={addingToCart}
            initialSize={selectedSize}
            initialColor={selectedColor}
            initialQuantity={quantity}
          />
        )}

        <Toaster />
      </div>
    </div>
  )
}
