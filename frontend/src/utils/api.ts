import { API_CONFIG } from '../config/api';
import type { ApiError } from '../types/api';

// API utility functions with error handling and retry logic
export async function makeApiRequest<T = any>(
  url: string, 
  body: Record<string, unknown>,
  retryCount = 0
): Promise<T> {
  try {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Only set timeout if TIMEOUT > 0
    if (API_CONFIG.TIMEOUT > 0) {
      timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // Clear timeout if request completes successfully
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
      };
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return makeApiRequest(url, body, retryCount + 1);
    }

    throw error;
  }
}

export function createApiError(message: string, status: number, details?: any): ApiError {
  return {
    message,
    status,
    details,
  };
}
