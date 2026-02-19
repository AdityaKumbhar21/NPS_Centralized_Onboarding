import React, { useState, useEffect } from 'react';
import { npsService } from '../api/npsService';
import { useToast } from '../contexts/ToastProvider';

const StepPFM = ({ userData, onNext, onBack }) => {
  const [selectedPfmId, setSelectedPfmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pfmList, setPfmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const { show } = useToast();

  // Default PFMs (used if API fetch fails)
  const defaultPfmData = [
    {
      id: 1,
      name: "SBI Pension Funds Pvt. Ltd.",
      tag: "Recommended",
      returns3Y: "14.2%",
      aum: "45,210",
      risk: "Moderate High",
      riskColor: "bg-amber-100 text-amber-800"
    },
    {
      id: 2,
      name: "HDFC Pension Mgmt. Co.",
      tag: "Top Performer (Equity)",
      returns3Y: "14.8%",
      aum: "32,180",
      risk: "High Risk",
      riskColor: "bg-red-100 text-red-800"
    },
    {
      id: 3,
      name: "LIC Pension Fund Ltd.",
      tag: "Stable Growth History",
      returns3Y: "11.5%",
      aum: "85,440",
      risk: "Moderate Low",
      riskColor: "bg-emerald-100 text-emerald-800"
    }
  ];

  // Fetch PFM list on component mount
  useEffect(() => {
    const fetchPfms = async () => {
      setLoading(true);
      try {
        const response = await npsService.listPfms();
        // Backend returns { pfms: [...] }
        const list = response.pfms || response.data?.pfms || response;
        const pfmArray = Array.isArray(list) ? list : [];
        if (pfmArray.length > 0) {
          setPfmList(pfmArray);
          setSelectedPfmId(pfmArray[0].id);
        } else {
          setPfmList(defaultPfmData);
          setSelectedPfmId(defaultPfmData[0].id);
        }
      } catch (err) {
        console.warn('Error fetching PFMs, using default data:', err);
        setPfmList(defaultPfmData);
        setSelectedPfmId(defaultPfmData[0].id);
      } finally {
        setLoading(false);
      }
    };

    fetchPfms();
  }, []);

  // Filter data based on search input
  const filteredPfm = pfmList.filter(pfm => 
    pfm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle PFM selection
  const handleSelectPfm = async (pfmId) => {
    setSelecting(true);
    try {
      const response = await npsService.selectPfm(pfmId);
      if (response.message || response.success || response.data) {
        setSelectedPfmId(pfmId);
      } else {
        show(response.message || 'Failed to select PFM', 'error');
      }
    } catch (err) {
      show(err.message || 'Error selecting PFM. Please try again.', 'error');
    } finally {
      setSelecting(false);
    }
  };

  // Handle proceed
  const handleProceed = () => {
    if (selectedPfmId) {
      const selectedFund = pfmList.find(p => p.id === selectedPfmId);
      onNext({ pfmId: selectedPfmId, pfmName: selectedFund?.name || String(selectedPfmId) });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Step 5: PFM Selection</h2>
            <p className="text-slate-500 text-sm mt-1">Select your preferred Pension Fund Manager to manage your retirement corpus.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-emerald-500 text-sm">✓</span>
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-tight">Auto-saved</span>
          </div>
        </div>

        {/* Errors are shown via global toasts */}

        {/* Filter Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <input 
              className="w-full pl-4 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              placeholder="Search Fund Manager..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-semibold">Loading PFM List...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">Fund Manager</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 text-center">3Y Returns</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 text-center">AUM (Cr)</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 text-center">Risk Level</th>
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPfm.length > 0 ? (
                    filteredPfm.map((pfm) => (
                      <tr key={pfm.id} className={`hover:bg-blue-50/30 transition-colors ${selectedPfmId === pfm.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{pfm.name}</p>
                          <span className="text-[10px] font-bold text-primary uppercase">{pfm.tag}</span>
                        </td>
                        <td className="p-4 text-center font-bold text-emerald-600">{pfm.returns3Y}</td>
                        <td className="p-4 text-center font-medium text-slate-500">₹{pfm.aum}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${pfm.riskColor}`}>
                            {pfm.risk}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {selectedPfmId === pfm.id ? (
                            <div className="flex items-center justify-end gap-1 text-primary">
                              <span className="font-bold text-xs uppercase">✓ Selected</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleSelectPfm(pfm.id)}
                              disabled={selecting}
                              className="px-4 py-2 rounded-lg border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {selecting ? 'Selecting...' : 'Select PFM'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 font-semibold">
                        No PFMs found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Info Cards (Trust & Safety) */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-xs">
                <p className="font-bold uppercase text-slate-900 mb-1">PFM Switch Rule</p>
                <p className="text-slate-500">Change your PFM once per financial year based on PFRDA regulations.</p>
              </div>
              <div className="text-xs">
                <p className="font-bold uppercase text-slate-900 mb-1">Trust & Safety</p>
                <p className="text-slate-500">All PFMs are regulated by PFRDA with standardized guidelines and oversight.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <button 
          onClick={onBack}
          disabled={loading || selecting}
          className="text-slate-600 font-bold text-sm hover:text-slate-900 transition-colors disabled:opacity-50"
        >
          ← Back to Nominee
        </button>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            disabled={loading || selecting}
            className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            onClick={handleProceed}
            disabled={!selectedPfmId || loading || selecting}
            className="flex-1 md:flex-none px-10 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {selecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              'Proceed to Asset Allocation →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepPFM;