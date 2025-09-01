import React, { useRef, useEffect, useState } from 'react';
import UserAvatar from './UserAvatar';
import UserDropdown from './UserDropdown';
import { RechargeModal } from './RechargeModal';
import { paymentService } from '../../services/payment';
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
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
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
    <div className="flex items-center space-x-3 relative z-40" ref={dropdownRef}>
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
        onRechargeClick={() => setIsRechargeModalOpen(true)}
      />

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onRecharge={async (amount) => {
          try {
            if (!user) return;
            await paymentService.initializePayment(user.email, user.name, amount);
            setIsRechargeModalOpen(false);
          } catch (error) {
            console.error('Payment initialization failed:', error);
          }
        }}
      />
    </div>
  );
};

export default ProfileSection;
