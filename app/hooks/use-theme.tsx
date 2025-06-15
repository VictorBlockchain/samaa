"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "auto"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  isNightTime: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("auto")
  const [isDark, setIsDark] = useState(false)
  const [isNightTime, setIsNightTime] = useState(false)

  useEffect(() => {
    // Check if it's night time (between Maghrib and Fajr)
    const checkNightTime = () => {
      const now = new Date()
      const hour = now.getHours()
      
      // Simple night time check (6 PM to 6 AM)
      // In a real app, you'd use actual prayer times
      const isNight = hour >= 18 || hour <= 6
      setIsNightTime(isNight)
      
      if (theme === "auto") {
        setIsDark(isNight)
      } else {
        setIsDark(theme === "dark")
      }
    }

    checkNightTime()
    
    // Check every minute
    const interval = setInterval(checkNightTime, 60000)
    
    return () => clearInterval(interval)
  }, [theme])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    
    if (isDark) {
      root.classList.add("dark")
      root.style.setProperty("--bg-primary", "rgb(15, 23, 42)") // slate-900
      root.style.setProperty("--bg-secondary", "rgb(30, 41, 59)") // slate-800
      root.style.setProperty("--text-primary", "rgb(248, 250, 252)") // slate-50
      root.style.setProperty("--text-secondary", "rgb(203, 213, 225)") // slate-300
      root.style.setProperty("--accent-primary", "rgb(99, 102, 241)") // indigo-500
      root.style.setProperty("--accent-secondary", "rgb(139, 92, 246)") // violet-500
    } else {
      root.classList.remove("dark")
      root.style.setProperty("--bg-primary", "rgb(248, 250, 252)") // slate-50
      root.style.setProperty("--bg-secondary", "rgb(255, 255, 255)") // white
      root.style.setProperty("--text-primary", "rgb(15, 23, 42)") // slate-900
      root.style.setProperty("--text-secondary", "rgb(71, 85, 105)") // slate-600
      root.style.setProperty("--accent-primary", "rgb(79, 70, 229)") // indigo-600
      root.style.setProperty("--accent-secondary", "rgb(124, 58, 237)") // violet-600
    }
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, isNightTime }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// Theme-aware component wrapper
export function ThemeAware({ 
  children, 
  lightClass = "", 
  darkClass = "",
  className = ""
}: { 
  children: React.ReactNode
  lightClass?: string
  darkClass?: string
  className?: string
}) {
  const { isDark } = useTheme()
  
  const themeClass = isDark ? darkClass : lightClass
  const finalClassName = `${className} ${themeClass}`.trim()
  
  return (
    <div className={finalClassName}>
      {children}
    </div>
  )
}

// Prayer time based theme colors
export function usePrayerTheme() {
  const { isDark, isNightTime } = useTheme()
  const [prayerColors, setPrayerColors] = useState({
    primary: "indigo",
    secondary: "purple",
    accent: "blue"
  })

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    
    // Different color schemes based on prayer times
    if (hour >= 5 && hour < 7) {
      // Fajr - Dawn colors
      setPrayerColors({
        primary: "rose",
        secondary: "pink", 
        accent: "orange"
      })
    } else if (hour >= 7 && hour < 12) {
      // Morning - Sky colors
      setPrayerColors({
        primary: "blue",
        secondary: "cyan",
        accent: "sky"
      })
    } else if (hour >= 12 && hour < 15) {
      // Dhuhr - Bright colors
      setPrayerColors({
        primary: "yellow",
        secondary: "amber",
        accent: "orange"
      })
    } else if (hour >= 15 && hour < 18) {
      // Asr - Afternoon colors
      setPrayerColors({
        primary: "orange",
        secondary: "amber",
        accent: "yellow"
      })
    } else if (hour >= 18 && hour < 20) {
      // Maghrib - Sunset colors
      setPrayerColors({
        primary: "red",
        secondary: "rose",
        accent: "pink"
      })
    } else {
      // Isha/Night - Deep colors
      setPrayerColors({
        primary: "indigo",
        secondary: "purple",
        accent: "violet"
      })
    }
  }, [])

  return { prayerColors, isDark, isNightTime }
}
