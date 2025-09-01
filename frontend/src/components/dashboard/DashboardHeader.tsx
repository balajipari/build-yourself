import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';
import ProfileSection from './ProfileSection';
import GlobalProjectSelect from '../common/GlobalProjectSelect';
import { useProject } from '../../context/ProjectContext';


const DashboardHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const { setProjectType } = useProject();
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
    <header className="relative bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 z-30">
      <div className="flex items-center justify-between py-3 px-4 lg:px-8 w-full xl:w-[80%] mx-auto">
        <BrandLogo />
        
        <div className="flex items-center gap-4">
          <GlobalProjectSelect onChange={(type) => setProjectType(type)} />
          <ProfileSection 
          user={user}
          isDropdownOpen={isDropdownOpen}
          isLoggingOut={isLoggingOut}
          onToggleDropdown={toggleDropdown}
          onLogout={handleLogout}
        />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
