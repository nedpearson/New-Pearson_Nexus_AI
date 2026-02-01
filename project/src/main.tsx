/* PNX_OFFLINE_GUARD_CHMLN */
const w = window as any;
w.chmln = w.chmln ?? { get: () => null, identify: () => {}, track: () => {}, set: () => {}, alias: () => {} };

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { installInjectedScriptBlocker } from './utils/blockInjectedScripts';
import { getSyncManager } from './lib/syncManager';

installInjectedScriptBlocker();

(window as any).chmln = undefined;
(window as any).Chameleon = undefined;
(window as any).messo = undefined;

window.addEventListener('error', (event: ErrorEvent) => {
  const message = event.message || '';
  if (message.includes('chmln') || message.includes('Chameleon') || message.includes('messo')) {
    console.log('[Defensive Guard] Suppressed third-party widget error:', message);
    event.preventDefault();
    return true;
  }
}, true);

const originalFetch = window.fetch;
window.fetch = function(...args: any[]) {
  try {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof URL ? args[0].href : (args[0] as Request)?.url || '');

    if (url.includes('chmln') || url.includes('chameleon') || url.includes('trychameleon') || url.includes('/~/messo/')) {
      console.log('[Defensive Guard] Blocked third-party fetch request:', url);
      return Promise.reject(new Error('Third-party widget requests are blocked'));
    }

    if (import.meta.env.DEV) {
      const isLocalOrVite =
        url.startsWith('/') ||
        url.startsWith(window.location.origin) ||
        url.includes('/@vite') ||
        url.includes('/node_modules') ||
        url.includes('/src/') ||
        url.includes('localhost') ||
        url.includes('127.0.0.1') ||
        url.includes('webcontainer');

      if (!isLocalOrVite && (url.includes('supabase') || url.includes('/auth/v1'))) {
        const error = new Error(
          `🚫 BLOCKED: Supabase network request detected!\n` +
          `URL: ${url}\n` +
          `This app is configured to run offline with localStorage only.\n` +
          `If you need Supabase integration, it must be explicitly re-enabled.`
        );
        console.error(error);
        return Promise.reject(error);
      }
    }

    return originalFetch.apply(this, args as [RequestInfo | URL, RequestInit?]);
  } catch (error) {
    console.error('[Defensive Guard] Fetch wrapper error:', error);
    return originalFetch.apply(this, args as [RequestInfo | URL, RequestInit?]);
  }
};

const originalXhrOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
  try {
    const urlStr = url?.toString?.() || String(url);

    if (urlStr.includes('chmln') || urlStr.includes('chameleon') || urlStr.includes('trychameleon') || urlStr.includes('/~/messo/')) {
      console.log('[Defensive Guard] Blocked third-party XHR request:', urlStr);
      throw new Error('Third-party widget requests are blocked');
    }

    return (originalXhrOpen as any).apply(this, [method, url, ...rest]);
  } catch (error) {
    const isBlockedError = error instanceof Error && error.message.includes('Third-party widget');
    if (isBlockedError) throw error;

    console.error('[Defensive Guard] XHR wrapper error:', error);
    return (originalXhrOpen as any).apply(this, [method, url, ...rest]);
  }
};

if (import.meta.env.DEV) {
  console.log('🛡️ Dev Guard Active: Allowing same-origin & Vite HMR, blocking external Supabase');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Initialize sync manager after service worker is ready
        getSyncManager();
        console.log('✅ Sync Manager initialized');
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
} else {
  // Initialize sync manager even without service worker
  getSyncManager();
  console.log('✅ Sync Manager initialized (no service worker)');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
