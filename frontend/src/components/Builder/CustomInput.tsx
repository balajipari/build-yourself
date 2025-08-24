import React, { useState } from 'react';
import { validateCustomInput, sanitizeInput } from '../../utils/validation';
import { projectService } from '../../services/project';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  className?: string;
  isValidating?: boolean;
}

interface ValidationResult {
  is_safe: boolean;
  suggestions: string[];
  explanation: string;
  risk_level: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading,
  className = '',
  isValidating = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLocalValidating, setIsLocalValidating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear errors when user starts typing
    if (error) {
      setError(null);
    }
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const validateMessage = async (message: string): Promise<boolean> => {
    if (!message.trim()) return false;
    
    setIsLocalValidating(true);
    try {
      const result = await projectService.validateCustomMessage(message);
      setValidationResult(result);
      
      if (!result.is_safe) {
        setError(`Content policy violation: ${result.explanation}`);
        return false;
      }
      
      return true;
    } catch (error) {
        // If validation fails, allow to proceed but warn user
        setError('Unable to validate message. Please ensure your description is appropriate.');
        return true;
    } finally {
      setIsLocalValidating(false);
    }
  };

  const handleSubmit = async () => {
    // First do basic validation
    const basicValidation = validateCustomInput(value);
    if (!basicValidation.isValid) {
      setError(basicValidation.error || 'Invalid input');
      return;
    }
    
    // Then do content policy validation
    const isContentSafe = await validateMessage(value);
    if (!isContentSafe) {
      return; // Error already set by validateMessage
    }
    
    // If all validations pass, submit
    onSubmit();
    setError(null);
    setValidationResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setError(null);
    setValidationResult(null);
  };

  // Use external isValidating or local validation state
  const isCurrentlyValidating = isValidating || isLocalValidating;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your custom specification here..."
          className={`flex-1 p-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8c52ff] focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={loading || isCurrentlyValidating}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || isCurrentlyValidating || !value.trim()}
          className="font-semibold px-3 py-1 h-fit bg-[#8c52ff] text-white rounded-lg hover:bg-white hover:text-[#8c52ff] hover:border-1 hover:border-[#8c52ff] hover:rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isCurrentlyValidating ? 'Validating...' : 'Save'}
        </button>
      </div>
      
      {/* Validation Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
          
          {/* Show suggestions if available */}
          {validationResult && validationResult.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-red-500">Try these safer alternatives:</p>
              <div className="flex flex-wrap gap-2">
                {validationResult.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Validation Success */}
      {validationResult && validationResult.is_safe && !error && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">
            ✅ Your description looks safe and complies with content policies.
          </p>
        </div>
      )}
      
      <p className="text-sm text-gray-600">
        Press Enter to submit, or click Save. Your input will be validated for content policy compliance.
      </p>
    </div>
  );
};

export default CustomInput;
