import React from 'react';
import { MESSAGES } from '../../config/constants';

interface LoadingIndicatorProps {
  loading: boolean;
  isComplete: boolean;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  loading, 
  isComplete, 
  className = '' 
}) => {
  if (!loading) return null;

  const message = isComplete ? MESSAGES.LOADING.GENERATING : MESSAGES.LOADING.THINKING;

  return (
    <div className={`mt-6 text-center ${className}`}>
      <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        {message}
      </div>
    </div>
  );
};

export default LoadingIndicator;
