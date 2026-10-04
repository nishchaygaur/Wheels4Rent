-- Wheels4Rent Production Supabase Schema
-- Includes Cars, Bookings, Profiles, and automated quantity triggers

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Users & Admins)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  phone text,
  dl_number text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CARS TABLE (Fleet Inventory)
create table if not exists public.cars (
  id text primary key,
  name text not null,
  brand text not null,
  model_year integer not null,
  category text not null check (category in ('SUV', 'Sedan', 'Hatchback', 'Off-road', 'Luxury')),
  daily_price numeric not null check (daily_price >= 0),
  quantity integer not null default 1 check (quantity >= 0),
  available_quantity integer not null default 1 check (available_quantity >= 0),
  fuel_type text not null check (fuel_type in ('Petrol', 'Diesel', 'Electric', 'CNG')),
  transmission text not null check (transmission in ('Automatic', 'Manual')),
  seats integer not null default 5,
  mileage text,
  image_url text not null,
  features text[] default '{}',
  rating numeric default 4.8,
  reviews_count integer default 0,
  plate_number text,
  description text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. BOOKINGS TABLE
create table if not exists public.bookings (
  id text primary key,
  booking_number text unique not null,
  user_id text not null,
  car_id text references public.cars(id) on delete set null,
  car_name text not null,
  car_brand text not null,
  car_image text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_dl text not null,
  pickup_date timestamp with time zone not null,
  return_date timestamp with time zone not null,
  pickup_location text not null,
  return_location text not null,
  total_days integer not null,
  daily_rate numeric not null,
  add_ons jsonb default '[]'::jsonb,
  subtotal numeric not null,
  tax_amount numeric not null,
  deposit_amount numeric not null,
  total_amount numeric not null,
  payment_method text default 'upi',
  payment_status text default 'paid' check (payment_status in ('paid', 'pending', 'pay_on_pickup')),
  booking_status text default 'confirmed' check (booking_status in ('confirmed', 'active', 'completed', 'cancelled')),
  email_sent boolean default false,
  email_sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. FUNCTION: Decrement Car Quantity on Booking
create or replace function public.decrement_car_quantity(car_id_param text)
returns void as $$
begin
  update public.cars
  set available_quantity = greatest(0, available_quantity - 1)
  where id = car_id_param and available_quantity > 0;
end;
$$ language plpgsql security definer;

-- 5. FUNCTION: Restore Car Quantity on Booking Cancellation
create or replace function public.restore_car_quantity(car_id_param text)
returns void as $$
begin
  update public.cars
  set available_quantity = least(quantity, available_quantity + 1)
  where id = car_id_param;
end;
$$ language plpgsql security definer;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.bookings enable row level security;

-- Profiles: Anyone can view their own profile, admins can view all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Cars: Anyone can view cars, only admins can insert/update/delete
create policy "Anyone can view cars" on public.cars
  for select using (true);

create policy "Admins can manage cars" on public.cars
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Bookings: Customers can read their own bookings, create bookings, admins can manage all
create policy "Users can read own bookings" on public.bookings
  for select using (
    auth.uid()::text = user_id or 
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Users can insert bookings" on public.bookings
  for insert with check (true);

create policy "Admins can update bookings" on public.bookings
  for update using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
