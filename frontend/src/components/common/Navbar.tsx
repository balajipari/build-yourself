import React from 'react';
import { APP_CONFIG } from '../../config/constants';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold">
            {APP_CONFIG.TITLE}
          </h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
