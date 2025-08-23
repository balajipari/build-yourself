export interface Project {
  id: string;  // Changed from number to string (UUID)
  name: string;
  status: string;
  progress: number;
  lastUpdated: string;
  image: string;
  category: string;
}

export interface InProgressProject {
  id: string;  // Changed from number to string (UUID)
  name: string;
  status: string;
  progress: number;
  lastUpdated: string;
  image: string;
}
