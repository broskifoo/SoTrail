'use client'

import { useState, useEffect } from 'react'

interface ItinerarySidebarProps {
  searchData: any
  onClose: () => void
}

export default function ItinerarySidebar({ searchData, onClose }: ItinerarySidebarProps) {
  const [itinerary, setItinerary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: searchData.origin,
            destination: searchData.destination,
            departureDate: searchData.departureDate,
            returnDate: searchData.returnDate,
            travelers: searchData.travelers,
          }),
        })
        const data = await response.json()
        setItinerary(data.itinerary)
      } catch (error) {
        console.error('Failed to generate itinerary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItinerary()
  }, [])

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center shadow-md">
        <h2 className="text-2xl font-bold">Your Itinerary</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
        >
          ×
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your personalized itinerary...</p>
          </div>
        ) : itinerary ? (
          <div className="space-y-6">
            {itinerary.days.map((day: any) => (
              <div key={day.day} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{day.title}</h3>
                    <p className="text-sm text-gray-600">{day.date}</p>
                  </div>
                </div>

                <div className="ml-14">
                  <ul className="space-y-2">
                    {day.activities.map((activity: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to generate itinerary. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  )
}
