import React from 'react';
import ImageResult from '../ImageResult';
import ActionButtons from './ActionButtons';
import LoadingIndicator from './LoadingIndicator';

interface BuilderProgressProps {
  isComplete: boolean;
  imageBase64: string | null;
  onDownload: () => void;
  className?: string;
  loading: boolean;
}

const BuilderProgress: React.FC<BuilderProgressProps> = ({
  isComplete,
  imageBase64,
  onDownload,
  className = '',
  loading,
}) => (
  <div className={`w-full ${className}`}>
    <LoadingIndicator loading={loading} isComplete={isComplete} />
    
    {isComplete && imageBase64 && (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <ImageResult imageBase64={imageBase64} />
        <ActionButtons onDownload={onDownload} />
      </div>
    )}
  </div>
);

export default BuilderProgress;
