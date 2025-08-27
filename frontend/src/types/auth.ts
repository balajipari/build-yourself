export interface ProjectQuota {
  completed_projects_count: number;
  free_projects_remaining: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  is_gsuite: boolean;
  domain?: string;
  project_quota?: ProjectQuota;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_info: User;
  jwt_token: string;
}
