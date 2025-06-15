"use client"

import { useEffect, useState } from "react"
import { Heart, Star } from "lucide-react"

export function FloatingElements() {
  const [elements, setElements] = useState<
    Array<{ id: number; x: number; y: number; delay: number; icon: "heart" | "star" }>
  >([])

  useEffect(() => {
    const newElements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      icon: Math.random() > 0.5 ? "heart" : ("star" as "heart" | "star"),
    }))
    setElements(newElements)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-pulse"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: "3s",
          }}
        >
          {element.icon === "heart" ? (
            <Heart className="w-4 h-4 text-rose-300 opacity-60" />
          ) : (
            <Star className="w-4 h-4 text-teal-300 opacity-60" />
          )}
        </div>
      ))}
    </div>
  )
}
