import React, { useRef, useEffect } from 'react';
import UserAvatar from './UserAvatar';
import UserDropdown from './UserDropdown';
import type { User } from '../../types/auth';

interface ProfileSectionProps {
  user: User | null;
  isDropdownOpen: boolean;
  isLoggingOut: boolean;
  onToggleDropdown: () => void;
  onLogout: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  isDropdownOpen,
  isLoggingOut,
  onToggleDropdown,
  onLogout,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggleDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, onToggleDropdown]);

  return (
    <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
      <UserAvatar 
        user={user}
        isDropdownOpen={isDropdownOpen}
        onToggleDropdown={onToggleDropdown}
      />
      
      <UserDropdown 
        user={user}
        isOpen={isDropdownOpen}
        isLoggingOut={isLoggingOut}
        onLogout={onLogout}
      />
    </div>
  );
};

export default ProfileSection;
