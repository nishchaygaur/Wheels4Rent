# Wheels4Rent | Premium Self-Drive Car Rental Platform

A modern, full-featured Self-Drive Car Rental platform built with React, TypeScript, Tailwind CSS, Supabase Auth & Database, and automated Tax Invoice (PDF) generation and email delivery.

---

## ✨ Features Implemented

### 1. 🧾 Automated Tax Invoice Generation (PDF)
- **Official GST Tax Invoice**: Compliant with Indian transport regulations, generated via `jspdf` & `jspdf-autotable`.
- **Itemized Pricing**:
  - Base Daily Car Rental
  - Protection Add-ons (Zero Excess Damage Protection, Additional Co-Driver, Child Seat, GPS Dashcam)
  - Subtotal
  - Goods & Services Tax (GST 18%)
  - Refundable Security Deposit
  - Grand Total Invoiced
- **Download & Print Ready**: Immediate 1-click PDF download or direct print dialog from checkout, user booking drawer, or admin dashboard.
- Includes unique Invoice Numbers (`INV-W4R-2026-XXXX`), registered contact helplines (`+91-9758925637`, `wheels4rent001@gmail.com`), pickup/return locations, and driver license validation.

### 2. 📧 Supabase Email Delivery & User Flows
- **User Email Confirmation**: When users sign up, Supabase Auth handles email verification.
- **Working Password Reset**: Users can initiate password recovery, receive the reset link via email, and securely set a new password.
- **Booking Confirmation & Tax Invoice Emails**:
  - Instant dispatch to customer's email upon reservation.
  - Interactive **Email Delivery Center** in the app allowing customer or admin to inspect rendered HTML templates and re-dispatch on demand.
  - Ready-to-deploy **Supabase Edge Function** (`supabase/functions/send-booking-invoice/index.ts`).

### 3. 🛡️ Admin Management Portal & Visual Dashboard
- **Executive Analytics**:
  - Total Invoiced Revenue (₹)
  - Total Reservations count
  - Fleet Utilization Rate (%)
  - Low Stock Alerts (vehicles with ≤ 1 unit left)
- **Interactive Visual Charts (Recharts)**:
  - Monthly Revenue Trend (Gradient Area Chart)
  - Booking Status Distribution (Donut / Pie Chart)
  - Fleet Inventory by Category (Bar Chart)
- **Fleet Control & Stock Quantity Adjustments**:
  - **Add New Vehicle**: Brand, model, category, daily price, total quantity, fuel, transmission, seats, mileage, image URL, and plate number.
  - **1-Click Quantity Adjustments**: Immediate `+` and `-` controls to increase or decrease available fleet units.
  - **Update Pricing & Details**: Real-time price edits.
  - **Delete Vehicles**: Secure removal with confirmation.
  - **Automatic Stock Tracking**: Units decrement upon reservation. Vehicles with 0 stock automatically show "Sold Out / Unavailable".
- **Booking Operations**:
  - View all customer reservations.
  - Update status (`Confirmed`, `Active / On Road`, `Completed`, `Cancelled`).
  - 1-click PDF Invoice Download for any booking.
  - 1-click Email Re-dispatch.
- **Email Audit Logs**: Full delivery trail with recipient, timestamp, and template preview.

### 4. 🚗 Premium Customer Experience
- **Luxury UI**: Dark slate & energetic orange aesthetic, glassmorphic cards, crisp typography.
- **Interactive Search Widget**: Filter by pickup hub (IGI Airport, Cyber Hub Gurugram, Noida, etc.), dates, and vehicle category.
- **Curated Fleet Catalog**: Filter by Category (SUV, Off-road, Sedan, Luxury), Fuel Type (Petrol, Diesel, Electric), and Transmission (Automatic, Manual).
- **Vehicle Details Modal**: 45-point inspection specs, safety highlights, inclusions, and rental policies.
- **My Bookings Modal**: Access active and past rentals, download PDF invoices, or inspect emailed copies.

---

## 🚀 Quick Start Guide

### 1. Development Server
```bash
npm install
npm run dev
```
The server runs on `http://localhost:5173/`.

### 2. Administrator Access
Access the operations dashboard via the Admin portal link using your authorized administrator credentials.

---

## 🗄️ Supabase Configuration (Optional for Cloud Mode)

The application works completely out-of-the-box with persistent local storage. To connect to your live Supabase cloud project:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL schema script in Supabase SQL Editor:
   - File: `supabase/migrations/01_schema.sql` (Creates `profiles`, `cars`, `bookings` tables, RLS policies, and stock decrement triggers).
   - File: `supabase/seed.sql` (Seeds initial fleet).
3. Copy your project credentials into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. In your Supabase Dashboard -> **Authentication** -> **URL Configuration**:
   - Set Site URL to `http://localhost:5173` (or your production domain).
   - Ensure "Enable Email Confirmations" is turned on.
5. (Optional) Deploy the transactional email Edge Function:
   ```bash
   supabase functions deploy send-booking-invoice
   ```

---

## 📁 Project Architecture

```
Wheels4Rent/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx   # Visual charts, stock +/- toggles, car CRUD, bookings & email logs
│   │   ├── AuthModal.tsx            # Supabase Sign In, Sign Up, and demo shortcuts
│   │   ├── BookingModal.tsx         # Multi-step checkout, PDF invoice download, email dispatch
│   │   ├── CarCard.tsx              # Vehicle card with live stock badges & specs
│   │   ├── CarDetailsModal.tsx      # Full specifications, policies, and highlights
│   │   ├── EmailPreviewModal.tsx    # Interactive rendered HTML email & resend center
│   │   ├── FleetSection.tsx         # Search, category pills, fuel/transmission filters, sorting
│   │   ├── Footer.tsx               # Brand info, helpline, social links, admin gateway
│   │   ├── HeroSection.tsx          # Luxury hero with search & itinerary widget
│   │   ├── HowItWorks.tsx           # 4-step rental process
│   │   ├── MyBookingsModal.tsx      # Customer bookings and PDF invoice download
│   │   ├── Navbar.tsx               # Navigation, user profile, admin toggle & Supabase status
│   │   ├── ResetPasswordModal.tsx   # Supabase Auth password update
│   │   └── WhyChooseUs.tsx          # Value propositions & guarantees
│   ├── data/
│   │   └── mockData.ts              # Initial fleet (Thar, Scorpio, XUV 700, Slavia, Fortuner, etc.)
│   ├── lib/
│   │   ├── authService.ts           # Supabase Auth, session, password reset, and demo auth
│   │   ├── emailService.ts          # HTML email template, Supabase Edge dispatch, and audit logger
│   │   ├── invoiceGenerator.ts      # jsPDF & jspdf-autotable Tax Invoice (PDF) generator
│   │   └── supabase.ts              # Supabase client with offline resilient store fallback
│   ├── types/
│   │   └── index.ts                 # TypeScript data contracts
│   ├── App.tsx                      # Root coordinator
│   ├── index.css                    # Tailwind CSS & glassmorphic utilities
│   └── main.tsx                     # Entry point
├── supabase/
│   ├── functions/
│   │   └── send-booking-invoice/    # Supabase Deno Edge Function
│   ├── migrations/
│   │   └── 01_schema.sql            # Full PostgreSQL schema with RLS and stock triggers
│   └── seed.sql                     # Seed script
├── .env.example
├── tailwind.config.js
└── package.json
```

---

## 📞 Support & Contact Info
- **Helpline**: +91-9758925637
- **Support & Sender Email**: wheels4rent@cyberforage.space
- **Hub Address**: Plot 42, Aerocity Commercial Hub, New Delhi, 110037
