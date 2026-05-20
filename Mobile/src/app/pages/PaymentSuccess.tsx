import { useNavigate, useLocation } from "react-router";
import { CheckCircle, Download, Calendar, CreditCard } from "lucide-react";

export function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = (location.state as any) || {};

  const { rentalId, car, startDate, endDate, totalCost, paymentMethod } = data;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pembayaran Berhasil!</h2>
            <p className="text-green-50">
              Booking Anda telah dikonfirmasi
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-muted rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground">Booking ID</span>
                <span className="font-mono font-bold text-primary">{rentalId}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                  Booked
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pembayaran</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  Lunas
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-bold mb-3">Detail Rental</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobil</span>
                  <span className="font-semibold text-right">{car}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Periode</span>
                  <span className="font-semibold text-right">
                    {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bayar</span>
                  <span className="font-bold text-primary text-base">
                    Rp {totalCost?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-primary flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary mb-1">Langkah Selanjutnya</p>
                  <p className="text-xs text-primary/80">
                    Silakan datang ke lokasi kami pada tanggal mulai sewa dengan membawa SIM dan KTP asli.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button className="w-full bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <Download size={20} />
                Download E-Ticket
              </button>
              <button
                onClick={() => navigate('/home/bookings')}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Lihat Booking Saya
              </button>
              <button
                onClick={() => navigate('/home')}
                className="w-full text-primary py-3 rounded-xl font-medium hover:bg-primary/5 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
