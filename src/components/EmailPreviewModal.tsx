import React from 'react';
import { Booking } from '../types';
import { generateBookingEmailHtml, sendBookingEmail } from '../lib/emailService';
import { downloadInvoicePDF } from '../lib/invoiceGenerator';
import { X, Mail, Send, Download, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface EmailPreviewModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const [recipientEmail, setRecipientEmail] = React.useState(booking.customer_email);
  const [isSending, setIsSending] = React.useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = React.useState<string | null>(null);

  const emailHtml = React.useMemo(() => {
    return generateBookingEmailHtml(booking);
  }, [booking]);

  const handleResend = async () => {
    setIsSending(true);
    setSendSuccessMessage(null);
    try {
      await sendBookingEmail(booking, recipientEmail);
      setSendSuccessMessage(`Booking confirmation & invoice successfully dispatched to ${recipientEmail} via Supabase Mail!`);
    } catch (e: any) {
      alert(`Error sending email: ${e.message || e}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Supabase Email Delivery Center</h3>
              <p className="text-xs text-slate-400">
                Booking #{booking.booking_number} • Customer: {booking.customer_name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dispatch Controls Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">From:</span>
              <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                wheels4rent@cyberforage.space
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">To:</span>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-brand-500 w-full sm:w-56"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => downloadInvoicePDF(booking)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Invoice</span>
            </button>

            <button
              onClick={handleResend}
              disabled={isSending}
              className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold shadow-md shadow-brand-500/25 flex items-center space-x-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send / Resend Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {sendSuccessMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-2.5 flex items-center space-x-2 text-xs text-emerald-400 shrink-0">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{sendSuccessMessage}</span>
          </div>
        )}

        {/* Rendered HTML Email Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
            <div 
              className="w-full text-slate-200"
              dangerouslySetInnerHTML={{ __html: emailHtml }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
