import React, { useState } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const AuthCard = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleGenerateOTP = () => {
    if (!/^[0-9]{10}$/.test(mobile)) {
      show('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    npsService.sendOtp(mobile)
      .then((res) => {
        if (res && res.message) {
          show(res.message, res.success ? 'success' : 'info');
        } else if (res && (res.success)) {
          show('OTP sent successfully', 'success');
        } else {
          show(res && res.message ? res.message : 'Failed to send OTP', 'error');
        }
      })
      .catch((err) => {
        show(err && err.message ? err.message : 'API Error', 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Mobile OTP</h2>
      <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg mb-6">
        <p className="text-xs text-primary font-medium">
          Enter your mobile number registered with your NPS account.
        </p>
      </div>
      {/* Validation and server errors are shown as global toasts */}
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
        disabled={loading}
        className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : 'Generate OTP →'}
      </button>
    </div>
  );
};

export default AuthCard;