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

interface RouteMapProps {
  routeDetails: Array<{
    summary: string
    distance: string
    duration: string
    start_address: string
    end_address: string
    polyline: {
      coordinates: number[][]
    }
    steps: Array<{
      instruction: string
      distance: string
      duration: string
    }>
  }>
  origin: string
  destination: string
}

export default function RouteMap({ routeDetails, origin, destination }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || !routeDetails || routeDetails.length === 0 || typeof window === 'undefined') return

    const route = routeDetails[0]

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    const map = mapInstanceRef.current

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    // Decode polyline coordinates
    let coordinates: [number, number][] = []

    if (route.polyline && route.polyline.coordinates) {
      // GeoJSON format: [lng, lat] -> convert to [lat, lng]
      coordinates = route.polyline.coordinates.map((coord) => [coord[1], coord[0]] as [number, number])
    }

    if (coordinates.length > 0) {
      // Draw route line
      const polyline = L.polyline(coordinates, {
        color: '#4285F4',
        weight: 5,
        opacity: 0.8,
      }).addTo(map)

      // Start marker (green)
      const startIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      L.marker(coordinates[0], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<strong>Start:</strong> ${origin}`)

      // End marker (red)
      const endIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      L.marker(coordinates[coordinates.length - 1], { icon: endIcon })
        .addTo(map)
        .bindPopup(`<strong>End:</strong> ${destination}`)

      // Fit map to show entire route
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [routeDetails, origin, destination])

  if (!routeDetails || routeDetails.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">No route data available</p>
      </div>
    )
  }

  const route = routeDetails[0]

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white mb-2">Route Map</h3>
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {route.distance}
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {route.duration}
          </span>
        </div>
      </div>

      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />

      <div className="p-4 bg-gray-900">
        <h4 className="text-lg font-semibold text-white mb-3">Turn-by-Turn Directions</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {route.steps &&
            route.steps.map((step, index) => (
              <div key={index} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-gray-300">{step.instruction}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {step.distance} • {step.duration}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
