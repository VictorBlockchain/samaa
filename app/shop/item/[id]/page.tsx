"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Heart, Star, Play, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

const mockProduct = {
  id: "1",
  name: "Elegant Hijab Set - Premium Collection",
  price: 0.05,
  currency: "SOL",
  images: [
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
  ],
  videoUrl: "https://example.com/product-video.mp4",
  category: "Women's Clothes",
  seller: "Modest Fashion Co",
  rating: 4.8,
  reviews: 124,
  inStock: true,
  stockCount: 15,
  description:
    "Beautiful modest hijab set perfect for daily wear. Made from premium breathable fabric with elegant designs inspired by traditional Islamic patterns.",
  features: [
    "Premium breathable fabric",
    "Traditional Islamic patterns",
    "Available in multiple colors",
    "Easy care instructions",
    "Ethically sourced materials",
  ],
  specifications: {
    Material: "100% Cotton",
    Size: "One Size Fits All",
    Care: "Machine washable",
    Origin: "Made in Turkey",
  },
}

export default function ShopItemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showVideo, setShowVideo] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="p-2 bg-white/80 backdrop-blur-sm rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Product Details</h1>
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Product Images */}
        <Card className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg border-0 mb-6">
          <div className="relative border-4 border-transparent bg-gradient-to-r from-amber-400 via-purple-500 to-teal-400 p-[2px]">
            <div className="bg-white relative">
              <img
                src={mockProduct.images[selectedImage] || "/placeholder.svg"}
                alt={mockProduct.name}
                className="w-full h-80 object-cover"
              />

              {/* Video Play Button */}
              <button
                onClick={() => setShowVideo(true)}
                className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                <Play className="w-5 h-5" />
              </button>

              {/* Stock Badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 text-xs font-bold">
                {mockProduct.stockCount} in stock
              </div>
            </div>
          </div>

          {/* Image Thumbnails */}
          <div className="p-4 border-t-2 border-amber-200">
            <div className="flex space-x-2">
              {mockProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 border-2 ${selectedImage === index ? "border-purple-500" : "border-gray-200"}`}
                >
                  <img src={image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Product Info */}
        <Card className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg border-0 p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">{mockProduct.name}</h2>
          <p className="text-gray-600 text-sm mb-3">{mockProduct.seller}</p>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{mockProduct.rating}</span>
              <span className="text-sm text-gray-500">({mockProduct.reviews} reviews)</span>
            </div>
            <span className="text-sm text-gray-500">{mockProduct.category}</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-bold text-purple-600">
              {mockProduct.price} {mockProduct.currency}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4">{mockProduct.description}</p>

          {/* Features */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="space-y-1">
              {mockProduct.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Specifications:</h3>
            <div className="space-y-2">
              {Object.entries(mockProduct.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-around py-4 border-t border-gray-200">
            <div className="text-center">
              <Truck className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600">Free Shipping</span>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600">Secure Payment</span>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <span className="text-xs text-gray-600">Easy Returns</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full py-4 bg-gradient-to-r from-amber-400 to-purple-500 text-white font-bold border-2 border-amber-300 hover:from-amber-500 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl">
            <ShoppingCart className="w-5 h-5 inline mr-2" />
            اشتري الآن - Buy Now
          </button>
          <button className="w-full py-4 border-2 border-purple-500 text-purple-500 font-bold hover:bg-purple-50 transition-colors">
            Add to Cart
          </button>
        </div>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-md">
              <button onClick={() => setShowVideo(false)} className="absolute -top-10 right-0 text-white text-xl">
                ✕
              </button>
              <video controls autoPlay className="w-full rounded-lg" src={mockProduct.videoUrl}>
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
