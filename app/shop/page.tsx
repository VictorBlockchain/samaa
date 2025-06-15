"use client"

import { ShopView } from "@/components/shop/shop-view"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      <div className="relative z-10">
        <ShopView />
      </div>
    </div>
  )
}
