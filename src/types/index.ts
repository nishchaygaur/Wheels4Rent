export type CarCategory = 'SUV' | 'Sedan' | 'Hatchback' | 'Off-road' | 'Luxury';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG';
export type TransmissionType = 'Automatic' | 'Manual';

export interface Car {
  id: string;
  name: string;
  brand: string;
  model_year: number;
  category: CarCategory;
  daily_price: number;
  quantity: number;           // Total fleet count
  available_quantity: number; // Currently available units
  fuel_type: FuelType;
  transmission: TransmissionType;
  seats: number;
  mileage: string;
  image_url: string;
  features: string[];
  rating: number;
  reviews_count: number;
  plate_number?: string;
  description: string;
  is_featured?: boolean;
}

export interface AddOnOption {
  id: string;
  name: string;
  description: string;
  price_per_day: number;
  iconName: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'pay_on_pickup';
export type BookingStatus = 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface BookingAddOn {
  id: string;
  name: string;
  price_per_day: number;
  total_price: number;
}

export interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  car_id: string;
  car_name: string;
  car_brand: string;
  car_image: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_dl: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  total_days: number;
  daily_rate: number;
  add_ons: BookingAddOn[];
  subtotal: number;
  tax_amount: number;       // GST 18%
  deposit_amount: number;   // Security deposit (refundable)
  total_amount: number;
  payment_method: 'card' | 'upi' | 'pay_on_pickup';
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  email_sent: boolean;
  email_sent_at?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  dl_number?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeRentals: number;
  totalFleetCount: number;
  availableFleetCount: number;
  utilizationRate: number;
  lowStockCarsCount: number;
}
