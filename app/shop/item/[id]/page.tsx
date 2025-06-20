"use client"

import { useParams } from "next/navigation"
import { ShopItemView } from "@/components/shop/shop-item-view"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function ShopItemPage() {
  const params = useParams()
  const itemId = params.id as string

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      <CelestialBackground intensity="medium" />
      <div className="relative z-10">
        <ShopItemView itemId={itemId} />
      </div>
    </div>
  )
}
