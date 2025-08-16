import React from 'react';
import type { QuestionOption } from '../../types/builder';

interface QuestionDisplayProps {
  questionText: string;
  options: QuestionOption[];
  isComplete: boolean;
  onOptionSelect: (optionNumber: string) => void;
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
    <div className={`mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{questionText}</h3>
      
      {options.length > 0 ? (
        <div className="grid gap-3">
          {options.map((opt) => (
            <button
              key={opt.number}
              className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={() => onOptionSelect(opt.number.toString())}
              disabled={loading}
            >
              <span className="font-medium text-gray-700">{opt.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <p>Processing your request...</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
