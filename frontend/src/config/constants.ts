// Application-wide constants
export const APP_CONFIG = {
  TITLE: 'Dream Bike Builder',
  DESCRIPTION: 'Design your perfect motorcycle, one choice at a time',
  DEFAULT_TOTAL_STEPS: 15,
  MAX_CUSTOM_INPUT_LENGTH: 500,
} as const;

export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8000/bike',
  CHAT: '/chat/complete',
  IMAGE_GENERATE: '/image/generate',
  IMAGE_DOWNLOAD: '/image/download',
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
