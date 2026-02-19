import React, { useState } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const StepPersonalPlus = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    fatherName: '',
    maritalStatus: 'Single',
    occupation: '',
    annualIncome: '',
    placeOfBirth: '',
    pep: 'Not Applicable',
    disabilityCategory: 'None',
  });
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.fatherName.trim()) {
      show('Please enter father/spouse name', 'error');
      return;
    }
    if (!formData.occupation.trim()) {
      show('Please select your occupation', 'error');
      return;
    }
    if (!formData.placeOfBirth.trim()) {
      show('Please enter place of birth', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await npsService.savePersonalDetails(formData);
      if (response.success || response.data || response.message) {
        onNext(formData);
      } else {
        show(response.message || 'Failed to save details', 'error');
      }
    } catch (err) {
      show(err.message || 'Error saving details. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 animate-in fade-in duration-500">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Step 4: Personal Details</h3>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Father / Spouse Name *</label>
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="Full name"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marital Status</label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            disabled={loading}
          >
            <option>Single</option>
            <option>Married</option>
            <option>Widowed</option>
            <option>Divorced</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupation *</label>
          <select
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            disabled={loading}
          >
            <option value="">-- Select Occupation --</option>
            <option>Salaried (Government)</option>
            <option>Salaried (Private)</option>
            <option>Self Employed / Business</option>
            <option>Professional</option>
            <option>Homemaker</option>
            <option>Student</option>
            <option>Retired</option>
            <option>Others</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Income (₹)</label>
          <select
            name="annualIncome"
            value={formData.annualIncome}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            disabled={loading}
          >
            <option value="">-- Select Range --</option>
            <option value="100000">Below ₹1 Lakh</option>
            <option value="300000">₹1–3 Lakh</option>
            <option value="500000">₹3–5 Lakh</option>
            <option value="1000000">₹5–10 Lakh</option>
            <option value="2500000">₹10–25 Lakh</option>
            <option value="5000000">Above ₹25 Lakh</option>
          </select>
        </div>

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
            disabled={loading || !formData.fatherName.trim() || !formData.occupation || !formData.placeOfBirth.trim()}
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