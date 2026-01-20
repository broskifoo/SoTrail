'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface MapSidebarProps {
  isOpen: boolean
  onClose: () => void
  origin: string
  destination: string
}

export default function MapSidebar({ isOpen, onClose, origin, destination }: MapSidebarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Route Map</h2>
              <p className="text-xs text-green-100">{origin} → {destination}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Map Container */}
        <div className="h-[calc(100vh-80px)] w-full">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[20.5937, 78.9629]}>
                <Popup>
                  {origin} → {destination}
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>

        {/* Info Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <p className="text-sm text-gray-600 text-center">
            Interactive map showing route from {origin} to {destination}
          </p>
        </div>
      </div>
    </>
  )
}
