import { Booking } from '../types';
import { isSupabaseConfigured, supabase, markBookingEmailSent } from './supabase';
import { format } from 'date-fns';

export interface EmailLog {
  id: string;
  booking_id: string;
  booking_number: string;
  recipient_email: string;
  customer_name: string;
  subject: string;
  sent_at: string;
  status: 'delivered' | 'sent' | 'failed';
  provider: 'Supabase Edge Functions' | 'Supabase Auth Mailer' | 'Wheels4Rent Dispatcher';
  html_preview: string;
}

const EMAIL_LOGS_KEY = 'w4r_email_logs_v1';

export function generateBookingEmailHtml(booking: Booking): string {
  const pickupFmt = format(new Date(booking.pickup_date), 'EEE, dd MMM yyyy @ hh:mm a');
  const returnFmt = format(new Date(booking.return_date), 'EEE, dd MMM yyyy @ hh:mm a');
  const totalAmountFmt = `INR ${booking.total_amount.toLocaleString('en-IN')}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wheels4Rent Booking Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }
    .card { max-width: 620px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 32px 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; color: #ffffff; letter-spacing: 1px; }
    .header p { margin: 8px 0 0 0; color: #fed7aa; font-size: 14px; }
    .badge { display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; margin-top: 10px; font-weight: bold; }
    .body-content { padding: 28px; }
    .hero-car { background-color: #0f172a; border-radius: 12px; padding: 18px; display: flex; align-items: center; margin-bottom: 24px; border: 1px solid #334155; }
    .car-info h3 { margin: 0 0 4px 0; font-size: 20px; color: #ffffff; }
    .car-info p { margin: 0; color: #94a3b8; font-size: 13px; }
    .summary-grid { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .summary-grid td { padding: 12px 10px; border-bottom: 1px solid #334155; font-size: 14px; }
    .label { color: #94a3b8; width: 40%; }
    .value { color: #f1f5f9; font-weight: 600; text-align: right; }
    .total-row td { border-bottom: none; font-size: 18px; color: #f97316; font-weight: bold; padding-top: 16px; }
    .action-btn { display: block; text-align: center; background-color: #f97316; color: #ffffff !important; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 24px 0 16px 0; }
    .footer { background-color: #0b1120; padding: 20px 28px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🚗 WHEELS 4 RENT</h1>
      <p>Booking Confirmed & Tax Invoice Attached</p>
      <div class="badge">BOOKING #${booking.booking_number}</div>
    </div>
    <div class="body-content">
      <p style="font-size: 16px; margin-top: 0;">Hello <strong>${booking.customer_name}</strong>,</p>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Your self-drive rental is locked in! Your official digital Tax Invoice (PDF) has been generated and validated with your booking.
      </p>

      <div class="hero-car">
        <div class="car-info">
          <h3>${booking.car_brand} ${booking.car_name}</h3>
          <p>Registration: ${booking.car_brand} | Category: Self-Drive | Total Days: ${booking.total_days}</p>
        </div>
      </div>

      <table class="summary-grid">
        <tr>
          <td class="label">Pickup Date & Time:</td>
          <td class="value">${pickupFmt}</td>
        </tr>
        <tr>
          <td class="label">Return Date & Time:</td>
          <td class="value">${returnFmt}</td>
        </tr>
        <tr>
          <td class="label">Pickup Location:</td>
          <td class="value">${booking.pickup_location}</td>
        </tr>
        <tr>
          <td class="label">Base Rental:</td>
          <td class="value">INR ${booking.subtotal.toLocaleString('en-IN')}</td>
        </tr>
        ${booking.add_ons && booking.add_ons.length > 0 ? `
        <tr>
          <td class="label">Add-ons (${booking.add_ons.map(a => a.name).join(', ')}):</td>
          <td class="value">INR ${booking.add_ons.reduce((s, a) => s + a.total_price, 0).toLocaleString('en-IN')}</td>
        </tr>` : ''}
        <tr>
          <td class="label">Taxes (GST 18%):</td>
          <td class="value">INR ${booking.tax_amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td class="label">Security Deposit (Refundable):</td>
          <td class="value">INR ${booking.deposit_amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr class="total-row">
          <td class="label" style="color: #f97316;">Grand Total:</td>
          <td class="value">${totalAmountFmt}</td>
        </tr>
      </table>

      <div style="background-color: #0f172a; padding: 14px; border-radius: 8px; border-left: 4px solid #f97316; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
          <strong>Pickup Instructions:</strong> Please carry your original Driving License (${booking.customer_dl}) and Govt. ID for fast verification upon pickup.
        </p>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 0;">
        For instant assistance, call our 24/7 Helpline: <strong>+91-9758925637</strong> or email <strong>wheels4rent@cyberforage.space</strong>
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Wheels4Rent Self-Drive Services. Plot 42, Aerocity Commercial Hub, New Delhi.</p>
      <p>Sent by <strong>wheels4rent@cyberforage.space</strong> via Wheels4Rent Supabase Mail Services.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendBookingEmail(booking: Booking, customRecipient?: string): Promise<EmailLog> {
  const recipient = customRecipient || booking.customer_email;
  const htmlContent = generateBookingEmailHtml(booking);
  const subject = `Booking Confirmed: ${booking.car_brand} ${booking.car_name} [INV-${booking.booking_number}]`;

  let deliveryStatus: 'delivered' | 'sent' | 'failed' = 'sent';

  // 1. Dispatch real transactional email via backend invoice API
  try {
    const res = await fetch('/api/send-booking-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking,
        recipientEmail: recipient,
        html: htmlContent,
        subject,
      }),
    });

    if (res.ok) {
      deliveryStatus = 'delivered';
      console.log(`[Email Service] Invoice successfully sent to ${recipient}`);
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn('[Email Service] Invoice API returned non-OK status:', errData.error || res.statusText);
      deliveryStatus = 'failed';
    }
  } catch (err: any) {
    console.warn('[Email Service] Network error dispatching invoice email:', err.message);
    deliveryStatus = 'failed';
  }

  // 2. Mark booking as emailed in database / storage
  await markBookingEmailSent(booking.id);

  // 3. Record in Email Logs
  const emailLog: EmailLog = {
    id: `mail-${Date.now()}`,
    booking_id: booking.id,
    booking_number: booking.booking_number,
    recipient_email: recipient,
    customer_name: booking.customer_name,
    subject,
    sent_at: new Date().toISOString(),
    status: deliveryStatus,
    provider: 'Wheels4Rent Dispatcher',
    html_preview: htmlContent,
  };

  const stored = localStorage.getItem(EMAIL_LOGS_KEY);
  const logs: EmailLog[] = stored ? JSON.parse(stored) : [];
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify([emailLog, ...logs]));

  return emailLog;
}

export function getEmailLogs(): EmailLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(EMAIL_LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
}
