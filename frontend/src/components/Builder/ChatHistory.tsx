import React, { useState, useCallback } from 'react';
import type { Message } from '../../types/chat';
import type { QuestionOption } from '../../types/builder';
import { projectService } from '../../services/project';

interface EditableTitleProps {
  title?: string;
  onUpdate?: (newTitle: string) => Promise<void>;
}

const EditableTitle: React.FC<EditableTitleProps> = ({ title, onUpdate }) => {
  const [editedTitle, setEditedTitle] = useState(title || '');

  const handleFocus = useCallback(() => {
    setEditedTitle(title || '');
  }, [title]);

  const handleBlur = useCallback(async () => {
    if (editedTitle.trim() !== title && editedTitle.trim() !== '') {
      await onUpdate?.(editedTitle.trim());
    }
  }, [editedTitle, title, onUpdate]);

  return (
    <input
      type="text"
      value={editedTitle}
      onChange={(e) => setEditedTitle(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="text-lg font-semibold text-gray-800 focus:outline-none bg-transparent w-full cursor-pointer hover:text-[#8c52ff] transition-colors duration-200"
      placeholder="Untitled"
    />
  );
};

interface ChatHistoryProps {
  messages: Message[];
  className?: string;
  questionText?: string;
  options?: QuestionOption[];
  isComplete?: boolean;
  customInput?: string;
  loading?: boolean;
  onOptionSelect?: (optionText: string) => void;
  onCustomInputChange?: (value: string) => void;
  onCustomSubmit?: () => void;
  isValidating?: boolean;
  imageBase64?: string | null;
  onDownload?: () => void;
  projectTitle?: string;
  onTitleUpdate?: (newTitle: string) => Promise<void>;
}

interface ValidationResult {
  is_safe: boolean;
  suggestions: string[];
  explanation: string;
  risk_level: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const alignment = isUser ? 'text-right' : 'text-left';
  const bubbleStyle = isUser
    ? 'bg-[#8c52ff] text-white rounded-tr-none'
    : 'bg-blue-50 text-black border border-gray-200 rounded-tl-none';

  return (
    <div className={alignment}>
      <div className="text-xs font-semibold text-gray-600 mb-2 opacity-75">
        {isUser ? 'You' : 'AI Assistant'}
      </div>
      
      <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${bubbleStyle}`}>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
};

interface ImageResultProps {
  imageBase64: string;
  onDownload: () => void;
}

const ImageResult: React.FC<ImageResultProps> = ({ imageBase64, onDownload }) => {
  const imageUrl = `data:image/png;base64,${imageBase64}`;
  
  return (
    <div className="text-left">
      <div className="text-xs font-semibold text-gray-600 mb-2 opacity-75">
        AI Assistant
      </div>
      <div className="inline-block max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-blue-50 text-black border border-gray-200 rounded-tl-none">
        <div className="text-sm font-medium text-gray-700 mb-3">
          Here's your custom bike design!
        </div>
        <img 
          src={imageUrl} 
          alt="Generated bike design"
          className="w-full h-auto rounded-lg mb-3"
        />
        <button
          onClick={onDownload}
          className="w-full p-2 bg-[#8c52ff] text-white rounded-lg hover:bg-white hover:text-[#8c52ff] hover:border-[#8c52ff] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
        >
          Download Image
        </button>
      </div>
    </div>
  );
};

interface QuestionOptionsProps {
  options: QuestionOption[];
  onOptionSelect: (optionText: string) => void;
  loading: boolean;
}

const OptionButton: React.FC<{
  option: QuestionOption;
  onSelect: () => void;
  disabled: boolean;
}> = ({ option, onSelect, disabled }) => (
  <button
    key={option.number}
    onClick={onSelect}
    disabled={disabled}
    className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-[#8c52ff] transition-all duration-200 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
  >
    <span className="text-gray-700">{option.text}</span>
  </button>
);

const QuestionOptions: React.FC<QuestionOptionsProps> = ({ options, onOptionSelect, loading }) => {
  const handleSelect = useCallback((text: string) => () => onOptionSelect(text), [onOptionSelect]);

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {options.map((opt) => (
        <OptionButton
          key={opt.number}
          option={opt}
          onSelect={handleSelect(opt.text)}
          disabled={loading}
        />
      ))}
    </div>
  );
};

interface CustomInputProps {
  customInput: string;
  loading: boolean;
  onCustomInputChange: (value: string) => void;
  validationResult: ValidationResult | null;
  validationError: string | null;
  isLocalValidating: boolean;
  onSubmit: () => void;
}

const ValidationFeedback: React.FC<{
  error: string | null;
  result: ValidationResult | null;
  onSuggestionClick: (suggestion: string) => void;
}> = ({ error, result, onSuggestionClick }) => {
  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
        {(result?.suggestions?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-red-500">Try these safer alternatives:</p>
            <div className="flex flex-wrap gap-2">
              {result?.suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (result?.is_safe) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-600">
          ✅ Your description looks safe and complies with content policies.
        </p>
      </div>
    );
  }

  return null;
};

const CustomInput: React.FC<CustomInputProps> = ({ 
  customInput, 
  loading, 
  onCustomInputChange, 
  validationResult, 
  validationError, 
  isLocalValidating, 
  onSubmit 
}) => {
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit]);

  const isDisabled = loading || isLocalValidating;
  const isSubmitDisabled = isDisabled || !customInput?.trim();

  return (
    <div className="mt-3">
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput || ''}
            onChange={(e) => onCustomInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your custom specification here..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8c52ff] focus:border-transparent border-gray-300 text-sm"
            disabled={isDisabled}
          />
          <button
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className="font-semibold px-3 py-2 bg-[#8c52ff] text-white rounded-lg hover:bg-white hover:text-[#8c52ff] hover:border-[#8c52ff] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {isLocalValidating ? 'Validating...' : 'Save'}
          </button>
        </div>
        
        <ValidationFeedback
          error={validationError}
          result={validationResult}
          onSuggestionClick={onCustomInputChange}
        />
      </div>
    </div>
  );
};

interface ChatContentProps {
  messages: Message[];
  isComplete?: boolean;
  imageBase64?: string | null;
  onDownload?: () => void;
}

const ChatContent: React.FC<ChatContentProps> = ({ messages, isComplete, imageBase64, onDownload }) => {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>Starting your dream bike journey...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg} />
      ))}
      
      {isComplete && imageBase64 && (
        <ImageResult imageBase64={imageBase64} onDownload={onDownload || (() => {})} />
      )}
    </div>
  );
};

interface QuestionSectionProps {
  questionText?: string;
  options?: QuestionOption[];
  isComplete?: boolean;
  customInput?: string;
  loading?: boolean;
  onOptionSelect?: (optionText: string) => void;
  onCustomInputChange?: (value: string) => void;
  validationResult: ValidationResult | null;
  validationError: string | null;
  isLocalValidating: boolean;
  onSubmit: () => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({
  questionText,
  options,
  isComplete,
  customInput,
  loading,
  onOptionSelect,
  onCustomInputChange,
  validationResult,
  validationError,
  isLocalValidating,
  onSubmit
}) => {
  if (!questionText || isComplete) return null;

  return (
    <div className="flex justify-center p-4 pb-6 rounded-b-lg">
      <div className="inline-block max-w-[80%] px-4 py-3 rounded-xl bg-blue-50 text-black border border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-3">{questionText}</div>
        
        {options && options.length > 0 && (
          <QuestionOptions 
            options={options} 
            onOptionSelect={onOptionSelect || (() => {})} 
            loading={loading || false} 
          />
        )}
        
        {(!options || options.length === 0) && (
          <CustomInput
            customInput={customInput || ''}
            loading={loading || false}
            onCustomInputChange={onCustomInputChange || (() => {})}
            validationResult={validationResult}
            validationError={validationError}
            isLocalValidating={isLocalValidating}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
};

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  messages, 
  className = '',
  questionText,
  options,
  isComplete,
  customInput,
  loading,
  onOptionSelect,
  onCustomInputChange,
  onCustomSubmit,
  imageBase64,
  onDownload,
  projectTitle,
  onTitleUpdate,
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLocalValidating, setIsLocalValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCustomSubmit = useCallback(async () => {
    if (!customInput?.trim()) return;

    setIsLocalValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      const validation = await projectService.validateCustomMessage(customInput);
      setValidationResult(validation);

      if (validation.is_safe) {
        onCustomSubmit?.();
        setValidationResult(null);
      } else {
        setValidationError(validation.explanation);
      }
    } catch (error) {
      setValidationError('Validation failed. Please try again.');
    } finally {
      setIsLocalValidating(false);
    }
  }, [customInput, onCustomSubmit]);

  return (
    <div className={`w-full h-[75vh] flex justify-center ${className}`}>
      <div className="w-full max-w-4xl">
        <div className="h-full flex flex-col border border-gray-300 rounded-lg bg-white shadow-sm">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 rounded-t-lg">
            <EditableTitle title={projectTitle} onUpdate={onTitleUpdate} />
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
            <ChatContent
              messages={messages}
              isComplete={isComplete}
              imageBase64={imageBase64}
              onDownload={onDownload}
            />
          </div>
          
          <QuestionSection
            questionText={questionText}
            options={options}
            isComplete={isComplete}
            customInput={customInput}
            loading={loading}
            onOptionSelect={onOptionSelect}
            onCustomInputChange={onCustomInputChange}
            validationResult={validationResult}
            validationError={validationError}
            isLocalValidating={isLocalValidating}
            onSubmit={handleCustomSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
