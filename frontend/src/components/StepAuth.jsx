import React, { useState, useRef } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const StepAuth = ({ onNext }) => {
  const [authPhase, setAuthPhase] = useState('initial'); // 'initial' or 'otp'
  const [activeTab, setActiveTab] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [aadhaar, setAadhaar] = useState('');
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

  // Send OTP - transitions from initial to OTP phase
  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      show('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await npsService.sendOtp(mobile);
      show(response.message || 'OTP sent successfully', 'info');
      setAuthPhase('otp');
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

  // Resend OTP
  const handleResendOtp = async () => {
    setOtp(Array(6).fill(''));
    await handleSendOtp();
  };

  // Go back to initial phase
  const handleBackToInitial = () => {
    setAuthPhase('initial');
    setOtp(Array(6).fill(''));
  };


  return (
    <div className="bg-white/70 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden transition-all duration-500 hover:shadow-2xl">

      {authPhase === 'initial' ? (
        <>
          {/* Tab Switcher */}
          <div className="flex bg-slate-100/50 p-1.5 m-6 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${activeTab === 'mobile' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mobile OTP
            </button>
            <button
              onClick={() => setActiveTab('aadhaar')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${activeTab === 'aadhaar' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Aadhaar eKYC
            </button>
          </div>

          <div className="p-8 pt-2 space-y-8">
            {activeTab === 'mobile' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                      onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                      disabled={loading}
                    />
                  </div>
                </div>

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
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-indigo-50/50 border-l-4 border-indigo-600 p-4 rounded-r-2xl">
                  <p className="text-[11px] text-indigo-700/80 leading-relaxed font-semibold">
                    Enter your 12-digit Aadhaar number to initiate secure paperless eKYC verification.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Aadhaar Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300/30 outline-none font-semibold tracking-[0.2em] transition-all duration-300"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaar}
                    onChange={e => setAadhaar(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={() => {
                    if (aadhaar.length !== 12) { show('Please enter a valid 12-digit Aadhaar number', 'error'); return; }
                    setAuthPhase('otp');
                  }}
                  disabled={loading || aadhaar.length !== 12}
                  className="w-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <>Verify Aadhaar <span className="material-symbols-outlined text-sm">verified_user</span></>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* OTP Entry Phase */
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Code Sent</p>
              <p className="text-sm text-slate-600">Enter the 6-digit OTP sent to your {activeTab === 'mobile' ? `mobile +91${mobile}` : 'Aadhaar-linked mobile'}</p>
            </div>

            <div className="space-y-2 text-center">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Enter 6-Digit OTP</label>

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

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join('').length !== 6}
                className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                ) : 'Verify & Continue'}
              </button>

              <button
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loading}
                className="w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-primary transition-colors disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>

          <button
            onClick={handleBackToInitial}
            disabled={loading}
            className="w-full pt-6 border-t border-slate-100 text-slate-600 text-sm font-semibold hover:text-primary transition-colors py-4"
          >
            ← Change Mobile / Aadhaar Number
          </button>
        </div>
      )}
    </div>
  );
};

export default StepAuth;
