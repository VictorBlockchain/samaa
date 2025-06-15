"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
}

export const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative group flex items-center justify-center overflow-hidden transition-all duration-300",
          "rounded-full font-medium",
          {
            "bg-gradient-to-r from-pink-400 to-pink-500 text-white hover:shadow-lg hover:shadow-pink-500/20":
              variant === "default",
            "bg-white/30 backdrop-blur-md border border-white/50 text-white hover:bg-white/40": variant === "outline",
            "text-sm px-4 py-2": size === "sm",
            "text-base px-6 py-3": size === "default",
            "text-lg px-8 py-4": size === "lg",
          },
          className,
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-white/20" />
      </button>
    )
  },
)

ModernButton.displayName = "ModernButton"
