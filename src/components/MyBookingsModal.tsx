import React from 'react';
import { Booking } from '../types';
import { downloadInvoicePDF, printInvoicePDF } from '../lib/invoiceGenerator';
import { X, Calendar, Download, Printer, Mail, Car, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface MyBookingsModalProps {
  bookings: Booking[];
  onClose: () => void;
  onOpenEmailPreview: (booking: Booking) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  bookings,
  onClose,
  onOpenEmailPreview,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">My Bookings & Invoices</h3>
              <p className="text-xs text-slate-400">Download Tax Invoices (PDF) and manage your rentals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No bookings found yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Your future self-drive car reservations and invoices will appear right here.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const pickupFmt = format(new Date(booking.pickup_date), 'dd MMM yyyy, hh:mm a');
              const returnFmt = format(new Date(booking.return_date), 'dd MMM yyyy, hh:mm a');

              const statusColor = 
                booking.booking_status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                booking.booking_status === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                booking.booking_status === 'completed' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                'bg-red-500/10 text-red-400 border-red-500/20';

              return (
                <div
                  key={booking.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  
                  {/* Left: Car and booking info */}
                  <div className="flex items-start space-x-4">
                    <img
                      src={booking.car_image}
                      alt={booking.car_name}
                      className="w-24 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                    />

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-brand-400">#{booking.booking_number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusColor}`}>
                          {booking.booking_status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mt-0.5">
                        {booking.car_brand} {booking.car_name}
                      </h4>

                      <div className="text-xs text-slate-400 space-y-0.5 mt-1">
                        <p>Pickup: <span className="text-slate-200">{pickupFmt}</span></p>
                        <p>Return: <span className="text-slate-200">{returnFmt}</span> ({booking.total_days} Days)</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Price and Action Buttons */}
                  <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-left md:text-right mb-0 md:mb-2">
                      <span className="text-xs text-slate-400 block">Total Invoiced</span>
                      <span className="text-base font-black text-white">
                        ₹{booking.total_amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      
                      {/* Download PDF button */}
                      <button
                        onClick={() => downloadInvoicePDF(booking)}
                        title="Download Tax Invoice PDF"
                        className="p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-white border border-brand-500/30 transition text-xs font-bold flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PDF Invoice</span>
                      </button>

                      {/* Print Invoice button */}
                      <button
                        onClick={() => printInvoicePDF(booking)}
                        title="Print Invoice"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs border border-slate-700"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* View Email preview */}
                      <button
                        onClick={() => onOpenEmailPreview(booking)}
                        title="View Email Confirmation & Invoice Sent"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs border border-slate-700 flex items-center space-x-1"
                      >
                        <Mail className="w-3.5 h-3.5 text-brand-400" />
                        <span className="hidden sm:inline">Email Copy</span>
                      </button>

                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
