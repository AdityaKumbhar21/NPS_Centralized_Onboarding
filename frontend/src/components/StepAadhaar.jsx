import React, { useState, useRef } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const StepAadhaar = ({ onNext }) => {
  const [aadhaar, setAadhaar] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [maskedMobile, setMaskedMobile] = useState('');
  const [demoOtp, setDemoOtp] = useState(null);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputsRef = useRef([]);
  const { show } = useToast();

  const startResendTimer = () => {
    setResendTimer(60);
    const t = setInterval(() => setResendTimer(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    setTimeout(() => clearInterval(t), 60000);
  };

  const handleInitiate = async () => {
    if (aadhaar.length !== 12) return;
    setLoading(true);
    try {
      const response = await npsService.initiateAadhaarOtp(aadhaar);
      setMaskedMobile(response.maskedMobile || 'xxxxxx99');
      if (response.otp) setDemoOtp(response.otp); // only present in dev mode
      setOtpSent(true);
      startResendTimer();
      show(response.message || `OTP sent to ${response.maskedMobile}`, 'info');
    } catch (err) {
      show(err.message || 'Failed to send Aadhaar OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpInputsRef.current[index + 1]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { show('Please enter all 6 digits', 'error'); return; }
    setLoading(true);
    try {
      const response = await npsService.verifyAadhaarOtp(aadhaar, otpCode);
      if (response.token || response.accessToken) {
        show('Aadhaar verified successfully', 'success');
        onNext({ aadhaar, authMethod: 'aadhaar' });
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
    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in duration-500">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 mb-1">Step 2: Aadhaar eKYC</h3>
        <p className="text-sm text-slate-500">Your Aadhaar-linked mobile will receive a one-time password for verification.</p>
      </div>

      {!otpSent ? (
        <div className="space-y-6">
          <div className="bg-indigo-50/60 border-l-4 border-indigo-500 p-4 rounded-r-2xl">
            <p className="text-[11px] text-indigo-700 font-semibold leading-relaxed">
              Enter your 12-digit Aadhaar number. An OTP will be sent to the mobile linked with your Aadhaar.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Aadhaar Number</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none font-semibold tracking-[0.2em] transition-all"
              placeholder="XXXX XXXX XXXX"
              value={aadhaar}
              onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleInitiate}
            disabled={loading || aadhaar.length !== 12}
            className="w-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP...</>
            ) : (
              <>Send OTP <span className="material-symbols-outlined text-sm">send</span></>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <p className="text-sm text-slate-500">OTP sent to <strong className="font-mono">{maskedMobile}</strong></p>
            {demoOtp && (
              <p className="text-xs text-amber-600 bg-amber-50 py-1.5 px-3 rounded-lg inline-block">
                Demo OTP: <strong>{demoOtp}</strong>
              </p>
            )}
          </div>

          <div className="space-y-4">
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
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold text-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all disabled:opacity-50"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
            ) : 'Verify & Continue'}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => { setOtpSent(false); setOtp(Array(6).fill('')); setDemoOtp(null); }}
              className="text-slate-400 hover:text-slate-600 font-semibold"
            >
              ← Change Aadhaar
            </button>
            <button
              onClick={handleInitiate}
              disabled={resendTimer > 0 || loading}
              className="text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepAadhaar;
