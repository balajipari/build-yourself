import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronDown } from 'react-icons/fa';

export type ProjectType = 'bike' | 'car';

interface GlobalProjectSelectProps {
  onChange: (type: ProjectType) => void;
}

const GlobalProjectSelect: React.FC<GlobalProjectSelectProps> = ({ onChange }) => {
  const [selectedType, setSelectedType] = useState<ProjectType>(() => {
    const saved = localStorage.getItem('selectedProjectType');
    return (saved as ProjectType) || 'bike';
  });
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('selectedProjectType', selectedType);
    onChange(selectedType);
  }, [selectedType, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type: ProjectType) => {
    if (type === 'car') return; // Car is disabled
    setSelectedType(type);
    setIsOpen(false);
  };

  const renderDropdown = () => {
    if (!isOpen || !buttonRef.current) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownStyles = {
      position: 'fixed',
      top: `${buttonRect.bottom + 4}px`,
      left: `${buttonRect.left}px`,
      width: `${buttonRect.width}px`,
      zIndex: 9999
    } as const;

    return createPortal(
      <div 
        ref={dropdownRef}
        className="bg-white rounded-md shadow border border-gray-200 py-1"
        style={dropdownStyles}
      >
        <button
          onClick={() => handleSelect('bike')}
          className={`w-full text-left px-3 py-1 text-sm ${selectedType === 'bike' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Bike
        </button>
        <button
          disabled
          className="w-full text-left px-3 py-1 text-sm text-gray-400 cursor-not-allowed"
        >
          Car
        </button>
      </div>,
      document.body
    );
  };

  return (
    <div>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none w-fit"
      >
        {selectedType === 'bike' ? 'Bike' : 'Car'}
        <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {renderDropdown()}
    </div>
  );
};

export default GlobalProjectSelect;
