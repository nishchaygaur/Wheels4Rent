import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3001;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.gjtzgkgjigsilfnmccig:SurajChaudhary123@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, count(*) as car_count FROM public.cars');
    res.json({
      status: 'connected',
      database: 'Supabase PostgreSQL (aws-0-ap-northeast-1.pooler.supabase.com)',
      currentTime: result.rows[0].current_time,
      fleetCount: Number(result.rows[0].car_count),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 1. CARS API
app.get('/api/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.cars ORDER BY daily_price ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cars', async (req, res) => {
  const c = req.body;
  const id = c.id || `car-${Date.now()}`;
  try {
    const query = `
      INSERT INTO public.cars (
        id, name, brand, model_year, category, daily_price, quantity,
        available_quantity, fuel_type, transmission, seats, mileage,
        image_url, features, rating, reviews_count, plate_number, description, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *;
    `;
    const values = [
      id, c.name, c.brand, c.model_year, c.category, c.daily_price, c.quantity,
      c.available_quantity ?? c.quantity, c.fuel_type, c.transmission, c.seats, c.mileage,
      c.image_url, c.features || [], c.rating || 4.8, c.reviews_count || 0, c.plate_number, c.description, c.is_featured || false
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  const { id } = req.params;
  const c = req.body;
  try {
    const query = `
      UPDATE public.cars SET
        name = COALESCE($1, name),
        brand = COALESCE($2, brand),
        model_year = COALESCE($3, model_year),
        category = COALESCE($4, category),
        daily_price = COALESCE($5, daily_price),
        quantity = COALESCE($6, quantity),
        available_quantity = COALESCE($7, available_quantity),
        fuel_type = COALESCE($8, fuel_type),
        transmission = COALESCE($9, transmission),
        seats = COALESCE($10, seats),
        mileage = COALESCE($11, mileage),
        image_url = COALESCE($12, image_url),
        plate_number = COALESCE($13, plate_number),
        description = COALESCE($14, description)
      WHERE id = $15
      RETURNING *;
    `;
    const values = [
      c.name, c.brand, c.model_year, c.category, c.daily_price,
      c.quantity, c.available_quantity, c.fuel_type, c.transmission,
      c.seats, c.mileage, c.image_url, c.plate_number, c.description, id
    ];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/cars/:id/quantity', async (req, res) => {
  const { id } = req.params;
  const { delta } = req.body; // e.g. +1 or -1
  try {
    const current = await pool.query('SELECT quantity, available_quantity FROM public.cars WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Car not found' });

    const newQty = Math.max(0, current.rows[0].quantity + delta);
    const newAvail = Math.max(0, Math.min(newQty, current.rows[0].available_quantity + delta));

    const result = await pool.query(
      'UPDATE public.cars SET quantity = $1, available_quantity = $2 WHERE id = $3 RETURNING *',
      [newQty, newAvail, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM public.cars WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. BOOKINGS API
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.bookings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const b = req.body;
  const id = b.id || `book-${Date.now()}`;
  try {
    const query = `
      INSERT INTO public.bookings (
        id, booking_number, user_id, car_id, car_name, car_brand, car_image,
        customer_name, customer_email, customer_phone, customer_dl,
        pickup_date, return_date, pickup_location, return_location,
        total_days, daily_rate, add_ons, subtotal, tax_amount, deposit_amount,
        total_amount, payment_method, payment_status, booking_status, email_sent, email_sent_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      ) RETURNING *;
    `;
    const values = [
      id, b.booking_number, b.user_id, b.car_id, b.car_name, b.car_brand, b.car_image,
      b.customer_name, b.customer_email, b.customer_phone, b.customer_dl,
      b.pickup_date, b.return_date, b.pickup_location, b.return_location,
      b.total_days, b.daily_rate, JSON.stringify(b.add_ons || []), b.subtotal, b.tax_amount,
      b.deposit_amount, b.total_amount, b.payment_method || 'upi', b.payment_status || 'paid',
      b.booking_status || 'confirmed', true, new Date().toISOString()
    ];
    const result = await pool.query(query, values);

    // Decrement available quantity in database
    await pool.query('SELECT public.decrement_car_quantity($1)', [b.car_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE public.bookings SET booking_status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (status === 'cancelled') {
      const b = result.rows[0];
      if (b?.car_id) {
        await pool.query('SELECT public.restore_car_quantity($1)', [b.car_id]);
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AUTH / PROFILES
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Designated administrator check
  if (
    (email.toLowerCase() === 'wheels4rent@cyberforage.space' && password === 'Suraj@5141') ||
    (email === 'admin@wheels4rent.com' && password === 'admin123')
  ) {
    return res.json({
      user: {
        id: 'admin-001',
        email: 'wheels4rent@cyberforage.space',
        full_name: 'Wheels4Rent Operations (Admin)',
        phone: '+91 97589 25637',
        role: 'admin',
        created_at: new Date().toISOString(),
      }
    });
  }

  try {
    const profile = await pool.query('SELECT * FROM public.profiles WHERE LOWER(email) = LOWER($1)', [email]);
    if (profile.rows.length > 0) {
      return res.json({ user: profile.rows[0] });
    }

    // Auto create guest/customer profile in database
    const newId = `usr-${Date.now()}`;
    const insertRes = await pool.query(
      'INSERT INTO public.profiles (id, email, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [newId, email, email.split('@')[0], 'customer']
    );
    res.json({ user: insertRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Wheels4Rent Database API Server running on port ${PORT}`);
  console.log(`Connected to Supabase PostgreSQL at aws-0-ap-northeast-1.pooler.supabase.com:5432`);
});
