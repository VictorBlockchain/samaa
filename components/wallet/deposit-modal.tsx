"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bitcoin, Copy, CheckCircle, Loader2, Clock, ExternalLink } from "lucide-react"

interface DepositModalProps {
  userId: string
  requiredSatoshis: number
  currentBalance: number
  description: string
  onSuccess: () => void
  onClose: () => void
}

interface DepositData {
  address: string
  amountSatoshis: number
  amountBTC: string
  expiresAt: string
}

export function DepositModal({ 
  userId, 
  requiredSatoshis, 
  currentBalance, 
  description,
  onSuccess, 
  onClose 
}: DepositModalProps) {
  const [depositData, setDepositData] = useState<DepositData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create deposit address
  useEffect(() => {
    const createDeposit = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/bitcoin/create-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            amountSatoshis: requiredSatoshis,
          }),
        })

        const result = await response.json()

        if (result.success) {
          setDepositData(result.data)
        } else {
          setError(result.error || 'Failed to create deposit')
        }
      } catch (error) {
        setError('Failed to create deposit')
        console.error('[deposit] Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    createDeposit()
  }, [userId, requiredSatoshis])

  // Countdown timer
  useEffect(() => {
    if (!depositData) return

    const timer = setInterval(() => {
      const expiresAt = new Date(depositData.expiresAt).getTime()
      const now = Date.now()
      const remaining = Math.floor((expiresAt - now) / 1000)

      if (remaining <= 0) {
        clearInterval(timer)
        setTimeLeft(0)
        setError('Deposit expired. Please try again.')
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [depositData])

  // Copy address
  const copyAddress = () => {
    if (!depositData) return
    navigator.clipboard.writeText(depositData.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Check deposit status
  const checkDeposit = async () => {
    if (!depositData) return

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch('/api/bitcoin/check-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requiredSatoshis,
        }),
      })

      const result = await response.json()

      if (result.success && result.deposited) {
        onSuccess()
      } else {
        setError('Payment not detected yet. Please wait and try again.')
      }
    } catch (error) {
      setError('Failed to check deposit status')
      console.error('[deposit] Error:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const deficit = requiredSatoshis - currentBalance
  const amountToDeposit = Math.ceil(deficit * 1.05) // Add 5% buffer for fees

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full"
      >
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bitcoin className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-queensides">Deposit Required</CardTitle>
            <CardDescription className="font-queensides">{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Balance Info */}
            <div className="bg-white/80 rounded-xl p-4 border border-amber-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-queensides">Current Balance:</span>
                <span className="font-mono font-medium">{(currentBalance / 100000000).toFixed(8)} BTC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-queensides">Required:</span>
                <span className="font-mono font-medium">{(requiredSatoshis / 100000000).toFixed(8)} BTC</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-amber-700 pt-2 border-t border-amber-100">
                <span className="font-queensides">Amount to Deposit:</span>
                <span className="font-mono">{(amountToDeposit / 100000000).toFixed(8)} BTC</span>
              </div>
              <p className="text-xs text-slate-500 font-queensides text-center">
                ({amountToDeposit.toLocaleString()} satoshis, includes 5% fee buffer)
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
                <p className="text-slate-600 font-queensides">Generating deposit address...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-700 font-queensides text-sm">{error}</p>
              </div>
            ) : depositData ? (
              <>
                {/* Timer */}
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                </div>

                {/* QR Code would go here - for now just address */}
                <div className="bg-white rounded-xl p-4 border-2 border-dashed border-amber-200">
                  <p className="text-xs text-slate-500 font-queensides mb-2 text-center">Send exactly to this address:</p>
                  <code className="block text-xs font-mono text-slate-700 break-all text-center">
                    {depositData.address}
                  </code>
                </div>

                {/* Copy Button */}
                <Button
                  onClick={copyAddress}
                  variant="outline"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Address Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </>
                  )}
                </Button>

                {/* Open in Wallet */}
                <a
                  href={`bitcoin:${depositData.address}?amount=${depositData.amountBTC}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-amber-800 font-queensides text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Bitcoin Wallet
                </a>

                {/* Check Payment Button */}
                <Button
                  onClick={checkDeposit}
                  disabled={isChecking}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'I\'ve Made the Deposit'
                  )}
                </Button>
              </>
            ) : null}
          </CardContent>

          <CardFooter>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
