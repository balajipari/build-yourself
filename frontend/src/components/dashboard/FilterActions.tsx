import React, { useState, useRef, useEffect } from 'react';
import { FaRegHeart } from 'react-icons/fa';
import { BiFilterAlt } from "react-icons/bi";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import CreateNewButton from './CreateNewButton';

interface FilterActionsProps {
  selectedCategory: string;
  sortBy: string;
  showFavorites: boolean;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onFavoritesToggle: () => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({
  selectedCategory,
  sortBy,
  showFavorites,
  onCategoryChange,
  onSortChange,
  onFavoritesToggle,
}) => {
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setOpenCategoryDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setOpenSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setOpenCategoryDropdown(false);
  };

  const handleSortSelect = (sort: string) => {
    onSortChange(sort);
    setOpenSortDropdown(false);
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
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-10 pr-4 py-2 border-b border-gray-300 focus:outline-none focus:border-[#8c52ff] bg-transparent"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Dropdown */}
        <div className="relative" ref={categoryDropdownRef}>
          <button 
            onClick={() => setOpenCategoryDropdown(!openCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
          >
            <span>{selectedCategory === 'all' ? 'All Categories' : selectedCategory === 'bikes' ? 'Bikes' : 'Cars'}</span>
            <BiFilterAlt height={35} width={35} />
          </button>
          
          {/* Category Dropdown Menu */}
          {openCategoryDropdown && (
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

        {/* Sort Dropdown */}
        <div className="relative" ref={sortDropdownRef}>
          <button 
            onClick={() => setOpenSortDropdown(!openSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
          >
            <span>{getSortDisplayText(sortBy)}</span>
            <HiOutlineArrowsUpDown height={35} width={35} />
          </button>
          
          {/* Sort Dropdown Menu */}
          {openSortDropdown && (
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
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Favorites Toggle */}
        <button
          onClick={onFavoritesToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
            showFavorites 
              ? 'bg-[#8c52ff] text-white' 
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <FaRegHeart className="w-4 h-4" />
          {showFavorites ? 'Show All' : 'Show Favorites'}
        </button>

        {/* Create New Button */}
        <CreateNewButton />
      </div>
    </div>
  );
};

export default FilterActions;
