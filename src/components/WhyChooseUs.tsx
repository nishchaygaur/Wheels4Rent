import React from 'react';
import { ShieldCheck, HeartHandshake, Gauge, Sparkles, PhoneCall, Receipt } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const perks = [
    {
      title: 'Automated GST Tax Invoicing',
      description: 'Instant download and email dispatch of verified Tax Invoices (PDF) compliant for personal and corporate reimbursement.',
      icon: Receipt,
    },
    {
      title: 'Zero Hidden Charges',
      description: 'Transparent rates including comprehensive insurance, roadside support, and clear fuel policies with no surprise markups.',
      icon: ShieldCheck,
    },
    {
      title: '100% Sanitized Fleet',
      description: 'Every vehicle undergoes a 45-point mechanical inspection, interior deep steam cleaning, and fluid checks before handover.',
      icon: Sparkles,
    },
    {
      title: 'Unlimited Freedom',
      description: 'Drive anywhere across India without route restrictions. Pre-loaded FASTag ensures seamless cashless toll passage.',
      icon: Gauge,
    },
    {
      title: 'Fast Refund Guarantee',
      description: 'Refundable security deposits are transferred back to your original payment method within 24 hours of vehicle return.',
      icon: HeartHandshake,
    },
    {
      title: '24/7 Roadside Helpline',
      description: 'Dedicated on-call concierge and towing network available around the clock at +91-9758925637.',
      icon: PhoneCall,
    },
  ];

  return (
    <section id="why-choose-us" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Why Wheels4Rent is Built Better
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Combining automotive passion with enterprise reliability for unforgettable self-drive journeys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {perks.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 mb-4">
                <Icon className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
            </div>
          );
        })}
      </div>

    </section>
  );
};
