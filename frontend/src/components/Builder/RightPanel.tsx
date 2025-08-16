import React from 'react';
import ProgressBar from './ProgressBar';
import QuestionDisplay from './QuestionDisplay';
import CustomInput from './CustomInput';
import LoadingIndicator from './LoadingIndicator';
import ActionButtons from './ActionButtons';
import ImageResult from '../ImageResult';
import type { QuestionOption } from '../../types/builder';

interface RightPanelProps {
  currentStep: number;
  totalSteps: number;
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
  onReset: () => void;
  className?: string;
}

const RightPanel: React.FC<RightPanelProps> = ({
  currentStep,
  totalSteps,
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
  onReset,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Build Progress</h2>
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />
        </div>

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
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <ImageResult imageBase64={imageBase64} />
            <ActionButtons 
              onDownload={onDownload}
              onReset={onReset}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
