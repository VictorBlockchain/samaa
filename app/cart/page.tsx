"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { CartService, CartItem, ExchangeRateService } from "@/lib/cart"
import { CheckoutModal } from "@/components/shop/checkout-modal"

export default function CartPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'SOL' | 'SAMAA'>('SOL')
  
  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notes: ''
  })

  useEffect(() => {
    loadCartItems()
  }, [publicKey])

  const loadCartItems = () => {
    if (!publicKey) {
      setCartItems([])
      setIsLoading(false)
      return
    }

    const items = CartService.getCartItems(publicKey.toString())
    setCartItems(items)
    setIsLoading(false)
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (!publicKey) return

    const success = CartService.updateCartItemQuantity(publicKey.toString(), itemId, newQuantity)
    if (success) {
      loadCartItems()
    }
  }

  const removeItem = (itemId: string) => {
    if (!publicKey) return

    const success = CartService.removeFromCart(publicKey.toString(), itemId)
    if (success) {
      loadCartItems()
    }
  }

  const clearCart = () => {
    if (!publicKey) return

    const success = CartService.clearCart(publicKey.toString())
    if (success) {
      loadCartItems()
    }
  }

  const totals = CartService.getCartTotal(cartItems)
  const totalInSelectedCurrency = selectedCurrency === 'SOL' 
    ? totals.SOL + ExchangeRateService.convertBetweenCrypto(totals.SAMAA, 'SAMAA', 'SOL')
    : totals.SAMAA + ExchangeRateService.convertBetweenCrypto(totals.SOL, 'SOL', 'SAMAA')

  const totalUSD = ExchangeRateService.convertToUSD(totalInSelectedCurrency, selectedCurrency)

  const handleCheckout = () => {
    if (!connected) {
      alert("Please connect your wallet to proceed with checkout")
      return
    }
    setShowCheckout(true)
  }

  const handleCheckoutSuccess = () => {
    // Reload cart items after successful checkout
    loadCartItems()
    setShowCheckout(false)
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        <CelestialBackground intensity="medium" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md">
            <ShoppingCart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 font-qurova mb-2">Connect Your Wallet</h2>
            <p className="text-slate-600 font-queensides mb-4">
              Please connect your wallet to view your shopping cart
            </p>
            <Button onClick={() => router.push('/')} className="font-queensides">
              Go Home
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        <CelestialBackground intensity="medium" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-queensides">Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 glass-nav border-b border-indigo-100/30 mb-8"
        >
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.button
                onClick={() => router.back()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium font-queensides">Back</span>
              </motion.button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800 font-qurova">Shopping Cart</h1>
                <p className="text-sm text-slate-600 font-queensides">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              
              <div className="w-16" />
            </div>
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto px-6 pb-12">
          {cartItems.length === 0 ? (
            // Empty Cart
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-4">Your cart is empty</h2>
              <p className="text-slate-600 font-queensides mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
              </p>
              <Button
                onClick={() => router.push('/shop')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-queensides"
              >
                Start Shopping
              </Button>
            </motion.div>
          ) : (
            // Cart with Items
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800 font-qurova">Cart Items</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 border-red-200 hover:bg-red-50 font-queensides"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>

                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-xl p-6"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 font-queensides mb-1 truncate">
                            {item.productName}
                          </h3>
                          <p className="text-sm text-slate-600 font-queensides mb-2">
                            by {item.shopName}
                          </p>
                          
                          {/* Size and Color */}
                          {(item.selectedSize || item.selectedColor) && (
                            <div className="flex items-center space-x-4 text-xs text-slate-500 font-queensides mb-2">
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            </div>
                          )}

                          {/* Price */}
                          <div className="text-lg font-bold text-indigo-600 font-qurova">
                            {item.price} {item.currency}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-qurova">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Currency Selection */}
                    <div>
                      <Label className="font-queensides mb-2 block">Payment Currency</Label>
                      <Select value={selectedCurrency} onValueChange={(value: 'SOL' | 'SAMAA') => setSelectedCurrency(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                          <SelectItem value="SAMAA">SAMAA Token</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 py-4 border-t border-slate-200">
                      <div className="flex justify-between text-sm font-queensides">
                        <span>Subtotal:</span>
                        <span>{totalInSelectedCurrency.toFixed(4)} {selectedCurrency}</span>
                      </div>
                      <div className="flex justify-between text-sm font-queensides text-slate-600">
                        <span>USD Value:</span>
                        <span>${totalUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold font-qurova pt-2 border-t border-slate-200">
                        <span>Total:</span>
                        <span>{totalInSelectedCurrency.toFixed(4)} {selectedCurrency}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-queensides"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceed to Checkout
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => router.push('/shop')}
                      className="w-full font-queensides"
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartItems={cartItems}
        totalAmount={totalInSelectedCurrency}
        currency={selectedCurrency}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}
