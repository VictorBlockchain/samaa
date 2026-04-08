"use client"

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'

type Props = {
  position: [number, number] | null
  onPositionChange: (lat: number, lng: number) => void
}

export default function LeafletMap({ position, onPositionChange }: Props) {
  // Relax react-leaflet typing via local wrappers to avoid prop mismatches
  const MapContainerAny = MapContainer as any
  const MarkerAny = Marker as any

  // Prefer LatLngTuple ([lat, lng]) to avoid literal type inference hiccups
  const centerTuple: [number, number] = position ?? [20, 0]
  const zoom = position ? 6 : 2

  // Invalidate map size when shown/mounted to ensure tiles render correctly
  function InvalidateSize() {
    const map = useMap()
    useEffect(() => {
      // Delay slightly to allow container layout to settle
      const id = setTimeout(() => {
        map.invalidateSize()
      }, 50)
      return () => clearTimeout(id)
    }, [map])
    return null
  }

  return (
    <MapContainerAny center={centerTuple} zoom={zoom} style={{ height: 320, width: '100%' }}>
      <InvalidateSize />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerAny
        draggable={true}
        position={centerTuple}
        eventHandlers={{
          dragend: (e: any) => {
            const { lat, lng } = e.target.getLatLng()
            onPositionChange(lat, lng)
          },
        }}
      />
    </MapContainerAny>
  )
}