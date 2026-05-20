import { useNavigate } from "react-router";
import { MapPin, Calendar, Clock } from "lucide-react";
import { mockRentals } from "../data/mockData";

export function RentalStatus() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const activeRentals = mockRentals.filter(r => r.status === 'booked' || r.status === 'ongoing');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-500';
      case 'ongoing':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'booked':
        return 'Booked';
      case 'ongoing':
        return 'On-going';
      default:
        return 'Unknown';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="px-6 py-6">
        <h2 className="text-2xl font-bold mb-6">Active Rentals</h2>
        <div className="bg-card rounded-2xl shadow-md p-8 text-center">
          <p className="text-muted-foreground mb-4">Login untuk melihat rental aktif Anda</p>
          <button
            onClick={() => navigate('/login', { state: { returnTo: '/home/rentals' } })}
            className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <h2 className="text-2xl font-bold mb-6">Active Rentals</h2>

      {activeRentals.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-md p-8 text-center">
          <p className="text-muted-foreground">No active rentals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeRentals.map((rental) => (
            <div key={rental.id} className="bg-card rounded-2xl shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={rental.imageUrl}
                  alt={rental.carModel}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(rental.status)}`}>
                    {getStatusLabel(rental.status)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{rental.carModel}</h3>
                <p className="text-sm text-muted-foreground mb-4">{rental.carUnit}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-primary mt-0.5" size={18} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Rental Period</p>
                      <p className="text-sm font-medium">
                        {new Date(rental.startDate).toLocaleDateString('id-ID')} - {new Date(rental.endDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="text-primary mt-0.5" size={18} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{rental.duration} days</p>
                    </div>
                  </div>

                  {rental.status === 'ongoing' && rental.location && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-primary/20">
                      <button
                        onClick={() => navigate('/map-tracking')}
                        className="w-full"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="text-primary" size={18} />
                          <p className="text-sm font-medium">Live Vehicle Location</p>
                        </div>
                        <div className="bg-card rounded-lg p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-2">
                            Track your car in real-time
                          </p>
                          <span className="text-primary text-sm font-medium">
                            View on Map →
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                  <span className="text-primary font-bold text-lg">
                    Rp {rental.totalCost.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
