"use client"

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton as SolanaWalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { cn } from "@/lib/utils"
import { Wallet } from "lucide-react"

interface WalletMultiButtonProps {
  className?: string
}

export function WalletMultiButton({ className }: WalletMultiButtonProps) {
  const { wallet, connected, connecting } = useWallet()

  return (
    <div className="relative">
      {/* Custom styled button that triggers wallet modal */}
      <SolanaWalletMultiButton
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          height: 'auto',
          width: 'auto',
        }}
      >
        <button
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded-2xl",
            "bg-gradient-to-r from-indigo-400 to-purple-500 text-white",
            "hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2",
            connecting && "animate-pulse",
            className,
          )}
          disabled={connecting}
        >
          <Wallet className={cn("w-5 h-5", connecting && "animate-spin")} />

          {/* Connection status indicator */}
          {connected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </button>
      </SolanaWalletMultiButton>
    </div>
  )
}
