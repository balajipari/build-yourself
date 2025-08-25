import React from 'react';
import ProjectTile from './ProjectTile';
import type { Project } from './types';

interface AllProjectsProps {
  projects: Project[];
  favorites: string[];
  onFavoriteToggle: (projectId: string) => void;
  onDownload: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

const AllProjects: React.FC<AllProjectsProps> = ({
  projects,
  favorites,
  onFavoriteToggle,
  onDownload,
  onDelete,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Creations</h2>
      <div className="flex flex-wrap gap-15 justify-items-start">
        {projects.map((project) => (
          <ProjectTile
            key={project.id}
            project={project}
            isFavorite={favorites.includes(project.id)}
            onFavoriteToggle={onFavoriteToggle}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default AllProjects;
