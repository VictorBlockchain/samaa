"use client"

import { useState } from "react"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { MobileHero } from "@/components/mobile/mobile-hero"
import { MobileFeatures } from "@/components/mobile/mobile-features"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { CelestialBackground } from "@/components/ui/celestial-background"

function MobileLayoutContent() {
  const [currentTab, setCurrentTab] = useState("home")

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      <CelestialBackground intensity="heavy" />
      <MobileNavigation />
      
      <div className="pb-24">
        {" "}
        {/* Add padding to account for bottom nav */}
        {currentTab === "home" && <MobileHero />}
        {currentTab === "suitors" && (
          <div className="pt-20 px-4 text-center">
            <h2 className="text-2xl font-bold text-indigo-600 font-queensides">
              Find Your Match
            </h2>
            <p className="mt-2 text-lg text-slate-600 font-queensides">
              Connect your wallet to view potential matches
            </p>
          </div>
        )}
        {currentTab === "shop" && (
          <div className="pt-20 px-4 text-center">
            <h2 className="text-2xl font-bold text-purple-600 font-queensides">
              Islamic Shop
            </h2>
            <p className="mt-2 text-lg text-slate-600 font-queensides">
              Browse Islamic products and gifts
            </p>
          </div>
        )}
        {currentTab === "wallet" && (
          <div className="pt-20 px-4 text-center">
            <h2 className="text-2xl font-bold text-blue-600 font-queensides">
              Wallet & Dowry
            </h2>
            <p className="mt-2 text-lg text-slate-600 font-queensides">
              Manage your tokens and dowry contracts
            </p>
          </div>
        )}
        {currentTab === "profile" && (
          <div className="pt-20 px-4 text-center">
            <h2 className="text-2xl font-bold text-emerald-600 font-queensides">
              Your Profile
            </h2>
            <p className="mt-2 text-lg text-slate-600 font-queensides">
              Complete your profile to find better matches
            </p>
          </div>
        )}
      </div>

      <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  )
}

export function MobileLayout() {
  return <MobileLayoutContent />
}
