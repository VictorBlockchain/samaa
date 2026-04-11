"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, X, Video, Loader2, Plus, Tag, DollarSign, Package, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/context/UserContext"
import { useAuth } from "@/app/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { useToast } from "@/hooks/use-toast"
import { ProductService } from "@/lib/shop"
import { ShopMediaService } from "@/lib/storage"
import { ShopService } from "@/lib/database"
import { supabase } from "@/lib/supabase"

const SHOP_CATEGORIES = [
  { value: 'bride_fashion', label: 'Bride Fashion', icon: '👰' },
  { value: 'groom_fashion', label: 'Groom Fashion', icon: '🤵' },
  { value: 'womens_fashion', label: "Women's Fashion", icon: '👗' },
  { value: 'mens_fashion', label: "Men's Fashion", icon: '👔' },
  { value: 'wedding_gifts', label: 'Wedding Gifts', icon: '🎁' },
  { value: 'accessories', label: 'Accessories', icon: '💍' },
  { value: 'islamic_art', label: 'Islamic Art', icon: '🖼️' },
  { value: 'home_decor', label: 'Home Decor', icon: '🏠' },
  { value: 'jewelry', label: 'Jewelry', icon: '💎' },
  { value: 'books_media', label: 'Books & Media', icon: '📚' },
  { value: 'beauty_personal_care', label: 'Beauty & Personal Care', icon: '✨' },
  { value: 'food_beverages', label: 'Food & Beverages', icon: '🍽️' },
  { value: 'other', label: 'Other', icon: '📦' }
]

const FASHION_CATEGORIES = ['bride_fashion', 'groom_fashion', 'womens_fashion', 'mens_fashion']
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "N/A"]
const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

interface ImageFile {
  file: File
  previewUrl: string
}

interface CategoryInfo {
  id: string
  category_type: string
}

