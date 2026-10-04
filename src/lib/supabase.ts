import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Car, Booking, UserProfile } from '../types';
import { INITIAL_CARS, INITIAL_BOOKINGS } from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gjtzgkgjigsilfnmccig.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = (isSupabaseConfigured && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local persistent store keys for offline fallback
const STORAGE_KEYS = {
  CARS: 'w4r_cars_v1',
  BOOKINGS: 'w4r_bookings_v1',
  AUTH_USER: 'w4r_auth_user_v1',
  PROFILES: 'w4r_profiles_v1',
  RESET_TOKENS: 'w4r_reset_tokens_v1',
  EMAIL_LOGS: 'w4r_email_logs_v1',
};

// Seed LocalStorage if empty
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CARS)) {
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(INITIAL_CARS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    const defaultProfiles: UserProfile[] = [
      {
        id: 'admin-001',
        email: 'wheels4rent@cyberforage.space',
        full_name: 'Wheels4Rent Operations (Admin)',
        phone: '+91 97589 25637',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
      {
        id: 'user-demo-1',
        email: 'rahul.sharma@example.com',
        full_name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        dl_number: 'DL0420190082341',
        role: 'customer',
        created_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(defaultProfiles));
  }
}

initializeLocalStorage();

// Helper to guarantee numbers are strictly typed numbers (Postgres numeric/decimal returns strings)
export function sanitizeCar(c: any): Car {
  return {
    ...c,
    daily_price: Number(c.daily_price || 0),
    rating: Number(c.rating || 4.8),
    quantity: Number(c.quantity || 0),
    available_quantity: Number(c.available_quantity ?? c.quantity ?? 0),
    seats: Number(c.seats || 5),
    model_year: Number(c.model_year || 2024),
    reviews_count: Number(c.reviews_count || 0),
    features: Array.isArray(c.features)
      ? c.features
      : (typeof c.features === 'string' ? JSON.parse(c.features || '[]') : []),
    is_featured: Boolean(c.is_featured),
  };
}

export function sanitizeBooking(b: any): Booking {
  return {
    ...b,
    total_days: Number(b.total_days || 1),
    daily_rate: Number(b.daily_rate || 0),
    subtotal: Number(b.subtotal || 0),
    tax_amount: Number(b.tax_amount || 0),
    deposit_amount: Number(b.deposit_amount || 0),
    total_amount: Number(b.total_amount || 0),
    add_ons: Array.isArray(b.add_ons)
      ? b.add_ons
      : (typeof b.add_ons === 'string' ? JSON.parse(b.add_ons || '[]') : []),
  };
}

// ==========================================
// VEHICLES (CARS) DATA ACCESS
// ==========================================

export async function fetchCars(): Promise<Car[]> {
  // 1. Try Backend API connected directly to Supabase Postgres
  try {
    const res = await fetch('/api/cars');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sanitized = data.map(sanitizeCar);
        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(sanitized));
        return sanitized;
      }
    }
  } catch (e) {
    // Backend API not reachable or offline, fallback to Supabase JS or local
  }

  // 2. Try Supabase JS client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('daily_price', { ascending: true });
      if (!error && data && data.length > 0) {
        return (data as any[]).map(sanitizeCar);
      }
    } catch (err) {
      console.warn('Supabase fetchCars failed, falling back to local database:', err);
    }
  }

  // 3. Fallback to local storage
  const stored = localStorage.getItem(STORAGE_KEYS.CARS);
  return stored ? JSON.parse(stored).map(sanitizeCar) : INITIAL_CARS.map(sanitizeCar);
}

export async function addCar(carData: Omit<Car, 'id'>): Promise<Car> {
  const newCar: Car = {
    ...carData,
    id: `car-${Date.now()}`,
    available_quantity: carData.quantity,
  };

  // 1. Try Backend API -> Supabase Postgres
  try {
    const res = await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCar),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (e) {
    // continue to fallback
  }

  // 2. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cars')
        .insert([newCar])
        .select()
        .single();
      if (!error && data) return data as Car;
    } catch (err) {
      console.warn('Supabase addCar failed, saving locally:', err);
    }
  }

  // 3. Local fallback
  const cars = await fetchCars();
  const updatedCars = [newCar, ...cars];
  localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(updatedCars));
  return newCar;
}

