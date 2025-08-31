import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsStars } from 'react-icons/bs';
import { useVehicle } from '../../context/VehicleContext';
import { projectService } from '../../services/project';
import { paymentService } from '../../services/payment';
import { useAuth } from '../../context/AuthContext';
import { RechargeModal } from './RechargeModal';
import toast from 'react-hot-toast';

interface CreateNewButtonProps {
  onProjectCreated: () => void;
  freeProjectsRemaining: number;
}

const CreateNewButton: React.FC<CreateNewButtonProps> = ({
  onProjectCreated,
  freeProjectsRemaining,
}) => {
  const { user } = useAuth();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { vehicleType } = useVehicle();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateProject = async (type: 'from_scratch' | 'customize') => {
    try {
      setIsCreating(true);
      setIsOpen(false);

      // Create project first
      const project = await projectService.createProject({
        project_type: type,
        vehicle_type: vehicleType
      });

      // Navigate to builder with the new project ID
      navigate('/builder', { 
        state: { 
          type,
          projectId: project.id
        } 
      });
      
      onProjectCreated(); // Refresh project list
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const options = [
    {
      id: 'from-scratch',
      label: "From Scratch",
      credits: 1,
      onClick: () => handleCreateProject('from_scratch'),
      disabled: false,
      comingSoon: false
    },
    {
      id: 'customize',
      label: "Customize",
      credits: 2,
      onClick: () => handleCreateProject('customize'),
      disabled: true,
      comingSoon: true
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {freeProjectsRemaining > 0 ? (
        <div className="flex items-center gap-3">
          <div className="text-gray-500 font-medium text-center">
            You have: <span className="font-semibold bg-gray-200 text-green-600 rounded-full pl-2.5 pr-2 py-0.5">{freeProjectsRemaining}🪙</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isCreating}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8c52ff] to-[#a855f7] text-white px-3 py-2 rounded-lg hover:from-[#8c52ff]/90 hover:to-[#a855f7]/90 transition-all duration-200 font-medium shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BsStars className="w-5 h-5" />
            <span className="font-semibold">
              {isCreating ? 'Creating...' : "Let's Build"}
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsRechargeModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg cursor-pointer"
        >
          <BsStars className="w-5 h-5" />
          <span className="font-semibold">Recharge credits</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              disabled={option.disabled || vehicleType === 'car' || isCreating}
              className={`w-full pr-2 pl-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between ${
                option.disabled || vehicleType === 'car' || isCreating ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex text-sm items-center gap-1">
                <span className="font-medium">{option.label}</span>
                {option.comingSoon && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              <span className="font-medium text-xs bg-gray-200 rounded-full px-2 py-1">🪙{option.credits}</span>
            </button>
          ))}
        </div>
      )}

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onRecharge={async (packageId, currencyCode) => {
          try {
            if (!user) {
              toast.error('Please sign in to recharge credits');
              return;
            }

            const loadingToast = toast.loading('Initializing payment...');
            await paymentService.initializePayment(user.email, user.name, packageId, currencyCode);
            toast.dismiss(loadingToast);
          } catch (error) {
            toast.error('Failed to initialize payment. Please try again.');
            console.error('Payment initialization failed:', error);
          }
        }}
      />
    </div>
  );
};

export default CreateNewButton;