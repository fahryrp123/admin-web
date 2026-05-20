import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, Fuel, Settings2, ChevronRight } from "lucide-react";
import { mockCars } from "../data/mockData";

export function CarDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const car = mockCars.find((c) => c.id === id);

  const handleBookNow = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      if (confirm('Anda harus login terlebih dahulu untuk melakukan booking. Login sekarang?')) {
        navigate('/login', { state: { returnTo: `/checkout/${id}` } });
      }
    } else {
      navigate(`/checkout/${id}`);
    }
  };

  if (!car) {
    return (
      <div className="px-6 py-6">
        <p>Car not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="relative">
        <img
          src={car.imageUrl}
          alt={car.model}
          className="w-full h-72 object-cover"
        />
        <button
          onClick={() => navigate("/home")}
          className="absolute top-4 left-4 bg-card text-foreground p-2 rounded-full shadow-lg hover:bg-accent"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              car.available
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {car.available ? "Available" : "Booked"}
          </span>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-card rounded-2xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{car.model}</h1>
              <p className="text-muted-foreground">{car.unitName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Daily Rate</p>
              <p className="text-primary font-bold text-2xl">
                Rp {car.dailyPrice.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-xl">
              <Settings2 className="mx-auto mb-2 text-primary" size={20} />
              <p className="text-xs text-muted-foreground mb-1">Transmission</p>
              <p className="text-sm font-medium">{car.transmission}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <Fuel className="mx-auto mb-2 text-primary" size={20} />
              <p className="text-xs text-muted-foreground mb-1">Fuel Type</p>
              <p className="text-sm font-medium">{car.fuel}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <Users className="mx-auto mb-2 text-primary" size={20} />
              <p className="text-xs text-muted-foreground mb-1">Capacity</p>
              <p className="text-sm font-medium">{car.seats} Seats</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Vehicle Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium">{car.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Color</span>
                <span className="font-medium">{car.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">License Plate</span>
                <span className="font-medium">{car.licensePlate}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {car.description}
            </p>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Harga Per Hari</p>
              <p className="text-primary font-bold text-2xl">
                Rp {car.dailyPrice.toLocaleString('id-ID')}
              </p>
            </div>
            <button
              onClick={handleBookNow}
              disabled={!car.available}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {car.available ? "Book Now" : "Tidak Tersedia"}
              {car.available && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
