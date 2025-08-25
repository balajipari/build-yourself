import { API_CONFIG } from '../config/api';
import { API_ENDPOINTS } from '../config/constants';
import type { 
  Project, 
  ProjectSearch,
  ProjectCreateSimple,
  ProjectUpdate, 
  ProjectSearchParams, 
  PaginatedResponse,
  FavoriteResponse,
  ProjectStats,
  ProjectCategories
} from '../types/project';

class ProjectService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createProject(projectData: ProjectCreateSimple): Promise<Project> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.CREATE}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async getProjects(searchParams: ProjectSearchParams): Promise<PaginatedResponse<ProjectSearch>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (searchParams.search_key) queryParams.append('search_key', searchParams.search_key);
      if (searchParams.category) queryParams.append('category', searchParams.category);
      if (searchParams.status) queryParams.append('status', searchParams.status);
      if (searchParams.is_favorite !== undefined) queryParams.append('is_favorite', searchParams.is_favorite.toString());
      if (searchParams.sort_by) queryParams.append('sort_by', searchParams.sort_by);
      if (searchParams.sort_order) queryParams.append('sort_order', searchParams.sort_order);
      if (searchParams.page) queryParams.append('page', searchParams.page.toString());
      if (searchParams.page_size) queryParams.append('page_size', searchParams.page_size.toString());

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.LIST}?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(projectId: string): Promise<Project> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.GET.replace('{id}', projectId)}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, projectData: ProjectUpdate): Promise<Project> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.UPDATE.replace('{id}', projectId)}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(projectData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async updateProjectImage(projectId: string, imageBase64: string): Promise<Project> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.UPDATE_IMAGE.replace('{id}', projectId)}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ image_base64: imageBase64 }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update project image: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project image:', error);
      throw error;
    }
  }

  async updateConversationHistory(projectId: string, conversationHistory: any[]): Promise<Project> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.UPDATE_CONVERSATION.replace('{id}', projectId)}`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ conversation_history: conversationHistory }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update conversation history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating conversation history:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string, softDelete: boolean = true): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.DELETE.replace('{id}', projectId)}`,
        {
          method: 'DELETE',
          headers: {
            ...this.getAuthHeaders(),
            'X-Soft-Delete': softDelete.toString()
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async toggleFavorite(projectId: string): Promise<FavoriteResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.FAVORITE.replace('{id}', projectId)}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to toggle favorite: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  async downloadImage(projectId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.IMAGE_DOWNLOAD}/project/${projectId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Image not found. The project may have been deleted.');
        }
        if (response.status === 500) {
          throw new Error('Project image data is missing or corrupted.');
        }
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const data = await response.json();
      const base64Data = data.image_base64;
      
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bike-${projectId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async getProjectCategories(): Promise<ProjectCategories> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.CATEGORIES}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getProjectStats(): Promise<ProjectStats> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROJECTS.STATS}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch project stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  }

  async validateCustomMessage(message: string): Promise<{
    is_safe: boolean;
    suggestions: string[];
    explanation: string;
    risk_level: string;
  }> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.VALIDATE_CUSTOM_MESSAGE}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ message: message.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to validate custom message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
        // Fallback: return a safe default
        return {
            is_safe: true,
            suggestions: [],
            explanation: 'Validation service unavailable, proceeding with input',
            risk_level: 'unknown'
        };
    }
  }
}

export const projectService = new ProjectService();
