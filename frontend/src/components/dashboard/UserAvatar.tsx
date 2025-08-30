import React from 'react';
import type { User } from '../../types/auth';

interface UserAvatarProps {
  user: User | null;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  isDropdownOpen,
  onToggleDropdown,
}) => {
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className="mr-1 w-12 h-12 bg-orange-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-500 transition-colors duration-200"
      onClick={onToggleDropdown}
    >
      <span className="text-white text-lg font-semibold">{getUserInitials()}</span>
    </div>
  );
};

export default UserAvatar;
