import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockCars, mockRentals, mockUser } from '../data/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
}

interface Car {
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

interface Rental {
  id: string;
  carId: string;
  customerId: string;
  carModel: string;
  carUnit: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalCost: number;
  status: 'booked' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
}

interface AppContextType {
  currentUser: User | null;
  cars: Car[];
  rentals: Rental[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Partial<User>) => boolean;
  createRental: (rental: Omit<Rental, 'id' | 'createdAt' | 'status'>) => string | null;
  updateRentalStatus: (rentalId: string, status: Rental['status']) => void;
  checkAvailability: (carId: string, startDate: string, endDate: string) => boolean;
  getUserRentals: () => Rental[];
  completeRental: (rentalId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedCars = localStorage.getItem('cars');
    const storedRentals = localStorage.getItem('rentals');
    const storedUsers = localStorage.getItem('users');
    const storedCurrentUser = localStorage.getItem('currentUser');

    if (storedCars) {
      setCars(JSON.parse(storedCars));
    } else {
      setCars(mockCars);
      localStorage.setItem('cars', JSON.stringify(mockCars));
    }

    if (storedRentals) {
      setRentals(JSON.parse(storedRentals));
    } else {
      setRentals(mockRentals);
      localStorage.setItem('rentals', JSON.stringify(mockRentals));
    }

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultUser = { ...mockUser, id: '1' };
      setUsers([defaultUser]);
      localStorage.setItem('users', JSON.stringify([defaultUser]));
    }

    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
  };

  const register = (userData: Partial<User>): boolean => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      memberSince: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('isLoggedIn', 'true');
    return true;
  };

  const checkAvailability = (carId: string, startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingRentals = rentals.filter(rental => {
      if (rental.carId !== carId) return false;
      if (rental.status === 'cancelled' || rental.status === 'completed') return false;

      const rentalStart = new Date(rental.startDate);
      const rentalEnd = new Date(rental.endDate);

      return (start >= rentalStart && start <= rentalEnd) ||
             (end >= rentalStart && end <= rentalEnd) ||
             (start <= rentalStart && end >= rentalEnd);
    });

    return conflictingRentals.length === 0;
  };

  const createRental = (rentalData: Omit<Rental, 'id' | 'createdAt' | 'status'>): string | null => {
    if (!currentUser) return null;

    const isAvailable = checkAvailability(rentalData.carId, rentalData.startDate, rentalData.endDate);
    if (!isAvailable) {
      return null;
    }

    const newRental: Rental = {
      ...rentalData,
      id: `RNT-${Date.now()}`,
      customerId: currentUser.id,
      status: 'booked',
      createdAt: new Date().toISOString(),
    };

    const updatedRentals = [...rentals, newRental];
    setRentals(updatedRentals);
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));

    const updatedCars = cars.map(car =>
      car.id === rentalData.carId ? { ...car, available: false } : car
    );
    setCars(updatedCars);
    localStorage.setItem('cars', JSON.stringify(updatedCars));

    return newRental.id;
  };

  const updateRentalStatus = (rentalId: string, status: Rental['status']) => {
    const updatedRentals = rentals.map(rental =>
      rental.id === rentalId ? { ...rental, status } : rental
    );
    setRentals(updatedRentals);
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));
  };

  const completeRental = (rentalId: string) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;

    const updatedRentals = rentals.map(r =>
      r.id === rentalId ? { ...r, status: 'completed' as const } : r
    );
    setRentals(updatedRentals);
    localStorage.setItem('rentals', JSON.stringify(updatedRentals));

    const updatedCars = cars.map(car =>
      car.id === rental.carId ? { ...car, available: true } : car
    );
    setCars(updatedCars);
    localStorage.setItem('cars', JSON.stringify(updatedCars));
  };

  const getUserRentals = (): Rental[] => {
    if (!currentUser) return [];
    return rentals.filter(rental => rental.customerId === currentUser.id);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        cars,
        rentals,
        login,
        logout,
        register,
        createRental,
        updateRentalStatus,
        checkAvailability,
        getUserRentals,
        completeRental,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
