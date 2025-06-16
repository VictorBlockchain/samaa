"use client"

import { AddProductView } from "@/components/shop/add-product-view"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      <div className="relative z-10">
        <AddProductView />
      </div>
    </div>
  )
}
