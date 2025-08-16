import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Brand Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-[#8c52ff] to-[#8c52ff]/80 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900">Dream Bike Builder</h1>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#8c52ff] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
