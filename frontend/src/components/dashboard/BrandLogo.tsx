import React from 'react';

const BrandLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gradient-to-br from-[#8c52ff] to-[#8c52ff]/80 rounded-lg flex items-center justify-center mr-3">
        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h1 className="text-lg font-bold text-gray-900">Dream Bike Builder</h1>
    </div>
  );
};

export default BrandLogo;
