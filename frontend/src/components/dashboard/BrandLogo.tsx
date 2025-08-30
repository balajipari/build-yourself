import React from 'react';

const BrandLogo: React.FC = () => {
  return (
    <div className="flex items-center">
        <img src="/assets/logo.png" alt="Dream Bike Builder Logo" className="w-12 lg:w-16 h-12 lg:h-16" />
      <h1 className="pl-2 font-comfortaa text-xl lg:text-2xl font-semibold text-gray-900 hidden sm:block">Build it Yourself</h1>
    </div>
  );
};

export default BrandLogo;
