import React, { useState } from 'react';
import AllProjects from './AllProjects';
import FilterActions from './FilterActions';
import InProgressProjects from './InProgressProjects';
import { mockAllProjects, mockInProgressProjects } from './mockData';

const DashboardContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredProjects = mockAllProjects.filter(project => {
    if (selectedCategory !== 'all' && project.category !== selectedCategory) return false;
    if (showFavorites) return favorites.includes(project.id);
    return true;
  });

  const toggleFavorite = (projectId: number) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleDownload = (projectId: number) => {
    console.log(`Downloading project ${projectId}`);
  };

  const handleDelete = (projectId: number) => {
    console.log(`Deleting project ${projectId}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleFavoritesToggle = () => {
    setShowFavorites(!showFavorites);
  };

  return (
    <div className="px-8 py-8">
      <FilterActions
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        showFavorites={showFavorites}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onFavoritesToggle={handleFavoritesToggle}
      />

      <InProgressProjects projects={mockInProgressProjects} />

      <AllProjects
        projects={filteredProjects}
        favorites={favorites}
        onFavoriteToggle={toggleFavorite}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DashboardContent;