export async function updateCar(id: string, updates: Partial<Car>): Promise<Car> {
  // 1. Try Backend API -> Supabase Postgres
  try {
    const res = await fetch(`/api/cars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (e) {
    // continue to fallback
  }

  // 2. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cars')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Car;
    } catch (err) {
      console.warn('Supabase updateCar failed, saving locally:', err);
    }
  }

  // 3. Local fallback
  const cars = await fetchCars();
  const updatedCars = cars.map(c => {
    if (c.id === id) {
      let available_quantity = updates.available_quantity !== undefined 
        ? updates.available_quantity 
        : c.available_quantity;
      if (updates.quantity !== undefined && available_quantity > updates.quantity) {
        available_quantity = updates.quantity;
      }
      return { ...c, ...updates, available_quantity };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(updatedCars));
  const updated = updatedCars.find(c => c.id === id)!;
  return updated;
}

export async function updateCarQuantity(id: string, delta: number): Promise<Car> {
  // 1. Try Backend API -> Supabase Postgres
  try {
    const res = await fetch(`/api/cars/${id}/quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (e) {
    // continue to fallback
  }

  // 2. Local fallback
  const cars = await fetchCars();
  const target = cars.find(c => c.id === id);
  if (!target) throw new Error('Car not found');

  const newQty = Math.max(0, target.quantity + delta);
  const newAvailable = Math.max(0, Math.min(newQty, target.available_quantity + delta));

  return updateCar(id, {
    quantity: newQty,
    available_quantity: newAvailable
  });
}

export async function deleteCar(id: string): Promise<boolean> {
  // 1. Try Backend API -> Supabase Postgres
  try {
    const res = await fetch(`/api/cars/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    // continue to fallback
  }

  // 2. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase deleteCar failed, deleting locally:', err);
    }
  }

  // 3. Local fallback
  const cars = await fetchCars();
  const filtered = cars.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(filtered));
  return true;
}

// ==========================================
// BOOKINGS DATA ACCESS
// ==========================================

export async function fetchBookings(): Promise<Booking[]> {
  // 1. Try Backend API -> Supabase Postgres
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const sanitized = data.map(sanitizeBooking);
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(sanitized));
        return sanitized;
      }
    }
  } catch (e) {
    // fallback
  }

  // 2. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return (data as any[]).map(sanitizeBooking);
      }
    } catch (err) {
      console.warn('Supabase fetchBookings failed, falling back to local:', err);
    }
  }

  // 3. Local fallback
  const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return stored ? JSON.parse(stored).map(sanitizeBooking) : INITIAL_BOOKINGS.map(sanitizeBooking);
}

export async function fetchUserBookings(userEmailOrId: string): Promise<Booking[]> {
  const all = await fetchBookings();
  return all.filter(
    b => b.user_id === userEmailOrId || b.customer_email.toLowerCase() === userEmailOrId.toLowerCase()
  );
}

export async function createBooking(bookingData: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
  const newBooking: Booking = {
    ...bookingData,
    id: `book-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  // 1. Try Backend API -> Supabase Postgres
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (e) {
    // fallback
  }

  // 2. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([newBooking])
        .select()
        .single();
      if (!error && data) {
        await supabase.rpc('decrement_car_quantity', { car_id_param: bookingData.car_id });
        return data as Booking;
      }
    } catch (err) {
      console.warn('Supabase createBooking failed, saving locally:', err);
    }
  }

  // 3. Local fallback
  const bookings = await fetchBookings();
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([newBooking, ...bookings]));

  const cars = await fetchCars();
  const updatedCars = cars.map(c => {
    if (c.id === bookingData.car_id && c.available_quantity > 0) {
      return { ...c, available_quantity: c.available_quantity - 1 };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(updatedCars));

  return newBooking;
}

export async function updateBookingStatus(id: string, status: Booking['booking_status']): Promise<Booking> {
  // 1. Try Backend API -> Supabase Postgres
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (e) {
    // fallback
  }

  // 2. Try Supabase Client
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ booking_status: status })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Booking;
    } catch (err) {
      console.warn('Supabase updateBookingStatus failed:', err);
    }
  }

  // 3. Local fallback
  const bookings = await fetchBookings();
  const updated = bookings.map(b => (b.id === id ? { ...b, booking_status: status } : b));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
  return updated.find(b => b.id === id)!;
}

export async function markBookingEmailSent(id: string): Promise<void> {
  const bookings = await fetchBookings();
  const updated = bookings.map(b => 
    b.id === id ? { ...b, email_sent: true, email_sent_at: new Date().toISOString() } : b
  );
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
}
