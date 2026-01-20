const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface TripRequest {
  destination: string
  trip_type: 'domestic' | 'international'
  budget?: number
  travel_date?: string
  duration?: number
  interests?: string[]
}

export interface DayItinerary {
  day: number
  title: string
  activities: string[]
  meals: string[]
  accommodation?: string
  estimated_cost?: number
}

export interface TripResponse {
  destination: string
  duration: number
  total_budget: number
  itinerary: DayItinerary[]
  hotels: Array<{
    name: string
    rating: number
    price_per_night: number
    location: { lat: number; lng: number }
  }>
  flights?: {
    departure: string
    arrival: string
    price: number
  }
  map_coordinates: {
    center: { lat: number; lng: number }
    zoom: number
  }
}

export async function planTrip(data: TripRequest): Promise<TripResponse> {
  const response = await fetch(`${API_BASE_URL}/api/plan-trip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to plan trip')
  }

  return response.json()
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  return response.json()
}
