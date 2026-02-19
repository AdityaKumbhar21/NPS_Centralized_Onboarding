import React from 'react';
import ProgressBar from './ProgressBar';

// Steps 2–11 are rendered inside this shell (step 1 is the landing/auth page)
const shellSteps = [
  'Aadhaar eKYC',
  'PAN Verification',
  'Video KYC',
  'Personal Details',
  'Nominee',
  'PFM Selection',
  'FATCA',
  'Asset Allocation',
  'Review',
  'Payment',
];

const OnboardingShell = ({ currentStep, children }) => {
  // currentStep ranges 2–11; idx 0–9 maps to shellSteps
  const idx = Math.max(0, Math.min(shellSteps.length - 1, currentStep - 2));
  const percent = Math.round((idx / (shellSteps.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col">
      <div className="max-w-6xl w-full mx-auto px-6 py-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
          <ProgressBar percent={percent} steps={shellSteps} />
        </div>
      </div>

      <div className="flex-grow max-w-6xl mx-auto w-full px-6 pb-12">
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingShell;
