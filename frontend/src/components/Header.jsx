import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="bg-white/95 backdrop-blur-xl border-b-2 border-slate-100 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity group">
          <div className="flex items-center border-r border-slate-200 pr-4 mr-2">
            {/* 1. Official Logo Area: Deep Navy */}
            <div className="h-12 w-12 bg-[#1a237e] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-900/10 group-hover:scale-105 transition-transform">
              NPS
            </div>
          </div>
          <div className="flex flex-col">
            {/* 2. High-Contrast Authority Typography */}
            <h1 className="text-[#1a237e] font-extrabold text-lg leading-tight tracking-tight uppercase">
              National Pension System
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
              Pension Fund Regulatory and Development Authority (PFRDA)
            </p>
          </div>
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link className="text-slate-600 hover:text-[#1a237e] text-sm font-bold transition-colors" to="/">Home</Link>
          
          <Link className="text-slate-600 hover:text-[#1a237e] text-sm font-bold transition-colors" to="/about">About NPS</Link>
          <Link className="text-slate-600 hover:text-[#1a237e] text-sm font-bold transition-colors" to="/guidelines">PFRDA Guidelines</Link>
          
          {/* 3. High-Security Admin Button: Navy Gradient */}
          <Link 
            to="/admin" 
            className="bg-gradient-to-br from-[#1a237e] via-[#1e40af] to-[#1a237e] text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-blue-100 hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Admin Login
          </Link>
        </nav>
      </div>
    </div>
  </header>
);

export default Header;