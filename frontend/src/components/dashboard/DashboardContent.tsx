import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdSense from '../common/AdSense';
import { projectService } from '../../services/project';
import type { ProjectSearch } from '../../types/project';
import FilterActions from './FilterActions';
import DraftProjects from './DraftProjects';
import AllProjects from './AllProjects';
import { mapToDashboardProject, mapToInProgressProject } from '../../utils/projectMappers';
import toast from 'react-hot-toast';

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
      toast.error('Failed to update favorite status. The project may have been deleted or you may not have permission.');
    }
  }, [fetchProjects]);

  const handleDownload = useCallback(async (projectId: string) => {
    try {
      await projectService.downloadImage(projectId);
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image. Please try again.');
    }
  }, []);

  const handleDelete = useCallback(async (projectId: string) => {
    toast((t) => (
      <div className="flex items-center gap-4">
        <span>Are you sure you want to delete this project?</span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await projectService.deleteProject(projectId);
                toast.success('Project deleted successfully');
                // Refresh projects after deletion
                fetchProjects();
              } catch (error) {
                console.error('Failed to delete project:', error);
                toast.error('Failed to delete project. Project not found.');
              }
            }}
          >
            Delete
          </button>
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    })
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
      <div className="flex flex-col lg:flex-col xl:flex-row gap-4 mt-4 lg:mt-10 px-4 py-4 mx-auto w-full lg:w-[95%]">
        {/* Left Ad Banner - Extra Large Desktop */}
        <div className="hidden xl:block w-[160px]">
          <div className="sticky top-4 bg-gray-100 rounded-lg h-[600px] overflow-hidden">
            <AdSense
              adSlot="7678234258"
              style={{ display: 'block', height: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* Top Ad Banner - Large Desktop */}
        <div className="hidden lg:block xl:hidden h-[120px] w-full">
          <div className="bg-gray-100 rounded-lg h-full overflow-hidden">
            <AdSense
              adSlot="7678234258"
              style={{ display: 'block', height: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 px-2 lg:px-10">

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

      {/* Mobile Ad Banner - Between Sections */}
      <div className="lg:hidden w-full my-6">
        <div className="bg-gray-100 rounded-lg h-[120px] overflow-hidden">
          <AdSense
            adSlot="7678234258"
            style={{ display: 'block', height: '100%', width: '100%' }}
          />
        </div>
      </div>

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
          {/* Mobile Ad Banner - After Cards */}
          {!isLoading && filteredProjects.length > 0 && (
            <div className="lg:hidden w-full mt-8">
              <div className="bg-gray-100 rounded-lg h-[120px] overflow-hidden">
                <AdSense
                  adSlot="7678234258"
                  style={{ display: 'block', height: '100%', width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Ad Banner - Extra Large Desktop */}
        <div className="hidden xl:block w-[160px]">
          <div className="sticky top-4 bg-gray-100 rounded-lg h-[600px] overflow-hidden">
            <AdSense
              adSlot="7678234258"
              style={{ display: 'block', height: '100%', width: '100%' }}
            />
          </div>
        </div>

        {/* Bottom Ad Banner - Large Desktop */}
        <div className="hidden lg:block xl:hidden h-[120px] w-full">
          <div className="bg-gray-100 rounded-lg h-full overflow-hidden">
            <AdSense
              adSlot="7678234258"
              style={{ display: 'block', height: '100%', width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
