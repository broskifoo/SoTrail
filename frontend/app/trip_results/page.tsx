'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import FlightResults from '@/components/FlightResults'
import TrainResults from '@/components/TrainResults'
import BusResults from '@/components/BusResults'
import HotelResults from '@/components/HotelResults'
import CabResults from '@/components/CabResults'
import ChatbotSidebar from '@/components/ChatbotSidebar'
import ItinerarySidebar from '@/components/ItinerarySidebar'

function TripResultsContent() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('flights')
  const [showChatbot, setShowChatbot] = useState(false)
  const [showItinerary, setShowItinerary] = useState(false)

  const searchData = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    departureDate: searchParams.get('departureDate') || '',
    departureTime: searchParams.get('departureTime') || '',
    returnDate: searchParams.get('returnDate') || '',
    returnTime: searchParams.get('returnTime') || '',
    travelers: parseInt(searchParams.get('travelers') || '1'),
    tripType: searchParams.get('tripType') || 'domestic',
    originCoords: results?.coords?.origin,
    destinationCoords: results?.coords?.destination,
  }

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('http://localhost:8000/api/search-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchData),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Received results:', data)
        setResults(data)
      } catch (err) {
        console.error('Error fetching results:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Searching for best travel options...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4 text-center">⚠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Search Failed</h2>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const tabs = [
    { id: 'flights', label: 'Flights', count: results.flights?.length || 0 },
    { id: 'trains', label: 'Trains', count: results.trains?.length || 0 },
    { id: 'buses', label: 'Buses', count: results.buses?.length || 0 },
    { id: 'hotels', label: 'Hotels', count: results.hotels?.length || 0 },
    { id: 'cabs', label: 'Cabs', count: results.cabs?.length || 0 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {searchData.origin} → {searchData.destination}
              </h1>
              <p className="text-gray-600">
                {searchData.departureDate} to {searchData.returnDate} • {searchData.travelers} traveler(s)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span>AI Assistant</span>
              </button>
              <button
                onClick={() => setShowItinerary(!showItinerary)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <span>Itinerary</span>
              </button>
            </div>
          </div>

          {results.summary && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-semibold">Cheapest Option</p>
                <p className="text-lg font-bold text-green-900">{results.summary.cheapest_option}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-semibold">Fastest Option</p>
                <p className="text-lg font-bold text-blue-900">{results.summary.fastest_option}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-700 font-semibold">Recommended</p>
                <p className="text-lg font-bold text-purple-900">{results.summary.recommended}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'flights' && <FlightResults flights={results.flights} searchData={searchData} />}
            {activeTab === 'trains' && <TrainResults trains={results.trains} searchData={searchData} />}
            {activeTab === 'buses' && <BusResults buses={results.buses} searchData={searchData} />}
            {activeTab === 'hotels' && <HotelResults hotels={results.hotels} searchData={searchData} />}
            {activeTab === 'cabs' && <CabResults cabs={results.cabs} searchData={searchData} />}
          </div>
        </div>
      </div>

      {showChatbot && (
        <ChatbotSidebar
          searchData={searchData}
          onClose={() => setShowChatbot(false)}
        />
      )}

      {showItinerary && (
        <ItinerarySidebar
          searchData={searchData}
          onClose={() => setShowItinerary(false)}
        />
      )}
    </div>
  )
}

export default function TripResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    }>
      <TripResultsContent />
    </Suspense>
  )
}