export function AddProductView() {
  const router = useRouter()
  const { userId, isAuthenticated } = useUser()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const [shopId, setShopId] = useState<string | null>(null)
  const [shopLoading, setShopLoading] = useState(true)

  // Media state
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "",
    condition: "new",
    tags: "",
    requiresShipping: true,
    isDigital: false,
    sku: "",
    brand: "",
  })

  // Size & color state (for fashion categories)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState("")
  const [customSize, setCustomSize] = useState("")

  // Category IDs from DB
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const isFashionCategory = (category: string) => FASHION_CATEGORIES.includes(category)

  // Load user's shop on mount
  useEffect(() => {
    const loadShop = async () => {
      if (!userId) {
        setShopLoading(false)
        return
      }
      try {
        const shop = await ShopService.getShopByOwner(userId)
        if (shop) {
          setShopId(shop.id)
        }
      } catch (error) {
        console.error("Error loading shop:", error)
      } finally {
        setShopLoading(false)
      }
    }
    loadShop()
  }, [userId])

  // Load product categories from DB
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('product_categories')
          .select('id, category_type')
          .eq('is_active', true)

        if (!error && data) {
          const map: Record<string, string> = {}
          data.forEach((cat: CategoryInfo) => {
            map[cat.category_type] = cat.id
          })
          setCategoryMap(map)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }
    loadCategories()
  }, [])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imageFiles.forEach(img => URL.revokeObjectURL(img.previewUrl))
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    }
  }, [])

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  const addCustomSize = () => {
    const trimmed = customSize.trim()
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes(prev => [...prev, trimmed])
      setCustomSize("")
    }
  }

  const addColor = () => {
    const trimmed = newColor.trim()
    if (trimmed && !colors.includes(trimmed)) {
      setColors(prev => [...prev, trimmed])
      setNewColor("")
    }
  }

  const removeColor = (colorToRemove: string) => {
    setColors(prev => prev.filter(c => c !== colorToRemove))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages: ImageFile[] = []
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 50MB limit`, variant: "destructive" })
        continue
      }
      if (imageFiles.length + newImages.length >= 10) {
        toast({ title: "Max images reached", description: "You can upload up to 10 images", variant: "destructive" })
        break
      }
      newImages.push({ file, previewUrl: URL.createObjectURL(file) })
    }

    if (newImages.length > 0) {
      setImageFiles(prev => [...prev, ...newImages])
    }
    // Reset input so same file can be selected again
    if (e.target) e.target.value = ""
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast({ title: "Invalid file", description: "Please select a video file", variant: "destructive" })
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Video must be under 50MB", variant: "destructive" })
      return
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(file)
    setVideoPreviewUrl(URL.createObjectURL(file))
    if (e.target) e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
    setVideoFile(null)
    setVideoPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !userId) {
      toast({ title: "Sign in required", description: "Please sign in to add products", variant: "destructive" })
      return
    }

    if (!shopId) {
      toast({ title: "No shop found", description: "You need to create a shop first", variant: "destructive" })
      router.push("/shop?tab=myshop")
      return
    }

    if (imageFiles.length === 0) {
      toast({ title: "Images required", description: "Please upload at least one product image", variant: "destructive" })
      return
    }

    if (!formData.name.trim() || !formData.price || !formData.category) {
      toast({ title: "Missing fields", description: "Please fill in name, price, and category", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      // 1. Upload images to Supabase Storage
      setUploadProgress("Uploading images...")
      const uploadedImageUrls: string[] = []

      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(`Uploading image ${i + 1} of ${imageFiles.length}...`)
        const result = await ShopMediaService.uploadShopImage(imageFiles[i].file, shopId)
        if (result.success && result.path) {
          // Store the path (not signed URL) in the DB
          uploadedImageUrls.push(result.path)
        } else {
          toast({ title: "Upload failed", description: `Failed to upload image ${i + 1}: ${result.error}`, variant: "destructive" })
          setIsLoading(false)
          setUploadProgress("")
          return
        }
      }

      // 2. Upload video if present
      let videoPath: string | undefined
      if (videoFile) {
        setUploadProgress("Uploading video...")
        const videoResult = await ShopMediaService.uploadShopVideo(videoFile, shopId)
        if (videoResult.success && videoResult.path) {
          videoPath = videoResult.path
        } else {
          toast({ title: "Video upload failed", description: videoResult.error || "Failed to upload video", variant: "destructive" })
          // Continue without video - not a blocker
        }
      }

      // 3. Build tags array
      const tagsArray = formData.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0)

      // Add size and color tags for fashion items
      if (isFashionCategory(formData.category)) {
        selectedSizes.forEach(s => { if (!tagsArray.includes(`size:${s}`)) tagsArray.push(`size:${s}`) })
        colors.forEach(c => { if (!tagsArray.includes(`color:${c}`)) tagsArray.push(`color:${c}`) })
      }

      // 4. Build images JSONB — store paths, include video path if present
      const imagesJson = uploadedImageUrls.map(path => path)
      if (videoPath) {
        imagesJson.push(`video:${videoPath}`)
      }

      // 5. Resolve category_id from DB
      const categoryId = categoryMap[formData.category] || undefined

      // 6. Create product in Supabase
      setUploadProgress("Creating product...")
      const product = await ProductService.createProduct({
        shop_id: shopId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        base_price: parseFloat(formData.price),
        compare_at_price: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        category_id: categoryId,
        images: imagesJson,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        condition: formData.condition || undefined,
        requires_shipping: formData.requiresShipping,
        is_digital: formData.isDigital,
      })

      if (!product) {
        toast({ title: "Error", description: "Failed to create product. Please try again.", variant: "destructive" })
        setIsLoading(false)
        setUploadProgress("")
        return
      }

      // 7. Create product variants for fashion categories (size/color combos)
      setUploadProgress("Creating variants...")
      
      const variants: Array<{ title: string; sku?: string | null; price?: number }> = []
      
      if (isFashionCategory(formData.category) && (selectedSizes.length > 0 || colors.length > 0)) {
        const sizes = selectedSizes.length > 0 ? selectedSizes : ["One Size"]
        const colorList = colors.length > 0 ? colors : ["Default"]

        for (const size of sizes) {
          for (const color of colorList) {
            variants.push({
              title: `${size} / ${color}`,
              sku: formData.sku ? `${formData.sku}-${size}-${color}`.replace(/\s/g, '') : null,
              price: parseFloat(formData.price),
            })
          }
        }
      } else {
        // Create a default variant for non-fashion products
        variants.push({
          title: 'Standard',
          sku: formData.sku || null,
          price: parseFloat(formData.price),
        })
      }

      // Use API route to create variants (bypasses RLS)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const variantsResponse = await fetch('/api/shop/create-variants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              product_id: product.id,
              variants,
            }),
          })

          const variantsResult = await variantsResponse.json()
          if (!variantsResponse.ok) {
            console.error('Error creating variants:', variantsResult.error)
          }
        }
      } catch (err) {
        console.error('Error creating variants:', err)
      }

      toast({ title: "Product added!", description: `${formData.name} has been added to your shop` })
      router.push("/shop?tab=myshop")
    } catch (error) {
      console.error("Error adding product:", error)
      toast({ title: "Error", description: "Failed to add product. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setUploadProgress("")
    }
  }

  // Loading state
  if (shopLoading) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground intensity="light" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground intensity="light" />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-800 font-qurova mb-4">Sign In Required</h2>
            <p className="text-slate-600 font-queensides mb-6">
              Please sign in to add products to your shop.
            </p>
            <Button
              onClick={() => router.push("/auth/login")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
            >
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // No shop found
  if (!shopId) {
    return (
      <div className="min-h-screen relative">
        <CelestialBackground intensity="light" />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-slate-800 font-qurova mb-4">Create a Shop First</h2>
            <p className="text-slate-600 font-queensides mb-6">
              You need to create a shop before adding products.
            </p>
            <Button
              onClick={() => router.push("/shop?tab=myshop")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-queensides"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to My Shop
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
              <p className="text-sm text-slate-600 font-queensides">Create a new listing</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto p-4 pb-32">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Product Images */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 font-qurova mb-1 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                Product Images
              </h3>
              <p className="text-xs text-slate-500 font-queensides mb-4">Upload up to 10 images. First image is the main photo.</p>

              <div className="mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                  disabled={imageFiles.length >= 10}
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                    <p className="text-indigo-600 font-queensides">
                      {imageFiles.length >= 10 ? "Max 10 images reached" : "Click to upload images"}
                    </p>
                    <p className="text-xs text-slate-500 font-queensides">PNG, JPG, WEBP up to 50MB each</p>
                  </div>
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imageFiles.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group aspect-square"
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-indigo-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-indigo-600 text-white px-2 py-0.5 rounded text-xs font-queensides">
                          Main
                        </div>
                      )}
                      {index > 0 && (
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white px-2 py-0.5 rounded text-xs font-queensides">
                          {index + 1}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            {/* Product Video */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 font-qurova mb-1 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-500" />
                Product Video
                <span className="text-xs font-normal text-slate-400 font-queensides">(Optional)</span>
              </h3>
              <p className="text-xs text-slate-500 font-queensides mb-4">Add a video showcasing your product</p>

              {!videoPreviewUrl ? (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-purple-300 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 transition-colors"
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
                    accept="video/mp4,video/webm"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full h-48 object-cover rounded-lg border border-purple-200"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </Card>

            {/* Product Details */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-500" />
                Product Details
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="font-queensides">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                    className="mt-1"
                    maxLength={255}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-queensides">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product in detail..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="font-queensides">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, category: e.target.value }))
                      if (!isFashionCategory(e.target.value)) {
                        setSelectedSizes([])
                        setColors([])
                      }
                    }}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Select category</option>
                    {SHOP_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="font-queensides flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Price (USD) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comparePrice" className="font-queensides">Compare at Price</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                      placeholder="Original price"
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-400 mt-1 font-queensides">Show as sale price if set</p>
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <Label htmlFor="condition" className="font-queensides">Condition</Label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {CONDITION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* SKU & Brand */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku" className="font-queensides">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Optional"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand" className="font-queensides">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Optional"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="font-queensides flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Tags
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="wedding, elegant, white (comma separated)"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-400 mt-1 font-queensides">Separate tags with commas to help buyers find your product</p>
                </div>

                {/* Shipping & Digital toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requiresShipping}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresShipping: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-queensides text-slate-700">Requires Shipping</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDigital}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDigital: e.target.checked, requiresShipping: e.target.checked ? false : formData.requiresShipping }))}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-queensides text-slate-700">Digital Product</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Size & Color Selection - Fashion categories only */}
            {isFashionCategory(formData.category) && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-800 font-qurova mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-pink-500" />
                  Sizes & Colors
                </h3>

                {/* Sizes */}
                <div className="mb-6">
                  <Label className="font-queensides">Available Sizes</Label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {AVAILABLE_SIZES.map((size) => (
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

                  <div className="mt-3 flex gap-2">
                    <Input
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder="Custom size (e.g., 32W, EU 42)"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addCustomSize() }
                      }}
                    />
                    <Button type="button" onClick={addCustomSize} variant="outline" className="px-4">
                      Add
                    </Button>
                  </div>

                  {selectedSizes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedSizes.map((size) => (
                        <div key={size} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-queensides">
                          <span>{size}</span>
                          <button type="button" onClick={() => toggleSize(size)} className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center text-indigo-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div>
                  <Label className="font-queensides">Available Colors</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Color name (e.g., Navy Blue)"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addColor() }
                      }}
                    />
                    <Button type="button" onClick={addColor} variant="outline" className="px-4">
                      Add
                    </Button>
                  </div>

                  {colors.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <div key={color} className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm font-queensides">
                          <span>{color}</span>
                          <button type="button" onClick={() => removeColor(color)} className="w-4 h-4 rounded-full bg-pink-200 hover:bg-pink-300 flex items-center justify-center text-pink-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2 font-queensides">
                    Variants will be created for each size/color combination
                  </p>
                </div>
              </Card>
            )}

            {/* Category-specific hints */}
            {formData.category && !isFashionCategory(formData.category) && (
              <Card className="p-4 bg-indigo-50/50 border-indigo-200/50">
                <p className="text-sm text-indigo-700 font-queensides">
                  {formData.category === 'jewelry' && "Tip: Include material type, gemstone details, and dimensions in your description."}
                  {formData.category === 'wedding_gifts' && "Tip: Mention if the item can be personalized or gift-wrapped."}
                  {formData.category === 'islamic_art' && "Tip: Include art medium, dimensions, and framing options in your description."}
                  {formData.category === 'home_decor' && "Tip: Include dimensions, material, and care instructions."}
                  {formData.category === 'books_media' && "Tip: Include author, publisher, edition, and language details."}
                  {formData.category === 'beauty_personal_care' && "Tip: List ingredients, skin type suitability, and certifications (halal, organic)."}
                  {formData.category === 'food_beverages' && "Tip: Include ingredients, dietary info (halal certified), and shelf life."}
                  {formData.category === 'accessories' && "Tip: Include material, dimensions, and care instructions."}
                  {formData.category === 'other' && "Tip: Be as descriptive as possible to help buyers understand your product."}
                </p>
              </Card>
            )}

            {/* Submit */}
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
                disabled={isLoading || imageFiles.length === 0}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadProgress || "Adding..."}
                  </span>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
