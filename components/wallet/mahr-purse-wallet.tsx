"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Bitcoin, 
  Copy, 
  CheckCircle, 
  Calendar as CalendarIcon,
  Loader2,
  Eye,
  Heart,
  Wallet,
  Lock,
  Unlock,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface MahrPurseWalletProps {
  userId: string
  userGender: string
  userType: 'mahr' | 'purse'
  onSuccess?: () => void
}

interface WalletData {
  address: string
  balanceSatoshis: number
  unlockDate: string | null
  isActive: boolean
  redeemScriptEncrypted: string | null
}

export function MahrPurseWallet({ userId, userGender, userType, onSuccess }: MahrPurseWalletProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("12:00")
  const [dateError, setDateError] = useState<string>("")

  const isMahr = userType === 'mahr'
  const title = isMahr ? "Mahr Wallet" : "Purse Wallet"
  const description = isMahr 
    ? "Show your readiness for marriage commitment with a timelocked Bitcoin wallet"
    : "Show your financial savviness with a timelocked Bitcoin purse"
  const icon = isMahr ? Heart : Wallet
  const color = isMahr ? "from-pink-500 to-rose-600" : "from-purple-500 to-indigo-600"

  // Fetch wallet data
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch(`/api/mahr-purse/wallet?userId=${userId}&type=${userType}`)
        const result = await response.json()

        if (result.success && result.data) {
          setWalletData(result.data)
        }
      } catch (error) {
        console.error('[mahr-purse] Error fetching wallet:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWallet()
  }, [userId, userType])

  // Validate date selection
  const validateDate = (date: Date) => {
    const now = new Date()
    const tenYearsFromNow = new Date()
    tenYearsFromNow.setFullYear(now.getFullYear() + 10)

    if (date <= now) {
      setDateError("Date must be in the future")
      return false
    }

    if (date > tenYearsFromNow) {
      setDateError("Date cannot be more than 10 years from today")
      return false
    }

    setDateError("")
    return true
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value
    if (!dateStr) {
      setSelectedDate(undefined)
      setDateError("")
      return
    }

    const [year, month, day] = dateStr.split('-').map(Number)
    const timeParts = selectedTime.split(':').map(Number)
    const newDate = new Date(year, month - 1, day, timeParts[0], timeParts[1])
    
    setSelectedDate(newDate)
    validateDate(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value
    setSelectedTime(timeStr)

    if (selectedDate) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const [year, month, day] = [
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      ]
      const newDate = new Date(year, month, day, hours, minutes)
      setSelectedDate(newDate)
      validateDate(newDate)
    }
  }

  // Create wallet
  const handleCreateWallet = async () => {
    if (!selectedDate) {
      setDateError('Please select a valid unlock date and time')
      return
    }

    if (!validateDate(selectedDate)) {
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/mahr-purse/create-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userType,
          unlockDate: selectedDate.toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setWalletData(result.data)
        // Notify parent component to refresh
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const errorMsg = result.error || 'Unknown error occurred'
        console.error('[mahr-purse] Wallet creation failed:', errorMsg)
        console.error('[mahr-purse] Response status:', response.status)
        setDateError(`Error creating wallet: ${errorMsg}`)
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network or server error'
      console.error('[mahr-purse] Exception during wallet creation:', error)
      setDateError(`Failed to create wallet: ${errorMsg}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Copy address
  const copyAddress = () => {
    if (!walletData?.address) return

    navigator.clipboard.writeText(walletData.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format balance
  const formatBalance = (satoshis: number) => {
    const btc = satoshis / 100000000
    return btc.toFixed(8)
  }

  // Calculate time until unlock
  const getTimeUntilUnlock = () => {
    if (!walletData?.unlockDate) return null

    const unlock = new Date(walletData.unlockDate)
    const now = new Date()
    const diff = unlock.getTime() - now.getTime()

    if (diff <= 0) return "Unlocked"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} days ${hours} hours`
    return `${hours} hours`
  }

  // Check if unlocked
  const isUnlocked = walletData?.unlockDate ? new Date(walletData.unlockDate) <= new Date() : false

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 font-queensides">Loading wallet...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show creation form if no wallet
  if (!walletData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-2 border-indigo-200">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {React.createElement(icon, { className: "w-8 h-8 text-white" })}
            </div>
            <CardTitle className="text-2xl font-queensides">{title}</CardTitle>
            <CardDescription className="font-queensides">{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <h4 className="font-medium text-indigo-900 font-queensides mb-2">Why create a {isMahr ? 'Mahr' : 'Purse'} wallet?</h4>
              <ul className="space-y-2 text-sm text-indigo-700">
                {isMahr ? (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Show your readiness for marriage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Demonstrate financial commitment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Visible on your profile to potential matches</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Show your financial savviness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Demonstrate independence and planning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Stand out to serious suitors</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Date and time picker */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 font-queensides mb-2 block">
                  Unlock Date & Time (when funds become accessible)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-queensides">Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      max={(() => {
                        const maxDate = new Date()
                        maxDate.setFullYear(maxDate.getFullYear() + 10)
                        return maxDate.toISOString().split('T')[0]
                      })()}
                      onChange={handleDateChange}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-queensides text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-queensides">Time</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={handleTimeChange}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg font-queensides text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                {dateError && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" />
                    {dateError}
                  </p>
                )}
                {selectedDate && !dateError && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                    <CheckCircle className="w-3 h-3" />
                    Selected: {format(selectedDate, "PPP p")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleCreateWallet}
              disabled={!selectedDate || isCreating}
              className={`w-full bg-gradient-to-r ${color} text-white font-queensides`}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Create {title}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  // Show wallet info
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-indigo-200">
        <CardHeader className="text-center">
          <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {React.createElement(icon, { className: "w-8 h-8 text-white" })}
          </div>
          <CardTitle className="text-2xl font-queensides">{title}</CardTitle>
          <Badge className={isUnlocked ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
            {isUnlocked ? (
              <><Unlock className="w-3 h-3 mr-1" /> Unlocked</>
            ) : (
              <><Lock className="w-3 h-3 mr-1" /> Timelocked</>
            )}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Balance */}
          <div className={`bg-gradient-to-r ${color} rounded-xl p-4 text-white`}>
            <div className="text-center">
              <p className="text-sm opacity-90 font-queensides mb-1">Balance</p>
              <p className="text-3xl font-bold font-mono">
                {formatBalance(walletData.balanceSatoshis)} BTC
              </p>
              <p className="text-sm opacity-75 mt-1">
                {walletData.balanceSatoshis.toLocaleString()} satoshis
              </p>
            </div>
          </div>

          {/* Unlock date */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-500 font-queensides">Unlock Date</p>
                  <p className="font-medium text-slate-800 font-queensides">
                    {walletData.unlockDate ? format(new Date(walletData.unlockDate), "PPP") : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-queensides">Time Left</p>
                <p className="font-medium text-amber-600 font-queensides flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {getTimeUntilUnlock()}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-indigo-200">
            <div className="flex justify-center">
              <QRCodeSVG
                value={walletData.address || ''}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-center text-slate-500 mt-2 font-queensides">
              {isMahr ? 'Mahr' : 'Purse'} Wallet Address
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 font-queensides">
              Wallet Address
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono break-all">
                {walletData.address}
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

          {/* Info box */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-sm text-indigo-700 font-queensides">
                {isMahr ? (
                  <>
                    <p className="font-medium mb-1">Commitment Signal</p>
                    <p>Your Mahr wallet is visible on your profile, showing potential matches your readiness for marriage.</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-1">Financial Independence</p>
                    <p>Your Purse demonstrates financial planning and independence to serious suitors.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <p className="text-xs text-center text-slate-500 font-queensides">
            Funds are timelocked and cannot be accessed until the unlock date
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
