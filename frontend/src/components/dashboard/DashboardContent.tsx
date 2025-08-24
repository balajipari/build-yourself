import React, { useState, useEffect } from 'react';
import CreateNewButton from './CreateNewButton';

import { projectService } from '../../services/project';
import type { Project as ApiProject, ProjectCreateSimple } from '../../types/project';
import type { Project as DashboardProject, InProgressProject } from './types';
import FilterActions from './FilterActions';
import DraftProjects from './DraftProjects';
import AllProjects from './AllProjects';

const DashboardContent: React.FC = () => {
  // Existing state for filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // New state for projects and API integration

  const [isLoading, setIsLoading] = useState(false);
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, sortBy, showFavorites]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await projectService.getProjects({
        search_key: '',
        category: selectedCategory === 'all' ? '' : selectedCategory,
        status: undefined,
        is_favorite: showFavorites ? true : undefined,
        sort_by: sortBy as any,
        sort_order: 'desc',
        page: 1,
        page_size: 50,
      });
      setApiProjects(response.items);
      
      // Extract favorite project IDs (assuming favorites are stored in a separate table)
      // For now, we'll use an empty array and handle favorites through the API
      setFavorites([]);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (category: string) => {
    try {
      setIsLoading(true);
      const projectData: ProjectCreateSimple = { project_type: category };
      await projectService.createProject(projectData);
      
      // Refresh projects to show the new one
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async (projectId: string) => {
    try {
      await projectService.toggleFavorite(projectId);
      // Refresh projects to show updated favorite status
      fetchProjects();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDownload = (projectId: string) => {
    // TODO: Implement download functionality
    console.log('Download project:', projectId);
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        // Refresh projects after deletion
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please not found');
      }
    }
  };

  // Map API projects to dashboard project format
  const mapToDashboardProject = (apiProject: ApiProject): DashboardProject => ({
    id: apiProject.id,
    name: apiProject.name,
    status: apiProject.status,
    progress: apiProject.status === 'COMPLETED' ? 100 : 
              apiProject.status === 'IN_PROGRESS' ? 50 : 0,
    lastUpdated: apiProject.updated_at,
    image: apiProject.image_base64 ? `data:image/png;base64,${apiProject.image_base64}` : '',
    category: apiProject.project_type,
  });

  const mapToInProgressProject = (apiProject: ApiProject): InProgressProject => ({
    id: apiProject.id,
    name: apiProject.name,
    status: apiProject.status,
    progress: apiProject.status === 'COMPLETED' ? 100 : 
              apiProject.status === 'IN_PROGRESS' ? 50 : 
              apiProject.status === 'DRAFT' ? 0 : 0,
    lastUpdated: apiProject.updated_at,
    image: apiProject.image_base64 ? `data:image/png;base64,${apiProject.image_base64}` : '',
  });

  // Filter projects based on current state (exclude draft projects)
  const filteredProjects = apiProjects
    .filter(project => {
      if (showFavorites && !favorites.includes(project.id)) return false;
      if (selectedCategory !== 'all' && project.project_type !== selectedCategory) return false;
      if (project.status === 'DRAFT') return false; // Exclude draft projects from main list
      return true;
    })
    .map(mapToDashboardProject);

  // Get draft projects (projects with status 'DRAFT')
  const draftProjects = apiProjects
    .filter(project => project.status === 'DRAFT')
    .map(mapToInProgressProject);

  return (
    <div className="px-8 py-8">
      {/* Header with Create Button */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-semibold text-gray-900">My Projects</p>
          </div>
          <CreateNewButton onProjectCreated={fetchProjects} />
        </div>
      </div>

      {/* Filter Actions */}
      <FilterActions
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        showFavorites={showFavorites}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onFavoritesToggle={() => setShowFavorites(!showFavorites)}
      />

      {/* Continue Working On */}
      <DraftProjects projects={draftProjects} />

      {/* Your Creations */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Loading projects...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            {apiProjects.length === 0 ? (
              <>
                <p className="mb-2">No projects found.</p>
              </>
            ) : (
              <>
                <p>Try adjusting your search criteria or create a new project.</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <AllProjects
          projects={filteredProjects}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}


    </div>
  );
};

export default DashboardContent;
