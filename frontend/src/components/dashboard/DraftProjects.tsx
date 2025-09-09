import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InProgressProject } from './types';
import '../../styles/scrollbar.css';
import toast from 'react-hot-toast';
import { projectService } from '../../services/project';
import DraftCard from './DraftCard';

interface DraftProjectsProps {
  projects: InProgressProject[];
}

const DraftProjects = memo<DraftProjectsProps>(({ projects }) => {
  const navigate = useNavigate();
  const [openOptionsId, setOpenOptionsId] = useState<string | null>(null);

  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/builder?projectId=${projectId}`);
  }, [navigate]);

  const handleOptionsClick = useCallback((e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setOpenOptionsId(openOptionsId === projectId ? null : projectId);
  }, [openOptionsId]);

  const handleDeleteClick = useCallback(async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId, false, false); // Don't count in quota
      toast.success('Draft deleted successfully');
      window.location.reload(); // Refresh the page to update the list
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast.error('Failed to delete draft');
    }
  }, []);

  if (projects.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Working On</h2>
      <div className="relative">
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50" />
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbar">
          <div className="flex gap-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {projects.map((project) => (
              <DraftCard
                key={project.id}
                project={project}
                isOptionsOpen={openOptionsId === project.id}
                onOptionsClick={(e) => handleOptionsClick(e, project.id)}
                onProjectClick={() => handleProjectClick(project.id)}
                onDelete={handleDeleteClick}
                onOptionsClose={() => setOpenOptionsId(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

DraftProjects.displayName = 'DraftProjects';

export default DraftProjects;