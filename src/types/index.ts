export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  avatar?: string;
  created_at: string;
}

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  type: 'SUV' | 'Sedan' | 'MPV' | 'Hatchback' | 'Van' | 'Pickup';
  transmission: 'Manual' | 'Automatic';
  passenger_capacity: number;
  price_per_day: number;
  driver_price_per_day?: number | null;
  description?: string;
  images?: string[];
  primary_image?: string;
  status: 'available' | 'booked' | 'maintenance';
  color?: string;
  fuel_type?: string;
  has_ac: boolean;
  has_gps: boolean;
  features?: string[];
  rating: number;
  total_reviews: number;
  facilities?: CarFacility[];
}

export interface CarFacility {
  id: number;
  name: string;
  description?: string;
  price: number;
  icon?: string;
  is_active: boolean;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  phone?: string;
  opening_time?: string;
  closing_time?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
}

export interface Booking {
  id: number;
  booking_number: string;
  user_id?: number;
  car_id: number;
  pickup_location_id: number;
  return_location_id: number;
  is_guest: boolean;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  pickup_date: string;
  return_date: string;
  rental_days: number;
  car_price_per_day: number;
  facilities_total: number;
  subtotal: number;
  discount: number;
  promo_code?: string;
  total_amount: number;
  need_delivery: boolean;
  delivery_address?: string;
  delivery_fee: number;
  status: 'pending_payment' | 'waiting_verification' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  car?: Car;
  pickup_location?: Location;
  return_location?: Location;
  payment?: Payment;
  booking_facilities?: BookingFacility[];
  created_at: string;
}

export interface BookingFacility {
  id: number;
  booking_id: number;
  car_facility_id: number;
  quantity: number;
  price: number;
  total: number;
  facility?: CarFacility;
}

export interface Payment {
  id: number;
  booking_id: number;
  payment_number: string;
  payment_method: 'bank_transfer' | 'cash' | 'e_wallet';
  amount: number;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  payment_proof?: string;
  payment_date?: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Review {
  id: number;
  booking_id: number;
  user_id?: number;
  car_id: number;
  guest_name?: string;
  guest_email?: string;
  rating: number;
  comment?: string;
  images?: string[];
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  user?: User;
  car?: Car;
}

export interface Promotion {
  id: number;
  name: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_transaction?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  data?: any;
  created_at: string;
}

export interface DashboardStats {
  total_bookings: number;
  total_revenue: number;
  total_cars: number;
  total_users: number;
  pending_payments: number;
  active_bookings: number;
  recent_bookings: Booking[];
  revenue_chart: {
    labels: string[];
    data: number[];
  };
  popular_cars: Array<{
    car: Car;
    booking_count: number;
    total_revenue: number;
  }>;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  group: 'general' | 'contact' | 'payment' | 'notification';
  type: 'text' | 'number' | 'boolean' | 'json';
  description?: string;
}
