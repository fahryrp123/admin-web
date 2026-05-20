import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight } from "lucide-react";

const onboardingData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
    title: "Choose Your Perfect Car",
    description: "Browse our extensive fleet of premium vehicles. Each unit is well-maintained and ready for your journey."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    title: "Easy Booking Process",
    description: "Select dates, choose your car, and book instantly. Simple, fast, and secure."
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    title: "Track Your Rental",
    description: "Monitor your active rentals in real-time with live location tracking and status updates."
  }
];

export function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < onboardingData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/home");
    }
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <img
            src={onboardingData[currentSlide].image}
            alt={onboardingData[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSkip}
              className="text-white/90 text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"
            >
              Skip
            </button>
          </div>

          <div className="pb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              {onboardingData[currentSlide].title}
            </h2>
            <p className="text-white/90 text-base leading-relaxed mb-8">
              {onboardingData[currentSlide].description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {onboardingData.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
