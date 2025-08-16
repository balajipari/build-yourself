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
              key={opt.number}
              className="w-fit mt-1 text-left p-2.5 py-1 bg-sky-50 border border-gray-300 rounded-xl hover:bg-white hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={() => onOptionSelect(opt.text)}
              disabled={loading}
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
