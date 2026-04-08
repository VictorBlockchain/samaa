"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ShopItemView } from "@/components/shop/shop-item-view"
import { CelestialBackground } from "@/components/ui/celestial-background"

function ShopItemInner() {
  const searchParams = useSearchParams()
  const itemId = (searchParams.get("id") || "").trim()
  if (!itemId) return null
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      <div className="relative z-10">
        <ShopItemView itemId={itemId} />
      </div>
    </div>
  )
}

export default function ShopItemPage() {
  return (
    <Suspense fallback={null}>
      <ShopItemInner />
    </Suspense>
  )
}
