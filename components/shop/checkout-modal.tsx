"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { 
  X, 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CartItem, OrderService, CartService } from "@/lib/cart"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  totalAmount: number
  currency: 'SOL' | 'SAMAA'
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
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'processing' | 'success'>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    notes: ''
  })

  const updateShippingForm = (field: keyof ShippingForm, value: string) => {
    setShippingForm(prev => ({ ...prev, [field]: value }))
  }

  const validateShippingForm = (): boolean => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    return required.every(field => shippingForm[field as keyof ShippingForm].trim() !== '')
  }

  const handleShippingNext = () => {
    if (!validateShippingForm()) {
      setError('Please fill in all required fields')
      return
    }
    setError(null)
    setCurrentStep('payment')
  }

  const handlePayment = async () => {
    if (!publicKey || !sendTransaction) {
      setError('Wallet not connected')
      return
    }

    setIsProcessing(true)
    setError(null)
    setCurrentStep('processing')

    try {
      // For SOL payments, create a transaction
      if (currency === 'SOL') {
        // In a real implementation, you would send to the seller's wallet
        // For demo purposes, we'll send to a demo wallet
        const demoSellerWallet = new PublicKey('11111111111111111111111111111112') // System program ID as demo
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: demoSellerWallet,
            lamports: Math.floor(totalAmount * LAMPORTS_PER_SOL), // Convert SOL to lamports
          })
        )

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        // Send transaction
        const signature = await sendTransaction(transaction, connection)
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed')
        
        setTxHash(signature)
      } else {
        // For SAMAA token payments, you would use SPL token transfer
        // For demo purposes, we'll simulate the transaction
        await new Promise(resolve => setTimeout(resolve, 2000))
        setTxHash('demo_samaa_transaction_hash')
      }

      // Create order in database
      const order = await OrderService.createOrder(
        publicKey.toString(),
        cartItems,
        shippingForm,
        currency
      )

      if (order && txHash) {
        // Update order with payment hash
        await OrderService.updateOrderStatus(order.id, 'paid', txHash)
      }

      // Clear cart
      CartService.clearCart(publicKey.toString())

      setCurrentStep('success')
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)

    } catch (error: any) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
      setCurrentStep('payment')
    } finally {
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
                Step {currentStep === 'shipping' ? '1' : currentStep === 'payment' ? '2' : '3'} of 3
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
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {/* Payment */}
            {currentStep === 'payment' && (
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
                    <h3 className="font-semibold text-slate-800 font-queensides">Payment</h3>
                    <p className="text-sm text-slate-600 font-queensides">Pay with your connected wallet</p>
                  </div>
                </div>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-queensides">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm font-queensides">
                          <span>{item.productName} x{item.quantity}</span>
                          <span>{(item.price * item.quantity).toFixed(4)} {item.currency}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold font-qurova">
                        <span>Total:</span>
                        <span>{totalAmount.toFixed(4)} {currency}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                    onClick={handlePayment}
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
                        Pay {totalAmount.toFixed(4)} {currency}
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
                  Processing Payment...
                </h3>
                <p className="text-slate-600 font-queensides">
                  Please confirm the transaction in your wallet
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
                {txHash && (
                  <p className="text-xs text-slate-500 font-queensides break-all">
                    Transaction: {txHash}
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
