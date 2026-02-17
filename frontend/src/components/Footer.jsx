import React from 'react';

const Footer = () => (
  /* 1. Deep Contrast Background: Grounding the UI with Navy */
  <footer className="bg-[#0f172a] text-slate-400 py-16 border-t border-white/5 mt-auto">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Section */}
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-black text-[10px]">NPS</div>
            <h6 className="font-black text-white uppercase tracking-tighter">National Pension System</h6>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            A central government-sponsored pension scheme regulated by the Pension Fund Regulatory and Development Authority (PFRDA).
          </p>
        </div>

        {/* Subscriber Services */}
        <div>
          <h6 className="font-black text-white mb-6 text-[10px] uppercase tracking-[0.2em]">Subscriber Services</h6>
          <ul className="space-y-3 text-[11px] font-medium">
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">download</span> Download Forms
            </li>
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">add_moderator</span> Tier II Activation
            </li>
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">campaign</span> Grievances
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h6 className="font-black text-white mb-6 text-[10px] uppercase tracking-[0.2em]">Resources</h6>
          <ul className="space-y-3 text-[11px] font-medium">
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">help_center</span> FAQs
            </li>
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">calculate</span> Pension Calculators
            </li>
          </ul>
        </div>

        {/* Official Support: High Visibility */}
        <div className="space-y-6">
          <h6 className="font-black text-white text-[10px] uppercase tracking-[0.2em]">Official Support</h6>
          <div className="space-y-3">
            <p className="text-white font-black text-lg flex items-center gap-2 tracking-tight">
              <span className="material-symbols-outlined text-blue-500">call</span> 1800 110 708
            </p>
            <p className="text-xs hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-sm">mail</span> info@pfrda.org.in
            </p>
          </div>
        </div>
      </div>

      {/* 2. Compliance & Trust Bar */}
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.25em]">
        <div className="flex items-center gap-4 opacity-50">
          <span>Digital India</span>
          <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
          <span>Secure e-KYC</span>
          <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
          <span>PFRDA Authorized</span>
        </div>
        <p className="opacity-40 tracking-widest">© 2026 PFRDA. All rights reserved.</p>
        <div className="flex gap-6 opacity-60">
          <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-white transition-colors cursor-pointer">Security</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;