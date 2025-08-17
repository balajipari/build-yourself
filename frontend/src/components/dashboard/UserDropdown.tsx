import React from 'react';
import { RxExit } from 'react-icons/rx';
import type { User } from '../../types/auth';

interface UserDropdownProps {
  user: User | null;
  isOpen: boolean;
  isLoggingOut: boolean;
  onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  isOpen,
  isLoggingOut,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
      </div>
      
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RxExit className={`w-4 h-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
      </button>
    </div>
  );
};

export default UserDropdown;
