import React from 'react';

const ConsentModal = ({ isOpen, onAccept, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-3 mb-6 text-primary">
          <span className="text-2xl">📋</span>
          <h3 className="text-xl font-bold">Data Usage Consent</h3>
        </div>
        
        <div className="space-y-4 text-sm text-slate-600 mb-8 leading-relaxed">
          <p>As per the <strong>DPDP Act</strong>, we require your permission to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access your demographic data from UIDAI via Aadhaar eKYC.</li>
            <li>Verify your tax status with NSDL using your PAN details.</li>
            <li>Share necessary identifiers with Pension Fund Managers (PFMs).</li>
          </ul>
          <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            Your data is encrypted using AES-256 and will only be used for NPS PRAN generation.
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Decline
          </button>
          <button 
            onClick={onAccept}
            className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-bold shadow-lg shadow-blue-200 hover:bg-primary-dark transition-all"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;