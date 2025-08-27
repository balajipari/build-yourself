import React from 'react';
import ProgressBar from './ProgressBar';

interface SubHeaderProps {
  onBackToDashboard: () => void;
  onStartOver: () => void;
  currentStep: number;
  totalSteps: number;
}

const SubHeader: React.FC<SubHeaderProps> = ({ onBackToDashboard, onStartOver, currentStep, totalSteps }) => {
  return (
    <div className="sticky top-15 z-10">
      <div className="max-w-7xl mx-auto my-2">
        <div className="flex items-center justify-between">
          {/* Left side - Back to Dashboard button */}
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer hover:text-[#8c52ff] border border-gray-300 rounded-lg px-2 py-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>

          {/* Center - Progress Bar */}
          <div className="flex-1 max-w-xl mx-8 mt-5">
            <ProgressBar 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
          </div>

          {/* Right side - Start Over button */}
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer hover:text-[#8c52ff] border border-gray-300 rounded-lg px-2 py-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubHeader;
