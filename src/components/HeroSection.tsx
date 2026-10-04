import React from 'react';
import { POPULAR_LOCATIONS } from '../data/mockData';
import { CarCategory } from '../types';
import { Calendar, MapPin, Search, Shield, Zap, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (filters: { location: string; category: string; pickupDate: string; returnDate: string }) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [selectedLocation, setSelectedLocation] = React.useState(POPULAR_LOCATIONS[0]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  
  // Default dates: tomorrow to +3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + 4);
  const returnDateStr = returnDate.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = React.useState(tomorrowStr);
  const [dropoffDate, setDropoffDate] = React.useState(returnDateStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: selectedLocation,
      category: selectedCategory,
      pickupDate,
      returnDate: dropoffDate,
    });
    const el = document.getElementById('fleet-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative pt-6 pb-20 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-500/15 via-brand-600/5 to-transparent blur-3xl -z-10 pointer-events-none" />
      <div className="absolute -top-32 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tagline & Value Pill */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
            <span>Next-Gen Self Drive Car Rental Platform</span>
            <span className="w-1 h-1 rounded-full bg-brand-400"></span>
            <span className="text-slate-300">Instant GST Invoices & Supabase Email Delivery</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight leading-[1.1] mb-6">
            Rent Premium Cars. <br />
            <span className="bg-gradient-to-r from-brand-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Drive With Total Freedom.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Experience hand-picked self-drive SUVs, off-roaders & luxury sedans. Verified sanitized vehicles, instant booking confirmation, automated tax invoice emailed immediately to your inbox.
          </p>
        </div>

        {/* Search Widget Box */}
        <div className="max-w-5xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Location Select */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 focus-within:border-brand-500 transition">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>Pickup & Drop Hub</span>
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer truncate"
                >
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-slate-900 text-slate-100">
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pickup Date */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 focus-within:border-brand-500 transition">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  <span>Pickup Date</span>
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
                />
              </div>

              {/* Return Date */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 focus-within:border-brand-500 transition">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  <span>Return Date</span>
                </label>
                <input
                  type="date"
                  value={dropoffDate}
                  min={pickupDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
                />
              </div>

              {/* Vehicle Category */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 focus-within:border-brand-500 transition">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-brand-400" />
                  <span>Vehicle Type</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900 text-slate-100">All Categories</option>
                  <option value="SUV" className="bg-slate-900 text-slate-100">SUVs & Crossovers</option>
                  <option value="Off-road" className="bg-slate-900 text-slate-100">4x4 & Off-road (Thar)</option>
                  <option value="Sedan" className="bg-slate-900 text-slate-100">Executive Sedans (Slavia)</option>
                  <option value="Luxury" className="bg-slate-900 text-slate-100">Luxury & Electric (Fortuner/EV)</option>
                </select>
              </div>

            </div>

            {/* Action Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Cancellation up to 24 hrs</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero Security Deposit Option</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GST Tax Invoice Included</span>
                </span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 hover:from-brand-500 hover:to-amber-400 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition active:scale-95 text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search Available Fleet</span>
              </button>
            </div>

          </form>
        </div>

        {/* Feature Badges below Hero */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12">
          
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-xs font-bold">100% Insured</p>
              <p className="text-slate-400 text-[11px]">Zero liability options</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-xs font-bold">Instant Delivery</p>
              <p className="text-slate-400 text-[11px]">Airport & Doorstep</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-xs font-bold">PDF Invoice</p>
              <p className="text-slate-400 text-[11px]">Sent instantly to email</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-xs font-bold">24/7 Helpline</p>
              <p className="text-slate-400 text-[11px]">+91-9758925637</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
