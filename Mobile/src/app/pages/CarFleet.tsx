import { useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { mockCars } from "../data/mockData";

export function CarFleet() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCars = mockCars.filter((car) =>
    car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    car.unitName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Car Fleet</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by model or unit..."
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredCars.map((car) => (
          <div
            key={car.id}
            onClick={() => navigate(`/car/${car.id}`)}
            className="bg-card rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={car.imageUrl}
                alt={car.model}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
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

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{car.model}</h3>
              <p className="text-sm text-muted-foreground mb-3">{car.unitName}</p>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Rate</p>
                  <p className="text-primary font-bold text-lg">
                    Rp {car.dailyPrice.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{car.transmission}</span>
                  <span>•</span>
                  <span>{car.seats} Seats</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
