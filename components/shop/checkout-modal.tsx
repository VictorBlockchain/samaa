"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/app/context/AuthContext"
import { 
  X, 
  CreditCard, 
  Truck, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock,
  Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CartItem, OrderService, CartService } from "@/lib/cart"
import { PromoService } from "@/lib/shop"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  totalAmount: number
  currency: 'USD'
  onSuccess: () => void
}

interface ShippingForm {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  notes: string
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  totalAmount, 
  currency,
  onSuccess 
}: CheckoutModalProps) {
  const { user, userId } = useAuth()
  const [currentStep, setCurrentStep] = useState<'shipping' | 'review' | 'processing' | 'success'>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    notes: ''
  })

  // Promo code state
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [appliedPromoId, setAppliedPromoId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email) {
      setShippingForm(prev => ({ ...prev, email: user.email || '' }))
    }
  }, [user])

  const updateShippingForm = (field: keyof ShippingForm, value: string) => {
    setShippingForm(prev => ({ ...prev, [field]: value }))
  }

  const validateShippingForm = (): boolean => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    return required.every(field => shippingForm[field as keyof ShippingForm].trim() !== '')
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }

    setIsApplyingPromo(true)
    setPromoError(null)

    try {
      const result = await PromoService.validatePromoCode(
        promoCode.trim(),
        totalAmount,
        cartItems.map(item => item.productId)
      )

      if (result.valid && result.promo_code) {
        setPromoDiscount(result.discount_amount)
        setAppliedPromoId(result.promo_code.id)
        setPromoError(null)
      } else {
        setPromoDiscount(0)
        setAppliedPromoId(null)
        setPromoError(result.error || 'Invalid promo code')
      }
    } catch (err: any) {
      setPromoError('Failed to validate promo code')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setPromoDiscount(0)
    setAppliedPromoId(null)
    setPromoError(null)
  }

  const finalTotal = totalAmount - promoDiscount

  const handleShippingNext = () => {
    if (!validateShippingForm()) {
      setError('Please fill in all required fields')
      return
    }
    setError(null)
    setCurrentStep('review')
  }

  const handlePlaceOrder = async () => {
    if (!userId) {
      setError('Please sign in to continue')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create order in Supabase
      const order = await OrderService.createOrder(
        userId,
        cartItems,
        shippingForm,
        {
          promoCodeId: appliedPromoId || undefined,
          promoDiscountAmount: promoDiscount
        }
      )

      if (!order) {
        throw new Error('Failed to create order')
      }

      setOrderId(order.id)

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: cartItems.map(item => ({
            productId: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.productImage
          })),
          totalAmount: finalTotal,
          shippingAddress: shippingForm,
          promoCode: promoCode,
          promoDiscount
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl
    } catch (error: any) {
      console.error('Order creation error:', error)
      setError(error.message || 'Failed to create order')
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-800 font-qurova">Checkout</h2>
              <p className="text-sm text-slate-600 font-queensides">
                Step {currentStep === 'shipping' ? '1' : currentStep === 'review' ? '2' : '3'} of 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Shipping Information */}
            {currentStep === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 font-queensides">Shipping Information</h3>
                    <p className="text-sm text-slate-600 font-queensides">Where should we send your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="font-queensides">Full Name *</Label>
                    <Input
                      value={shippingForm.fullName}
                      onChange={(e) => updateShippingForm('fullName', e.target.value)}
                      placeholder="John Doe"
                      className="font-queensides"
                    />
                  </div>

                  <div>
                    <Label className="font-queensides">Email *</Label>
                    <Input
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => updateShippingForm('email', e.target.value)}
                      placeholder="john@example.com"
                      className="font-queensides"
                    />
                  </div>

                  <div>
                    <Label className="font-queensides">Phone *</Label>
                    <Input
                      value={shippingForm.phone}
                      onChange={(e) => updateShippingForm('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="font-queensides"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="font-queensides">Address *</Label>
                    <Input
                      value={shippingForm.address}
                      onChange={(e) => updateShippingForm('address', e.target.value)}
                      placeholder="123 Main Street, Apt 4B"
                      className="font-queensides"
                    />
                  </div>

                  <div>
                    <Label className="font-queensides">City *</Label>
                    <Input
                      value={shippingForm.city}
                      onChange={(e) => updateShippingForm('city', e.target.value)}
                      placeholder="New York"
                      className="font-queensides"
                    />
                  </div>

                  <div>
                    <Label className="font-queensides">State *</Label>
                    <Input
                      value={shippingForm.state}
                      onChange={(e) => updateShippingForm('state', e.target.value)}
                      placeholder="NY"
                      className="font-queensides"
                    />
                  </div>

                  <div>
                    <Label className="font-queensides">ZIP Code *</Label>
                    <Input
                      value={shippingForm.zipCode}
                      onChange={(e) => updateShippingForm('zipCode', e.target.value)}
                      placeholder="10001"
                      className="font-queensides"
                    />
                  </div>

                  <div>
                    <Label className="font-queensides">Country *</Label>
                    <Input
                      value={shippingForm.country}
                      onChange={(e) => updateShippingForm('country', e.target.value)}
                      className="font-queensides"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="font-queensides">Delivery Notes (Optional)</Label>
                    <Textarea
                      value={shippingForm.notes}
                      onChange={(e) => updateShippingForm('notes', e.target.value)}
                      placeholder="Special delivery instructions..."
                      className="font-queensides"
                      rows={3}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm font-queensides">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleShippingNext}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-queensides"
                >
                  Continue to Review
                </Button>
              </motion.div>
            )}

            {/* Review & Promo Code */}
            {currentStep === 'review' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 font-queensides">Review & Payment</h3>
                    <p className="text-sm text-slate-600 font-queensides">Review your order and apply promo code</p>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-slate-800 font-queensides">Promo Code</h4>
                  </div>
                  
                  {!appliedPromoId ? (
                    <div className="flex space-x-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="font-queensides"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <Button
                        onClick={handleApplyPromo}
                        disabled={isApplyingPromo}
                        variant="outline"
                        className="font-queensides"
                      >
                        {isApplyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div>
                        <p className="font-semibold text-green-700 font-queensides">{promoCode}</p>
                        <p className="text-sm text-green-600">-${promoDiscount.toFixed(2)} discount applied</p>
                      </div>
                      <Button
                        onClick={handleRemovePromo}
                        variant="ghost"
                        size="sm"
                        className="text-green-700 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {promoError && (
                    <p className="text-sm text-red-600 font-queensides">{promoError}</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 font-queensides mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm font-queensides">
                        <span>{item.productName} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-sm font-queensides">
                        <span>Subtotal:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      {promoDiscount > 0 && (
                        <div className="flex justify-between text-sm font-queensides text-green-600">
                          <span>Discount:</span>
                          <span>-${promoDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold font-qurova pt-2 border-t">
                        <span>Total:</span>
                        <span>${finalTotal.toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Lock className="w-4 h-4" />
                  <span className="font-queensides">Secure payment powered by Stripe</span>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-red-600 text-sm font-queensides">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('shipping')}
                    className="flex-1 font-queensides"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-queensides"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Place Order & Pay
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Processing */}
            {currentStep === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-lg font-semibold text-slate-800 font-queensides mb-2">
                  Redirecting to Stripe...
                </h3>
                <p className="text-slate-600 font-queensides">
                  Please wait while we prepare your secure checkout
                </p>
              </motion.div>
            )}

            {/* Success */}
            {currentStep === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 font-queensides mb-2">
                  Payment Successful!
                </h3>
                <p className="text-slate-600 font-queensides mb-4">
                  Your order has been placed and will be processed soon.
                </p>
                {orderId && (
                  <p className="text-xs text-slate-500 font-queensides">
                    Order ID: {orderId}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
