import React, { useEffect, useRef, useState } from 'react';
import { FaEllipsisH, FaHeart, FaRegHeart } from 'react-icons/fa';
import { RiDownloadLine } from "react-icons/ri";
import { TbTrash } from "react-icons/tb";
import OptimizedImage from '../common/OptimizedImage';
import type { Project } from './types';
import defaultBike from '../../assets/default-bike.png';

interface ProjectTileProps {
  project: Project;
  isFavorite: boolean;
  onFavoriteToggle: (projectId: string) => void;
  onDownload: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

const ProjectTile: React.FC<ProjectTileProps> = ({
  project,
  isFavorite,
  onFavoriteToggle,
  onDownload,
  onDelete,
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
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
    <article className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 w-full">
      {/* Project Image with Heart Icon */}
      <div className="relative aspect-[4/3] md:aspect-[16/9] lg:aspect-square bg-gray-100">
        <OptimizedImage 
          src={!project.image || imageError ? defaultBike : project.image} 
          alt={`Custom motorcycle design: ${project.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
          width={400}
          height={400}
          onError={() => setImageError(true)}
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
      <div className="p-2 md:p-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-gray-900 truncate flex-1 text-sm md:text-base">
            <span className="sr-only">Project name: </span>
            {project.name}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap px-3">
            {project.lastUpdated}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProjectTile;
