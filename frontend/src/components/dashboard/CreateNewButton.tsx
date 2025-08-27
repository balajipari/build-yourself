import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsStars } from 'react-icons/bs';
import { IoCarSportOutline } from 'react-icons/io5';
import { RiEBikeLine } from 'react-icons/ri';
import { projectService } from '../../services/project';
import { paymentService } from '../../services/payment';
import { useAuth } from '../../context/AuthContext';
import { RechargeModal } from './RechargeModal';
import toast from 'react-hot-toast';
import type { ProjectCreateSimple } from '../../types/project';

interface CreateNewButtonProps {
  onProjectCreated?: () => void;
  freeProjectsRemaining: number;
}

const CreateNewButton: React.FC<CreateNewButtonProps> = ({ onProjectCreated, freeProjectsRemaining }) => {
  const { user } = useAuth();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [openCreateDropdown, setOpenCreateDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const createDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node)) {
        setOpenCreateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateSelect = async (type: string) => {
    try {
      setIsCreating(true);
      setOpenCreateDropdown(false);
      
      // Create project via API first
      const projectData: ProjectCreateSimple = { project_type: type };
      const newProject = await projectService.createProject(projectData);
      
      // Refresh the projects list
      if (onProjectCreated) {
        onProjectCreated();
      }
      
      // Navigate to builder with the created project ID
      navigate('/builder', { 
        state: { 
          type, 
          projectId: newProject.id 
        } 
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative" ref={createDropdownRef}>
      {freeProjectsRemaining > 0 ? (
        <div className="flex items-center gap-3">
          <div className="text-orange-500 font-medium">
            {freeProjectsRemaining} free projects left
          </div>
        <button
          onClick={() => setOpenCreateDropdown(!openCreateDropdown)}
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

      {openCreateDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-32 z-10">
          <button
            onClick={() => handleCreateSelect('bike')}
            disabled={isCreating}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RiEBikeLine className="w-5 h-5 text-[#8c52ff]" />
            <span className="font-medium">Bike</span>
          </button>
          <button
            onClick={() => handleCreateSelect('car')}
            disabled={isCreating}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoCarSportOutline className="w-5 h-5 text-[#8c52ff]" />
            <span className="font-medium">Car</span>
          </button>
        </div>
      )}
            <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => setIsRechargeModalOpen(false)}
          onRecharge={async (amount) => {
            try {
              if (!user) {
                toast.error('Please sign in to recharge credits');
                return;
              }
              
              const loadingToast = toast.loading('Initializing payment...');
              await paymentService.initializePayment(user.email, user.name, amount);
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
