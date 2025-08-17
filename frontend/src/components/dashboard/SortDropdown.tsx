import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineArrowsUpDown } from "react-icons/hi2";

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  onSortChange,
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

  const handleSortSelect = (sort: string) => {
    onSortChange(sort);
    setIsOpen(false);
  };

  const getSortDisplayText = (sort: string) => {
    switch (sort) {
      case 'name-asc': return 'Name A-Z';
      case 'name-desc': return 'Name Z-A';
      case 'date-desc': return 'Date Desc';
      case 'date-asc': return 'Date Asc';
      default: return 'Date Desc';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
      >
        <span>{getSortDisplayText(sortBy)}</span>
        <HiOutlineArrowsUpDown height={35} width={35} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[160px] z-10">
          <button
            onClick={() => handleSortSelect('name-asc')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
              sortBy === 'name-asc' ? 'text-[#8c52ff] bg-[#8c52ff]/10' : 'text-gray-700'
            }`}
          >
            Name A-Z
          </button>
          <button
            onClick={() => handleSortSelect('name-desc')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
              sortBy === 'name-desc' ? 'text-[#8c52ff] bg-[#8c52ff]/10' : 'text-gray-700'
            }`}
          >
            Name Z-A
          </button>
          <button
            onClick={() => handleSortSelect('date-desc')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
              sortBy === 'date-desc' ? 'text-[#8c52ff] bg-[#8c52ff]/10' : 'text-gray-700'
            }`}
          >
            Date Desc
          </button>
          <button
            onClick={() => handleSortSelect('date-asc')}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer ${
              sortBy === 'date-asc' ? 'text-[#8c52ff] bg-[#8c52ff]/10' : 'text-gray-700'
            }`}
          >
            Date Asc
          </button>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
