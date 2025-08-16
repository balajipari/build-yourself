import React from 'react';
import type { QuestionOption } from '../../types/builder';

interface QuestionDisplayProps {
  questionText: string;
  options: QuestionOption[];
  isComplete: boolean;
  onOptionSelect: (optionText: string) => void;
  loading: boolean;
  className?: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  questionText,
  options,
  isComplete,
  onOptionSelect,
  loading,
  className = '',
}) => {
  if (!questionText || isComplete) return null;

  return (
    <div className={`mt-6 p-4 bg-white rounded-2xl shadow-lg ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{questionText}</h3>
      
      {options.length > 0 ? (
        <div className="grid gap-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onOptionSelect(opt.text)}
              className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#8c52ff] transition-all duration-200 cursor-pointer"
            >
              <span className="text-gray-700 font-medium">{opt.text}</span>
            </button>
          ))}
        </div>
      ) : null}
      {/* Remove the "Processing your request..." message - custom input will be handled by parent component */}
    </div>
  );
};

export default QuestionDisplay;
