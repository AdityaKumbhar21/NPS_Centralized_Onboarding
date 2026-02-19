import React, { useState, useRef } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const StepAuth = ({ onNext }) => {
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputsRef = useRef([]);
  const { show } = useToast();

  const startResendTimer = () => {
    setResendTimer(60);
    const t = setInterval(() => setResendTimer(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    setTimeout(() => clearInterval(t), 60000);
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      show('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await npsService.sendOtp(mobile);
      if (response.otp) setDemoOtp(response.otp); // dev mode only
      show(response.message || 'OTP sent successfully', 'info');
      setOtpSent(true);
      startResendTimer();
    } catch (err) {
      show(err.message || 'Error sending OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputsRef.current[index + 1]?.focus();
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { show('Please enter all 6 digits', 'error'); return; }
    setLoading(true);
    try {
      const response = await npsService.verifyOtp(mobile, otpCode);
      if (response.token || response.accessToken || response.success) {
        show('Mobile verified successfully', 'success');
        onNext({ mobile, authMethod: 'mobile' });
      } else {
        show(response.message || 'Invalid OTP. Please try again.', 'error');
      }
    } catch (err) {
      show(err.message || 'OTP verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden transition-all duration-500 hover:shadow-2xl">
      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-1">Welcome Back</h3>
          <p className="text-sm text-slate-500">Enter your mobile number to receive a secure OTP.</p>
        </div>

        <div className="bg-blue-50/50 border-l-4 border-primary p-4 rounded-r-2xl">
          <p className="text-[11px] text-primary/80 leading-relaxed font-semibold">
            Enter your mobile number registered with your NPS account to receive a secure OTP.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Mobile Number</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r border-slate-100 pr-3 transition-colors group-focus-within:text-primary group-focus-within:border-primary/30">+91</span>
            <input
              type="tel"
              className="w-full pl-16 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-primary/30 outline-none transition-all duration-300 font-semibold"
              placeholder="99999 99999"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              disabled={loading || otpSent}
            />
          </div>
        </div>

        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={loading || mobile.length !== 10}
            className="w-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
            ) : (
              <>Generate OTP <span className="material-symbols-outlined text-sm">arrow_forward</span></>
            )}
          </button>
        ) : (
          <div className="space-y-5 pt-4 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
            {demoOtp && (
              <p className="text-xs text-amber-600 text-center bg-amber-50 py-1.5 px-3 rounded-lg">
                Demo OTP: <strong>{demoOtp}</strong>
              </p>
            )}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Enter 6-Digit OTP</label>
              <div className="flex justify-between gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpInputsRef.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold text-xl focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-primary/30 outline-none transition-all disabled:opacity-50"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
              ) : 'Verify & Continue'}
            </button>
            <button
              onClick={handleSendOtp}
              disabled={resendTimer > 0 || loading}
              className="w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-primary transition-colors disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepAuth;
