"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  X,
  ExternalLink,
  MapPin,
  Calendar,
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CelestialBackground } from "@/components/ui/celestial-background"
import { OrderService, Order } from "@/lib/cart"

export default function OrdersPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [publicKey])

  const loadOrders = async () => {
    if (!publicKey) {
      setOrders([])
      setIsLoading(false)
      return
    }

    try {
      const userOrders = await OrderService.getUserOrders(publicKey.toString())
      setOrders(userOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <Package className="w-4 h-4" />
      case 'cancelled':
        return <X className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        <CelestialBackground intensity="medium" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md">
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 font-qurova mb-2">Connect Your Wallet</h2>
            <p className="text-slate-600 font-queensides mb-4">
              Please connect your wallet to view your order history
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
            <p className="text-slate-600 font-queensides">Loading your orders...</p>
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
                <h1 className="text-2xl font-bold text-slate-800 font-qurova">My Orders</h1>
                <p className="text-sm text-slate-600 font-queensides">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </p>
              </div>
              
              <div className="w-16" />
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto px-6 pb-12">
          {orders.length === 0 ? (
            // No Orders
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-qurova mb-4">No orders yet</h2>
              <p className="text-slate-600 font-queensides mb-8 max-w-md mx-auto">
                You haven't placed any orders yet. Start shopping to see your order history here!
              </p>
              <Button
                onClick={() => router.push('/shop')}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 font-queensides"
              >
                Start Shopping
              </Button>
            </motion.div>
          ) : (
            // Orders List
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-qurova text-lg">
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 font-queensides mt-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CreditCard className="w-4 h-4" />
                              <span>{order.totalAmount.toFixed(4)} {order.currency}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {/* Order Items */}
                      <div className="space-y-3 mb-6">
                        {order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-800 font-queensides truncate">
                                {item.productName}
                              </h4>
                              <p className="text-sm text-slate-600 font-queensides">
                                Qty: {item.quantity} • {item.price} {item.currency}
                              </p>
                              {(item.selectedSize || item.selectedColor) && (
                                <p className="text-xs text-slate-500 font-queensides">
                                  {item.selectedSize && `Size: ${item.selectedSize}`}
                                  {item.selectedSize && item.selectedColor && ' • '}
                                  {item.selectedColor && `Color: ${item.selectedColor}`}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="mb-6">
                          <h4 className="font-medium text-slate-800 font-queensides mb-2 flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Shipping Address
                          </h4>
                          <div className="bg-slate-50 p-3 rounded-lg text-sm font-queensides">
                            <p className="font-medium">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        </div>
                      )}

                      {/* Transaction Hash */}
                      {order.paymentTxHash && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-queensides">Transaction:</span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {order.paymentTxHash.slice(0, 16)}...
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`https://explorer.solana.com/tx/${order.paymentTxHash}`, '_blank')}
                              className="p-1 h-auto"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
