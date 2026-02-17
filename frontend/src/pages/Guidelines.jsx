import React from 'react';

const Guidelines = () => {
  const rules = [
    { text: "Digital e-KYC is mandatory for all paperless registrations.", icon: "fingerprint", color: "text-blue-600" },
    { text: "Mobile numbers must be linked with Aadhaar for OTP verification.", icon: "vibration", color: "text-orange-600" },
    { text: "Subscribers must select a valid Pension Fund Manager (PFM) at the time of joining.", icon: "account_balance", color: "text-indigo-600" },
    { text: "A minimum initial contribution of ₹500 is required for Tier I account activation.", icon: "payments", color: "text-emerald-600" },
    { text: "FATCA/CRS self-certification is mandatory for tax compliance.", icon: "description", color: "text-slate-600" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      {/* 1. Header Section with Official Gradient */}
      <section className="bg-[#1a237e] pt-24 pb-40 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-xs text-orange-400">gavel</span>
            Regulatory Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            PFRDA Onboarding <span className="text-orange-400">Guidelines</span>
          </h1>
          <p className="text-blue-100/70 max-w-2xl mx-auto font-medium">
            Essential regulatory requirements for successful National Pension System registration and account maintenance.
          </p>
        </div>
      </section>

      {/* 2. Guidelines Grid with Step-Indicators */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {rules.map((item, i) => (
            <div 
              key={i} 
              className="group bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1)] hover:shadow-[0_32px_64px_-12px_rgba(15,23,42,0.15)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start gap-6">
                <div className="relative">
                  <span className="text-5xl font-black text-slate-100 absolute -top-4 -left-2 select-none group-hover:text-blue-50 transition-colors">
                    0{i + 1}
                  </span>
                  <div className="relative h-14 w-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className={`material-symbols-outlined ${item.color} text-3xl`}>{item.icon}</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-slate-700 font-bold leading-relaxed tracking-tight text-lg">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Footer Call-to-Action Card */}
        <div className="mt-12 bg-gradient-to-r from-[#1a237e] to-[#0d47a1] rounded-[3rem] p-10 md:p-14 text-center space-y-6 shadow-2xl shadow-blue-900/20">
          <h3 className="text-2xl font-black text-white uppercase tracking-widest">Ready to secure your future?</h3>
          <p className="text-blue-100 opacity-80 max-w-xl mx-auto font-medium">
            Ensure you have your Aadhaar and PAN card ready before starting the digital registration process.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-orange-900/20">
              Start Registration
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
              Download Full PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;