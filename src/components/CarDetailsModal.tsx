import React from 'react';
import { Car } from '../types';
import { X, Check, Star, Fuel, Gauge, Users, Shield, Calendar, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

interface CarDetailsModalProps {
  car: Car | null;
  onClose: () => void;
  onBookNow: (car: Car) => void;
}

export const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ car, onClose, onBookNow }) => {
  if (!car) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Hero */}
        <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={car.image_url}
            alt={`${car.brand} ${car.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white uppercase tracking-wider">
                {car.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                {car.brand} {car.name}
              </h2>
              <p className="text-xs text-slate-300">
                Model Year: {car.model_year} • Reg Plate: {car.plate_number || 'Official Self-Drive Fleet'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-white">
                ₹{Number(car.daily_price || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 block">per day (excl. GST)</span>
            </div>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key Specs Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <Users className="w-5 h-5 text-brand-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Capacity</p>
              <p className="text-xs font-bold text-white">{car.seats} Passengers</p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <Fuel className="w-5 h-5 text-brand-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Fuel Type</p>
              <p className="text-xs font-bold text-white">{car.fuel_type}</p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <Gauge className="w-5 h-5 text-brand-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">Transmission</p>
              <p className="text-xs font-bold text-white">{car.transmission}</p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400">User Rating</p>
              <p className="text-xs font-bold text-white">{Number(car.rating || 0).toFixed(1)} ({car.reviews_count} reviews)</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About this Car</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-2xl border border-slate-800/80">
              {car.description}
            </p>
          </div>

          {/* Vehicle Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Highlights & Tech</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {car.features.map((feature, i) => (
                <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-200 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Inclusions */}
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-brand-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Wheels4Rent Assurance Included</p>
                <p className="text-[11px] text-slate-300">Clean & sanitized car, 24x7 roadside assist, GST invoice automatically emailed.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
              Zero Surge Guaranteed
            </span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Close
            </button>
            <button
              disabled={car.available_quantity <= 0}
              onClick={() => {
                onClose();
                onBookNow(car);
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/25 flex items-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              <span>{car.available_quantity > 0 ? 'Proceed to Book Now' : 'Currently Out of Stock'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
