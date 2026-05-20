import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, Fuel, Settings2, FileText, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { mockCars } from "../data/mockData";
import useEmblaCarousel from 'embla-carousel-react';

export function CarDetailEnhanced() {
  const navigate = useNavigate();
  const { id } = useParams();
  const car = mockCars.find((c) => c.id === id);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedImage, setSelectedImage] = useState(0);

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

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
    setSelectedImage(prev => prev > 0 ? prev - 1 : (car?.images?.length || 1) - 1);
  };

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
    setSelectedImage(prev => prev < (car?.images?.length || 1) - 1 ? prev + 1 : 0);
  };

  if (!car) {
    return (
      <div className="px-6 py-6">
        <p>Mobil tidak ditemukan</p>
      </div>
    );
  }

  const images = car.images || [car.imageUrl];

  return (
    <div className="min-h-screen bg-muted pb-32">
      <div className="relative bg-black">
        <button
          onClick={() => navigate('/home')}
          className="absolute top-6 left-4 z-20 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-black/70"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="relative" ref={emblaRef}>
          <div className="flex">
            {images.map((img, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0">
                <img
                  src={img}
                  alt={`${car.model} - ${idx + 1}`}
                  className="w-full h-80 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === selectedImage ? 'w-8 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-6">
        <div className="bg-card rounded-2xl shadow-md p-6 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
                {car.category}
              </span>
              <h1 className="text-2xl font-bold mb-1">{car.model}</h1>
              <p className="text-muted-foreground text-sm">{car.unitName}</p>
            </div>
            <div>
              <span
                className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                  car.available
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {car.available ? "Tersedia" : "Tidak Tersedia"}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Harga Sewa per Hari</p>
            <p className="text-primary font-bold text-3xl">
              Rp {car.dailyPrice.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Settings2 size={20} className="text-primary" />
            Spesifikasi Kendaraan
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-xl">
              <Settings2 className="text-primary mb-2" size={20} />
              <p className="text-xs text-muted-foreground mb-1">Transmisi</p>
              <p className="font-semibold">{car.transmission}</p>
            </div>
            <div className="bg-muted p-4 rounded-xl">
              <Fuel className="text-primary mb-2" size={20} />
              <p className="text-xs text-muted-foreground mb-1">Bahan Bakar</p>
              <p className="font-semibold">{car.fuel}</p>
            </div>
            <div className="bg-muted p-4 rounded-xl">
              <Users className="text-primary mb-2" size={20} />
              <p className="text-xs text-muted-foreground mb-1">Kapasitas</p>
              <p className="font-semibold">{car.seats} Penumpang</p>
            </div>
            <div className="bg-muted p-4 rounded-xl">
              <FileText className="text-primary mb-2" size={20} />
              <p className="text-xs text-muted-foreground mb-1">Tahun</p>
              <p className="font-semibold">{car.year}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md p-6 mb-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-primary" />
            Detail Kendaraan
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Nomor Plat</span>
              <span className="font-semibold text-primary">{car.licensePlate}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Warna</span>
              <span className="font-semibold">{car.color}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Kategori</span>
              <span className="font-semibold">{car.category}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Kondisi</span>
              <span className="font-semibold text-right max-w-[60%]">{car.condition}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-md p-6">
          <h3 className="font-bold mb-3">Deskripsi</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {car.description}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4 shadow-2xl">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total Harga</p>
            <p className="text-primary font-bold text-xl">
              Rp {car.dailyPrice.toLocaleString('id-ID')}/hari
            </p>
          </div>
          <button
            onClick={handleBookNow}
            disabled={!car.available}
            className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {car.available ? "Sewa Sekarang" : "Tidak Tersedia"}
          </button>
        </div>
      </div>
    </div>
  );
}
