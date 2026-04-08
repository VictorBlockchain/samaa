"use client"

import { Suspense } from "react"
import WalletView from "@/components/wallet/wallet-view"

function WalletContent() {
  return <WalletView />
}

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-queensides">Loading wallet...</p>
        </div>
      </div>
    }>
      <WalletContent />
    </Suspense>
  )
}
