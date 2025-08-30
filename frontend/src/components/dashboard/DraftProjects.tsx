import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { InProgressProject } from './types';
import '../../styles/scrollbar.css';

interface DraftProjectsProps {
  projects: InProgressProject[];
}

const DraftProjects: React.FC<DraftProjectsProps> = ({ projects }) => {
  const navigate = useNavigate();

  if (projects.length === 0) return null;

  const handleProjectClick = (projectId: string) => {
    navigate(`/builder?projectId=${projectId}`);
  };

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Working On</h2>
      <div className="relative">
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbar">
          <div className="flex gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white rounded-xl shadow-md border border-gray-200 p-3 md:p-4 min-w-[280px] md:min-w-0 w-full cursor-pointer hover:shadow-lg transition-shadow duration-200 snap-start"
            onClick={() => handleProjectClick(project.id)}
          >
            {/* Project Name and Progress Only */}
            <div className="text-left h-full flex flex-col justify-between">
              <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">{project.lastUpdated}</span>
              </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text text-gray-600 mb-2">
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
              
              {/* Last Updated Time */}
              
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftProjects;
