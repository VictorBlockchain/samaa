"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, X, Play, Image as ImageIcon, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export function AddProductView() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "SOL" as "SOL" | "SAMAA",
    category: ""
  })
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState("")
  const [customSize, setCustomSize] = useState("")

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "N/A"]

  const isClothingCategory = (category: string) => {
    return category === "Women's Clothes" ||
           category === "Men's Clothes" ||
           category === "Bride Fashion" ||
           category === "Groom Fashion"
  }

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const addCustomSize = () => {
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      setSelectedSizes(prev => [...prev, customSize.trim()])
      setCustomSize("")
    }
  }

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors(prev => [...prev, newColor.trim()])
      setNewColor("")
    }
  }

  const removeColor = (colorToRemove: string) => {
    setColors(prev => prev.filter(color => color !== colorToRemove))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setUploadedImages(prev => [...prev, url])
      }
    })
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      setUploadedVideo(url)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = () => {
    setUploadedVideo(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey) {
      alert("Please connect your wallet")
      return
    }

    if (uploadedImages.length === 0) {
      alert("Please upload at least one product image")
      return
    }

    setIsLoading(true)

    try {
      // Get user's shop
      const userShop = localStorage.getItem(`shop_${publicKey.toString()}`)
      if (!userShop) {
        alert("You need to create a shop first")
        router.push("/shop")
        return
      }

      const shop: UserShop = JSON.parse(userShop)

      // Generate auto-incrementing ID
      const existingProducts = shop.products || []
      const maxId = existingProducts.length > 0
        ? Math.max(...existingProducts.map(p => parseInt(p.id) || 0))
        : 0
      const newId = (maxId + 1).toString()

      // Create new product
      const newProduct: Product = {
        id: newId,
        name: formData.name,
        description: formData.description,
        images: uploadedImages,
        video: uploadedVideo || undefined,
        price: Number(formData.price),
        currency: formData.currency,
        category: formData.category,
        seller: shop.name,
        shopId: shop.id,
        rating: 0,
        reviews: 0,
        inStock: true,
        ...(isClothingCategory(formData.category) && {
          sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
          colors: colors.length > 0 ? colors : undefined
        })
      }

      // Update shop with new product
      const updatedShop = {
        ...shop,
        products: [...shop.products, newProduct]
      }

      localStorage.setItem(`shop_${publicKey.toString()}`, JSON.stringify(updatedShop))
      
      // Redirect back to shop
      router.push("/shop?tab=myshop")
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground intensity="light" />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-800 font-qurova mb-4">Connect Wallet Required</h2>
            <p className="text-slate-600 font-queensides mb-6">
              Please connect your wallet to add products to your shop.
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
      <CelestialBackground intensity="light" />
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-indigo-100/50">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-indigo-600" />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 font-qurova">Add Product</h1>
              <p className="text-sm text-slate-600 font-queensides">Create a new product listing</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto p-4 pb-32">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Images */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Product Images</h3>
              
              {/* Upload Button */}
              <div className="mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <p className="text-indigo-600 font-queensides">Click to upload images</p>
                    <p className="text-xs text-slate-500 font-queensides">PNG, JPG, WEBP up to 10MB each</p>
                  </div>
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-indigo-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-queensides">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Product Video */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Product Video (Optional)</h3>
              
              {!uploadedVideo ? (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-purple-300 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-center">
                      <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-purple-600 font-queensides">Click to upload video</p>
                      <p className="text-xs text-slate-500 font-queensides">MP4, WEBM up to 50MB</p>
                    </div>
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <video
                    src={uploadedVideo}
                    controls
                    className="w-full h-48 object-cover rounded-lg border border-purple-200"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </Card>

            {/* Product Details */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4">Product Details</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-queensides">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="font-queensides">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product in detail..."
                    required
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="font-queensides">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency" className="font-queensides">Currency</Label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as "SOL" | "SAMAA" }))}
                      required
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="SOL">SOL</option>
                      <option value="SAMAA">SAMAA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="font-queensides">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, category: e.target.value }))
                      // Reset sizes and colors when category changes
                      if (!isClothingCategory(e.target.value)) {
                        setSelectedSizes([])
                        setColors([])
                      }
                    }}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    <option value="Women's Clothes">Women's Clothes</option>
                    <option value="Men's Clothes">Men's Clothes</option>
                    <option value="Bride Fashion">Bride Fashion</option>
                    <option value="Groom Fashion">Groom Fashion</option>
                    <option value="Wedding Gifts">Wedding Gifts</option>
                    <option value="Arts & Crafts">Arts & Crafts</option>
                    <option value="Accessories">Accessories</option>
                    <option value="NFTs">NFTs</option>
                  </select>
                </div>

                {/* Size Selection - Only for clothing categories */}
                {isClothingCategory(formData.category) && (
                  <div>
                    <Label className="font-queensides">Available Sizes</Label>

                    {/* Standard Size Buttons */}
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`p-2 text-sm rounded-lg border transition-colors font-queensides ${
                            selectedSizes.includes(size)
                              ? 'bg-indigo-500 text-white border-indigo-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                    {/* Custom Size Input */}
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="Enter custom size (e.g., 32W, EU 42, One Size)"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomSize()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addCustomSize}
                        variant="outline"
                        className="px-4"
                      >
                        Add
                      </Button>
                    </div>

                    {/* Selected Sizes Display */}
                    {selectedSizes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedSizes.map((size, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-queensides"
                          >
                            <span>{size}</span>
                            <button
                              type="button"
                              onClick={() => toggleSize(size)}
                              className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center text-indigo-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2 font-queensides">
                      Select standard sizes or add custom sizes for this product
                    </p>
                  </div>
                )}

                {/* Color Selection - Only for clothing categories */}
                {isClothingCategory(formData.category) && (
                  <div>
                    <Label className="font-queensides">Available Colors</Label>
                    <div className="mt-2 space-y-3">
                      {/* Add Color Input */}
                      <div className="flex gap-2">
                        <Input
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          placeholder="Enter color name (e.g., Navy Blue, Red)"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addColor()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addColor}
                          variant="outline"
                          className="px-4"
                        >
                          Add
                        </Button>
                      </div>

                      {/* Selected Colors */}
                      {colors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-queensides"
                            >
                              <span>{color}</span>
                              <button
                                type="button"
                                onClick={() => removeColor(color)}
                                className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center text-indigo-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-queensides">
                      Add all colors available for this product
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 font-queensides"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-queensides"
                disabled={isLoading || uploadedImages.length === 0}
              >
                {isLoading ? "Adding Product..." : "Add Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
