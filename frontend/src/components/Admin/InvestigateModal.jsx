import React from 'react';

const InvestigateModal = ({ applicant, onClose }) => {
  if (!applicant) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-rose-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Investigate Flagged Application</h3>
            <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Case ID: {applicant.pran || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="material-symbols-outlined hover:rotate-90 transition-transform">close</button>
        </div>

        <div className="p-8 space-y-6">
          {/* Risk Alert Section */}
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-4 items-start">
            <span className="material-symbols-outlined text-rose-600">warning</span>
            <div>
              <p className="text-sm font-bold text-rose-900">Reason for Flag: Name Mismatch</p>
              <p className="text-xs text-rose-700">The name provided in PAN records does not match the Aadhaar eKYC data exactly.</p>
            </div>
          </div>

          {/* Data Comparison Table */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Aadhaar Data (UIDAI)</p>
              <p className="text-sm font-bold text-slate-800">{applicant.name}</p>
              <p className="text-[10px] text-slate-500">Verified via Biometric/OTP</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 border-rose-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">PAN Data (NSDL/ITD)</p>
              <p className="text-sm font-bold text-rose-600">A. Khan (Abbreviated)</p>
              <p className="text-[10px] text-slate-500">Manual verification required</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">
              Request More Docs
            </button>
            <button className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
              Approve Manually
            </button>
            <button className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all">
              Reject Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigateModal;