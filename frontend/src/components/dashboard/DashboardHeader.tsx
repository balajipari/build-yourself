import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';
import ProfileSection from './ProfileSection';

const DashboardHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      setIsDropdownOpen(false);
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/signin');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <BrandLogo />
        
        <ProfileSection 
          user={user}
          isDropdownOpen={isDropdownOpen}
          isLoggingOut={isLoggingOut}
          onToggleDropdown={toggleDropdown}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
};

export default DashboardHeader;
