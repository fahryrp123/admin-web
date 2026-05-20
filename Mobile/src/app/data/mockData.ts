export interface Car {
  id: string;
  model: string;
  unitName: string;
  dailyPrice: number;
  imageUrl: string;
  images?: string[];
  available: boolean;
  transmission: string;
  fuel: string;
  seats: number;
  description: string;
  year: number;
  color: string;
  licensePlate: string;
  category: string;
  condition: string;
}

export interface Rental {
  id: string;
  carId: string;
  carModel: string;
  carUnit: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalCost: number;
  status: 'booked' | 'ongoing' | 'completed';
  imageUrl: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export const mockCars: Car[] = [
  {
    id: '1',
    model: 'Toyota Avanza 1.3 G MT',
    unitName: 'B 1234 XYZ',
    dailyPrice: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
      'https://images.unsplash.com/photo-1583267746897-c169e0f191be?w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'
    ],
    available: true,
    transmission: 'Manual',
    fuel: 'Bensin',
    seats: 7,
    description: 'MPV keluarga yang luas, cocok untuk perjalanan grup. Unit terawat dengan fitur lengkap dan kenyamanan maksimal.',
    year: 2023,
    color: 'Silver Metallic',
    licensePlate: 'B 1234 XYZ',
    category: 'MPV',
    condition: 'Sangat Baik - Baru Service'
  },
  {
    id: '2',
    model: 'Honda Civic 1.5 Turbo CVT',
    unitName: 'B 5678 ABC',
    dailyPrice: 500000,
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80'
    ],
    available: true,
    transmission: 'Automatic',
    fuel: 'Bensin',
    seats: 5,
    description: 'Sedan modern dengan efisiensi bahan bakar tinggi dan interior premium. Ideal untuk perjalanan bisnis.',
    year: 2024,
    color: 'Pearl White',
    licensePlate: 'B 5678 ABC',
    category: 'Sedan',
    condition: 'Excellent - Seperti Baru'
  },
  {
    id: '3',
    model: 'Mitsubishi Xpander Sport AT',
    unitName: 'B 9012 DEF',
    dailyPrice: 400000,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'
    ],
    available: false,
    transmission: 'Automatic',
    fuel: 'Bensin',
    seats: 7,
    description: 'MPV serbaguna dengan desain modern dan fitur keamanan canggih. Sempurna untuk petualangan keluarga.',
    year: 2023,
    color: 'Titanium Gray',
    licensePlate: 'B 9012 DEF',
    category: 'MPV',
    condition: 'Baik - Siap Pakai'
  },
  {
    id: '4',
    model: 'Toyota Fortuner 2.4 VRZ 4x2 AT',
    unitName: 'B 3456 GHI',
    dailyPrice: 750000,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'
    ],
    available: true,
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 7,
    description: 'SUV premium dengan mesin bertenaga dan interior mewah. Pilihan terbaik untuk perjalanan jarak jauh.',
    year: 2024,
    color: 'Attitude Black',
    licensePlate: 'B 3456 GHI',
    category: 'SUV',
    condition: 'Excellent - Full Option'
  },
  {
    id: '5',
    model: 'Suzuki Ertiga GL MT',
    unitName: 'B 7890 JKL',
    dailyPrice: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1583267746897-c169e0f191be?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583267746897-c169e0f191be?w=800&q=80'
    ],
    available: true,
    transmission: 'Manual',
    fuel: 'Bensin',
    seats: 7,
    description: 'MPV ekonomis dengan efisiensi bahan bakar sangat baik. Nyaman untuk perjalanan dalam kota.',
    year: 2023,
    color: 'Arctic White',
    licensePlate: 'B 7890 JKL',
    category: 'MPV',
    condition: 'Baik - Hemat BBM'
  },
  {
    id: '6',
    model: 'Daihatsu Terios X MT',
    unitName: 'B 2345 MNO',
    dailyPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80'
    ],
    available: true,
    transmission: 'Manual',
    fuel: 'Bensin',
    seats: 7,
    description: 'SUV kompak dengan manuver yang baik. Sempurna untuk eksplorasi perkotaan.',
    year: 2022,
    color: 'Dark Silver',
    licensePlate: 'B 2345 MNO',
    category: 'SUV',
    condition: 'Baik - Terawat'
  },
];

export const mockRentals: Rental[] = [
  {
    id: 'R001',
    carId: '3',
    carModel: 'Mitsubishi Xpander',
    carUnit: 'B 9012 DEF',
    startDate: '2026-05-13',
    endDate: '2026-05-15',
    duration: 2,
    totalCost: 800000,
    status: 'ongoing',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    location: {
      lat: -6.2088,
      lng: 106.8456
    }
  },
  {
    id: 'R002',
    carId: '1',
    carModel: 'Toyota Avanza',
    carUnit: 'B 1234 XYZ',
    startDate: '2026-05-18',
    endDate: '2026-05-20',
    duration: 2,
    totalCost: 700000,
    status: 'booked',
    imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80'
  },
  {
    id: 'R003',
    carId: '2',
    carModel: 'Honda Civic',
    carUnit: 'B 5678 ABC',
    startDate: '2026-05-05',
    endDate: '2026-05-08',
    duration: 3,
    totalCost: 1500000,
    status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80'
  },
  {
    id: 'R004',
    carId: '4',
    carModel: 'Toyota Fortuner',
    carUnit: 'B 3456 GHI',
    startDate: '2026-04-20',
    endDate: '2026-04-25',
    duration: 5,
    totalCost: 3750000,
    status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'
  }
];

export const mockUser = {
  name: 'Budi Santoso',
  email: 'budi.santoso@email.com',
  phone: '+62 812 3456 7890',
  address: 'Jl. Sudirman No. 123, Jakarta Selatan',
  memberSince: '2024-01-15'
};
