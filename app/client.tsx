"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Web3Providers from "@/app/providers/Web3Providers"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { useState, useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentTab, setCurrentTab] = useState("home")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <Web3Providers>
        <div className="min-h-screen relative">
          {isMobile ? (
            <>
              <MobileNavigation />
              <div className="pt-16">{children}</div>
              <MobileBottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
            </>
          ) : (
            children
          )}
          <Toaster />
        </div>
      </Web3Providers>
    </ThemeProvider>
  )
}
