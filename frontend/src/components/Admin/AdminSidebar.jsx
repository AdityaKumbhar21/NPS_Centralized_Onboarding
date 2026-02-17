import React from 'react';

const AdminSidebar = () => (
  <aside className="w-64 bg-[#1a227f] text-white flex flex-col shrink-0">
    <div className="p-6 flex items-center gap-3 border-b border-white/10">
      <div className="bg-white rounded-lg p-1 text-[#1a227f]">
        <span className="material-symbols-outlined text-3xl">account_balance</span>
      </div>
      <div>
        <h1 className="text-lg font-bold leading-none">PFRDA/CRA</h1>
        <p className="text-[10px] text-white/70 mt-1 uppercase tracking-widest">Monitoring Hub</p>
      </div>
    </div>
    <nav className="flex-1 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg text-white font-medium cursor-pointer">
        <span className="material-symbols-outlined">dashboard</span> Analytics
      </div>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg text-white/80 transition-colors cursor-pointer">
        <span className="material-symbols-outlined">group</span> Users
      </div>
    </nav>
  </aside>
);

export default AdminSidebar;