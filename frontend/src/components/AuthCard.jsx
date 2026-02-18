import React, { useState } from 'react';

const AuthCard = () => {
  const [mobile, setMobile] = useState('');

  const handleGenerateOTP = () => {
    console.log("Calling Backend API for:", mobile);
    // This is where you will eventually fetch('/api/auth/send-otp')
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Mobile OTP</h2>
      <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-xs text-primary font-medium">
          Enter your mobile number registered with your NPS account.
        </p>
      </div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Mobile Number</label>
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold border-r pr-3">+91</span>
        <input 
          className="w-full pl-16 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
          placeholder="99999 99999"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
      </div>
      <button 
        onClick={handleGenerateOTP}
        className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all shadow-lg"
      >
        Generate OTP →
      </button>
    </div>
  );
};

export default AuthCard;