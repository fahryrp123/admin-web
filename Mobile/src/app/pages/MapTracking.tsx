import { useNavigate } from "react-router";
import { ArrowLeft, Navigation, Clock, MapPin, Phone } from "lucide-react";
import { mockRentals } from "../data/mockData";

export function MapTracking() {
  const navigate = useNavigate();
  const ongoingRental = mockRentals.find(r => r.status === 'ongoing');

  if (!ongoingRental) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-6">
        <div className="bg-card rounded-2xl shadow-md p-8 text-center">
          <p className="text-muted-foreground">No ongoing rental to track</p>
          <button
            onClick={() => navigate("/home/rentals")}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-xl"
          >
            View Rentals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted relative">
      <div className="absolute inset-0 bg-gray-200">
        <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="text-primary mx-auto mb-2" size={48} />
              <p className="text-sm text-muted-foreground">Map View</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lat: {ongoingRental.location?.lat}, Lng: {ongoingRental.location?.lng}
              </p>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="px-6 pt-6 pb-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/home/rentals")}
            className="bg-white text-foreground p-3 rounded-full shadow-lg hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg drop-shadow-lg">Live Tracking</h1>
            <p className="text-white/90 text-sm drop-shadow-lg">Real-time location</p>
          </div>
          <button className="bg-white text-primary p-3 rounded-full shadow-lg hover:bg-gray-50">
            <Navigation size={20} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl p-6">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>

        <div className="flex gap-4 mb-6">
          <img
            src={ongoingRental.imageUrl}
            alt={ongoingRental.carModel}
            className="w-24 h-24 object-cover rounded-2xl"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">{ongoingRental.carModel}</h3>
                <p className="text-sm text-muted-foreground">{ongoingRental.carUnit}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                On-going
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-xl">
            <Clock className="text-primary mb-2" size={20} />
            <p className="text-xs text-muted-foreground">Time Remaining</p>
            <p className="font-semibold">
              {Math.ceil((new Date(ongoingRental.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
          <div className="bg-muted p-4 rounded-xl">
            <MapPin className="text-primary mb-2" size={20} />
            <p className="text-xs text-muted-foreground">Current Location</p>
            <p className="font-semibold text-sm">Jakarta Pusat</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-primary text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Phone size={20} />
            Contact Support
          </button>
          <button className="w-full bg-muted text-foreground py-4 rounded-xl font-medium hover:bg-accent transition-colors">
            Rental Details
          </button>
        </div>
      </div>
    </div>
  );
}
