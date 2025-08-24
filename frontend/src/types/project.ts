export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  project_type: string;
  status: ProjectStatus;
  configuration?: Record<string, any>;
  image_base64?: string;
  conversation_history?: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface ProjectCreateSimple {
  /** Simplified project creation - only requires project type */
  project_type: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  configuration?: Record<string, any>;
  image_base64?: string;
  conversation_history?: ConversationMessage[];
}

export interface ProjectSearchParams {
  search_key?: string;
  category?: string;
  status?: ProjectStatus;
  is_favorite?: boolean;
  sort_by: 'created_at' | 'name' | 'updated_at' | 'status';
  sort_order: 'asc' | 'desc';
  page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FavoriteToggle {
  project_id: string;
}

export interface FavoriteResponse {
  project_id: string;
  is_favorite: boolean;
  created_at: string;
}

export interface ProjectStats {
  total_projects: number;
  total_favorites: number;
  by_status: Record<string, number>;
}

export interface ProjectCategories {
  categories: string[];
}

export interface ProjectSearch {
  /** Simplified project data for search results */
  id: string;
  name: string;
  description?: string;
  project_type: string;
  status: ProjectStatus;
  image_base64?: string;
  completion_timestamp?: string;
  progress?: number;
}
