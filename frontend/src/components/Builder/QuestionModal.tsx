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
  isMultiselect?: boolean;
  selectedOptions?: QuestionOption[];
  onContinue?: () => void;
  loading?: boolean;
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
  isMultiselect = false,
  selectedOptions = [],
  onContinue,
  loading = false,
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

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#8c52ff] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-600">Processing...</p>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 relative">
            {options.map((option) => {
              const optionText = typeof option === 'object' ? option.text : option;
              const isSelected = selectedOptions.some(selected => selected.text === optionText);
              
              return (
                <button
                  key={typeof option === 'object' ? option.number : option}
                  onClick={() => {
                    if (!loading) {
                      onOptionSelect(optionText);
                      if (!isMultiselect) {
                        onClose();
                      }
                    }
                  }}
                  disabled={loading}
                  className={`
                    w-full px-4 py-2 border rounded-xl transition-all duration-200 cursor-pointer text-sm
                    ${isSelected 
                      ? 'bg-[#8c52ff] text-white border-[#8c52ff]' 
                      : 'bg-white border-gray-200 hover:border-[#8c52ff]'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span className={isSelected ? 'text-white' : 'text-gray-700'}>
                    {optionText}
                  </span>
                </button>
              );
            })}

            {/* Continue Button for Multiselect */}
            {isMultiselect && selectedOptions.length > 0 && (
              <button
                onClick={() => {
                  if (!loading && onContinue) {
                    onContinue();
                  }
                }}
                disabled={loading}
                className="mt-6 w-full bg-[#8c52ff] text-white py-3 px-6 rounded-xl hover:bg-[#7440d8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
              </button>
            )}
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
                  if (e.key === 'Enter' && !loading) {
                    onCustomSubmit();
                    onClose();
                  }
                }}
                disabled={loading}
              />
              <button
                onClick={() => {
                  if (!loading) {
                    onCustomSubmit();
                    onClose();
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-[#8c52ff] text-white rounded-lg hover:bg-[#8c52ff]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
