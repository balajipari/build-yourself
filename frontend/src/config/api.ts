import { API_ENDPOINTS } from './constants';

// API configuration and URL builders
export const API_CONFIG = {
  BASE_URL: API_ENDPOINTS.BASE_URL,
  TIMEOUT: 0, // No timeout - wait indefinitely
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const API_URLS = {
  CHAT: buildApiUrl(API_ENDPOINTS.CHAT),
  IMAGE_GENERATE: buildApiUrl(API_ENDPOINTS.IMAGE_GENERATE),
  IMAGE_DOWNLOAD: buildApiUrl(API_ENDPOINTS.IMAGE_DOWNLOAD),
} as const;
