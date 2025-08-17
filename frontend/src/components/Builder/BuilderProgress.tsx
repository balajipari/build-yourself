import React from 'react';
import type { QuestionOption } from '../../types/builder';
import ImageResult from '../ImageResult';
import ActionButtons from './ActionButtons';
import CustomInput from './CustomInput';
import LoadingIndicator from './LoadingIndicator';
import QuestionDisplay from './QuestionDisplay';

interface BuilderProgressProps {
  questionText: string;
  options: QuestionOption[];
  isComplete: boolean;
  customInput: string;
  loading: boolean;
  imageBase64: string | null;
  onOptionSelect: (optionText: string) => void;
  onCustomInputChange: (value: string) => void;
  onCustomSubmit: () => void;
  onDownload: () => void;
  className?: string;
}

const BuilderProgress: React.FC<BuilderProgressProps> = ({
  questionText,
  options,
  isComplete,
  customInput,
  loading,
  imageBase64,
  onOptionSelect,
  onCustomInputChange,
  onCustomSubmit,
  onDownload,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-6">
        <QuestionDisplay
          questionText={questionText}
          options={options}
          isComplete={isComplete}
          onOptionSelect={onOptionSelect}
          loading={loading}
        />

        {/* Show custom input when there are no options (empty options array) */}
        {questionText && options.length === 0 && !isComplete && (
          <CustomInput
            value={customInput}
            onChange={onCustomInputChange}
            onSubmit={onCustomSubmit}
            loading={loading}
          />
        )}

        <LoadingIndicator 
          loading={loading} 
          isComplete={isComplete} 
        />

        {/* Image Result Section - Inside the builder progress area */}
        {isComplete && imageBase64 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <ImageResult imageBase64={imageBase64} />
            <ActionButtons 
              onDownload={onDownload}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderProgress;
