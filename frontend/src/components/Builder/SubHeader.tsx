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
    <div className="relative py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div>
          {/* Mobile Layout (< 768px) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between py-2 px-0.5 border-b border-gray-100">
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-1 text-sm text-gray-600 font-semibold cursor-pointer hover:text-[#8c52ff]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>

              <button
                onClick={onStartOver}
                className="flex items-center gap-1.5 text-sm text-gray-600 font-semibold cursor-pointer hover:text-[#8c52ff]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Start Over
              </button>
            </div>
            
            <div className="pb-2">
              <ProgressBar 
                currentStep={currentStep} 
                totalSteps={totalSteps} 
              />
            </div>
          </div>

          {/* Desktop Layout (≥ 768px) */}
          <div className="hidden md:flex items-center justify-between my-2">
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-gray-600 font-semibold cursor-pointer hover:text-[#8c52ff] border border-gray-300 rounded-lg px-2 py-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>

            <div className="flex-1 max-w-xl mx-8">
              <ProgressBar 
                currentStep={currentStep} 
                totalSteps={totalSteps} 
              />
            </div>

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
    </div>
  );
};

export default SubHeader;
