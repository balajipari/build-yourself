import React, { memo } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import type { InProgressProject } from './types';
import DraftOptionsMenu from './DraftOptionsMenu';

interface DraftCardProps {
  project: InProgressProject;
  isOptionsOpen: boolean;
  onOptionsClick: (e: React.MouseEvent) => void;
  onProjectClick: () => void;
  onDelete: (projectId: string) => void;
  onOptionsClose: () => void;
}

const DraftCard = memo<DraftCardProps>(({
  project,
  isOptionsOpen,
  onOptionsClick,
  onProjectClick,
  onDelete,
  onOptionsClose,
}) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md border border-gray-200 p-3 md:p-4 min-w-[280px] md:min-w-0 w-full cursor-pointer hover:shadow-lg transition-shadow duration-200 snap-start"
      onClick={onProjectClick}
    >
      <div className="text-left h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">{project.lastUpdated}</span>
              <div className="relative">
                <button
                  onClick={onOptionsClick}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <FaEllipsisH className="w-3.5 h-3.5 text-gray-600" />
                </button>
                {isOptionsOpen && (
                  <DraftOptionsMenu
                    projectId={project.id}
                    onClose={onOptionsClose}
                    onDelete={onDelete}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-300" 
                style={{ width: `${project.progress}%`, backgroundColor: '#8c52ff' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

DraftCard.displayName = 'DraftCard';

export default DraftCard;
