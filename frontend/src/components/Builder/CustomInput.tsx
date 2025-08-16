import React, { useState } from 'react';
import { validateCustomInput, sanitizeInput } from '../../utils/validation';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  className?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  value,
  onChange,
  onSubmit,
  loading,
  className = '',
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = () => {
    const validation = validateCustomInput(value);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    onSubmit();
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your custom specification here..."
          className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-sm text-gray-600">Press Enter to submit, or click Send</p>
    </div>
  );
};

export default CustomInput;
