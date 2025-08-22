import React, { useState, useEffect } from 'react';
import { CategorySelector } from '../projects/CategorySelector';
import { projectService } from '../../services/project';
import type { Project as ApiProject, ProjectCreateSimple } from '../../types/project';
import type { Project as DashboardProject, InProgressProject } from './types';
import FilterActions from './FilterActions';
import InProgressProjects from './InProgressProjects';
import AllProjects from './AllProjects';

const DashboardContent: React.FC = () => {
  // Existing state for filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // New state for projects and API integration
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

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
      setShowCategorySelector(false);
      // Refresh projects to show the new one
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async (projectId: number) => {
    try {
      await projectService.toggleFavorite(projectId.toString());
      // Refresh projects to show updated favorite status
      fetchProjects();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDownload = (projectId: number) => {
    // TODO: Implement download functionality
    console.log('Download project:', projectId);
  };

  const handleDelete = async (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId.toString());
        // Refresh projects after deletion
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  // Map API projects to dashboard project format
  const mapToDashboardProject = (apiProject: ApiProject): DashboardProject => ({
    id: parseInt(apiProject.id),
    name: apiProject.name,
    status: apiProject.status,
    progress: apiProject.status === 'completed' ? 100 : 
              apiProject.status === 'in_progress' ? 50 : 0,
    lastUpdated: apiProject.updated_at,
    image: apiProject.image_base64 ? `data:image/png;base64,${apiProject.image_base64}` : '',
    category: apiProject.project_type,
  });

  const mapToInProgressProject = (apiProject: ApiProject): InProgressProject => ({
    id: parseInt(apiProject.id),
    name: apiProject.name,
    status: apiProject.status,
    progress: apiProject.status === 'completed' ? 100 : 
              apiProject.status === 'in_progress' ? 50 : 0,
    lastUpdated: apiProject.updated_at,
    image: apiProject.image_base64 ? `data:image/png;base64,${apiProject.image_base64}` : '',
  });

  // Filter projects based on current state
  const filteredProjects = apiProjects
    .filter(project => {
      if (showFavorites && !favorites.includes(parseInt(project.id))) return false;
      if (selectedCategory !== 'all' && project.project_type !== selectedCategory) return false;
      return true;
    })
    .map(mapToDashboardProject);

  // Get in-progress projects (projects with status 'in_progress')
  const inProgressProjects = apiProjects
    .filter(project => project.status === 'in_progress')
    .map(mapToInProgressProject);

  return (
    <div className="px-8 py-8">
      {/* Header with Create Button */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Manage and organize your custom vehicle projects</p>
          </div>
          <button
            onClick={() => setShowCategorySelector(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <span>+</span>
            {isLoading ? 'Creating...' : 'Build New Project'}
          </button>
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

      {/* In Progress Projects */}
      <InProgressProjects projects={inProgressProjects} />

      {/* All Projects */}
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
                <p>Create your first project to get started!</p>
              </>
            ) : (
              <>
                <p className="mb-2">No projects match your current filters.</p>
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

      {/* Category Selector Modal */}
      {showCategorySelector && (
        <CategorySelector
          onSelectCategory={handleCreateProject}
          onCancel={() => setShowCategorySelector(false)}
        />
      )}
    </div>
  );
};

export default DashboardContent;
