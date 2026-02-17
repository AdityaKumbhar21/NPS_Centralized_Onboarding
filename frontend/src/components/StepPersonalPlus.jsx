import React, { useState } from 'react';
import { npsService } from '../api/npsService';

const StepPersonalPlus = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    placeOfBirth: '',
    pep: 'Not Applicable',
    disabilityCategory: 'None',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setError('');
    if (!formData.placeOfBirth.trim()) {
      setError('Please enter place of birth');
      return;
    }

    setLoading(true);
    try {
      const response = await npsService.savePersonalDetails(formData);
      if (response.success || response.data) {
        onNext(formData);
      } else {
        setError(response.message || 'Failed to save details');
      }
    } catch (err) {
      setError(err.message || 'Error saving details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 animate-in fade-in duration-500">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Step 3: Additional Information</h3>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50/50 border-l-4 border-red-500 p-4 rounded-r-2xl">
          <p className="text-[11px] text-red-600 leading-relaxed font-semibold">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Place of Birth *</label>
          <input 
            type="text" 
            name="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            placeholder="City, State"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Politically Exposed Person (PEP)</label>
          <select 
            name="pep"
            value={formData.pep}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            disabled={loading}
          >
            <option>Not Applicable</option>
            <option>I am a PEP</option>
            <option>Related to a PEP</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disability Category</label>
          <select 
            name="disabilityCategory"
            value={formData.disabilityCategory}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            disabled={loading}
          >
            <option>None</option>
            <option>Visual Impairment</option>
            <option>Hearing Impairment</option>
            <option>Locomotor Disability</option>
          </select>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={onBack}
            disabled={loading}
            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Back
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || !formData.placeOfBirth.trim()}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Continue to Nominees →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepPersonalPlus;