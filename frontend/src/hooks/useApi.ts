import { useState, useCallback } from 'react';
import { makeApiRequest } from '../utils/api';
import { API_URLS } from '../config/api';
import type { ChatApiRequest, ChatApiResponse, ImageApiRequest, ImageApiResponse } from '../types/api';

// Custom hook for API operations
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const chatComplete = useCallback(async (request: ChatApiRequest): Promise<ChatApiResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeApiRequest<ChatApiResponse>(API_URLS.CHAT, request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateImage = useCallback(async (request: ImageApiRequest): Promise<ImageApiResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeApiRequest<ImageApiResponse>(API_URLS.IMAGE_GENERATE, request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    chatComplete,
    generateImage,
  };
}
