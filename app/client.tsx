"use client"

import type React from "react"
import { Inter, Playfair_Display } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { WalletContextProvider } from "@/components/wallet/wallet-context-provider"
import { MobileNavigation } from "@/components/mobile/mobile-navigation"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"
import { useState, useEffect } from "react"

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <WalletContextProvider>
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
            </div>
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
