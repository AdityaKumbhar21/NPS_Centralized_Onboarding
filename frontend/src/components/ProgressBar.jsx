import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const totalSegments = totalSteps;
  const completedSegments = Math.max(0, currentStep - 1);
  
  return (
    <div className="w-full bg-slate-100/50 h-1.5 overflow-hidden rounded-full shadow-sm border border-slate-200/30">
      <div 
        className="h-full bg-gradient-to-r from-[#1a237e] via-[#1e3a8a] to-[#2563eb] rounded-full transition-all duration-500 ease-out"
        style={{ width: `${(completedSegments / totalSegments) * 100}%` }}
      />
    </div>
  );
};

export default ProgressBar;
