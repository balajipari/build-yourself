import React from 'react';
import ProgressBar from './ProgressBar';
import QuestionDisplay from './QuestionDisplay';
import CustomInput from './CustomInput';
import LoadingIndicator from './LoadingIndicator';
import type { QuestionOption } from '../../types/builder';

interface RightPanelProps {
  currentStep: number;
  totalSteps: number;
  questionText: string;
  options: QuestionOption[];
  isComplete: boolean;
  customInput: string;
  loading: boolean;
  onOptionSelect: (optionNumber: string) => void;
  onCustomInputChange: (value: string) => void;
  onCustomSubmit: () => void;
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
  onOptionSelect,
  onCustomInputChange,
  onCustomSubmit,
  className = '',
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
        <div className="mb-6">
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

        {!questionText && !isComplete && (
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
      </div>
    </div>
  );
};

export default RightPanel;
