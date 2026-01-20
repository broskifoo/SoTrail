"use client";

interface SidebarProps {
  tripType: string;
  setTripType: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  onSelectService: (service: string) => void;
  showSidebar: boolean;
  setShowSidebar: (value: boolean) => void;
  supportsInternationalRail: () => boolean;
}

export default function Sidebar({
  tripType,
  setTripType,
  destination,
  setDestination,
  onSelectService,
  showSidebar,
  setShowSidebar,
  supportsInternationalRail
}: SidebarProps) {

  const getAvailableServices = () => {
    const base = ["Flight Booking", "Hotel Booking", "Route Map"];

    if (tripType === "domestic") {
      return [...base, "Train Booking", "Bus Booking", "Cab Booking"];
    }

    const list = [...base];
    if (supportsInternationalRail()) {
      list.push("Train Booking", "Bus Booking");
    }

    return list;
  };

  const services = getAvailableServices();

  return (
    <>
      {/* Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-[98]"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r shadow-xl z-[99] transition-transform duration-300
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 pt-24">

          <h3 className="text-lg font-semibold mb-4">Trip Type</h3>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setTripType("domestic")}
              className={`flex-1 py-2 border rounded-md ${
                tripType === "domestic" ? "bg-blue-700 text-white" : "bg-gray-100"
              }`}
            >
              Domestic
            </button>

            <button
              onClick={() => setTripType("international")}
              className={`flex-1 py-2 border rounded-md ${
                tripType === "international"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100"
              }`}
            >
              International
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-4 py-2 border rounded-md mb-6"
          />

          <h3 className="text-lg font-semibold mb-4">Services</h3>

          <div className="space-y-3">
            {services.map((service, i) => (
              <button
                key={i}
                onClick={() => onSelectService(service)}
                className="w-full text-left px-4 py-3 border rounded-md hover:bg-gray-100"
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
