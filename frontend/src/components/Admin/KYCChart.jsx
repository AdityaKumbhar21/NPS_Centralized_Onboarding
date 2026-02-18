import React from 'react';

const KYCChart = () => {
  const chartData = [
    { day: 'MON', height: 65 },
    { day: 'TUE', height: 85 },
    { day: 'WED', height: 75 },
    { day: 'THU', height: 95 },
    { day: 'FRI', height: 80 }
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full animate-in fade-in duration-700">
      <h4 className="text-lg font-bold text-slate-800 mb-6">Daily Onboarding</h4>
      
      {/* Bars Container */}
      <div className="flex-1 flex items-end gap-3 justify-between h-48 pb-6 border-b border-slate-100">
        {chartData.map((item, i) => (
          <div key={i} className="flex flex-col items-center flex-1 gap-2">
            <div className="w-full bg-slate-100 rounded-t-sm relative h-32 overflow-hidden">
              {/* The Blue Bar */}
              <div 
                className="absolute bottom-0 w-full bg-primary transition-all duration-1000 ease-out" 
                style={{ height: `${item.height}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.day}</span>
          </div>
        ))}
      </div>

      {/* Legend / Metrics (New Section) */}
      <div className="pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-xs font-medium text-slate-600">Successful</span>
          </div>
          <span className="text-xs font-bold text-slate-800">42,500</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
            <span className="text-xs font-medium text-slate-600">Flagged</span>
          </div>
          <span className="text-xs font-bold text-slate-800">1,240</span>
        </div>
      </div>
    </div>
  );
};

export default KYCChart;