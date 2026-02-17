import React from 'react';

const StatCard = ({ title, value, trend, icon, color }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600"
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className={`text-xs font-semibold mt-2 ${trend.includes('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend} vs last month
        </p>
      </div>
      <div className={`size-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;