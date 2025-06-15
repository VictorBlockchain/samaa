"use client"

import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { DesktopHero } from "@/components/desktop/desktop-hero"
import { DesktopFeatures } from "@/components/desktop/desktop-features"
import { CelestialBackground } from "@/components/ui/celestial-background"

export function DesktopLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-amber-50 overflow-hidden">
      <CelestialBackground intensity="heavy" />
      <DesktopNavigation />
      <DesktopHero />
    </div>
  )
}
