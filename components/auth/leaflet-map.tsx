"use client"

import React, { useEffect, useRef } from "react"
import L from "leaflet"

// Leaflet defaults resolve relative to the page URL; Next serves static files from `/public`.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-shadow.png",
  shadowUrl: "/marker-shadow.png",
})

type Props = {
  position: [number, number] | null
  onPositionChange: (lat: number, lng: number) => void
}

export default function LeafletMap({ position, onPositionChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Protect against stale Leaflet instances in dev/hot-reload.
    const staleId = (containerRef.current as any)._leaflet_id
    if (staleId) {
      delete (containerRef.current as any)._leaflet_id
    }

    const initialCenter: [number, number] = position ?? [20, 0]
    const initialZoom = position ? 6 : 2
    const map = L.map(containerRef.current).setView(initialCenter, initialZoom)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

    if (position) {
      const marker = L.marker(position, { draggable: true }).addTo(map)
      marker.on("dragend", () => {
        const latlng = marker.getLatLng()
        onPositionChange(latlng.lat, latlng.lng)
      })
      markerRef.current = marker
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map)
        markerRef.current.on("dragend", () => {
          const latlng = markerRef.current!.getLatLng()
          onPositionChange(latlng.lat, latlng.lng)
        })
      } else {
        markerRef.current.setLatLng([lat, lng])
      }
      onPositionChange(lat, lng)
    })

    const id = setTimeout(() => map.invalidateSize(), 50)

    return () => {
      clearTimeout(id)
      map.off()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [onPositionChange])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !position) return

    if (!markerRef.current) {
      markerRef.current = L.marker(position, { draggable: true }).addTo(map)
      markerRef.current.on("dragend", () => {
        const latlng = markerRef.current!.getLatLng()
        onPositionChange(latlng.lat, latlng.lng)
      })
    } else {
      markerRef.current.setLatLng(position)
    }

    map.setView(position, 6)
  }, [position, onPositionChange])

  return <div ref={containerRef} style={{ height: 320, width: "100%" }} />
}
