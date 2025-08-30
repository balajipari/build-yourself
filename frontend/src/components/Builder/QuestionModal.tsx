import React from 'react';

interface QuestionOption {
  number: number;
  text: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  options: (QuestionOption | string)[];
  customInput: string;
  onOptionSelect: (option: string) => void;
  onCustomInputChange: (input: string) => void;
  onCustomSubmit: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  questionText,
  options,
  customInput,
  onOptionSelect,
  onCustomInputChange,
  onCustomSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      {/* Modal */}
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-lg mx-auto z-50 transform transition-all">
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {questionText}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={typeof option === 'object' ? option.number : option}
                onClick={() => {
                  onOptionSelect(typeof option === 'object' ? option.text : option);
                  onClose();
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-[#8c52ff] transition-all duration-200 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <span className="text-gray-700">
                  {typeof option === 'object' ? option.text : option}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => onCustomInputChange(e.target.value)}
                placeholder="Or type your own answer..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c52ff]/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onCustomSubmit();
                    onClose();
                  }
                }}
              />
              <button
                onClick={() => {
                  onCustomSubmit();
                  onClose();
                }}
                className="px-4 py-2 bg-[#8c52ff] text-white rounded-lg hover:bg-[#8c52ff]/90"
              >
                Send
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
