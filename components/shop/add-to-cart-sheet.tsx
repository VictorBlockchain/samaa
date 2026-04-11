"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddToCartSheetProduct {
  id: string
  name: string
  images: string[]
  price: number
  currency?: string
  sizes?: string[]
  colors?: string[]
}

interface AddToCartSheetProps {
  product: AddToCartSheetProduct
  isOpen: boolean
  onClose: () => void
  onConfirm: (quantity: number, size?: string, color?: string) => void
  loading?: boolean
  initialSize?: string
  initialColor?: string
  initialQuantity?: number
}

export function AddToCartSheet({
  product,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  initialSize = "",
  initialColor = "",
  initialQuantity = 1,
}: AddToCartSheetProps) {
  const [selectedSize, setSelectedSize] = useState(initialSize)
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [quantity, setQuantity] = useState(initialQuantity)

  const hasSizes = product.sizes && product.sizes.length > 0
  const hasColors = product.colors && product.colors.length > 0
  const totalPrice = (product.price * quantity).toFixed(2)

  const canConfirm = (!hasSizes || selectedSize) && (!hasColors || selectedColor)

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm(quantity, selectedSize || undefined, selectedColor || undefined)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Close button */}
            <div className="flex justify-end px-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-pink-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-6 pb-8">
              {/* Product info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 flex-shrink-0">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 font-queensides text-lg line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-pink-600 font-bold font-queensides text-xl mt-1">
                    ${product.price} {product.currency && product.currency !== "USD" ? product.currency : ""}
                  </p>
                </div>
              </div>

              {/* Sizes */}
              {hasSizes && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-700 font-queensides mb-3 uppercase tracking-wide">
                    Size {!selectedSize && <span className="text-rose-500">*</span>}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes!.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 font-queensides font-medium ${
                          selectedSize === size
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg shadow-pink-200"
                            : "bg-white text-slate-700 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {hasColors && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-slate-700 font-queensides mb-3 uppercase tracking-wide">
                    Color {!selectedColor && <span className="text-rose-500">*</span>}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.colors!.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 font-queensides font-medium ${
                          selectedColor === color
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500 shadow-lg shadow-pink-200"
                            : "bg-white text-slate-700 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 font-queensides mb-3 uppercase tracking-wide">
                  Quantity
                </h4>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-bold text-xl text-slate-800 font-queensides">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <div className="flex-1 text-right">
                    <p className="text-xs text-slate-500 font-queensides uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-pink-600 font-queensides">${totalPrice}</p>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirm}
                disabled={!canConfirm || loading}
                className="w-full py-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-queensides"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart — ${totalPrice}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
