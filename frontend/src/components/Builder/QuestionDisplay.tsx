import React from 'react';
import type { QuestionOption } from '../../types/builder';
import ChipsSelect from './ChipsSelect';

interface QuestionDisplayProps {
  questionText: string;
  options: QuestionOption[];
  selectedOptions: QuestionOption[];
  isMultiselect: boolean;
  isComplete: boolean;
  onOptionSelect: (option: QuestionOption) => void;
  onContinue: () => void;
  loading: boolean;
  className?: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  questionText,
  options,
  selectedOptions,
  isMultiselect,
  isComplete,
  onOptionSelect,
  onContinue,
  loading,
  className = '',
}) => {
  if (!questionText || isComplete) return null;

  return (
    <div className={`${className}`}>
      <h3 className="text font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-3">
        {questionText}
      </h3>
      
      {options.length > 0 && (
        <ChipsSelect
          options={options}
          selectedOptions={selectedOptions}
          isMultiselect={isMultiselect}
          onOptionSelect={onOptionSelect}
          onContinue={onContinue}
        />
      )}
    </div>
  );
};

export default QuestionDisplay;