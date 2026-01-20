'use client'

interface Cab {
  type: string
  operator: string
  price: number
  duration: string
  capacity: number
  currency?: string
  booking_link?: string | null
}

interface CabResultsProps {
  cabs: Cab[]
  searchData: any
}

function buildUberDeepLink(searchData: any) {
  const origin = searchData.originCoords
  const destination = searchData.destinationCoords
  
  if (!origin || !destination) {
    return 'https://m.uber.com/'
  }
  
  const params = new URLSearchParams({
    action: 'setPickup',
    'pickup[latitude]': origin.lat.toString(),
    'pickup[longitude]': origin.lng.toString(),
    'dropoff[latitude]': destination.lat.toString(),
    'dropoff[longitude]': destination.lng.toString(),
    'dropoff[nickname]': searchData.destination || ''
  })
  
  return `https://m.uber.com/ul/?${params.toString()}`
}

function getBookingUrl(cab: Cab, searchData: any) {
  if (cab.operator.toLowerCase() === 'uber') {
    return buildUberDeepLink(searchData)
  }
  return 'https://www.uber.com/'
}

export default function CabResults({ cabs, searchData }: CabResultsProps) {
  if (!cabs || cabs.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Cabs</h2>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">Cabs are not practical for this route.</p>
        </div>
      </section>
    )
  }
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Cabs</h2>
        <p className="text-sm text-gray-600">{cabs.length} options</p>
      </div>
      
      <div className="space-y-4">
        {cabs.map((cab, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex justify-between items-start gap-6 flex-wrap">
              
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">Cab</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{cab.type}</h3>
                    <p className="text-sm text-gray-600">{cab.operator}</p>
                    <p className="text-xs text-gray-500 mt-1">Estimated fare. Final price shown in Uber app.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Duration</p>
                    <p className="font-semibold text-gray-900">{cab.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-semibold text-gray-900">{cab.capacity} passengers</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">Private Ride</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">Door to Door</span>
                </div>
              </div>
              
              <div className="text-right flex flex-col justify-between min-w-[180px]">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimated Fare</p>
                  <p className="text-3xl font-bold text-blue-600 mb-1">
                    {cab.currency === 'USD' ? '$' : '₹'}{cab.price.toLocaleString()}
                  </p>
                </div>
                
                <a
                  href={getBookingUrl(cab, searchData)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Book in Uber
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
