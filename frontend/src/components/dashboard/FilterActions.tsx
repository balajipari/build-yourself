import React from 'react';
import SearchBar from './SearchBar';

import SortDropdown from './SortDropdown';
import FavoritesToggle from './FavoritesToggle';
import CreateNewButton from './CreateNewButton';
import FilterMenu from './FilterMenu';
import { useAuth } from '../../context/AuthContext';

interface FilterActionsProps {
  sortBy: string;
  showFavorites: boolean;
  onSortChange: (sort: string) => void;
  onFavoritesToggle: () => void;
  onProjectCreated: () => void;
  onSearch: (searchTerm: string) => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({
  sortBy,
  showFavorites,
  onSortChange,
  onFavoritesToggle,
  onProjectCreated,
  onSearch,
}) => {
  const { user } = useAuth();
  const freeProjectsRemaining = user?.project_quota?.free_projects_remaining ?? 0;
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mt-4 mb-8">
      <div className="flex flex-row gap-2 max-[425px]:gap-1 items-center w-full sm:w-auto">
        <div className="flex-1 max-[425px]:max-w-[180px]">
          <SearchBar onSearch={onSearch} />
        </div>
        
        {/* Grouped Filters (All Resolutions) */}
        <div className="flex-none">
          <FilterMenu
            sortBy={sortBy}
            showFavorites={showFavorites}
            onSortChange={onSortChange}
            onFavoritesToggle={onFavoritesToggle}
          />
        </div>

        {/* Expanded Filters (Hidden) */}
        <div className="hidden items-center space-x-4">
          <SortDropdown 
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
          <FavoritesToggle 
            showFavorites={showFavorites}
            onToggle={onFavoritesToggle}
          />
        </div>
      </div>

      <div className="flex items-center">
        <CreateNewButton 
          onProjectCreated={onProjectCreated} 
          freeProjectsRemaining={freeProjectsRemaining}
        />
      </div>
    </div>
  );
};

export default FilterActions;
