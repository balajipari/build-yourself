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
    <div className={`p-4 bg-white rounded-lg border border-gray-300 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b border-gray-100 pb-2 mb-4">{questionText}</h3>
      
      {options.length > 0 ? (
        <div className="grid gap-4">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onOptionSelect(opt.text)}
              className="w-fit p-1 px-2.5 text-left bg-blue-50 border border-blue-100 rounded-xl hover:bg-gray-50 hover:border-[#8c52ff] transition-all duration-200 cursor-pointer"
            >
              <span className="text-gray-700 font-medium">{opt.text}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default QuestionDisplay;
