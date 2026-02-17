import React from 'react';

const StepReview = ({ userData, onNext, onBack }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-4xl border border-slate-100 animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h3 className="text-2xl font-black text-slate-900">Final Review & Confirmation</h3>
        <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest">
          Verify Details
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Section 1: Personal & KYC */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-primary uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">person</span> Personal Details
          </h4>
          <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
            <p className="text-sm text-slate-500">Mobile: <span className="text-slate-900 font-bold">{userData.mobileNumber || "N/A"}</span></p>
            <p className="text-sm text-slate-500">PAN: <span className="text-slate-900 font-bold uppercase">{userData.panNumber || "N/A"}</span></p>
            <p className="text-sm text-slate-500">Birth Place: <span className="text-slate-900 font-bold">{userData.birthPlace || "N/A"}</span></p>
          </div>
        </div>

        {/* Section 2: Investment Choice */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-primary uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">account_balance</span> Investment
          </h4>
          <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
            <p className="text-sm text-slate-500">PFM: <span className="text-slate-900 font-bold">{userData.selectedPFM || "N/A"}</span></p>
            <p className="text-sm text-slate-500">Asset Choice: <span className="text-slate-900 font-bold">{userData.assetChoice || "Auto"}</span></p>
          </div>
        </div>
      </div>

      {/* Section 3: Nominee Summary (Full Width) */}
      <div className="mb-10 space-y-4">
        <h4 className="text-sm font-bold text-primary uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">group</span> Nominee Allocation
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {userData.nominees?.map((n, i) => (
            <div key={i} className="border border-slate-100 p-4 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-slate-800">{n.name}</p>
              <p className="text-[10px] text-slate-500">{n.relation} | {n.share}% Share</p>
            </div>
          )) || <p className="text-xs text-slate-400">No nominees added.</p>}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-600 transition-colors">
          Edit Details
        </button>
        <button 
          onClick={() => onNext({ confirmed: true })}
          className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:shadow-blue-300 hover:-translate-y-1 transition-all flex items-center gap-3"
        >
          Confirm & Proceed to Payment <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default StepReview;