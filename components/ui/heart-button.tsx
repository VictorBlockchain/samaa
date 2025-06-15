"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { HeartIcon } from "@/components/ui/heart-icon"

interface HeartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
}

export const HeartButton = forwardRef<HTMLButtonElement, HeartButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative group flex items-center justify-center overflow-hidden transition-all duration-300",
          "rounded-full font-medium",
          {
            "bg-gradient-to-r from-purple-500 to-rose-500 text-white hover:shadow-lg hover:shadow-purple-500/20":
              variant === "default",
            "bg-transparent border-2 border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50":
              variant === "outline",
            "text-sm px-4 py-2": size === "sm",
            "text-base px-6 py-3": size === "default",
            "text-lg px-8 py-4": size === "lg",
          },
          className,
        )}
        {...props}
      >
        <span className="absolute left-0 flex items-center justify-center h-full aspect-square">
          <HeartIcon
            className={cn("transition-all duration-300", {
              "w-4 h-4": size === "sm",
              "w-5 h-5": size === "default",
              "w-6 h-6": size === "lg",
              "text-white": variant === "default",
              "text-rose-500": variant === "outline",
            })}
          />
        </span>
        <span
          className={cn("transition-all duration-300", {
            "pl-6": size === "sm",
            "pl-7": size === "default",
            "pl-8": size === "lg",
          })}
        >
          {children}
        </span>
      </button>
    )
  },
)

HeartButton.displayName = "HeartButton"
