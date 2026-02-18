import React from 'react';

const AdminHeader = ({ title }) => (
  <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
    <div className="flex items-center gap-4">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <div className="h-6 w-px bg-slate-200"></div>
      <p className="text-slate-500 text-sm font-medium">Last 30 Days: Oct 01 - Oct 31, 2023</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-bold text-slate-800 leading-none">V. Sharma</p>
        <p className="text-[10px] text-slate-500 uppercase font-bold">CRA Officer</p>
      </div>
      <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">VS</div>
    </div>
  </header>
);

export default AdminHeader;