// Application-wide constants
export const APP_CONFIG = {
  TITLE: 'Dream Bike Builder',
  DESCRIPTION: 'Design your perfect motorcycle, one choice at a time',
  DEFAULT_TOTAL_STEPS: 15,
  MAX_CUSTOM_INPUT_LENGTH: 500,
} as const;

export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:5000',
  CHAT: '/bike/chat/complete',
  IMAGE_GENERATE: '/bike/image/generate',
  IMAGE_DOWNLOAD: '/bike/image/download',
  VALIDATE_CUSTOM_MESSAGE: '/bike/validate-custom-message',
  AUTH: {
    GOOGLE_URL: '/auth/google/url',
    CALLBACK: '/auth/callback',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  PROJECTS: {
    CREATE: '/projects/',
    LIST: '/projects/',
    GET: '/projects/{id}',
    UPDATE: '/projects/{id}',
    UPDATE_IMAGE: '/projects/{id}/image',
    UPDATE_CONVERSATION: '/projects/{id}/conversation',
    DELETE: '/projects/{id}',
    FAVORITE: '/projects/{id}/favorite',
    CATEGORIES: '/projects/categories/list',
    STATS: '/projects/stats/summary',
  },
  FEEDBACK: {
    SUBMIT: '/feedback/submit',
  },
} as const;

export const DEFAULT_IMAGES = {
  BIKE_GRAFFITI: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzQ3NTU2OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk15IERyZWFtIEJpa2U8L3RleHQ+PC9zdmc+',
} as const;

export const FRONTEND_URLS = {
  BASE_URL: 'http://localhost:5173',
  DASHBOARD: 'http://localhost:5173/dashboard',
  SIGNIN: 'http://localhost:5173/signin',
  CALLBACK: 'http://localhost:5173/auth/callback',
} as const;

export const STORAGE_KEYS = {
  SESSION_ID: 'session_id',
} as const;

export const MESSAGES = {
  LOADING: {
    THINKING: 'Thinking...',
    GENERATING: 'Generating your custom bike...',
  },
  ERROR: {
    BACKEND: 'Error contacting backend',
    IMAGE_GENERATION: 'Error generating image',
  },
  SUCCESS: {
    BIKE_READY: 'Your Custom Bike is Ready!',
    BIKE_DESCRIPTION: "Here's your dream motorcycle, designed just for you",
  },
} as const;
