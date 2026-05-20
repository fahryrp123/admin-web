import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { MapPin, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

export function BookingManagement() {
  const navigate = useNavigate();
  const { getUserRentals, completeRental } = useApp();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const userRentals = getUserRentals();
  const activeRentals = userRentals.filter(r => r.status === 'booked' || r.status === 'ongoing');
  const completedRentals = userRentals.filter(r => r.status === 'completed');

  const handleCompleteRental = (rentalId: string) => {
    if (confirm('Selesaikan rental ini?')) {
      completeRental(rentalId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-blue-500';
      case 'ongoing':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'booked':
        return 'Booked';
      case 'ongoing':
        return 'On-Going';
      default:
        return 'Unknown';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="bg-primary text-white px-6 py-6">
          <h1 className="text-2xl font-bold">Booking Saya</h1>
          <p className="text-sm text-white/80 mt-1">Kelola semua booking Anda</p>
        </div>

        <div className="px-6 py-8">
          <div className="bg-card rounded-2xl shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-muted-foreground" size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Belum Login</h3>
            <p className="text-muted-foreground mb-6">
              Login untuk melihat dan mengelola booking Anda
            </p>
            <button
              onClick={() => navigate('/login', { state: { returnTo: '/home/bookings' } })}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Login Sekarang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-primary text-white px-6 py-6">
        <h1 className="text-2xl font-bold">Booking Saya</h1>
        <p className="text-sm text-white/80 mt-1">Kelola semua booking Anda</p>
      </div>

      <div className="bg-card border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'active'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Status Aktif
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'history'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            Histori
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'active' ? (
          activeRentals.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-sm p-8 text-center">
              <p className="text-muted-foreground">Tidak ada booking aktif</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRentals.map((rental) => (
                <div key={rental.id} className="bg-card rounded-2xl shadow-md overflow-hidden">
                  <div className="relative h-40">
                    <img
                      src={rental.imageUrl}
                      alt={rental.carModel}
                      className="w-full h-full object-cover"
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
                      <div className="flex items-center gap-3">
                        <Calendar className="text-primary" size={18} />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Periode Rental</p>
                          <p className="text-sm font-medium">
                            {new Date(rental.startDate).toLocaleDateString('id-ID')} - {new Date(rental.endDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="text-primary" size={18} />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Durasi</p>
                          <p className="text-sm font-medium">{rental.duration} hari</p>
                        </div>
                      </div>

                      {rental.status === 'ongoing' && rental.location && (
                        <button
                          onClick={() => navigate('/map-tracking')}
                          className="w-full mt-2 p-3 bg-blue-50 rounded-xl border border-primary/20 hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 justify-center">
                            <MapPin className="text-primary" size={18} />
                            <span className="text-sm font-medium text-primary">Lacak Lokasi Real-time</span>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-border pt-3 flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">Total Biaya</span>
                      <span className="text-primary font-bold text-lg">
                        Rp {rental.totalCost.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {rental.status === 'ongoing' && (
                      <button
                        onClick={() => handleCompleteRental(rental.id)}
                        className="w-full bg-green-500 text-white py-2.5 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Selesaikan Rental
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          completedRentals.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-sm p-8 text-center">
              <p className="text-muted-foreground">Belum ada riwayat rental</p>
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
                          Selesai
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-primary" size={18} />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Periode Rental</p>
                        <p className="text-sm font-medium">
                          {new Date(rental.startDate).toLocaleDateString('id-ID')} - {new Date(rental.endDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Durasi</p>
                        <p className="text-sm font-medium">{rental.duration} hari</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Biaya</p>
                        <p className="text-primary font-bold text-lg">
                          Rp {rental.totalCost.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
