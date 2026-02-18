import React, { useState } from 'react';
import { npsService } from '../api/npsService';
import VideoKyc from './VideoKyc';

const StepKYC = ({ onNext }) => {
  const [pan, setPan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Official PAN Regex: 5 letters, 4 numbers, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const isInvalid = pan.length === 10 && !panRegex.test(pan);

  const handleVerifyPan = async () => {
    setError('');
    if (!panRegex.test(pan)) {
      setError('Please enter a valid PAN format');
      return;
    }

    setLoading(true);
    try {
      const response = await npsService.verifyPan(pan);
      if (response.success || response.data) {
        // PAN verification successful, proceed to next step
        onNext({ pan, kycMethod: 'pan' });
      } else {
        setError(response.message || 'PAN verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Error verifying PAN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [showVideo, setShowVideo] = useState(false);

  const handleVideoComplete = (resp) => {
    // on successful upload/approval we proceed
    onNext({ kycMethod: 'video', videoResult: resp });
    setShowVideo(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 animate-in fade-in duration-500">
      <h3 className="text-2xl font-black text-slate-900 mb-2">Step 2: e-KYC</h3>
      <p className="text-sm text-slate-500 mb-8">We use real-time NSDL & UIDAI integration for instant verification.</p>

      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50/50 border-l-4 border-red-500 p-4 rounded-r-2xl animate-in slide-in-from-top-2">
            <p className="text-[11px] text-red-600 leading-relaxed font-semibold">{error}</p>
          </div>
        )}

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
              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
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

        <div className="pt-2">
          <button onClick={() => setShowVideo(true)} className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-bold">Do Video KYC (POC)</button>
        </div>

        {showVideo && (
          <div className="mt-4">
            <VideoKyc onComplete={handleVideoComplete} onCancel={() => setShowVideo(false)} />
          </div>
        )}

        <button 
          onClick={handleVerifyPan}
          disabled={!panRegex.test(pan) || loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : (
            pan.length === 10 && !panRegex.test(pan) ? "Enter Valid PAN" : "Confirm & Fetch Details"
          )}
        </button>
      </div>
    </div>
  );
};

export default StepKYC;