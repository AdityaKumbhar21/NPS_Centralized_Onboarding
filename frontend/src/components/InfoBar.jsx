import React from 'react';

const InfoBar = () => (
  <section className="bg-indigo-50/50 border-y border-indigo-100/50 py-10 mt-12">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">❓</div>
        <div>
          <h5 className="font-bold text-slate-800">New to NPS?</h5>
          <p className="text-sm text-slate-500">Open your account in less than 5 minutes with paperless eKYC.</p>
        </div>
      </div>
      <button className="bg-white border-2 border-indigo-600 text-indigo-600 px-10 py-3 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all">
        Register Now
      </button>
    </div>
  </section>
);

export default InfoBar;