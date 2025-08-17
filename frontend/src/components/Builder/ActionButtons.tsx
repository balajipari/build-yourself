import React from 'react';

interface ActionButtonsProps {
  onDownload: () => void;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onDownload, 
  className = '' 
}) => {
  return (
    <div className={`flex gap-4 mt-6 justify-center ${className}`}>
      <button 
        onClick={onDownload} 
        className="px-6 py-3 bg-[#8c52ff] text-white rounded-lg hover:bg-[#8c52ff]/90 transition-colors duration-200 font-medium cursor-pointer"
      >
        Download Image
      </button>
    </div>
  );
};

export default ActionButtons;
