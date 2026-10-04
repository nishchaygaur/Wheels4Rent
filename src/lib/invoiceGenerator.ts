import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '../types';
import { format } from 'date-fns';

export function generateInvoicePDF(booking: Booking): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const formatCurrency = (amount: number) => `INR ${amount.toLocaleString('en-IN')}`;

  // Top Accent Banner
  doc.setFillColor(249, 115, 22); // brand orange #f97316
  doc.rect(0, 0, pageWidth, 7, 'F');

  // Header Title & Logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('WHEELS 4 RENT', 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('PREMIUM SELF-DRIVE CAR RENTALS', 15, 27);
  doc.text('Plot 42, Aerocity Commercial Hub, New Delhi, 110037', 15, 32);
  doc.text('Helpline: +91-9758925637  |  Email: wheels4rent@cyberforage.space', 15, 36);
  doc.text('GSTIN: 07AAACW4982R1ZQ  |  Web: wheels4rent.com', 15, 40);

  // Invoice Meta Box (Right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(249, 115, 22);
  doc.text('TAX INVOICE', pageWidth - 15, 22, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Invoice #: INV-${booking.booking_number}`, pageWidth - 15, 29, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${format(new Date(booking.created_at || Date.now()), 'dd MMM yyyy, hh:mm a')}`, pageWidth - 15, 34, { align: 'right' });
  doc.text(`Status: ${booking.payment_status.toUpperCase()}`, pageWidth - 15, 39, { align: 'right' });
  doc.text(`Payment: ${booking.payment_method.toUpperCase()}`, pageWidth - 15, 44, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 48, pageWidth - 15, 48);

  // Customer & Rental Details Columns
  // Column 1: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('BILLED TO (CUSTOMER):', 15, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Full Name: ${booking.customer_name}`, 15, 61);
  doc.text(`Email: ${booking.customer_email}`, 15, 66);
  doc.text(`Phone: ${booking.customer_phone}`, 15, 71);
  doc.text(`Driving License #: ${booking.customer_dl}`, 15, 76);

  // Column 2: Rental Itinerary Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('RENTAL ITINERARY:', pageWidth / 2 + 5, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Vehicle: ${booking.car_brand} ${booking.car_name}`, pageWidth / 2 + 5, 61);
  doc.text(`Duration: ${booking.total_days} Day(s)`, pageWidth / 2 + 5, 66);
  
  const pickupFmt = format(new Date(booking.pickup_date), 'dd MMM yyyy, hh:mm a');
  const returnFmt = format(new Date(booking.return_date), 'dd MMM yyyy, hh:mm a');
  doc.text(`Pickup: ${pickupFmt}`, pageWidth / 2 + 5, 71);
  doc.text(`Return: ${returnFmt}`, pageWidth / 2 + 5, 76);
  
  // Location subtext
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Location: ${booking.pickup_location.substring(0, 45)}...`, 15, 82);

  // Table of Charges
  const tableData: Array<[string, string, string, string]> = [
    [
      `Self-Drive Rental: ${booking.car_brand} ${booking.car_name}`,
      formatCurrency(booking.daily_rate),
      `${booking.total_days} Day(s)`,
      formatCurrency(booking.subtotal)
    ]
  ];

  if (booking.add_ons && booking.add_ons.length > 0) {
    booking.add_ons.forEach(addon => {
      tableData.push([
        `Add-on: ${addon.name}`,
        formatCurrency(addon.price_per_day),
        `${booking.total_days} Day(s)`,
        formatCurrency(addon.total_price)
      ]);
    });
  }

  tableData.push(
    ['Subtotal (Rental & Services)', '-', '-', formatCurrency(booking.subtotal + (booking.add_ons?.reduce((s, a) => s + a.total_price, 0) || 0))],
    ['Goods & Services Tax (GST 18%)', '-', '18%', formatCurrency(booking.tax_amount)],
    ['Refundable Security Deposit', '-', 'Deposit', formatCurrency(booking.deposit_amount)]
  );

  autoTable(doc, {
    startY: 88,
    margin: { left: 15, right: 15 },
    head: [['Item Description', 'Daily Rate', 'Period / Qty', 'Total (INR)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'right', cellWidth: 30 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30 }
    }
  });

  // Calculate final Y after table
  const finalY = (doc as any).lastAutoTable?.finalY || 140;

  // Total Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pageWidth - 85, finalY + 5, 70, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - 85, finalY + 5, 70, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('GRAND TOTAL AMOUNT:', pageWidth - 80, finalY + 12);

  doc.setFontSize(14);
  doc.setTextColor(234, 88, 12);
  doc.text(formatCurrency(booking.total_amount), pageWidth - 80, finalY + 22);

  // Terms and Security Deposit Note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('RENTAL POLICY & IMPORTANT NOTES:', 15, finalY + 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const terms = [
    '1. Security Deposit of INR ' + booking.deposit_amount.toLocaleString('en-IN') + ' is 100% refundable within 24 hours after inspection of vehicle upon drop-off.',
    '2. Fuel Policy: Same to same. Vehicle is handed over with specific fuel level and must be returned with the equivalent level.',
    '3. Valid Original Driving License (min. 1 year old) & Govt ID must be presented physically at the time of vehicle handover.',
    '4. In case of breakdown or roadside assistance, contact 24/7 Support: +91-9758925637 immediately.',
    '5. Speed limit is electronically capped at 100 km/h in accordance with transport safety regulations.'
  ];

  let currentTermY = finalY + 39;
  terms.forEach(term => {
    doc.text(term, 15, currentTermY);
    currentTermY += 4.5;
  });

  // Authorized Signatory & QR Verification Badge
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Signatory', pageWidth - 20, finalY + 68, { align: 'right' });
  doc.text('Wheels 4 Rent Automated Billing System', pageWidth - 20, finalY + 72, { align: 'right' });

  // Bottom footer accent
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 287, pageWidth, 10, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Thank you for choosing Wheels 4 Rent! Drive safe and enjoy your journey.', pageWidth / 2, 293, { align: 'center' });

  return doc;
}

export function downloadInvoicePDF(booking: Booking): void {
  const doc = generateInvoicePDF(booking);
  doc.save(`Invoice_${booking.booking_number}.pdf`);
}

export function printInvoicePDF(booking: Booking): void {
  const doc = generateInvoicePDF(booking);
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

export function getInvoiceDataUri(booking: Booking): string {
  const doc = generateInvoicePDF(booking);
  return doc.output('datauristring');
}
