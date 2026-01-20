'use client'

interface Train {
  train_name: string
  train_number: string
  departure_time: string
  arrival_time: string
  duration: string
  price: number
  class_type: string
  seats_available: number
  operator: string
  booking_link: string
}

interface TrainResultsProps {
  trains: Train[]
  searchData: any
}

export default function TrainResults({ trains, searchData }: TrainResultsProps) {
  if (!trains || trains.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Trains</h2>
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No trains available for this route or trip type.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Trains</h2>
        <p className="text-sm text-gray-600">{trains.length} trains found</p>
      </div>

      <div className="space-y-4">
        {trains.map((train, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex justify-between items-start gap-6 flex-wrap">
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-green-700">Train</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{train.train_name}</h3>
                    <p className="text-sm text-gray-600">{train.train_number} • {train.operator}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-bold text-gray-900">{train.departure_time}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">{train.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Arrival</p>
                    <p className="font-bold text-gray-900">{train.arrival_time}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">{train.class_type}</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {train.seats_available} seats available
                  </span>
                </div>
              </div>

              <div className="text-right flex flex-col justify-between min-w-[180px]">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-3xl font-bold text-green-600 mb-1">₹{train.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">per person</p>
                </div>

                <a
                  href={train.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block text-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition"
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
