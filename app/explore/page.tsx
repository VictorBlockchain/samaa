"use client"

import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { DesktopNavigation } from "@/components/desktop/desktop-navigation"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { ExploreView } from "@/components/explore/explore-view"
import { useIsMobile } from "@/app/hooks/use-mobile"
import { useState } from "react"
import { CelestialBackground } from "@/components/ui/celestial-background"

export default function ExplorePage() {
  const isMobile = useIsMobile()
  const [currentTab, setCurrentTab] = useState("suitors")

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <CelestialBackground intensity="medium" />
      {/* Navigation */}
      {isMobile ? <MobileNavigation /> : <DesktopNavigation />}

      {/* Main Content */}
      <div className="relative z-10">
        <ExploreView />
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />}
    </div>
  )
}
