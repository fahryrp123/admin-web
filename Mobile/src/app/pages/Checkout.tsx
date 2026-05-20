import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Calendar, User, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { cars, checkAvailability } = useApp();
  const car = cars.find((c) => c.id === id);

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    navigate('/login', { state: { returnTo: `/checkout/${id}` } });
    return null;
  }

  const bookingState = (location.state as any);
  const initialStartDate = bookingState?.startDate || '';
  const initialDuration = bookingState?.duration || 1;

  const [formData, setFormData] = useState({
    driverLicense: "",
    idNumber: "",
    startDate: initialStartDate,
    duration: initialDuration,
  });

  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const calculateEndDate = (start: string, days: number) => {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    return endDate.toISOString().split('T')[0];
  };

  const endDate = calculateEndDate(formData.startDate, formData.duration);

  if (!car) {
    return <div>Car not found</div>;
  }

  const subtotal = car.dailyPrice * formData.duration;
  const insurance = 50000 * formData.duration;
  const serviceFee = 25000;
  const total = subtotal + insurance + serviceFee;

  const handleCheckout = () => {
    setAvailabilityError(null);

    if (!formData.driverLicense || !formData.idNumber || !formData.startDate) {
      alert('Mohon lengkapi semua data');
      return;
    }

    const isAvailable = checkAvailability(car.id, formData.startDate, endDate);
    if (!isAvailable) {
      setAvailabilityError('Maaf, mobil ini sudah dibooking untuk tanggal tersebut. Silakan pilih tanggal lain.');
      return;
    }

    navigate('/payment', {
      state: {
        bookingData: {
          car,
          startDate: formData.startDate,
          endDate,
          duration: formData.duration,
          totalCost: total,
          driverLicense: formData.driverLicense,
          idNumber: formData.idNumber,
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <div className="bg-primary text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      <div className="px-6 py-6 space-y-4">
        {availabilityError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Mobil Tidak Tersedia</p>
              <p className="text-sm text-red-700">{availabilityError}</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-md p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Informasi Pengemudi
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Driver's License Number</label>
              <input
                type="text"
                value={formData.driverLicense}
                onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                placeholder="e.g., 1234567890123456"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">ID Card Number (KTP)</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="e.g., 3174012345678901"
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Periode Rental
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  setAvailabilityError(null);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Durasi (Hari)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, duration: Math.max(1, formData.duration - 1) });
                    setAvailabilityError(null);
                  }}
                  className="w-10 h-10 bg-primary/10 text-primary rounded-lg font-bold"
                >
                  −
                </button>
                <div className="flex-1 text-center bg-muted rounded-xl py-2">
                  <p className="text-2xl font-bold text-primary">{formData.duration}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, duration: formData.duration + 1 });
                    setAvailabilityError(null);
                  }}
                  className="w-10 h-10 bg-primary/10 text-primary rounded-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
            {endDate && (
              <div className="bg-blue-50 border border-primary/20 rounded-xl p-3">
                <p className="text-sm text-primary">
                  <span className="font-semibold">Tanggal Selesai:</span> {new Date(endDate).toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md p-4">
          <h3 className="font-semibold mb-4">Payment Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {car.model} ({car.unitName})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Rental ({formData.duration} {formData.duration === 1 ? "day" : "days"})
              </span>
              <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insurance</span>
              <span className="font-medium">Rp {insurance.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-medium">Rp {serviceFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-bold">Total Payment</span>
              <span className="text-primary font-bold text-xl">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 shadow-lg">
        <button
          onClick={handleCheckout}
          disabled={!formData.driverLicense || !formData.idNumber || !formData.startDate}
          className="w-full max-w-md mx-auto bg-primary text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Lanjut ke Pembayaran - Rp {total.toLocaleString('id-ID')}
        </button>
      </div>
    </div>
  );
}
