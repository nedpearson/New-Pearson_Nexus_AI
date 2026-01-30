import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pnx.uiMode';
type UiMode = 'simple' | 'advanced';

function getInitialMode(): UiMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'simple' || stored === 'advanced') {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to read UI mode from localStorage:', e);
  }
  return 'simple';
}

function persistMode(mode: UiMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (e) {
    console.warn('Failed to persist UI mode:', e);
  }
}

export function useUiMode() {
  const [mode, setModeState] = useState<UiMode>(getInitialMode);

  const setMode = (newMode: UiMode) => {
    setModeState(newMode);
    persistMode(newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'simple' ? 'advanced' : 'simple';
    setMode(newMode);
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'simple' || e.newValue === 'advanced')) {
        setModeState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { mode, setMode, toggleMode };
}

export function isAdvanced(mode: UiMode): boolean {
  return mode === 'advanced';
}
