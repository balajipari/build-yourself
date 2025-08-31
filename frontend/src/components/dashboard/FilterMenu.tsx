import React, { useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import SortDropdown from './SortDropdown';
import FavoritesToggle from './FavoritesToggle';

interface FilterMenuProps {
  sortBy: string;
  showFavorites: boolean;
  onSortChange: (sort: string) => void;
  onFavoritesToggle: () => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  sortBy,
  showFavorites,
  onSortChange,
  onFavoritesToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
      >
        <FaFilter className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200/50 p-5 z-20">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2.5 block">Sort By</label>
                <SortDropdown
                  sortBy={sortBy}
                  onSortChange={(sort) => {
                    onSortChange(sort);
                    setIsOpen(false);
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2.5 block">Show Only</label>
                <FavoritesToggle
                  showFavorites={showFavorites}
                  onToggle={() => {
                    onFavoritesToggle();
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterMenu;