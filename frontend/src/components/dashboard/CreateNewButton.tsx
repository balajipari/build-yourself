import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsStars } from 'react-icons/bs';
import { IoCarSportOutline } from 'react-icons/io5';
import { RiEBikeLine } from 'react-icons/ri';

const CreateNewButton: React.FC = () => {
  const [openCreateDropdown, setOpenCreateDropdown] = useState(false);
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

  const handleCreateSelect = (type: string) => {
    setOpenCreateDropdown(false);
    navigate('/builder', { state: { type } });
  };

  return (
    <div className="relative" ref={createDropdownRef}>
      <button
        onClick={() => setOpenCreateDropdown(!openCreateDropdown)}
        className="flex items-center gap-2 bg-gradient-to-r from-[#8c52ff] to-[#a855f7] text-white px-3 py-2.5 rounded-full hover:from-[#8c52ff]/90 hover:to-[#a855f7]/90 transition-all duration-200 font-medium shadow-lg cursor-pointer"
      >
        <BsStars className="w-5 h-5" />
        <span className="font-semibold">Let's Build</span>
      </button>

      {openCreateDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-32 z-10">
          <button
            onClick={() => handleCreateSelect('bike')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center gap-2"
          >
            <RiEBikeLine className="w-5 h-5 text-[#8c52ff]" />
            <span className="font-medium">Bike</span>
          </button>
          <button
            onClick={() => handleCreateSelect('car')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center gap-2"
          >
            <IoCarSportOutline className="w-5 h-5 text-[#8c52ff]" />
            <span className="font-medium">Car</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateNewButton;
