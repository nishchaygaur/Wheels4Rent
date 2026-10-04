import React from 'react';
import { UserProfile } from '../types';
import { Car, Shield, User, LogOut, Calendar, Key, ShieldCheck, Mail } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: (initialTab?: 'signin' | 'signup' | 'forgot') => void;
  onLogout: () => void;
  onOpenMyBookings: () => void;
  onOpenAdmin: () => void;
  onOpenResetPassword: () => void;
  onOpenEmailCenter?: () => void;
  isAdminView: boolean;
  onToggleAdminView: (admin: boolean) => void;
  supabaseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenMyBookings,
  onOpenAdmin,
  onOpenResetPassword,
  onOpenEmailCenter,
  isAdminView,
  onToggleAdminView,
  supabaseConnected,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onToggleAdminView(false)}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                  Wheels<span className="text-brand-500">4</span>Rent
                </span>
                <span className="bg-brand-500/10 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/20 uppercase tracking-wider">
                  Self-Drive
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Drive Freedom • Zero Hassle</p>
            </div>
          </div>

          {/* Center Navigation Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button
              onClick={() => {
                onToggleAdminView(false);
                const el = document.getElementById('fleet-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-300 hover:text-brand-400 transition"
            >
              Our Fleet
            </button>
            <button
              onClick={() => {
                onToggleAdminView(false);
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-300 hover:text-brand-400 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                onToggleAdminView(false);
                const el = document.getElementById('why-choose-us');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-slate-300 hover:text-brand-400 transition"
            >
              Why Wheels4Rent
            </button>
            <a
              href="tel:+919758925637"
              className="text-slate-300 hover:text-brand-400 transition flex items-center space-x-1"
            >
              <span>Helpline:</span>
              <span className="text-brand-400 font-semibold">+91-9758925637</span>
            </a>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center space-x-3">
            {/* Supabase status indicator badge */}
            <div 
              title={supabaseConnected ? "Connected to live Supabase Backend & Auth" : "Using Local Storage Mock Mode (Provide VITE_SUPABASE_URL to connect)"}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 cursor-help"
            >
              <div className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px]">
                {supabaseConnected ? 'Supabase Active' : 'Offline / Demo DB'}
              </span>
            </div>

            {/* Admin Switcher Button */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onToggleAdminView(!isAdminView)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  isAdminView 
                    ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/30'
                    : 'bg-slate-900 text-brand-400 border-brand-500/30 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAdminView ? 'Customer View' : 'Admin Portal'}</span>
              </button>
            )}

            {/* Email Logs Button */}
            {onOpenEmailCenter && (
              <button
                onClick={onOpenEmailCenter}
                title="View Dispatched Emails & Logs"
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition"
              >
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                <span>Emails</span>
              </button>
            )}

            {/* User Dropdown or Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-xs border border-brand-500/30">
                    {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-tight truncate max-w-[110px]">
                      {currentUser.full_name}
                    </p>
                    <span className="text-[10px] text-brand-400 uppercase tracking-wider font-medium">
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-sm"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-white truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenMyBookings();
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition"
                    >
                      <Calendar className="w-4 h-4 text-brand-400" />
                      <span>My Bookings & Invoices</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenResetPassword();
                      }}
                      className="w-full text-left px-4 py-2.5 text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Update Password</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2.5 text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-500/10 flex items-center space-x-2.5 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 rounded-xl transition border border-transparent hover:border-slate-800"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-xl shadow-lg shadow-brand-500/25 transition active:scale-95"
                >
                  Register
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
};
