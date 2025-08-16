import React, { useState, useRef, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaEllipsisH } from 'react-icons/fa';
import { RiDownloadLine } from "react-icons/ri";
import { TbTrash } from "react-icons/tb";
import type { Project } from './types';

interface ProjectTileProps {
  project: Project;
  isFavorite: boolean;
  onFavoriteToggle: (projectId: number) => void;
  onDownload: (projectId: number) => void;
  onDelete: (projectId: number) => void;
}

const ProjectTile: React.FC<ProjectTileProps> = ({
  project,
  isFavorite,
  onFavoriteToggle,
  onDownload,
  onDelete,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDownload = () => {
    onDownload(project.id);
    setOpenDropdown(false);
  };

  const handleDelete = () => {
    onDelete(project.id);
    setOpenDropdown(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 max-w-xs w-full">
      {/* Project Image with Heart Icon */}
      <div className="relative h-40 bg-gray-100">
        <img 
          src={project.image} 
          alt={project.name}
          className="w-full h-full object-cover"
        />
        
        {/* Heart Icon - Top Left */}
        <button
          onClick={() => onFavoriteToggle(project.id)}
          className="absolute top-3 left-3 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 cursor-pointer"
        >
          {isFavorite ? (
            <FaHeart className="w-4 h-4 text-red-500" />
          ) : (
            <FaRegHeart className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Three Dots Menu - Top Right */}
        <div className="absolute top-3 right-3" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200 cursor-pointer"
          >
            <FaEllipsisH className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {openDropdown && (
            <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-10">
              <button
                onClick={handleDownload}
                className="w-full px-4 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <RiDownloadLine width={20} height={20} />
                Download
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-1.5 font-semibold text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <TbTrash width={20} height={20} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Project Info - Name and Time on same line */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate flex-1">{project.name}</h3>
          <span className="text-xs text-gray-500 ml-2">{project.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectTile;
