import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentStep, 
  totalSteps, 
  className = '' 
}) => {
  const progressPercentage = currentStep > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className={`mb-5 ${className}`}>
      <div className="flex justify-between text-sm text-gray-600 mt-4">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{progressPercentage}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      {totalSteps > 15 && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          Custom questions added for detailed specifications
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
