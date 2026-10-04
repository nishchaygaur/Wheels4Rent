import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // 1. Schema setup
    console.log('Running schema migrations...');
    await client.query(`
      create extension if not exists "uuid-ossp";

      -- 1. PROFILES TABLE
      create table if not exists public.profiles (
        id text primary key,
        email text not null,
        full_name text not null,
        phone text,
        dl_number text,
        role text default 'customer' check (role in ('customer', 'admin')),
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );

      -- 2. CARS TABLE
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
    `);

    console.log('Tables and functions created successfully.');

    // 2. Seeding initial fleet
    console.log('Seeding initial vehicle fleet...');
    await client.query(`
      insert into public.cars (id, name, brand, model_year, category, daily_price, quantity, available_quantity, fuel_type, transmission, seats, mileage, image_url, features, rating, reviews_count, plate_number, description, is_featured)
      values
        ('car-1', 'Thar 4x4 Hard Top', 'Mahindra', 2024, 'Off-road', 5500, 4, 3, 'Diesel', 'Automatic', 4, '14 km/l', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', array['4x4 Drivetrain', 'Touchscreen Infotainment', 'Convertible / Hardtop', 'Hill Descent Assist', 'Cruise Control'], 4.9, 84, 'DL 01 AX 4490', 'Iconic authentic 4x4 off-roader designed for rough terrain, highway comfort, and adventurous road trips.', true),
        ('car-2', 'XUV 700 AX7 Luxury', 'Mahindra', 2024, 'SUV', 5000, 5, 4, 'Diesel', 'Automatic', 7, '15.5 km/l', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', array['Panoramic Skyroof', 'Level 2 ADAS', 'Dual 10.25 screens', 'Sony 12-Speaker 3D Audio', 'Ventilated Seats'], 4.8, 67, 'DL 04 CZ 8812', 'The pinnacle of luxury and tech in an SUV with generous 7-seater space and whisper-quiet suspension.', true),
        ('car-3', 'Scorpio Classic S11', 'Mahindra', 2024, 'SUV', 6000, 3, 2, 'Diesel', 'Manual', 7, '15 km/l', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', array['mHawk Turbo Engine', '9" Touchscreen', 'Captain Seats', 'Hydraulic Steering'], 4.7, 53, 'HR 26 DQ 7721', 'The legendary Scorpio Classic with raw power, commanding driving position, and rugged durability.', false),
        ('car-4', 'Slavia 1.5 TSI Style', 'Skoda', 2024, 'Sedan', 4000, 4, 4, 'Petrol', 'Automatic', 5, '18.7 km/l', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80', array['150 HP Turbo TSI', 'Electric Sunroof', 'Ventilated Leather Seats', '521L Boot Space'], 4.9, 42, 'UP 16 BE 3319', 'German precision meets executive luxury with phenomenal acceleration and 5-Star safety rating.', true),
        ('car-5', 'Venue SX (O) Turbo', 'Hyundai', 2024, 'SUV', 3500, 6, 5, 'Petrol', 'Automatic', 5, '18 km/l', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80', array['Connected Bluelink Car Tech', 'Air Purifier', 'Drive Modes', 'Smart Sunroof'], 4.6, 38, 'DL 08 BK 9021', 'Agile compact SUV ideally suited for navigating city traffic while offering punchy turbo power.', false),
        ('car-6', 'Fortuner Legender 4x4', 'Toyota', 2024, 'Luxury', 8500, 2, 2, 'Diesel', 'Automatic', 7, '13.5 km/l', 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80', array['500 Nm Torque 4x4', 'Dual Tone Roof', 'Wireless Qi Charging', 'JBL Sound System'], 5.0, 91, 'HR 26 EX 0001', 'The undisputed king of full-size SUVs with peerless road status and indestructible reliability.', true)
      on conflict (id) do update set
        daily_price = excluded.daily_price,
        quantity = excluded.quantity,
        available_quantity = excluded.available_quantity;
    `);
    console.log('Cars seeded successfully.');

    // 3. Insert Admin Profile
    console.log('Seeding administrator profile for wheels4rent@cyberforage.space...');
    await client.query(`
      insert into public.profiles (id, email, full_name, phone, role)
      values (
        'admin-001',
        'wheels4rent@cyberforage.space',
        'Wheels4Rent Operations (Admin)',
        '+91 97589 25637',
        'admin'
      )
      on conflict (id) do update set
        email = excluded.email,
        role = 'admin';
    `);
    console.log('Admin profile configured.');

    // 4. Check API Keys / Config
    console.log('Checking Supabase config & keys...');
    try {
      const keysRes = await client.query(`
        select name, value from (
          select 'jwt_secret' as name, current_setting('app.settings.jwt_secret', true) as value
        ) s;
      `);
      console.log('Current settings:', keysRes.rows);
    } catch (e) {
      // ignore
    }

    // Check count of cars
    const countRes = await client.query('select count(*) as count from public.cars;');
    console.log(`Current cars in database: ${countRes.rows[0].count}`);

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
