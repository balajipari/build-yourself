import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardContent from '../components/dashboard/DashboardContent';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="pt-20">
        <DashboardContent />
      </div>
    </div>
  );
};

export default Dashboard;
