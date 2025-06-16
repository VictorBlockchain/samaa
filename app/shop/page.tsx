"use client"

import { Suspense } from "react"
import { ShopView } from "@/components/shop/shop-view"
import { CelestialBackground } from "@/components/ui/celestial-background"

function ShopContent() {
  return <ShopView />
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      <div className="relative z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-queensides">Loading shop...</p>
            </div>
          </div>
        }>
          <ShopContent />
        </Suspense>
      </div>
    </div>
  )
}
