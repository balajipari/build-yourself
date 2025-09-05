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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.number}
            onClick={() => onOptionSelect(option)}
            className={`
              p-3 text-left rounded-xl transition-all duration-200 cursor-pointer
              ${isSelected(option) 
                ? 'bg-[#8c52ff] text-white border-[#8c52ff]' 
                : 'bg-blue-50 border border-blue-100 hover:border-[#8c52ff]'}
            `}
          >
            <span className="font-medium">{option.text}</span>
          </button>
        ))}
      </div>

      {isMultiselect && selectedOptions.length > 0 && (
        <button
          onClick={onContinue}
          className="mt-6 w-full bg-[#8c52ff] text-white py-3 px-6 rounded-xl hover:bg-[#7440d8] transition-all duration-200"
        >
          Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};

export default ChipsSelect;
