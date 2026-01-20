'use client'

interface Hotel {
  name: string
  rating: number
  price_per_night: number
  total_price: number
  amenities: string[]
  distance_from_center: string
  address: string
  images: string[]
  booking_link: string
}

interface HotelResultsProps {
  hotels: Hotel[]
  searchData: any
}

export default function HotelResults({ hotels, searchData }: HotelResultsProps) {
  if (!hotels || hotels.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Hotels</h2>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No hotels found for this destination.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Hotels</h2>
        <p className="text-sm text-gray-600">{hotels.length} hotels found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
          >
            {hotel.images && hotel.images.length > 0 && (
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex-1">{hotel.name}</h3>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold text-gray-900">{hotel.rating}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{hotel.address}</p>
              <p className="text-xs text-gray-500 mb-4">{hotel.distance_from_center}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {hotel.amenities.slice(0, 3).map((amenity, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Per night</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{hotel.price_per_night.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{hotel.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <a
                  href={hotel.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
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
