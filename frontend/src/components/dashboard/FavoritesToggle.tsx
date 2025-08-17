import React from 'react';
import { FaRegHeart } from 'react-icons/fa';

interface FavoritesToggleProps {
  showFavorites: boolean;
  onToggle: () => void;
}

const FavoritesToggle: React.FC<FavoritesToggleProps> = ({
  showFavorites,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer ${
        showFavorites 
          ? 'bg-[#8c52ff] text-white' 
          : 'text-gray-700 hover:text-gray-900'
      }`}
    >
      <FaRegHeart className="w-4 h-4" />
      {showFavorites ? 'Show All' : 'Show Favorites'}
    </button>
  );
};

export default FavoritesToggle;
