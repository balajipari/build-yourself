export interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  lastUpdated: string;
  image: string;
  category: string;
}

export interface InProgressProject {
  id: number;
  name: string;
  status: string;
  progress: number;
  lastUpdated: string;
  image: string;
}
