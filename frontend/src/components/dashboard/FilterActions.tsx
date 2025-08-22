import React from 'react';
import SearchBar from './SearchBar';
import CategoryDropdown from './CategoryDropdown';
import SortDropdown from './SortDropdown';
import FavoritesToggle from './FavoritesToggle';

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
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <SearchBar />
        <CategoryDropdown 
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
        <SortDropdown 
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>

      <div className="flex items-center space-x-4">
        <FavoritesToggle 
          showFavorites={showFavorites}
          onToggle={onFavoritesToggle}
        />
      </div>
    </div>
  );
};

export default FilterActions;
