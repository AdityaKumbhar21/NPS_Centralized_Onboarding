import React, { useState } from 'react';

const StepFATCA = ({ onNext }) => {
  const [isIndianResident, setIsIndianResident] = useState(true);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 animate-in slide-in-from-right-8 duration-500">
      <h3 className="text-xl font-bold text-slate-900 mb-6">FATCA/CRS Declaration</h3>
      
      <div className="space-y-6">
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you a tax resident of any country other than India?
        </p>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsIndianResident(true)}
            className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${isIndianResident ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 text-slate-400'}`}
          >
            No
          </button>
          <button 
            onClick={() => setIsIndianResident(false)}
            className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${!isIndianResident ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 text-slate-400'}`}
          >
            Yes
          </button>
        </div>

        {!isIndianResident && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-700">
            ⚠️ Non-resident tax details will require manual verification by the CRA officer.
          </div>
        )}

        <div className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 rounded text-primary" id="declare" />
          <label htmlFor="declare" className="text-[11px] text-slate-500">
            I hereby declare that the information provided is true and correct to the best of my knowledge.
          </label>
        </div>

        <button 
          onClick={() => onNext({ fatcaCompliant: true })}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl"
        >
          Confirm Declaration
        </button>
      </div>
    </div>
  );
};

export default StepFATCA;