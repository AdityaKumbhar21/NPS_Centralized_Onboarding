import React, { useState } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const StepKYC = ({ onNext }) => {
  const [pan, setPan] = useState('');
  const [loading, setLoading] = useState(false);
  const { show } = useToast();
  
  // Official PAN Regex: 5 letters, 4 numbers, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  // Normalize PAN for validation: remove spaces (including NBSP) and trim
  const normalizedPan = pan ? pan.replace(/[\s\u00A0]/g, '').trim() : pan;
  const isInvalid = normalizedPan.length === 10 && !panRegex.test(normalizedPan);

  const handleVerifyPan = async () => {
    const panToVerify = normalizedPan;
    if (!panRegex.test(panToVerify)) {
      show('Please enter a valid PAN format', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await npsService.verifyPan(panToVerify);
      if (response.success || response.data) {
        // PAN verification successful, proceed to next step
        onNext({ pan: panToVerify, kycMethod: 'pan' });
      } else {
        show(response.message || 'PAN verification failed. Please try again.', 'error');
      }
    } catch (err) {
      show(err.message || 'Error verifying PAN. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in duration-500">
      <h3 className="text-2xl font-black text-slate-900 mb-2">Step 3: PAN Verification</h3>
      <p className="text-sm text-slate-500 mb-8">We use real-time NSDL & UIDAI integration for instant verification.</p>

      <div className="space-y-6">
        {/* Validation and server errors are shown as global toasts */}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">PAN Card Number</label>
            {isInvalid && (
              <span className="text-[10px] font-bold text-rose-500 animate-pulse">Invalid Format</span>
            )}
          </div>
          <input 
            type="text" 
            className={`w-full px-4 py-3.5 border rounded-lg focus:ring-2 outline-none uppercase font-mono transition-all ${
              isInvalid ? 'border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:ring-primary/20'
            }`} 
            placeholder="ABCDE1234F"
            value={pan}
            onChange={(e) => {
              const raw = e.target.value || '';
              const noSpaces = raw.replace(/[\s\u00A0]/g, '');
              const val = noSpaces.toUpperCase().replace(/[^A-Z0-9]/g, '');
              setPan(val.slice(0, 10));
            }}
            disabled={loading}
          />
        </div>

        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-4">
          <div className="text-2xl">🆔</div>
          <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
            By continuing, you provide consent to fetch your demographic details from the CKYC registry and UIDAI as per PFRDA guidelines.
          </p>
        </div>

        {/* Video KYC moved to final onboarding step */}

        <button 
          onClick={handleVerifyPan}
          disabled={!panRegex.test(normalizedPan) || loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : (
            normalizedPan.length === 10 && !panRegex.test(normalizedPan) ? "Enter Valid PAN" : "Confirm & Fetch Details"
          )}
        </button>
      </div>
    </div>
  );
};

export default StepKYC;