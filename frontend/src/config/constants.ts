// Application-wide constants
export const APP_CONFIG = {
  TITLE: 'Dream Bike Builder',
  DESCRIPTION: 'Design your perfect motorcycle, one choice at a time',
  DEFAULT_TOTAL_STEPS: 15,
  MAX_CUSTOM_INPUT_LENGTH: 500,
} as const;

export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL,
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

export const FRONTEND_URLS = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL,
  DASHBOARD: `${import.meta.env.VITE_FRONTEND_URL}/dashboard`,
  SIGNIN: `${import.meta.env.VITE_FRONTEND_URL}/signin`,
  CALLBACK: `${import.meta.env.VITE_FRONTEND_URL}/auth/callback`,
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

export const TIMING_CONFIG = {
  POLLING: {
    DASHBOARD: 10000, // 10 seconds for dashboard project updates
    FAST: 5000,      // 5 seconds for time-sensitive updates
    SLOW: 30000,     // 30 seconds for less critical updates
  },
  DEBOUNCE: {
    DEFAULT: 300,    // Default debounce time for inputs
    SEARCH: 500,     // Debounce time for search inputs
  },
  THROTTLE: {
    DEFAULT: 1000,   // Default throttle time
  },
} as const;