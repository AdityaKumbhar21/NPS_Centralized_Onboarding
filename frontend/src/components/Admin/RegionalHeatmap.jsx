import React from 'react';

const RegionalHeatmap = () => {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-slate-800">Regional Signup Density</h4>
        <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
          View Full Heatmap <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>

      <div className="aspect-video bg-slate-50 rounded-lg border border-dashed border-slate-300 relative overflow-hidden">
        {/* Placeholder for Map Interface */}
        <div className="absolute inset-0 flex items-center justify-center flex-col opacity-60">
          <div className="bg-white/40 p-12 rounded-full border border-slate-200">
            <span className="material-symbols-outlined text-6xl text-slate-400">map</span>
          </div>
          <p className="mt-4 text-slate-500 font-medium">State-wise Heatmap Interface Loading...</p>
        </div>

        {/* Decorative Grid representing high-density areas */}
        <div className="w-full h-full p-4">
          <div className="w-full h-full opacity-10 flex flex-wrap gap-2">
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className={`grow rounded-sm ${i % 3 === 0 ? 'bg-primary' : 'bg-primary/20'}`}
                style={{ minWidth: '40px', height: '30px' }}
              ></div>
            ))}
          </div>
        </div>

        {/* Data Labels (from original design) */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
            <span className="w-2.5 h-2.5 bg-primary rounded-full"></span> 
            <span className="text-slate-700 tracking-tight">Maharashtra: 124k+</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
            <span className="w-2.5 h-2.5 bg-primary/40 rounded-full"></span> 
            <span className="text-slate-700 tracking-tight">Uttar Pradesh: 89k+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionalHeatmap;