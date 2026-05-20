import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronRight, MessageCircle, Bell, Filter } from "lucide-react";
import { useApp } from "../context/AppContext";
import { carBrands } from "../data/brands";

export function HomeEnhanced() {
  const navigate = useNavigate();
  const { cars, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const displayedBrands = showAllBrands ? carBrands : carBrands.slice(0, 8);

  const filteredCars = cars.filter((car) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      car.model.toLowerCase().includes(searchLower) ||
      car.unitName.toLowerCase().includes(searchLower) ||
      car.licensePlate.toLowerCase().includes(searchLower) ||
      car.transmission.toLowerCase().includes(searchLower) ||
      car.fuel.toLowerCase().includes(searchLower);
    const matchesBrand = !selectedBrand || car.model.toLowerCase().includes(selectedBrand.toLowerCase());
    return matchesSearch && matchesBrand;
  });

  const handleChatAdmin = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      if (confirm('Anda harus login terlebih dahulu untuk menghubungi admin. Login sekarang?')) {
        navigate('/login', { state: { returnTo: '/chat-admin' } });
      }
    } else {
      navigate('/chat-admin');
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-primary text-white px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {isLoggedIn ? 'U' : '?'}
              </span>
            </div>
            <div>
              <p className="text-xs text-white/70">Selamat Datang</p>
              <h2 className="font-semibold">{currentUser?.name || 'Guest'}</h2>
            </div>
          </div>
          <button className="relative p-2 hover:bg-white/10 rounded-lg">
            <Bell size={24} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari model, plat nomor, transmisi..."
            className="w-full pl-12 pr-4 py-4 bg-white text-foreground rounded-2xl focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
          />
        </div>

        <button className="flex items-center gap-2 text-white/90 text-sm">
          <Filter size={18} />
          <span>Filter & Urutkan</span>
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Brand Mobil</h2>
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="text-primary text-sm font-medium flex items-center gap-1"
          >
            {showAllBrands ? "Sembunyikan" : "Lihat Semua"}
            <ChevronRight size={16} className={showAllBrands ? "rotate-90" : ""} />
          </button>
        </div>

        <div className={`grid grid-cols-4 gap-3 mb-6 ${showAllBrands ? '' : 'overflow-hidden'}`}>
          {displayedBrands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                selectedBrand === brand.name
                  ? "bg-primary text-white shadow-lg"
                  : "bg-card text-foreground shadow-sm"
              }`}
            >
              <div className="text-2xl">{brand.logo}</div>
              <span className="text-xs font-medium text-center">{brand.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Mobil Tersedia</h2>
          <span className="text-sm text-muted-foreground">{filteredCars.length} unit</span>
        </div>

        {selectedBrand && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
              {selectedBrand}
              <button onClick={() => setSelectedBrand(null)} className="hover:bg-primary/20 rounded-full p-1">
                ✕
              </button>
            </span>
          </div>
        )}

        <div className="space-y-4">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              onClick={() => navigate(`/home/car/${car.id}`)}
              className="bg-card rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="relative h-52">
                <img
                  src={car.imageUrl}
                  alt={car.model}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/90 text-white backdrop-blur-sm">
                    {car.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                      car.available
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {car.available ? "Tersedia" : "Tidak Tersedia"}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-xs font-medium">{car.unitName}</p>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-base mb-1">{car.model}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="bg-muted px-2 py-1 rounded">{car.transmission}</span>
                  <span className="bg-muted px-2 py-1 rounded">{car.seats} Kursi</span>
                  <span className="bg-muted px-2 py-1 rounded">{car.fuel}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Harga/hari</p>
                    <p className="text-primary font-bold text-xl">
                      Rp {car.dailyPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/home/car/${car.id}`);
                    }}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleChatAdmin}
        className="fixed bottom-24 right-6 bg-green-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-colors z-50"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}
