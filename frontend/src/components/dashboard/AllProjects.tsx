import React from 'react';
import ProjectTile from './ProjectTile';
import type { Project } from './types';

interface AllProjectsProps {
  projects: Project[];
  favorites: number[];
  onFavoriteToggle: (projectId: number) => void;
  onDownload: (projectId: number) => void;
  onDelete: (projectId: number) => void;
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
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-start">
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
