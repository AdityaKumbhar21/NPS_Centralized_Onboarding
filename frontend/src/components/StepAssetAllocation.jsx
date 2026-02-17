import React, { useState } from 'react';

const StepAssetAllocation = ({ onNext, onBack }) => {
  const [choice, setChoice] = useState('auto'); // 'auto' or 'active'

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-3xl font-black text-slate-900">Step 5: Asset Allocation</h2>
          <p className="text-slate-500 mt-2">Decide how your contributions are invested across Asset Classes.</p>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Auto Choice Card */}
          <div 
            onClick={() => setChoice('auto')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${choice === 'auto' ? 'border-primary bg-blue-50/30' : 'border-slate-100'}`}
          >
            <div className="flex justify-between mb-4">
              <span className="text-2xl">⚙️</span>
              <input type="radio" checked={choice === 'auto'} readOnly className="text-primary" />
            </div>
            <h4 className="font-bold text-slate-900">Auto Choice (Lifecycle)</h4>
            <p className="text-xs text-slate-500 mt-2">Portfolio is automatically rebalanced based on your age. Ideal for passive investors.</p>
          </div>

          {/* Active Choice Card */}
          <div 
            onClick={() => setChoice('active')}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${choice === 'active' ? 'border-primary bg-blue-50/30' : 'border-slate-100'}`}
          >
            <div className="flex justify-between mb-4">
              <span className="text-2xl">📊</span>
              <input type="radio" checked={choice === 'active'} readOnly className="text-primary" />
            </div>
            <h4 className="font-bold text-slate-900">Active Choice</h4>
            <p className="text-xs text-slate-500 mt-2">Manually decide your allocation in Equity (E), Corporate Debt (C), and Govt Bonds (G).</p>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 flex justify-between items-center">
          <button onClick={onBack} className="text-sm font-bold text-slate-600 hover:text-slate-900">← Back</button>
          <button 
            onClick={() => onNext({ assetChoice: choice })}
            className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all"
          >
            Confirm Allocation
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepAssetAllocation;