"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/mobile/splash-screen"
import { MobileLayout } from "@/components/mobile/mobile-layout"
import { DesktopLayout } from "@/components/desktop/desktop-layout"
import { WalletContextProvider } from "@/components/wallet/wallet-context-provider"
import { Inter, Playfair_Display } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
})

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)

    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('splashShown')

    if (splashShown) {
      // If splash was already shown, skip it
      setShowSplash(false)
    } else {
      // Show splash for 3 seconds, then mark as shown
      const timer = setTimeout(() => {
        setShowSplash(false)
        sessionStorage.setItem('splashShown', 'true')
      }, 3000)

      return () => {
        clearTimeout(timer)
      }
    }

    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return (
    <main className={`${inter.variable} ${playfair.variable} font-sans`}>
      <WalletContextProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => {
            setShowSplash(false)
            sessionStorage.setItem('splashShown', 'true')
          }} />
        ) : isMobile ? (
          <MobileLayout />
        ) : (
          <DesktopLayout />
        )}
      </WalletContextProvider>
    </main>
  )
}
