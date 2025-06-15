"use client"

import { cn } from "@/lib/utils"

interface IslamicPatternProps {
  className?: string
}

export function IslamicPattern({ className }: IslamicPatternProps) {
  return (
    <svg
      className={cn("w-full h-full", className)}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <g fill="currentColor" opacity="0.1">
            <circle cx="50" cy="50" r="20" />
            <path d="M30 50 L50 30 L70 50 L50 70 Z" />
            <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
    </svg>
  )
}
