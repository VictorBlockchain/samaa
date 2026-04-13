"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Bitcoin, ArrowUpRight, Loader2, CheckCircle, Copy, ExternalLink, AlertCircle, Wallet } from "lucide-react"

interface WithdrawModalProps {
  userId: string
  walletType: "main" | "mahr" | "purse"
  balanceSatoshis: number
  address: string
  onSuccess: () => void
  onClose: () => void
}

export function WithdrawModal({ userId, walletType, balanceSatoshis, address, onSuccess, onClose }: WithdrawModalProps) {
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [txId, setTxId] = useState("")
  const [btcPrice, setBtcPrice] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchBTCPrice()
  }, [])

  const fetchBTCPrice = async () => {
    try {
      const response = await fetch('/api/bitcoin/price')
      const data = await response.json()
      if (data.success) {
        setBtcPrice(data.data.price)
      }
    } catch (error) {
      console.error('Failed to fetch BTC price:', error)
    }
  }

  const formatBtc = (satoshis: number) => {
    return (satoshis / 100000000).toFixed(8)
  }

  const satoshisToUSD = (satoshis: number) => {
    return ((satoshis / 100000000) * btcPrice).toFixed(2)
  }

  const balanceBTC = balanceSatoshis / 100000000
  const withdrawSatoshis = withdrawAmount ? Math.floor(parseFloat(withdrawAmount) * 100000000) : 0
  const isValidAmount = withdrawSatoshis > 0 && withdrawSatoshis <= balanceSatoshis
  const isValidAddress = withdrawAddress.length > 20 && (withdrawAddress.startsWith('1') || withdrawAddress.startsWith('3') || withdrawAddress.startsWith('bc1') || withdrawAddress.startsWith('tb1'))

  const handleWithdraw = async () => {
    if (!isValidAmount || !isValidAddress) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid amount and Bitcoin address",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/bitcoin/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          walletType,
          fromAddress: address,
          toAddress: withdrawAddress,
          amountSatoshis: withdrawSatoshis,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTxId(result.data.txId)
        setIsSuccess(true)
        toast({
          title: "✅ Withdrawal Successful!",
          description: `Successfully withdrew ${formatBtc(withdrawSatoshis)} BTC`,
        })
        onSuccess()
      } else {
        toast({
          title: "Withdrawal Failed",
          description: result.error || 'Failed to process withdrawal',
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('[withdraw] Error:', error)
      toast({
        title: "Withdrawal Failed",
        description: error.message || 'Failed to process withdrawal',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMax = () => {
    // Reserve 2000 satoshis for network fee
    const maxAmount = Math.max(0, balanceSatoshis - 2000)
    setWithdrawAmount((maxAmount / 100000000).toFixed(8))
  }

  const getWalletTitle = () => {
    switch (walletType) {
      case "main": return "Bitcoin Wallet"
      case "mahr": return "Mahr Wallet"
      case "purse": return "Purse Wallet"
    }
  }

  const getWalletColor = () => {
    switch (walletType) {
      case "main": return "from-amber-500 to-orange-600"
      case "mahr": return "from-pink-500 to-rose-600"
      case "purse": return "from-purple-500 to-indigo-600"
    }
  }

  const getNetworkUrl = () => {
    const isTestnet = process.env.NODE_ENV !== 'production'
    return isTestnet 
      ? `https://blockstream.info/testnet/tx/${txId}`
      : `https://blockstream.info/tx/${txId}`
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-queensides mb-2">Withdrawal Successful!</h2>
          <p className="text-sm opacity-90 font-queensides">Your BTC has been sent</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="text-center">
              <p className="text-sm text-emerald-600 font-queensides mb-1">Amount Sent</p>
              <p className="text-3xl font-bold font-mono text-emerald-800">
                {formatBtc(withdrawSatoshis)} BTC
              </p>
              <p className="text-sm text-emerald-600 font-queensides mt-1">
                ≈ ${satoshisToUSD(withdrawSatoshis)} USD
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 font-queensides">Destination Address</p>
            <code className="block bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono break-all">
              {withdrawAddress}
            </code>
          </div>

          {txId && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 font-queensides">Transaction ID</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono break-all">
                  {txId}
                </code>
                <a
                  href={getNetworkUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                </a>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-queensides"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${getWalletColor()} p-6 text-white`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-queensides">Withdraw from {getWalletTitle()}</h2>
            <p className="text-sm opacity-90 font-queensides">Send BTC to external wallet</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm opacity-90 font-queensides mb-1">Available Balance</p>
          <p className="text-3xl font-bold font-mono">
            {formatBtc(balanceSatoshis)} BTC
          </p>
          <p className="text-sm opacity-75 mt-1">
            ≈ ${satoshisToUSD(balanceSatoshis)} USD
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        {/* Destination Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 font-queensides">
            Destination Bitcoin Address
          </label>
          <input
            type="text"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value.trim())}
            placeholder="Enter BTC address (bc1..., 1..., 3..., tb1...)"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors"
          />
          {withdrawAddress && !isValidAddress && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Invalid Bitcoin address format
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 font-queensides">
            Amount (BTC)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.00000001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00000000"
              className="w-full px-4 py-3 pr-16 border-2 border-slate-200 rounded-xl font-mono text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <Button
              onClick={handleMax}
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-xs font-queensides"
            >
              MAX
            </Button>
          </div>
          {withdrawAmount && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>≈ ${satoshisToUSD(withdrawSatoshis)} USD</span>
              {withdrawSatoshis > balanceSatoshis && (
                <span className="text-red-500">Insufficient balance</span>
              )}
            </div>
          )}
        </div>

        {/* Network Fee Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">Network Fee</p>
              <p>A small network fee (~2000 satoshis) will be deducted for the Bitcoin transaction</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleWithdraw}
            disabled={!isValidAmount || !isValidAddress || isProcessing}
            className={`w-full bg-gradient-to-r ${getWalletColor()} text-white font-queensides py-6 text-lg disabled:opacity-50`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Withdrawal...
              </>
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5 mr-2" />
                Withdraw {withdrawAmount ? `${withdrawAmount} BTC` : 'BTC'}
              </>
            )}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full font-queensides"
          >
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
