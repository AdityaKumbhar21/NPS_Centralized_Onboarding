import React, { useState } from 'react';
import { npsService } from '../api/npsService';

const StepNominee = ({ onNext, onBack }) => {
  const [nominees, setNominees] = useState([{ name: '', relation: '', age: '', share: 100 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addNominee = () => {
    if (nominees.length < 3) {
      setNominees([...nominees, { name: '', relation: '', age: '', share: 0 }]);
    }
  };

  const updateNominee = (index, field, value) => {
    const updated = [...nominees];
    updated[index][field] = value;
    setNominees(updated);
  };

  const totalShare = nominees.reduce((sum, n) => sum + parseInt(n.share || 0), 0);

  const handleSaveNominees = async () => {
    setError('');
    
    // Validate all nominees
    const validNominees = nominees.filter(n => n.name && n.relation && n.age);
    if (validNominees.length === 0) {
      setError('Please fill in at least one nominee');
      return;
    }

    setLoading(true);
    try {
      const response = await npsService.saveNominee({ nominees: validNominees });
      if (response.success || response.data) {
        onNext({ nominees: validNominees });
      } else {
        setError(response.message || 'Failed to save nominees');
      }
    } catch (err) {
      setError(err.message || 'Error saving nominees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl border border-slate-100 animate-in fade-in duration-500">
      <h3 className="text-2xl font-black mb-6 text-slate-900">Step 4: Nominee Details</h3>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50/50 border-l-4 border-red-500 p-4 rounded-r-2xl">
          <p className="text-[11px] text-red-600 leading-relaxed font-semibold">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {nominees.map((nominee, index) => (
          <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative">
            <h4 className="text-xs font-bold text-primary uppercase mb-4">Nominee {index + 1}</h4>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Full Name *"
                value={nominee.name}
                className="rounded-lg border border-slate-200 text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                onChange={(e) => updateNominee(index, 'name', e.target.value)}
                disabled={loading}
              />
              <select 
                value={nominee.relation}
                className="rounded-lg border border-slate-200 text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                onChange={(e) => updateNominee(index, 'relation', e.target.value)}
                disabled={loading}
              >
                <option value="">Relation *</option>
                <option>Spouse</option>
                <option>Son/Daughter</option>
                <option>Parent</option>
                <option>Sibling</option>
                <option>Other</option>
              </select>
              <input 
                type="number" 
                placeholder="Age *"
                value={nominee.age}
                className="rounded-lg border border-slate-200 text-sm px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                onChange={(e) => updateNominee(index, 'age', e.target.value)}
                disabled={loading}
              />
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="Share %"
                  className="w-full rounded-lg border border-slate-200 text-sm px-4 py-3 pr-8 focus:ring-2 focus:ring-primary/20 outline-none"
                  value={nominee.share}
                  onChange={(e) => updateNominee(index, 'share', e.target.value)}
                  disabled={loading}
                />
                <span className="absolute right-3 top-3 text-slate-400">%</span>
              </div>
            </div>
          </div>
        ))}

        {nominees.length < 3 && (
          <button 
            onClick={addNominee} 
            disabled={loading}
            className="text-primary font-bold text-sm flex items-center gap-2 hover:opacity-70 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">add_circle</span> Add Another Nominee
          </button>
        )}

        <div className={`p-4 rounded-xl text-center font-bold text-sm ${totalShare === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          Total Allocation: {totalShare}% {totalShare !== 100 && "(Must be 100%)"}
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-4">
        <button 
          onClick={onBack}
          disabled={loading}
          className="text-slate-500 font-bold px-6 py-3 hover:text-slate-700 disabled:opacity-50"
        >
          Back
        </button>
        <button 
          disabled={totalShare !== 100 || loading}
          onClick={handleSaveNominees}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Nominees'
          )}
        </button>
      </div>
    </div>
  );
};

export default StepNominee;