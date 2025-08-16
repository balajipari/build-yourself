import React from 'react';
import type { InProgressProject } from './types';

interface InProgressProjectsProps {
  projects: InProgressProject[];
}

const InProgressProjects: React.FC<InProgressProjectsProps> = ({ projects }) => {
  if (projects.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">In Progress Projects</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-start">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 max-w-xs w-full">
            {/* Project Name and Progress Only */}
            <div className="text-left">
              <h3 className="font-medium text-gray-900 mb-3 truncate">{project.name}</h3>
              
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${project.progress}%`, backgroundColor: '#8c52ff' }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InProgressProjects;
