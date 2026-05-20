import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, CreditCard, Building2, Wallet, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createRental, checkAvailability } = useApp();

  const bookingData = (location.state as any)?.bookingData;

  const [paymentMethod, setPaymentMethod] = useState<"credit" | "bank" | "ewallet">("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingData) {
      navigate('/home');
    }
  }, [bookingData, navigate]);

  if (!bookingData) {
    return null;
  }

  const { car, startDate, endDate, duration, totalCost, driverLicense, idNumber } = bookingData;

  const handlePayment = async () => {
    setError(null);
    setIsProcessing(true);

    const isAvailable = checkAvailability(car.id, startDate, endDate);
    if (!isAvailable) {
      setError('Maaf, mobil ini sudah dibooking untuk tanggal tersebut. Silakan pilih tanggal lain.');
      setIsProcessing(false);
      return;
    }

    setTimeout(() => {
      const rentalId = createRental({
        carId: car.id,
        carModel: car.model,
        carUnit: car.unitName,
        startDate,
        endDate,
        duration,
        totalCost,
        imageUrl: car.imageUrl,
        paymentStatus: 'paid',
        paymentMethod: paymentMethod,
        customerId: '',
      });

      setIsProcessing(false);

      if (rentalId) {
        navigate('/payment-success', {
          state: {
            rentalId,
            car: car.model,
            startDate,
            endDate,
            totalCost,
            paymentMethod
          }
        });
      } else {
        setError('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
      }
    }, 2000);
  };

  const paymentMethods = [
    {
      id: 'credit',
      icon: CreditCard,
      title: 'Kartu Kredit/Debit',
      subtitle: 'Visa, Mastercard, JCB',
      popular: true
    },
    {
      id: 'bank',
      icon: Building2,
      title: 'Transfer Bank',
      subtitle: 'BCA, Mandiri, BNI, BRI',
      popular: false
    },
    {
      id: 'ewallet',
      icon: Wallet,
      title: 'E-Wallet',
      subtitle: 'GoPay, OVO, Dana, ShopeePay',
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-muted pb-24">
      <div className="bg-primary text-white px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Pembayaran</h1>
          <p className="text-xs text-white/80">Pilih metode pembayaran</p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Booking Gagal</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-md p-4">
          <p className="text-xs text-muted-foreground font-semibold mb-3">RINGKASAN BOOKING</p>
          <div className="flex gap-4 mb-4">
            <img src={car.imageUrl} alt={car.model} className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1">{car.model}</h3>
              <p className="text-xs text-muted-foreground mb-2">{car.unitName}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
              </p>
              <p className="text-xs text-muted-foreground">{duration} hari</p>
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold">Total Pembayaran</span>
            <span className="text-primary font-bold text-xl">
              Rp {totalCost.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            Metode Pembayaran
          </h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left relative ${
                    isSelected
                      ? "border-primary bg-blue-50"
                      : "border-border bg-white hover:border-primary/30"
                  }`}
                >
                  {method.popular && (
                    <span className="absolute -top-2 right-4 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                      Populer
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon size={20} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{method.title}</p>
                        <p className="text-xs text-muted-foreground">{method.subtitle}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="text-white" size={16} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-50 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary mb-1">Pembayaran Aman</p>
              <p className="text-xs text-primary/80">
                Transaksi Anda dilindungi dengan enkripsi 256-bit SSL
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4 shadow-2xl">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full max-w-md mx-auto bg-primary text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Memproses Pembayaran...
            </>
          ) : (
            <>
              Bayar Rp {totalCost.toLocaleString('id-ID')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
