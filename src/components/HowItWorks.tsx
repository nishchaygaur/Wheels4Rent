import React from 'react';
import { Search, FileCheck, Key, Compass, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Select Your Ride',
      description: 'Choose from our extensive fleet of Mahindra Thar 4x4, Scorpio Classic, Skoda Slavia, and luxury SUVs.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Instant Verification',
      description: 'Quick digital upload of your Driving License and Govt ID with automated approval in minutes.',
      icon: FileCheck,
    },
    {
      step: '03',
      title: 'Pickup or Doorstep Delivery',
      description: 'Collect your pristine vehicle from IGI Airport or have it delivered straight to your home or hotel.',
      icon: Key,
    },
    {
      step: '04',
      title: 'Drive Freedom & Enjoy',
      description: 'Zero speed lockouts, FASTag pre-installed, with digital tax invoice delivered straight to your email.',
      icon: Compass,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-950/70 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 text-brand-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seamless Self-Drive Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Wheels4Rent Works
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Get on the road in 4 effortless steps. No paperwork headaches, no hidden security deposit deductions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 rounded-3xl p-6 transition duration-300 group shadow-lg"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-110 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-800 group-hover:text-brand-500/30 transition">
                    {s.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
