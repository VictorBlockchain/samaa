import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon element to display above the message */
  icon?: React.ReactNode
  /** Override the default icon color */
  iconColor?: string
}

/**
 * An empty state card with Arabic-inspired corner ornaments, designed for
 * "no results", "no matches", "nothing here yet" messaging. Uses soft
 * purple/lavender tones to convey gentle encouragement rather than alert.
 *
 * Usage:
 *   <ArabicEmptyStateCard icon={<Heart className="w-12 h-12 text-purple-300" />}>
 *     <ArabicEmptyStateCardTitle>No matches found</ArabicEmptyStateCardTitle>
 *     <ArabicEmptyStateCardDescription>Try adjusting your preferences</ArabicEmptyStateCardDescription>
 *   </ArabicEmptyStateCard>
 */
const ArabicEmptyStateCard = React.forwardRef<HTMLDivElement, EmptyStateCardProps>(
  ({ className, icon, iconColor = "text-purple-300", children, ...props }, ref) => (
    <div ref={ref} className={cn("relative group", className)} {...props}>
      <div className="relative rounded-2xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/80 via-white to-pink-50/60 backdrop-blur-sm overflow-hidden transition-all duration-300">
        {/* Arabic corner decorations (soft purple) */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-purple-300/50 rounded-tl-xl" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-pink-300/50 rounded-tr-xl" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-pink-300/50 rounded-bl-xl" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-purple-300/50 rounded-br-xl" />

        {/* Geometric pattern overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-purple-300/20 rounded-full opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-purple-300/15 rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-pink-300/15 rounded-full" />

        {/* Content */}
        <div className="relative z-10 px-8 py-12 text-center">
          {/* Icon */}
          {icon && (
            <div className={cn("mx-auto mb-4", iconColor)}>
              {icon}
            </div>
          )}
          {children}
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center px-8 pb-5">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-200/60 to-transparent" />
          <div className="mx-4 flex items-center space-x-1">
            <div className="w-1 h-1 bg-purple-300/60 rounded-full" />
            <div className="w-2 h-2 border border-pink-300/50 rounded-full flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-pink-400/60 rounded-full" />
            </div>
            <div className="w-1 h-1 bg-purple-300/60 rounded-full" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-200/60 to-transparent" />
        </div>
      </div>
    </div>
  ),
)
ArabicEmptyStateCard.displayName = "ArabicEmptyStateCard"

/** Convenience wrapper – centres text content */
const ArabicEmptyStateCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-center", className)} {...props} />
))
ArabicEmptyStateCardContent.displayName = "ArabicEmptyStateCardContent"

/** Title styled with the app's heading font. */
const ArabicEmptyStateCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold text-slate-700 mb-2 font-queensides",
      className,
    )}
    {...props}
  />
))
ArabicEmptyStateCardTitle.displayName = "ArabicEmptyStateCardTitle"

/** Description text with softer styling. */
const ArabicEmptyStateCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-slate-500 font-queensides text-sm leading-relaxed",
      className,
    )}
    {...props}
  />
))
ArabicEmptyStateCardDescription.displayName = "ArabicEmptyStateCardDescription"

export { ArabicEmptyStateCard, ArabicEmptyStateCardContent, ArabicEmptyStateCardTitle, ArabicEmptyStateCardDescription }
