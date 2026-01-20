'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface TripMapProps {
  center: { lat: number; lng: number }
  zoom?: number
  hotels?: Array<{
    name: string
    location: { lat: number; lng: number }
    rating: number
  }>
}

export default function TripMap({ center, zoom = 12, hotels = [] }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [center.lat, center.lng],
        zoom
      )

      // Add OpenStreetMap tiles (FREE)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    } else {
      // Update center if it changes
      mapInstanceRef.current.setView([center.lat, center.lng], zoom)
    }

    const map = mapInstanceRef.current

    // Clear existing hotel markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Add hotel markers
    if (hotels && hotels.length > 0) {
      hotels.forEach((hotel) => {
        const marker = L.marker([hotel.location.lat, hotel.location.lng])
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 150px;">
              <strong>${hotel.name}</strong><br/>
              ⭐ ${hotel.rating} stars
            </div>
          `)
      })
    } else {
      // Add center marker if no hotels
      L.marker([center.lat, center.lng])
        .addTo(map)
        .bindPopup('<strong>Destination</strong>')
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom, hotels])

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-purple-500/30">
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
    </div>
  )
}
