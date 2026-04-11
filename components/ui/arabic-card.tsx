import * as React from "react"
import { cn } from "@/lib/utils"

interface ArabicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the animated entrance via framer-motion externally; this component is pure CSS */
  noDivider?: boolean
}

/**
 * A decorative card with Arabic-inspired corner ornaments, subtle geometric
 * overlays, and an optional bottom divider. Uses the app's primary
 * (pink / rose) palette so it works everywhere without color props.
 *
 * Usage:
 *   <ArabicCard>
 *     <ArabicCardContent>…</ArabicCardContent>
 *   </ArabicCard>
 */
const ArabicCard = React.forwardRef<HTMLDivElement, ArabicCardProps>(
  ({ className, noDivider = false, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative group", className)} {...props}>
      <div className="relative rounded-2xl p-8 border-2 border-pink-300/50 bg-white transition-all duration-300 overflow-hidden backdrop-blur-sm">
        {/* Arabic corner decorations */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-pink-400/60 rounded-tl-xl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-rose-400/60 rounded-tr-xl" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-rose-400/60 rounded-bl-xl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-pink-400/60 rounded-br-xl" />

        {/* Geometric pattern overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-pink-300/30 rounded-full opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-rose-300/20 rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-pink-300/20 rounded-full" />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Arabic-Inspired Divider */}
        {!noDivider && (
          <div className="flex items-center justify-center mt-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/60 to-transparent" />
            <div className="mx-4 flex items-center space-x-1">
              <div className="w-1 h-1 bg-pink-400/70 rounded-full" />
              <div className="w-2 h-2 border border-rose-400/60 rounded-full flex items-center justify-center">
                <div className="w-0.5 h-0.5 bg-rose-500/70 rounded-full" />
              </div>
              <div className="w-1 h-1 bg-pink-400/70 rounded-full" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/60 to-transparent" />
          </div>
        )}
      </div>
    </div>
  ),
)
ArabicCard.displayName = "ArabicCard"

/** Convenience wrapper – centres text content inside an ArabicCard. */
const ArabicCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-center", className)} {...props} />
))
ArabicCardContent.displayName = "ArabicCardContent"

/** Optional title styled with the app's heading font. */
const ArabicCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold text-slate-800 mb-4 font-queensides",
      className,
    )}
    {...props}
  />
))
ArabicCardTitle.displayName = "ArabicCardTitle"

/** Body text inside the card. */
const ArabicCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-slate-600 font-queensides leading-relaxed text-base",
      className,
    )}
    {...props}
  />
))
ArabicCardDescription.displayName = "ArabicCardDescription"

export { ArabicCard, ArabicCardContent, ArabicCardTitle, ArabicCardDescription }
