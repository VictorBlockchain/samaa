"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { Wallet, Copy, ExternalLink, LogOut, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface WalletButtonProps {
  className?: string
  showText?: boolean
}

export function WalletButton({ className, showText = false }: WalletButtonProps) {
  const { wallet, connected, connecting, disconnect, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  const handleConnect = () => {
    setVisible(true)
  }

  const handleDisconnect = () => {
    disconnect()
    setShowDetails(false)
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      // You could add a toast notification here
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!connected) {
    return (
      <motion.button
        onClick={handleConnect}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center justify-center rounded-2xl",
          "bg-gradient-to-r from-indigo-400 to-purple-500 text-white",
          "hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",
          connecting && "animate-pulse",
          showText ? "px-6 py-3 space-x-2" : "w-11 h-11",
          className,
        )}
        disabled={connecting}
      >
        <Wallet className={cn("w-5 h-5", connecting && "animate-spin")} />
        {showText && (
          <span className="font-queensides font-bold">{connecting ? "Connecting..." : "Connect Wallet"}</span>
        )}
      </motion.button>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => router.push("/settings")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-2xl",
          "bg-gray-100 hover:bg-gray-200 text-gray-600",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
          className,
        )}
      >
        <Settings className="w-5 h-5" />

        {/* Connection status indicator */}
        {/* Remove this entire div */}
        {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" /> */}
      </motion.button>

      {/* Wallet details dropdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-0 min-w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-indigo-200/50 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100/50">
              <div className="flex items-center space-x-3">
                {wallet?.adapter.icon && (
                  <img
                    src={wallet.adapter.icon || "/placeholder.svg"}
                    alt={wallet.adapter.name}
                    className="w-8 h-8 rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-medium text-slate-700 font-qurova">{wallet?.adapter.name}</h3>
                  <p className="text-sm text-slate-500 font-queensides">Connected</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 border-b border-indigo-100/50">
              <p className="text-xs text-slate-500 font-queensides mb-1">Wallet Address</p>
              <div className="flex items-center space-x-2">
                <code className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {publicKey ? shortenAddress(publicKey.toString()) : ""}
                </code>
                <button onClick={copyAddress} className="p-1 hover:bg-slate-100 rounded transition-colors">
                  <Copy className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() =>
                    window.open(`https://explorer.solana.com/address/${publicKey?.toString()}?cluster=devnet`, "_blank")
                  }
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-queensides"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown */}
      {showDetails && <div className="fixed inset-0 z-40" onClick={() => setShowDetails(false)} />}
    </div>
  )
}
