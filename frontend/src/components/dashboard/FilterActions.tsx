import React from 'react';
import SearchBar from './SearchBar';
import CategoryDropdown from './CategoryDropdown';
import SortDropdown from './SortDropdown';
import FavoritesToggle from './FavoritesToggle';
import CreateNewButton from './CreateNewButton';

interface FilterActionsProps {
  selectedCategory: string;
  sortBy: string;
  showFavorites: boolean;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onFavoritesToggle: () => void;
  onProjectCreated: () => void;
  onSearch: (searchTerm: string) => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({
  selectedCategory,
  sortBy,
  showFavorites,
  onCategoryChange,
  onSortChange,
  onFavoritesToggle,
  onProjectCreated,
  onSearch,
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <SearchBar onSearch={onSearch} />
        <CategoryDropdown 
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
        <SortDropdown 
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
        <FavoritesToggle 
          showFavorites={showFavorites}
          onToggle={onFavoritesToggle}
        />
      </div>

      <div className="flex items-center space-x-4">
      <CreateNewButton onProjectCreated={onProjectCreated} />
      </div>
    </div>
  );
};

export default FilterActions;
