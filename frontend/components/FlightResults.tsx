'use client'

interface Flight {
  airline: string
  flight_number: string
  departure_time: string
  arrival_time: string
  departure_airport: string
  arrival_airport: string
  duration: string
  price: number
  stops: number
  class_type: string
  baggage_allowance: string
  booking_link: string
}

interface FlightResultsProps {
  flights: Flight[]
  searchData: any
}

export default function FlightResults({ flights, searchData }: FlightResultsProps) {
  if (!flights || flights.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Flights</h2>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No flights found for this route.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Flights</h2>
        <p className="text-sm text-gray-600">{flights.length} flights found</p>
      </div>

      <div className="space-y-4">
        {flights.map((flight, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex justify-between items-start gap-6 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">Flight</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{flight.airline}</h3>
                    <p className="text-sm text-gray-600">{flight.flight_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-bold text-gray-900">{flight.departure_time}</p>
                    <p className="text-xs text-gray-500">{flight.departure_airport}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{flight.duration}</p>
                    <p className="text-xs text-gray-500">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Arrival</p>
                    <p className="font-bold text-gray-900">{flight.arrival_time}</p>
                    <p className="text-xs text-gray-500">{flight.arrival_airport}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{flight.class_type}</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{flight.baggage_allowance}</span>
                </div>
              </div>

              <div className="text-right flex flex-col justify-between min-w-[180px]">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-3xl font-bold text-blue-600 mb-1">₹{flight.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">per person</p>
                </div>

                <a
                  href={flight.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Book Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
