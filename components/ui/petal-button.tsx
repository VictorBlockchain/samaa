"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface PetalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
}

export const PetalButton = forwardRef<HTMLButtonElement, PetalButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative group flex items-center justify-center overflow-hidden transition-all duration-300",
          "rounded-2xl font-medium",
          {
            "bg-gradient-to-r from-amber-400 to-rose-400 text-white hover:shadow-lg hover:shadow-amber-500/20":
              variant === "default",
            "bg-transparent border-2 border-amber-200 text-amber-700 hover:border-amber-300 hover:bg-amber-50":
              variant === "outline",
            "text-sm px-4 py-2": size === "sm",
            "text-base px-6 py-3": size === "default",
            "text-lg px-8 py-4": size === "lg",
          },
          className,
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={cn(
                "absolute w-8 h-8 rounded-full bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-500",
                {
                  "top-0 left-1/4": i === 0,
                  "top-1/4 right-0": i === 1,
                  "bottom-0 left-1/3": i === 2,
                  "bottom-1/4 left-0": i === 3,
                  "top-1/2 right-1/4": i === 4,
                },
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            />
          ))}
        </span>
      </button>
    )
  },
)

PetalButton.displayName = "PetalButton"
