import { APP_CONFIG } from '../config/constants';

// Validation utility functions
export function validateCustomInput(input: string): { isValid: boolean; error?: string } {
  if (!input.trim()) {
    return { isValid: false, error: 'Input cannot be empty' };
  }

  if (input.length > APP_CONFIG.MAX_CUSTOM_INPUT_LENGTH) {
    return { 
      isValid: false, 
      error: `Input must be ${APP_CONFIG.MAX_CUSTOM_INPUT_LENGTH} characters or less` 
    };
  }

  return { isValid: true };
}

export function validateSessionId(sessionId: string): boolean {
  return typeof sessionId === 'string' && sessionId.length > 0;
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}
