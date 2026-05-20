import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, Clock, DollarSign, Loader2 } from "lucide-react";
import { mockCars } from "../data/mockData";

export function Booking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const car = mockCars.find((c) => c.id === id);

  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  if (!car) {
    return <div>Car not found</div>;
  }

  const subtotal = car.dailyPrice * duration;
  const totalCost = subtotal;

  useEffect(() => {
    if (startDate && duration > 0) {
      setIsCheckingAvailability(true);
      const timer = setTimeout(() => {
        setIsCheckingAvailability(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [startDate, duration]);

  const handleConfirmBooking = () => {
    if (!startDate || duration < 1) {
      alert('Mohon lengkapi tanggal dan durasi sewa');
      return;
    }
    navigate(`/checkout/${id}`, { state: { startDate, duration } });
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(`/car/${id}`)} className="p-1 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Booking Details</h1>
      </div>

      <div className="px-6 py-6">
        <div className="bg-card rounded-2xl shadow-md overflow-hidden mb-6">
          <p className="px-4 pt-4 text-xs text-muted-foreground font-medium">RINGKASAN MOBIL</p>
          <div className="flex gap-4 p-4">
            <img
              src={car.imageUrl}
              alt={car.model}
              className="w-28 h-28 object-cover rounded-xl"
            />
            <div className="flex-1">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-1">
                {car.category}
              </span>
              <h3 className="font-bold text-base">{car.model}</h3>
              <p className="text-xs text-muted-foreground mb-2">{car.unitName}</p>
              <p className="text-primary font-bold text-lg">
                Rp {car.dailyPrice.toLocaleString('id-ID')}/hari
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md p-6 mb-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="text-primary" size={18} />
              Tanggal Mulai Sewa
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-4 bg-muted border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="text-primary" size={18} />
              Durasi Sewa (Hari)
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDuration(Math.max(1, duration - 1))}
                className="w-14 h-14 bg-primary/10 text-primary rounded-xl font-bold text-2xl hover:bg-primary/20 transition-colors"
              >
                −
              </button>
              <div className="flex-1 text-center bg-muted rounded-xl py-3">
                <p className="text-4xl font-bold text-primary">{duration}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {duration === 1 ? "Hari" : "Hari"}
                </p>
              </div>
              <button
                onClick={() => setDuration(duration + 1)}
                className="w-14 h-14 bg-primary/10 text-primary rounded-xl font-bold text-2xl hover:bg-primary/20 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {startDate && duration > 0 && (
            <div className="bg-blue-50 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              {isCheckingAvailability ? (
                <Loader2 className="text-primary animate-spin" size={20} />
              ) : (
                <DollarSign className="text-primary" size={20} />
              )}
              <p className="text-sm text-primary font-medium">
                {isCheckingAvailability
                  ? "Memeriksa ketersediaan ke sistem backend..."
                  : "Mobil tersedia untuk tanggal yang dipilih"}
              </p>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <DollarSign size={22} className="text-primary" />
            Ringkasan Biaya
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Harga Sewa ({duration} hari)</span>
              <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t-2 border-dashed border-border pt-3 flex justify-between items-center">
              <span className="font-bold text-base">Total Pembayaran</span>
              <div className="text-right">
                <span className="text-primary font-bold text-2xl">
                  Rp {totalCost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4 shadow-2xl">
        <button
          onClick={handleConfirmBooking}
          disabled={!startDate || duration < 1 || isCheckingAvailability}
          className="w-full max-w-md mx-auto bg-primary text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCheckingAvailability ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Memeriksa...
            </>
          ) : (
            <>
              Konfirmasi Booking
            </>
          )}
        </button>
      </div>
    </div>
  );
}
