import { useNavigate } from "react-router";
import { CheckCircle, Download, Home } from "lucide-react";

export function CheckoutSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={48} />
          </div>

          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            Your car rental has been successfully booked. Check your email for booking details.
          </p>

          <div className="bg-muted rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Booking ID</span>
              <span className="font-mono font-medium">#RNT-2026-{Math.floor(Math.random() * 9000) + 1000}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                Confirmed
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2">
              <Download size={20} />
              Download Receipt
            </button>
            <button
              onClick={() => navigate("/home")}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
