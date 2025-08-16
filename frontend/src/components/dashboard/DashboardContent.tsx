import React, { useState } from 'react';
import FilterActions from './FilterActions';
import InProgressProjects from './InProgressProjects';
import AllProjects from './AllProjects';
import type { Project, InProgressProject } from './types';

const DashboardContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const inProgressProjects: InProgressProject[] = [
    { id: 1, name: 'Sport Cruiser 2024', status: 'In Progress', progress: 75, lastUpdated: '2 hours ago', image: '/assets/bike-placeholder.svg' },
    { id: 2, name: 'Adventure Tourer', status: 'In Progress', progress: 45, lastUpdated: '3 days ago', image: '/assets/bike-placeholder.svg' },
  ];

  const allProjects: Project[] = [
    { id: 1, name: 'Sport Cruiser 2024', status: 'In Progress', progress: 75, lastUpdated: '2 hours ago', image: '/assets/bike-placeholder.svg', category: 'bikes' },
    { id: 2, name: 'Classic Chopper', status: 'Completed', progress: 100, lastUpdated: '1 day ago', image: '/assets/bike-placeholder.svg', category: 'bikes' },
    { id: 3, name: 'Adventure Tourer', status: 'In Progress', progress: 45, lastUpdated: '3 days ago', image: '/assets/bike-placeholder.svg', category: 'bikes' },
    { id: 4, name: 'Electric Commuter', status: 'Completed', progress: 100, lastUpdated: '1 week ago', image: '/assets/car-placeholder.svg', category: 'cars' },
    { id: 5, name: 'Off-road Explorer', status: 'Planning', progress: 20, lastUpdated: '2 weeks ago', image: '/assets/bike-placeholder.svg', category: 'bikes' },
    { id: 6, name: 'Urban Cruiser', status: 'Completed', progress: 100, lastUpdated: '3 weeks ago', image: '/assets/car-placeholder.svg', category: 'cars' },
  ];

  const filteredProjects = allProjects.filter(project => {
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
      {/* Filter Actions */}
      <FilterActions
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        showFavorites={showFavorites}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onFavoritesToggle={handleFavoritesToggle}
      />

      {/* In Progress Projects Section */}
      <InProgressProjects projects={inProgressProjects} />

      {/* All Projects Gallery */}
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
