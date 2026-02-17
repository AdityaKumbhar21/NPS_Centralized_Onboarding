import React from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';
import StatCard from '../../components/Admin/StatCard';
import RegionalHeatmap from '../../components/Admin/RegionalHeatmap'; // Import the new heatmap component
import KYCChart from '../../components/Admin/KYCChart';
import KYCTable from '../../components/Admin/KYCTable';

const AdminDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      {/* 1. Permanent Sidebar Navigation */}
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Top Administrator Header with User Profile */}
        <AdminHeader title="Administrator Overview" />
        
        {/* 3. Main Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* KPI Row: High-level metrics for Feature 10 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total PRANs Generated" 
              value="1,240,500" 
              trend="+2.4%" 
              icon="badge" 
              color="blue" 
            />
            <StatCard 
              title="KYC Success Rate" 
              value="94.2%" 
              trend="+0.8%" 
              icon="check_circle" 
              color="emerald" 
            />
            <StatCard 
              title="Abandonment Rate" 
              value="5.8%" 
              trend="-1.2%" 
              icon="person_remove" 
              color="rose" 
            />
          </div>

          {/* Visualization Row: Heatmap and Daily Onboarding */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Now uses the specialized RegionalHeatmap component */}
            <RegionalHeatmap />

            {/* Daily Volume Bar Chart for subscriber flow */}
            <KYCChart />
          </div>

          {/* Real-time Monitoring Table: Recent KYC Applications */}
          <KYCTable />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;