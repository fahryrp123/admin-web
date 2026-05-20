import { useNavigate } from "react-router";
import { Calendar, CheckCircle } from "lucide-react";
import { mockRentals } from "../data/mockData";

export function RentalHistory() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const completedRentals = mockRentals.filter(r => r.status === 'completed');

  if (!isLoggedIn) {
    return (
      <div className="px-6 py-6">
        <h2 className="text-2xl font-bold mb-6">Rental History</h2>
        <div className="bg-card rounded-2xl shadow-md p-8 text-center">
          <p className="text-muted-foreground mb-4">Login untuk melihat riwayat rental Anda</p>
          <button
            onClick={() => navigate('/login', { state: { returnTo: '/home/history' } })}
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
      <h2 className="text-2xl font-bold mb-6">Rental History</h2>

      {completedRentals.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-md p-8 text-center">
          <p className="text-muted-foreground">No rental history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedRentals.map((rental) => (
            <div key={rental.id} className="bg-card rounded-2xl shadow-md overflow-hidden">
              <div className="flex gap-4 p-4 border-b border-border">
                <img
                  src={rental.imageUrl}
                  alt={rental.carModel}
                  className="w-24 h-24 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{rental.carModel}</h3>
                      <p className="text-sm text-muted-foreground">{rental.carUnit}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" size={18} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Rental Period</p>
                    <p className="text-sm font-medium">
                      {new Date(rental.startDate).toLocaleDateString('id-ID')} - {new Date(rental.endDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{rental.duration} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                    <p className="text-primary font-bold text-lg">
                      Rp {rental.totalCost.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
