import type { ProjectSearch } from '../types/project';
import type { Project as DashboardProject, InProgressProject } from '../components/dashboard/types';
import { formatReadableTime } from './time';

export const mapToDashboardProject = (apiProject: ProjectSearch): DashboardProject => ({
  id: apiProject.id,
  name: apiProject.name,
  status: apiProject.status,
  progress: apiProject.status === 'COMPLETED' ? 100 : 
            apiProject.status === 'IN_PROGRESS' ? 50 : 0,
  lastUpdated: apiProject.completion_timestamp ? formatReadableTime(apiProject.completion_timestamp) : 'recently',
  image: apiProject.image_base64 ? `data:image/png;base64,${apiProject.image_base64}` : '',
  category: apiProject.project_type,
});

export const mapToInProgressProject = (apiProject: ProjectSearch): InProgressProject => ({
  id: apiProject.id,
  name: apiProject.name,
  status: apiProject.status,
  progress: apiProject.progress || 0,
  lastUpdated: apiProject.completion_timestamp ? formatReadableTime(apiProject.completion_timestamp) : 'recently',
  image: apiProject.image_base64 ? `data:image/png;base64,${apiProject.image_base64}` : '',
});
