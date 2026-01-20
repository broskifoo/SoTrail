'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// Popular destinations database
const DESTINATIONS = {
  domestic: {
    metros: [
      { city: "Mumbai", state: "Maharashtra", airport: "BOM", popular: true },
      { city: "Delhi", state: "Delhi", airport: "DEL", popular: true },
      { city: "Bangalore", state: "Karnataka", airport: "BLR", popular: true },
      { city: "Hyderabad", state: "Telangana", airport: "HYD", popular: true },
      { city: "Chennai", state: "Tamil Nadu", airport: "MAA", popular: true },
      { city: "Kolkata", state: "West Bengal", airport: "CCU", popular: true },
      { city: "Pune", state: "Maharashtra", airport: "PNQ", popular: true },
      { city: "Ahmedabad", state: "Gujarat", airport: "AMD", popular: true }
    ],
    tourist: [
      { city: "Goa", state: "Goa", airport: "GOI", popular: true },
      { city: "Jaipur", state: "Rajasthan", airport: "JAI", popular: true },
      { city: "Udaipur", state: "Rajasthan", airport: "UDR", popular: true },
      { city: "Shimla", state: "Himachal Pradesh", popular: true },
      { city: "Manali", state: "Himachal Pradesh", popular: true },
      { city: "Darjeeling", state: "West Bengal", popular: true },
      { city: "Agra", state: "Uttar Pradesh", airport: "AGR", popular: true },
      { city: "Varanasi", state: "Uttar Pradesh", airport: "VNS", popular: true },
      { city: "Amritsar", state: "Punjab", airport: "ATQ", popular: true },
      { city: "Rishikesh", state: "Uttarakhand", popular: true },
      { city: "Kochi", state: "Kerala", airport: "COK", popular: true },
      { city: "Munnar", state: "Kerala", popular: true },
      { city: "Leh-Ladakh", state: "Ladakh", airport: "IXL", popular: true },
      { city: "Andaman", state: "Andaman & Nicobar", airport: "IXZ", popular: true }
    ]
  },
  international: {
    asia: [
      { city: "Dubai", country: "UAE", airport: "DXB", popular: true },
      { city: "Singapore", country: "Singapore", airport: "SIN", popular: true },
      { city: "Bangkok", country: "Thailand", airport: "BKK", popular: true },
      { city: "Phuket", country: "Thailand", airport: "HKT", popular: true },
      { city: "Bali", country: "Indonesia", airport: "DPS", popular: true },
      { city: "Maldives", country: "Maldives", airport: "MLE", popular: true },
      { city: "Tokyo", country: "Japan", airport: "NRT", popular: true },
      { city: "Seoul", country: "South Korea", airport: "ICN", popular: true }
    ],
    europe: [
      { city: "London", country: "UK", airport: "LHR", popular: true },
      { city: "Paris", country: "France", airport: "CDG", popular: true },
      { city: "Rome", country: "Italy", airport: "FCO", popular: true },
      { city: "Barcelona", country: "Spain", airport: "BCN", popular: true },
      { city: "Amsterdam", country: "Netherlands", airport: "AMS", popular: true },
      { city: "Zurich", country: "Switzerland", airport: "ZRH", popular: true }
    ]
  }
}

const ALL_DESTINATIONS = [
  ...DESTINATIONS.domestic.metros,
  ...DESTINATIONS.domestic.tourist,
  ...DESTINATIONS.international.asia,
  ...DESTINATIONS.international.europe
]

