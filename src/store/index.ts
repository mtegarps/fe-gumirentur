import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Car, Location, CarFacility } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface BookingState {
  selectedCar: Car | null;
  pickupDate: Date | null;
  returnDate: Date | null;
  pickupLocation: Location | null;
  returnLocation: Location | null;
  selectedFacilities: { facility: CarFacility; quantity: number }[];
  needDelivery: boolean;
  deliveryAddress: string;
  promoCode: string;
  notes: string;
  
  setSelectedCar: (car: Car | null) => void;
  setDates: (pickup: Date | null, returnDate: Date | null) => void;
  setLocations: (pickup: Location | null, returnLoc: Location | null) => void;
  addFacility: (facility: CarFacility, quantity: number) => void;
  removeFacility: (facilityId: number) => void;
  updateFacilityQuantity: (facilityId: number, quantity: number) => void;
  setDelivery: (need: boolean, address?: string) => void;
  setPromoCode: (code: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedCar: null,
  pickupDate: null,
  returnDate: null,
  pickupLocation: null,
  returnLocation: null,
  selectedFacilities: [],
  needDelivery: false,
  deliveryAddress: '',
  promoCode: '',
  notes: '',
  
  setSelectedCar: (car) => set({ selectedCar: car }),
  setDates: (pickup, returnDate) => set({ pickupDate: pickup, returnDate }),
  setLocations: (pickup, returnLoc) => set({ pickupLocation: pickup, returnLocation: returnLoc }),
  
  addFacility: (facility, quantity) => set((state) => ({
    selectedFacilities: [
      ...state.selectedFacilities.filter(f => f.facility.id !== facility.id),
      { facility, quantity }
    ]
  })),
  
  removeFacility: (facilityId) => set((state) => ({
    selectedFacilities: state.selectedFacilities.filter(f => f.facility.id !== facilityId)
  })),
  
  updateFacilityQuantity: (facilityId, quantity) => set((state) => ({
    selectedFacilities: state.selectedFacilities.map(f => 
      f.facility.id === facilityId ? { ...f, quantity } : f
    )
  })),
  
  setDelivery: (need, address = '') => set({ needDelivery: need, deliveryAddress: address }),
  setPromoCode: (code) => set({ promoCode: code }),
  setNotes: (notes) => set({ notes }),
  
  reset: () => set({
    selectedCar: null,
    pickupDate: null,
    returnDate: null,
    pickupLocation: null,
    returnLocation: null,
    selectedFacilities: [],
    needDelivery: false,
    deliveryAddress: '',
    promoCode: '',
    notes: '',
  }),
}));
