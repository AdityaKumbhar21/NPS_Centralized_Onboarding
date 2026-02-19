import React from 'react';

const ProgressBar = ({ percent, steps = [] }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-slate-700">Onboarding Progress</div>
        <div className="text-xs text-slate-500">{Math.round(percent)}% complete</div>
      </div>

      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
        <div className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all" style={{ width: `${percent}%` }} />
      </div>

      {steps && steps.length > 0 && (
        <div className="mt-4 flex gap-2 text-[11px] text-slate-500">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 text-center truncate">{s}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
