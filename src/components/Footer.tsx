import React from 'react';
import { Car, Phone, Mail, MapPin, Shield } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                Wheels<span className="text-brand-500">4</span>Rent
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Leading self-drive car rental provider offering premium Mahindra Thar 4x4, Scorpio, Skoda Slavia, and executive SUVs with automated digital GST invoicing.
            </p>

            <div className="flex items-center space-x-3 text-slate-400 pt-1">
              <a
                href="https://www.instagram.com/wheels4rent.001?igsh=MWpjbXZ6b2s3dm0zdQ=="
                target="_blank"
                rel="noreferrer"
                title="Follow us on Instagram"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-brand-400 hover:border-brand-500/40 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/wheels-4-rent-008906314/"
                target="_blank"
                rel="noreferrer"
                title="Connect on LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-brand-400 hover:border-brand-500/40 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61560917232557&mibextid=ZbWKwL"
                target="_blank"
                rel="noreferrer"
                title="Find us on Facebook"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-brand-400 hover:border-brand-500/40 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5">
              <li><a href="#fleet-section" className="hover:text-brand-400 transition">Our Vehicle Fleet</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-400 transition">How It Works</a></li>
              <li><a href="#why-choose-us" className="hover:text-brand-400 transition">Why Choose Wheels4Rent</a></li>
              <li>
                <button onClick={onOpenAdmin} className="text-brand-400 hover:underline flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin Management Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Rental Hub Locations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Pickup Hubs</h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>IGI Airport Terminal 3 Hub, New Delhi</li>
              <li>Cyber Hub, DLF Phase 2, Gurugram</li>
              <li>Connaught Place Inner Circle, Delhi</li>
              <li>Noida Sector 18 Commercial District</li>
              <li>Doorstep Delivery Available (Delhi NCR)</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">24/7 Support Helpline</h4>
            <div className="space-y-3">
              <a href="tel:+919758925637" className="flex items-start space-x-2.5 text-slate-300 hover:text-brand-400 transition">
                <Phone className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>+91-9758925637</span>
              </a>

              <a href="mailto:wheels4rent@cyberforage.space" className="flex items-start space-x-2.5 text-slate-300 hover:text-brand-400 transition">
                <Mail className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>wheels4rent@cyberforage.space</span>
              </a>

              <div className="flex items-start space-x-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Plot 42, Aerocity Commercial Hub, New Delhi, 110037</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Wheels4Rent Self-Drive Services. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Rental</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy & Security</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">GST IN: 07AAACW4982R1ZQ</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
