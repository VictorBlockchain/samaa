"use client"

export function FloralBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-5">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="floral-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.5">
              {/* Flower pattern */}
              <path d="M100,80 C120,60 140,80 100,100 C60,140 80,120 100,80" className="text-pink-400" />
              <path d="M100,80 C80,60 60,80 100,100 C140,140 120,120 100,80" className="text-pink-400" />
              <path d="M100,120 C120,140 140,120 100,100 C60,60 80,80 100,120" className="text-pink-400" />
              <path d="M100,120 C80,140 60,120 100,100 C140,60 120,80 100,120" className="text-pink-400" />

              {/* Center */}
              <circle cx="100" cy="100" r="5" fill="currentColor" className="text-pink-500" />

              {/* Decorative elements */}
              <path d="M40,40 C60,20 80,40 60,60 C40,80 20,60 40,40" className="text-pink-400" />
              <path d="M160,160 C180,140 200,160 180,180 C160,200 140,180 160,160" className="text-pink-400" />
              <path d="M40,160 C20,140 40,120 60,140 C80,160 60,180 40,160" className="text-pink-400" />
              <path d="M160,40 C180,20 200,40 180,60 C160,80 140,60 160,40" className="text-pink-400" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#floral-pattern)" />
      </svg>
    </div>
  )
}
