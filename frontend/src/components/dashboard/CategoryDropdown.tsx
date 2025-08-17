import React, { useState, useRef, useEffect } from 'react';
import { BiFilterAlt } from "react-icons/bi";

interface CategoryDropdownProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  const getDisplayText = (category: string) => {
    switch (category) {
      case 'all': return 'All Categories';
      case 'bikes': return 'Bikes';
      case 'cars': return 'Cars';
      default: return 'All Categories';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
      >
        <span>{getDisplayText(selectedCategory)}</span>
        <BiFilterAlt height={35} width={35} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-10">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
              selectedCategory === 'all' ? 'text-[#8c52ff] bg-[#8c52ff]/10' : 'text-gray-700'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => handleCategorySelect('bikes')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
              selectedCategory === 'bikes' ? 'text-[#8c52ff] bg-[#8c52ff]/10' : 'text-gray-700'
            }`}
          >
            Bikes
          </button>
          <button
            onClick={() => handleCategorySelect('cars')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
              selectedCategory === 'cars' ? 'text-[#8c52ff] bg-[#8c52ff]/10' : 'text-gray-700'
            }`}
          >
            Cars
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
