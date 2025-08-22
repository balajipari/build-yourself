import type { Project, InProgressProject } from './types';

export const mockDraftProjects: InProgressProject[] = [
  { 
    id: 1, 
    name: 'Sport Cruiser 2024', 
    status: 'In Progress', 
    progress: 75, 
    lastUpdated: '2 hours ago', 
    image: '/assets/bike-placeholder.svg' 
  },
  { 
    id: 2, 
    name: 'Adventure Tourer', 
    status: 'In Progress', 
    progress: 45, 
    lastUpdated: '3 days ago', 
    image: '/assets/bike-placeholder.svg' 
  },
];

export const mockAllProjects: Project[] = [
  { 
    id: 1, 
    name: 'Sport Cruiser 2024', 
    status: 'In Progress', 
    progress: 75, 
    lastUpdated: '1 day ago', 
    image: '/assets/bike-placeholder.svg', 
    category: 'bikes' 
  },
  { 
    id: 2, 
    name: 'Classic Chopper', 
    status: 'Completed', 
    progress: 100, 
    lastUpdated: '1 day ago', 
    image: '/assets/bike-placeholder.svg', 
    category: 'bikes' 
  },
  { 
    id: 3, 
    name: 'Adventure Tourer', 
    status: 'In Progress', 
    progress: 45, 
    lastUpdated: '3 days ago', 
    image: '/assets/bike-placeholder.svg', 
    category: 'bikes' 
  },
  { 
    id: 4, 
    name: 'Electric Commuter', 
    status: 'Completed', 
    progress: 100, 
    lastUpdated: '1 week ago', 
    image: '/assets/car-placeholder.svg', 
    category: 'cars' 
  },
  { 
    id: 5, 
    name: 'Off-road Explorer', 
    status: 'Planning', 
    progress: 20, 
    lastUpdated: '2 weeks ago', 
    image: '/assets/bike-placeholder.svg', 
    category: 'bikes' 
  },
  { 
    id: 6, 
    name: 'Urban Cruiser', 
    status: 'Completed', 
    progress: 100, 
    lastUpdated: '3 weeks ago', 
    image: '/assets/car-placeholder.svg', 
    category: 'cars' 
  },
];
