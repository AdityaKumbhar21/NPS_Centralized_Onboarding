import React from 'react';

const STEP_LABELS = [
  'Aadhaar eKYC',
  'PAN Verify',
  'Video KYC',
  'Personal Details',
  'Nominee',
  'PFM',
  'FATCA',
  'Asset Allocation',
  'Review',
  'Payment',
];

// currentStep is the global step number (1-11).
// Step 1 is Auth (outside the bar). Steps 2-11 map to labels above.
const ProgressBar = ({ currentStep, totalSteps = 11 }) => {
  // Shell steps start from step 2
  const shellStep = currentStep - 1;          // 1-based index within the bar
  const total = STEP_LABELS.length;           // 10 steps shown
  const progressPct = Math.min(((shellStep - 1) / (total - 1)) * 100, 100);

  if (currentStep <= 1) return null; // Don't show on Auth step

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
      {/* Top row: label + percentage */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Onboarding Progress</span>
        <span className="text-xs font-black text-primary">{Math.round(progressPct)}% complete</span>
      </div>

      {/* Progress track */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step labels */}
      <div className="flex items-start justify-between gap-1 overflow-x-auto no-scrollbar">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1; // 1-based within the bar
          const isDone = shellStep > stepNum;
          const isCurrent = shellStep === stepNum;
          return (
            <div key={label} className="flex flex-col items-center min-w-0 flex-1">
              {/* Dot */}
              <div
                className={`w-3 h-3 rounded-full mb-1 flex-shrink-0 transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-500 scale-90'
                    : isCurrent
                    ? 'bg-primary ring-4 ring-blue-100 scale-110'
                    : 'bg-slate-200'
                }`}
              />
              {/* Label */}
              <span
                className={`text-[9px] font-bold text-center leading-tight transition-colors duration-300 ${
                  isCurrent ? 'text-primary' : isDone ? 'text-emerald-600' : 'text-slate-300'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
