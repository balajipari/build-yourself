import React from 'react';
import type { QuestionOption } from '../../types/builder';

interface ChipsSelectProps {
  options: QuestionOption[];
  selectedOptions: QuestionOption[];
  isMultiselect: boolean;
  onOptionSelect: (option: QuestionOption) => void;
  onContinue: () => void;
  className?: string;
}

const ChipsSelect: React.FC<ChipsSelectProps> = ({
  options,
  selectedOptions,
  isMultiselect,
  onOptionSelect,
  onContinue,
  className = '',
}) => {
  const isSelected = (option: QuestionOption) => 
    selectedOptions.some(selected => selected.value === option.value);

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.number}
            onClick={() => onOptionSelect(option)}
            className={`
              p-3 text-left text-xs text-gray-500 rounded-xl shadow bg-white transition-all duration-200 cursor-pointer 
              ${isSelected(option) 
                ? '!text-[#8c52ff] border !border-[#8c52ff]'
                : 'border border-gray-300 hover:border-gray-300 hover:scale-101'}
            `}
          >
            <span className="font-medium">{option.text}</span>
          </button>
        ))}
      </div>

      {isMultiselect && selectedOptions.length > 0 && (
        <button
          onClick={onContinue}
          className="mt-6 text-sm w-fit font-semibold border border-[#8c52ff] bg-[#8c52ff] shadow text-white py-2.5 px-4 rounded-full transition-all duration-200"
        >
          Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};

export default ChipsSelect;
