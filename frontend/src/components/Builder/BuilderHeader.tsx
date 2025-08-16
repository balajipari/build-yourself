import React from 'react';
import { APP_CONFIG } from '../../config/constants';

interface BuilderHeaderProps {
  className?: string;
}

const BuilderHeader: React.FC<BuilderHeaderProps> = ({ className = '' }) => {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        {APP_CONFIG.TITLE}
      </h1>
      <p className="text-gray-600">
        {APP_CONFIG.DESCRIPTION}
      </p>
    </div>
  );
};

export default BuilderHeader;
