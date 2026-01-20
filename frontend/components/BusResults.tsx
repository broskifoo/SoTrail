'use client'

interface Bus {
  operator: string
  bus_type: string
  departure_time: string
  arrival_time: string
  duration: string
  price: number
  seats_available: number
  amenities: string[]
  rating: number
  booking_link: string
}

interface BusResultsProps {
  buses: Bus[]
  searchData: any
}

export default function BusResults({ buses, searchData }: BusResultsProps) {
  if (!buses || buses.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Buses</h2>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No buses available for this route or distance.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Buses</h2>
        <p className="text-sm text-gray-600">{buses.length} buses found</p>
      </div>

      <div className="space-y-4">
        {buses.map((bus, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex justify-between items-start gap-6 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-orange-700">Bus</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{bus.operator}</h3>
                    <p className="text-sm text-gray-600">{bus.bus_type}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-semibold text-gray-700">{bus.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-bold text-gray-900">{bus.departure_time}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{bus.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Arrival</p>
                    <p className="font-bold text-gray-900">{bus.arrival_time}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Amenities</p>
                  <div className="flex gap-2 flex-wrap">
                    {bus.amenities.slice(0, 4).map((amenity, i) => (
                      <span
                        key={i}
                        className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {bus.seats_available} seats available
                </p>
              </div>

              <div className="text-right flex flex-col justify-between min-w-[180px]">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-3xl font-bold text-orange-600 mb-1">₹{bus.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">per person</p>
                </div>

                <a
                  href={bus.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold transition"
                >
                  Book on RedBus
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
