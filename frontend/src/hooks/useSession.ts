import { useState, useEffect, useCallback } from 'react';
import { getOrCreateSessionId, clearSession } from '../utils/session';

// Custom hook for session management
export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);

  const resetSession = useCallback(() => {
    clearSession();
  }, []);

  return {
    sessionId,
    resetSession,
  };
}
