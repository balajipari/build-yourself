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
    const newId = getOrCreateSessionId();
    setSessionId(newId);
  }, []);

  return {
    sessionId,
    resetSession,
  };
}
