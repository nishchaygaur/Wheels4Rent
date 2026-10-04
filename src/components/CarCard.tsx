import React from 'react';
import { Car } from '../types';
import { Fuel, Gauge, Users, Star, Sparkles, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onSelectCar: (car: Car) => void;
  onBookCar: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onSelectCar, onBookCar }) => {
  const isAvailable = car.available_quantity > 0;
  const isLowStock = isAvailable && car.available_quantity <= 2;

  return (
    <div className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-brand-500/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-brand-500/10">
      
      {/* Top Media Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={car.image_url}
          alt={`${car.brand} ${car.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider">
            {car.category}
          </span>
          {car.is_featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500 to-brand-500 text-white shadow-sm flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Popular</span>
            </span>
          )}
        </div>

        {/* Stock Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          {!isAvailable ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/90 text-white flex items-center space-x-1 shadow-md">
              <AlertCircle className="w-3 h-3" />
              <span>Sold Out</span>
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-slate-950 flex items-center space-x-1 shadow-md animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span>Only {car.available_quantity} Left!</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>{car.available_quantity} In Fleet</span>
            </span>
          )}
        </div>

        {/* Rating Floating Badge */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-white text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{car.rating.toFixed(1)}</span>
          <span className="text-slate-400 text-[10px]">({car.reviews_count})</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Brand & Name */}
          <div className="mb-2">
            <p className="text-xs font-bold text-brand-400 tracking-wider uppercase">
              {car.brand} • {car.model_year}
            </p>
            <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition tracking-tight">
              {car.name}
            </h3>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {car.description}
          </p>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-950/50 rounded-2xl border border-slate-800/80 mb-4">
            
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-200">{car.seats} Seats</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center border-x border-slate-800/80">
              <Fuel className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[70px]">{car.fuel_type}</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <Gauge className="w-4 h-4 text-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[70px]">{car.transmission}</span>
            </div>

          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div>
          <div className="pt-2 border-t border-slate-800/80 flex items-baseline justify-between mb-4">
            <div>
              <span className="text-2xl font-black text-white">
                ₹{car.daily_price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 font-medium"> / day</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Zero Surge
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onSelectCar(car)}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/60 transition text-center"
            >
              Specs & Policy
            </button>

            <button
              disabled={!isAvailable}
              onClick={() => onBookCar(car)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md ${
                isAvailable
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-brand-500/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              <span>{isAvailable ? 'Book Self-Drive' : 'Unavailable'}</span>
              {isAvailable && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