export default function Home() {
  const router = useRouter()
  const [tripType, setTripType] = useState<'domestic' | 'international'>('domestic')
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '09:00',
    returnDate: '',
    returnTime: '18:00',
    travelers: 1
  })

  const [originSuggestions, setOriginSuggestions] = useState<any[]>([])
  const [destSuggestions, setDestSuggestions] = useState<any[]>([])
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestDropdown, setShowDestDropdown] = useState(false)

  const originRef = useRef<HTMLDivElement>(null)
  const destRef = useRef<HTMLDivElement>(null)

  const handleOriginSearch = (value: string) => {
    setFormData({...formData, origin: value})
    
    if (value.length < 2) {
      setOriginSuggestions([])
      return
    }

    const filtered = ALL_DESTINATIONS.filter(dest => {
      const searchStr = value.toLowerCase()
      const cityMatch = dest.city.toLowerCase().includes(searchStr)
      const stateMatch = 'state' in dest && dest.state.toLowerCase().includes(searchStr)
      const countryMatch = 'country' in dest && dest.country.toLowerCase().includes(searchStr)
      return cityMatch || stateMatch || countryMatch
    }).slice(0, 8)

    setOriginSuggestions(filtered)
    setShowOriginDropdown(true)
  }

  const handleDestSearch = (value: string) => {
    setFormData({...formData, destination: value})
    
    if (value.length < 2) {
      setDestSuggestions([])
      return
    }

    const filtered = ALL_DESTINATIONS.filter(dest => {
      const searchStr = value.toLowerCase()
      const cityMatch = dest.city.toLowerCase().includes(searchStr)
      const stateMatch = 'state' in dest && dest.state.toLowerCase().includes(searchStr)
      const countryMatch = 'country' in dest && dest.country.toLowerCase().includes(searchStr)
      return cityMatch || stateMatch || countryMatch
    }).slice(0, 8)

    setDestSuggestions(filtered)
    setShowDestDropdown(true)
  }

  const selectOrigin = (dest: any) => {
    const displayName = 'country' in dest 
      ? `${dest.city}, ${dest.country}`
      : `${dest.city}, ${dest.state}`
    
    setFormData({...formData, origin: displayName})
    setShowOriginDropdown(false)
    
    if ('country' in dest && dest.country !== 'India') {
      setTripType('international')
    } else {
      setTripType('domestic')
    }
  }

  const selectDest = (dest: any) => {
    const displayName = 'country' in dest 
      ? `${dest.city}, ${dest.country}`
      : `${dest.city}, ${dest.state}`
    
    setFormData({...formData, destination: displayName})
    setShowDestDropdown(false)

    if ('country' in dest && dest.country !== 'India') {
      setTripType('international')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false)
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams({
      origin: formData.origin,
      destination: formData.destination,
      departureDate: formData.departureDate,
      departureTime: formData.departureTime,
      returnDate: formData.returnDate,
      returnTime: formData.returnTime,
      travelers: formData.travelers.toString(),
      tripType: tripType
    })
    
    router.push(`/trip_results?${params.toString()}`)
  }

  const popularDests = tripType === 'domestic'
    ? [...DESTINATIONS.domestic.metros, ...DESTINATIONS.domestic.tourist].filter(d => d.popular).slice(0, 10)
    : [...DESTINATIONS.international.asia, ...DESTINATIONS.international.europe].filter(d => d.popular).slice(0, 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-blue-700">SoTrail</h1>
          <p className="text-gray-600">Your AI-Powered Travel Companion</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Plan Your Journey</h2>
          
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setTripType('domestic')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                tripType === 'domestic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Domestic Travel
            </button>
            <button
              type="button"
              onClick={() => setTripType('international')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                tripType === 'international'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              International Travel
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={originRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From (Origin)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mumbai"
                  value={formData.origin}
                  onChange={(e) => handleOriginSearch(e.target.value)}
                  onFocus={() => formData.origin.length >= 2 && setShowOriginDropdown(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
                
                {showOriginDropdown && originSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {originSuggestions.map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectOrigin(dest)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-semibold text-gray-900">{dest.city}</div>
                        <div className="text-sm text-gray-600">
                          {'country' in dest ? dest.country : dest.state}
                          {dest.airport && ` • ${dest.airport}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={destRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To (Destination)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Goa"
                  value={formData.destination}
                  onChange={(e) => handleDestSearch(e.target.value)}
                  onFocus={() => formData.destination.length >= 2 && setShowDestDropdown(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                />
                
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {destSuggestions.map((dest, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectDest(dest)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-semibold text-gray-900">{dest.city}</div>
                        <div className="text-sm text-gray-600">
                          {'country' in dest ? dest.country : dest.state}
                          {dest.airport && ` • ${dest.airport}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Popular Destinations
              </p>
              <div className="flex flex-wrap gap-2">
                {popularDests.map((dest, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectDest(dest)}
                    className="px-3 py-1 bg-white text-sm text-blue-700 rounded-full hover:bg-blue-100 border border-blue-200 transition"
                  >
                    {dest.city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departure Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.departureDate}
                  onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Departure Time
                </label>
                <input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Return Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.returnDate}
                  onChange={(e) => setFormData({...formData, returnDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={formData.departureDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Return Time
                </label>
                <input
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Travelers
              </label>
              <select
                value={formData.travelers}
                onChange={(e) => setFormData({...formData, travelers: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-lg transition text-lg shadow-lg"
            >
              Search All Options
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-blue-700 font-bold text-lg">Multi</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Modal Transport</h3>
            <p className="text-gray-600 text-sm">Flights, trains, buses, and cabs in one search</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-green-700 font-bold text-lg">AI</span>
            </div>
            <h3 className="font-bold text-lg mb-2">AI Assistant</h3>
            <p className="text-gray-600 text-sm">Get personalized travel suggestions powered by AI</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-purple-700 font-bold text-lg">Plan</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Smart Itinerary</h3>
            <p className="text-gray-600 text-sm">Automated day-by-day trip planning</p>
          </div>
        </div>
      </main>
    </div>
  )
}
