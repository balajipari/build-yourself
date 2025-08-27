import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { projectService } from '../../services/project';
import type { ProjectSearch } from '../../types/project';
import FilterActions from './FilterActions';
import DraftProjects from './DraftProjects';
import AllProjects from './AllProjects';
import { mapToDashboardProject, mapToInProgressProject } from '../../utils/projectMappers';

const DashboardContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiProjects, setApiProjects] = useState<ProjectSearch[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, sortBy, showFavorites, searchTerm]);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sortField, sortDirection] = sortBy.split('-');
      const sortByField = sortField === 'date' ? 'created_at' : 'name';
      const sortOrder = sortDirection as 'asc' | 'desc';
      
      const response = await projectService.getProjects({
        search_key: searchTerm,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        status: undefined,
        is_favorite: showFavorites ? true : undefined,
        sort_by: sortByField,
        sort_order: sortOrder,
        page: 1,
        page_size: 50,
      });
      setApiProjects(response.items);
      
      // Set favorites based on the is_favorite flag from the API response
      const favoriteIds = response.items
        .filter(project => project.is_favorite)
        .map(project => project.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, searchTerm, selectedCategory, showFavorites]);


  const handleFavoriteToggle = useCallback(async (projectId: string) => {
    try {
      const response = await projectService.toggleFavorite(projectId);
      // Update favorites state locally
      setFavorites(prevFavorites => {
        if (response.is_favorite) {
          return [...prevFavorites, projectId];
        } else {
          return prevFavorites.filter(id => id !== projectId);
        }
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Refresh projects to ensure we have the latest state
      fetchProjects();
      alert('Failed to update favorite status. The project may have been deleted or you may not have permission.');
    }
  }, [fetchProjects]);

  const handleDownload = useCallback(async (projectId: string) => {
    try {
      await projectService.downloadImage(projectId);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try again.');
    }
  }, []);

  const handleDelete = useCallback(async (projectId: string) => {
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
  }, [fetchProjects]);

  // Filter and transform projects
  const { filteredProjects, draftProjects } = useMemo(() => {
    const filtered = apiProjects
      .filter(project => {
        if (showFavorites && !favorites.includes(project.id)) return false;
        if (selectedCategory !== 'all' && project.project_type !== selectedCategory) return false;
        if (project.status === 'DRAFT') return false;
        return true;
      })
      .map(mapToDashboardProject);

    const drafts = apiProjects
      .filter(project => project.status === 'DRAFT')
      .map(mapToInProgressProject);

    return { filteredProjects: filtered, draftProjects: drafts };
  }, [apiProjects, showFavorites, favorites, selectedCategory]);

  return (
    <div className="relative min-h-screen">
    <div className="mt-10 px-8 py-8 w-[80%] mx-auto">

      {/* Filter Actions */}
      <FilterActions
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        showFavorites={showFavorites}
        onCategoryChange={setSelectedCategory}
        onSortChange={setSortBy}
        onFavoritesToggle={() => setShowFavorites(!showFavorites)}
        onProjectCreated={fetchProjects}
        onSearch={setSearchTerm}
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
    </div>
  );
};

export default DashboardContent;
