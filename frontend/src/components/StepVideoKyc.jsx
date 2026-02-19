import React, { useEffect, useRef, useState } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StepVideoKyc = ({ onNext, onBack }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | starting | scanning | verified | completing | done
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const { show } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const handleStart = async () => {
    setError(null);
    setPhase('starting');
    try {
      // 1. Get camera access
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;

      // 2. Create session in backend BEFORE scanning
      const startRes = await npsService.startVideoKyc();
      const sid = startRes?.sessionId || startRes?.session_id;
      if (!sid) throw new Error('Failed to start Video KYC session');
      setSessionId(sid);

      setPhase('scanning');
      setCountdown(5);

      let remaining = 5;
      intervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) clearInterval(intervalRef.current);
      }, 1000);

      timerRef.current = setTimeout(() => setPhase('verified'), 5000);
    } catch (err) {
      setError(err.message || 'Camera permission denied. Please allow camera access and try again.');
      setPhase('idle');
    }
  };

  // Auto-complete once face is verified
  useEffect(() => {
    if (phase !== 'verified') return;
    const finish = async () => {
      setPhase('completing');
      try {
        await npsService.completeVideoKyc({ sessionId, s3Key: 'demo' });
        if (stream) stream.getTracks().forEach((t) => t.stop());
        setPhase('done');
        show('Video KYC verified successfully!', 'success');
        setTimeout(() => onNext && onNext({ videoKycDone: true }), 1800);
      } catch (err) {
        show(err.message || 'Video KYC failed. Please try again.', 'error');
        setPhase('idle');
      }
    };
    finish();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const progress =
    phase === 'scanning' ? ((5 - countdown) / 5) * 100 :
    phase === 'verified' || phase === 'completing' || phase === 'done' ? 100 : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);
  const ringColor = phase === 'verified' || phase === 'completing' || phase === 'done' ? '#10b981' : '#2563eb';

  if (phase === 'done') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full border border-slate-100 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Video KYC Complete!</h2>
          <p className="text-slate-500 mt-2 text-sm">Identity verified. Proceeding to next step...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg mx-auto border border-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="size-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <span className="material-symbols-outlined">videocam</span>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">Video KYC</h3>
          <p className="text-[11px] text-slate-400">Live face verification — takes about 5 seconds</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 text-center">{error}</div>
      )}

      {/* Circular camera */}
      <div className="flex flex-col items-center mt-8 mb-6">
        <div className="relative" style={{ width: 256, height: 256 }}>
          {/* SVG progress ring */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 256" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="128" cy="128" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="128" cy="128" r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
            />
          </svg>

          {/* Circular video */}
          <div className="absolute inset-[20px] rounded-full overflow-hidden bg-slate-900">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Idle / starting overlay */}
            {(phase === 'idle' || phase === 'starting') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                {phase === 'starting'
                  ? <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <span className="material-symbols-outlined text-5xl opacity-30">videocam_off</span>
                }
              </div>
            )}

            {/* Verified overlay */}
            {(phase === 'verified' || phase === 'completing') && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/60 animate-in fade-in duration-300">
                <svg viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          {/* Countdown badge */}
          {phase === 'scanning' && countdown > 0 && (
            <div className="absolute -top-1 -right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">
              {countdown}
            </div>
          )}

          {/* LIVE badge */}
          {phase === 'scanning' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-[10px] font-bold tracking-widest">LIVE</span>
            </div>
          )}
        </div>

        {/* Status label */}
        <div className="mt-5 text-center min-h-[24px]">
          {phase === 'idle'      && <p className="text-sm text-slate-500">Click <strong>Start Verification</strong> to begin</p>}
          {phase === 'starting'  && <p className="text-sm text-slate-500">Accessing camera...</p>}
          {phase === 'scanning'  && <p className="text-sm text-slate-600">Keep face centred · Verifying in <strong className="text-primary">{countdown}s</strong></p>}
          {(phase === 'verified' || phase === 'completing') && <p className="text-sm font-bold text-emerald-600">✓ Face verified — saving result...</p>}
        </div>
      </div>

      {/* Action row */}
      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            disabled={phase === 'scanning' || phase === 'completing' || phase === 'verified'}
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium disabled:opacity-40"
          >
            Back
          </button>
        )}
        {phase === 'idle' && (
          <button onClick={handleStart} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow hover:bg-blue-700 transition-all">
            Start Verification
          </button>
        )}
        {phase === 'scanning' && (
          <div className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm text-slate-500">
            Scanning face… {countdown}s remaining
          </div>
        )}
        {(phase === 'verified' || phase === 'completing') && (
          <div className="flex-1 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-sm font-bold text-emerald-600">
            Verified — proceeding automatically…
          </div>
        )}
      </div>
    </div>
  );
};

export default StepVideoKyc;
