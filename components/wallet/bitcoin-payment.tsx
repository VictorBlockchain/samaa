"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bitcoin, 
  Copy, 
  CheckCircle, 
  Clock, 
  Loader2, 
  ExternalLink,
  AlertCircle,
  Timer
} from "lucide-react"

interface BitcoinPaymentProps {
  userId: string
  paymentType: "subscription" | "views" | "leads"
  amountUSD: number
  description: string
  onSuccess?: () => void
}

interface PaymentData {
  paymentId: string
  bitcoinAddress: string
  amountSatoshis: number
  amountBTC: string
  amountUSD: number
  btcPrice: number
  bitcoinURI: string
  expiresAt: string
  paymentType: string
  subscriptionMonths: number
  viewsAmount: number
  leadsAmount: number
}

export function BitcoinPayment({ 
  userId, 
  paymentType, 
  amountUSD, 
  description,
  onSuccess 
}: BitcoinPaymentProps) {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create payment
  useEffect(() => {
    const createPayment = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/bitcoin/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            paymentType,
            amount: amountUSD,
          }),
        })

        const result = await response.json()

        if (result.success) {
          setPaymentData(result.data)
        } else {
          setError(result.error || 'Failed to create payment')
        }
      } catch (error) {
        setError('Failed to create payment')
        console.error('[bitcoin-payment] Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    createPayment()
  }, [userId, paymentType, amountUSD])

  // Countdown timer
  useEffect(() => {
    if (!paymentData) return

    const timer = setInterval(() => {
      const expiresAt = new Date(paymentData.expiresAt).getTime()
      const now = Date.now()
      const remaining = Math.floor((expiresAt - now) / 1000)

      if (remaining <= 0) {
        clearInterval(timer)
        setTimeLeft(0)
        setError('Payment expired. Please try again.')
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentData])

  // Copy address to clipboard
  const copyAddress = useCallback(() => {
    if (!paymentData) return

    navigator.clipboard.writeText(paymentData.bitcoinAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [paymentData])

  // Check payment status
  const checkPayment = async () => {
    if (!paymentData) return

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch('/api/bitcoin/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
        }),
      })

      const result = await response.json()

      if (result.success && result.paid) {
        // Payment confirmed!
        setPaymentData(null)
        
        // Show success message
        alert(`✅ Payment confirmed!\n\nTransaction: ${result.txid}\n\nRedirecting to wallet...`)
        
        // Redirect to wallet success page
        router.push(`/wallet/success?type=${result.paymentType}&txid=${result.txid}`)
        
        if (onSuccess) {
          onSuccess()
        }
      } else if (result.expired) {
        setError('Payment expired. Please try again.')
      } else {
        setError('Payment not yet detected. Please wait and try again.')
      }
    } catch (error) {
      setError('Failed to check payment status')
      console.error('[bitcoin-payment] Error checking payment:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 font-queensides">Generating payment address...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !paymentData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 font-queensides mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!paymentData) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-indigo-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bitcoin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-queensides">Pay with Bitcoin</CardTitle>
          <CardDescription className="font-queensides">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment amount */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
            <div className="text-center">
              <p className="text-sm text-slate-600 font-queensides mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold text-orange-600 font-queensides">
                {paymentData.amountBTC} BTC
              </p>
              <p className="text-sm text-slate-500 mt-1">
                ≈ ${paymentData.amountUSD.toFixed(2)} USD
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ({paymentData.amountSatoshis.toLocaleString()} satoshis)
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Timer className="w-5 h-5" />
            <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-indigo-200">
            <div className="flex justify-center">
              <QRCodeSVG
                value={paymentData.bitcoinURI}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-center text-slate-500 mt-2 font-queensides">
              Scan with your Bitcoin wallet
            </p>
          </div>

          {/* Bitcoin Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 font-queensides">
              Payment Address
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono break-all">
                {paymentData.bitcoinAddress}
              </code>
              <Button
                size="icon"
                variant="outline"
                onClick={copyAddress}
                className="shrink-0"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* What you get */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-sm font-medium text-indigo-900 font-queensides mb-2">
              You will receive:
            </p>
            {paymentData.paymentType === 'subscription' && (
              <Badge className="bg-indigo-100 text-indigo-700">
                {paymentData.subscriptionMonths === 12 ? '1 Year' : '1 Month'} Premium Subscription
              </Badge>
            )}
            {paymentData.paymentType === 'views' && (
              <Badge className="bg-indigo-100 text-indigo-700">
                {paymentData.viewsAmount} Profile Views
              </Badge>
            )}
            {paymentData.paymentType === 'leads' && (
              <Badge className="bg-indigo-100 text-indigo-700">
                {paymentData.leadsAmount} Lead Messages
              </Badge>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 font-queensides text-center">{error}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={checkPayment}
            disabled={isChecking || timeLeft === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-queensides"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking Payment...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Check Payment
              </>
            )}
          </Button>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 font-queensides"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-queensides"
              onClick={() => {
                window.open(`https://blockstream.info/address/${paymentData.bitcoinAddress}`, '_blank')
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          </div>

          <p className="text-xs text-center text-slate-500 font-queensides">
            Payment will be confirmed automatically after 1 confirmation
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
