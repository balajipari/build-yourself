import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * A custom hook for polling an API endpoint at regular intervals
 * @param callback The function to call at each interval
 * @param options Configuration options for polling
 * @returns Object containing the start and stop functions
 */
export const usePolling = (
  callback: () => Promise<void>,
  { 
    interval = 5000, // Default to 5 seconds
    enabled = true,
    onError
  }: UsePollingOptions = {}
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isPolling = useRef(false);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    isPolling.current = false;
  }, []);

  const poll = useCallback(async () => {
    if (!isPolling.current) return;

    try {
      await callback();
    } catch (error) {
      onError?.(error as Error);
    }

    // Schedule next poll if still polling
    if (isPolling.current) {
      timeoutRef.current = setTimeout(poll, interval);
    }
  }, [callback, interval, onError]);

  const start = useCallback(() => {
    if (isPolling.current) return;
    isPolling.current = true;
    poll();
  }, [poll]);

  // Start/stop polling based on enabled flag
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return { start, stop };
};
