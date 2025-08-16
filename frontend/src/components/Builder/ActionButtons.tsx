import React from 'react';

interface ActionButtonsProps {
  onDownload: () => void;
  onReset: () => void;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onDownload, 
  onReset, 
  className = '' 
}) => {
  return (
    <div className={`flex gap-4 mt-6 justify-center ${className}`}>
      <button 
        onClick={onDownload} 
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        📥 Download Image
      </button>
      <button 
        onClick={onReset} 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        🚀 Create New Bike
      </button>
    </div>
  );
};

export default ActionButtons;
