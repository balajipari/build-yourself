import { STORAGE_KEYS } from '../config/constants';

// Session management utilities
export function getOrCreateSessionId(): string {
  let id = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
  }
  return id;
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
}

export function getSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
}

export function setSessionId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
}
