import React from 'react';

const AboutNPS = () => {
  const benefits = [
    { title: "Tax Benefits", desc: "Deductions up to ₹2 lakh under Section 80C and 80CCD.", icon: "payments", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Portability", desc: "Move your PRAN account across jobs and locations seamlessly.", icon: "explore", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Regulated", desc: "Supervised by PFRDA to ensure transparency and safety.", icon: "gavel", color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Flexible", desc: "Choose your own Pension Fund Manager and Asset Allocation.", icon: "account_tree", color: "text-amber-600", bg: "bg-amber-50" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      {/* 1. Hero Section with Mesh Gradient */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-[#0f172a]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#3b82f6,transparent)]"></div>
        <div className="relative max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Official PFRDA Resource
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
            National Pension <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">System</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed font-medium">
            A voluntary, defined contribution retirement savings scheme designed to enable systematic savings during your working life.
          </p>
        </div>
      </section>

      {/* 2. Benefits Grid with Premium Glass Cards */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, i) => (
            <div 
              key={i} 
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.08)] hover:shadow-[0_32px_64px_-12px_rgba(15,23,42,0.12)] hover:-translate-y-2 transition-all duration-500"
            >
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined ${item.color} text-3xl`}>{item.icon}</span>
              </div>
              <h3 className="font-black text-xl text-slate-900 mb-3 tracking-tight">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Detailed Information Section */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Systematic Savings for a Secure Future</h2>
            <p className="text-slate-600 leading-relaxed">
              NPS is structured to provide individual citizens with a sustainable solution for retirement income. It utilizes professional fund management and market-linked returns to build a substantial corpus over time.
            </p>
            <div className="pt-4">
              <button className="bg-[#1a237e] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-900/10 hover:bg-black transition-all">
                View Scheme Details
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-slate-50 rounded-[2rem] flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-slate-200">shield_with_heart</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutNPS;