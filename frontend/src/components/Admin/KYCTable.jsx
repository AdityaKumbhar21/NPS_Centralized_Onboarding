import React, { useState } from 'react';
import InvestigateModal from './InvestigateModal'; // Import the modal you just created

const KYCTable = () => {
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const applications = [
    {
      id: 1,
      name: "Rajesh Kumar",
      pran: "110012934421",
      date: "Oct 24, 2023 | 11:32 AM",
      method: "e-KYC (Aadhaar)",
      status: "Verified",
      risk: "Low",
      statusColor: "bg-emerald-100 text-emerald-700",
      dotColor: "bg-emerald-600"
    },
    {
      id: 2,
      name: "Amit Khan",
      pran: "110022349102",
      date: "Oct 24, 2023 | 09:15 AM",
      method: "Offline PAN",
      status: "Flagged",
      risk: "High",
      statusColor: "bg-rose-100 text-rose-700",
      dotColor: "bg-rose-600",
      isFlagged: true
    },
    {
      id: 3,
      name: "Sneha Biswas",
      pran: "110091223401",
      date: "Oct 23, 2023 | 04:45 PM",
      method: "e-KYC (DigiLocker)",
      status: "Pending",
      risk: "Medium",
      statusColor: "bg-amber-100 text-amber-700",
      dotColor: "bg-amber-600"
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-800">Recent KYC Applications</h4>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-white">download</span> Export Report
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Applicant Name</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">KYC Method</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => (
              <tr key={app.id} className={`${app.isFlagged ? 'bg-rose-50/30' : ''} hover:bg-slate-50 transition-colors`}>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-800">{app.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">PRAN: {app.pran}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">
                    {app.method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${app.statusColor} text-[10px] font-bold`}>
                    <span className={`size-1.5 ${app.dotColor} rounded-full`}></span> {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  <span className={app.risk === 'High' ? 'text-rose-600 font-bold' : ''}>{app.risk}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {app.isFlagged ? (
                    <button 
                      onClick={() => setSelectedApplicant(app)}
                      className="bg-rose-600 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-rose-700 transition-all shadow-sm shadow-rose-100"
                    >
                      Investigate
                    </button>
                  ) : app.status === "Pending" ? (
                    <button className="text-amber-600 hover:underline font-bold text-xs px-2">Review KYC</button>
                  ) : (
                    <button className="text-primary hover:underline font-bold text-xs px-2">View Details</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logic to render the Investigate Modal when an applicant is selected */}
      {selectedApplicant && (
        <InvestigateModal 
          applicant={selectedApplicant} 
          onClose={() => setSelectedApplicant(null)} 
        />
      )}
    </div>
  );
};

export default KYCTable;