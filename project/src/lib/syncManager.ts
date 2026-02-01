/**
 * SyncManager - Handles automatic data synchronization
 * - Auto-sync every 12 hours
 * - Manual sync on demand
 * - Background sync when connection restored
 * - Works with service worker
 */

const SYNC_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const SYNC_STATUS_KEY = 'pnx_last_sync';

export class SyncManager {
  private syncTimer: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.init();
  }

  /**
   * Initialize sync manager
   */
  private init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[SyncManager] Connection restored');
      this.isOnline = true;
      this.syncNow(); // Sync immediately when connection restored
    });

    window.addEventListener('offline', () => {
      console.log('[SyncManager] Connection lost');
      this.isOnline = false;
      this.notifyListeners({
        lastSync: this.getLastSyncTime(),
        nextSync: this.getNextSyncTime(),
        status: 'offline',
        message: 'No internet connection'
      });
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_REQUEST') {
          console.log('[SyncManager] Sync requested by service worker');
          this.performSync();
        }
        if (event.data.type === 'SYNC_COMPLETE') {
          console.log('[SyncManager] Sync completed by service worker');
          this.notifyListeners({
            lastSync: Date.now(),
            nextSync: this.getNextSyncTime(),
            status: 'success',
            message: 'Data synchronized'
          });
        }
      });
    }

    // Register periodic background sync (if supported)
    this.registerPeriodicSync();

    // Start automatic sync timer
    this.startAutoSync();

    // Sync on load if it's been more than 12 hours
    const lastSync = this.getLastSyncTime();
    if (!lastSync || Date.now() - lastSync > SYNC_INTERVAL) {
      console.log('[SyncManager] Initial sync needed');
      setTimeout(() => this.syncNow(), 2000); // Wait 2s for app to initialize
    }
  }

  /**
   * Register periodic background sync (PWA feature)
   */
  private async registerPeriodicSync() {
    if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check permission
        const status = await (navigator as any).permissions.query({
          name: 'periodic-background-sync'
        });

        if (status.state === 'granted') {
          // Register periodic sync every 12 hours
          await (registration as any).periodicSync.register('auto-sync-12h', {
            minInterval: SYNC_INTERVAL
          });
          console.log('[SyncManager] Periodic background sync registered');
        } else {
          console.log('[SyncManager] Periodic sync permission not granted');
        }
      } catch (error) {
        console.log('[SyncManager] Periodic sync not supported:', error);
      }
    }
  }

  /**
   * Register one-time background sync (when connection restored)
   */
  private async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-data');
        console.log('[SyncManager] Background sync registered');
      } catch (error) {
        console.log('[SyncManager] Background sync failed:', error);
      }
    }
  }

  /**
   * Start automatic sync timer
   */
  private startAutoSync() {
    // Clear any existing timer
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // Set up new timer for every 12 hours
    this.syncTimer = setInterval(() => {
      console.log('[SyncManager] Auto-sync timer triggered');
      this.syncNow();
    }, SYNC_INTERVAL);

    console.log('[SyncManager] Auto-sync timer started (12 hour interval)');
  }

  /**
   * Sync now (manual or automatic)
   */
  public async syncNow(): Promise<SyncStatus> {
    console.log('[SyncManager] Sync requested');

    // Check if already syncing
    if (this.syncInProgress) {
      console.log('[SyncManager] Sync already in progress');
      return {
        lastSync: this.getLastSyncTime(),
        nextSync: this.getNextSyncTime(),
        status: 'in-progress',
        message: 'Sync already in progress'
      };
    }

    // Check if online
    if (!this.isOnline) {
      console.log('[SyncManager] Cannot sync - offline');
      this.registerBackgroundSync(); // Register for when connection restored
      
      const status: SyncStatus = {
        lastSync: this.getLastSyncTime(),
        nextSync: null,
        status: 'offline',
        message: 'No internet connection. Will sync when online.'
      };
      this.notifyListeners(status);
      return status;
    }

    // Perform sync
    this.syncInProgress = true;
    this.notifyListeners({
      lastSync: this.getLastSyncTime(),
      nextSync: this.getNextSyncTime(),
      status: 'syncing',
      message: 'Syncing data...'
    });

    try {
      await this.performSync();
      
      const now = Date.now();
      localStorage.setItem(SYNC_STATUS_KEY, now.toString());
      
      const status: SyncStatus = {
        lastSync: now,
        nextSync: now + SYNC_INTERVAL,
        status: 'success',
        message: 'Data synchronized successfully'
      };
      
      this.notifyListeners(status);
      this.syncInProgress = false;
      
      // Notify service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_NOW'
        });
      }
      
      return status;
    } catch (error) {
      console.error('[SyncManager] Sync failed:', error);
      
      const status: SyncStatus = {
        lastSync: this.getLastSyncTime(),
        nextSync: this.getNextSyncTime(),
        status: 'error',
        message: error instanceof Error ? error.message : 'Sync failed'
      };
      
      this.notifyListeners(status);
      this.syncInProgress = false;
      return status;
    }
  }

  /**
   * Perform actual sync operations
   */
  private async performSync(): Promise<void> {
    console.log('[SyncManager] Performing sync operations...');

    // Get data from localStorage
    const settingsData = localStorage.getItem('pnx_settings');
    const uploadsData = localStorage.getItem('pnx_uploads');
    const authData = localStorage.getItem('pnx_auth');

    // Simulate sync delay (in real app, this would be API calls)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you would:
    // 1. Upload local changes to server
    // 2. Download server changes
    // 3. Merge conflicts
    // 4. Update local storage
    
    // For now, just log what we would sync
    console.log('[SyncManager] Would sync:', {
      settings: settingsData ? 'Has data' : 'No data',
      uploads: uploadsData ? 'Has data' : 'No data',
      auth: authData ? 'Has data' : 'No data'
    });

    // Cache data in service worker cache
    if ('caches' in window) {
      try {
        const cache = await caches.open('pearson-nexus-ai-data-v2.0.0');
        
        // Cache settings
        if (settingsData) {
          await cache.put(
            new Request('/api/settings'),
            new Response(settingsData, {
              headers: { 'Content-Type': 'application/json' }
            })
          );
        }
        
        console.log('[SyncManager] Data cached for offline use');
      } catch (error) {
        console.error('[SyncManager] Cache error:', error);
      }
    }
  }

  /**
   * Get last sync timestamp
   */
  public getLastSyncTime(): number | null {
    const lastSync = localStorage.getItem(SYNC_STATUS_KEY);
    return lastSync ? parseInt(lastSync, 10) : null;
  }

  /**
   * Get next scheduled sync time
   */
  public getNextSyncTime(): number | null {
    const lastSync = this.getLastSyncTime();
    return lastSync ? lastSync + SYNC_INTERVAL : null;
  }

  /**
   * Get time until next sync (in milliseconds)
   */
  public getTimeUntilNextSync(): number | null {
    const nextSync = this.getNextSyncTime();
    return nextSync ? Math.max(0, nextSync - Date.now()) : null;
  }

  /**
   * Subscribe to sync status updates
   */
  public subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifyListeners(status: SyncStatus) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('[SyncManager] Listener error:', error);
      }
    });
  }

  /**
   * Get current sync status
   */
  public getStatus(): SyncStatus {
    const lastSync = this.getLastSyncTime();
    const nextSync = this.getNextSyncTime();
    
    return {
      lastSync,
      nextSync,
      status: this.syncInProgress ? 'syncing' : (this.isOnline ? 'idle' : 'offline'),
      message: this.syncInProgress 
        ? 'Syncing...' 
        : (this.isOnline ? 'Ready to sync' : 'Offline')
    };
  }

  /**
   * Stop auto-sync timer (cleanup)
   */
  public destroy() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.listeners.clear();
    console.log('[SyncManager] Destroyed');
  }
}

export interface SyncStatus {
  lastSync: number | null;
  nextSync: number | null;
  status: 'idle' | 'syncing' | 'success' | 'error' | 'offline' | 'in-progress';
  message: string;
}

// Singleton instance
let syncManagerInstance: SyncManager | null = null;

/**
 * Get or create sync manager instance
 */
export function getSyncManager(): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager();
  }
  return syncManagerInstance;
}

/**
 * Format time until next sync as human-readable string
 */
export function formatTimeUntilSync(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format timestamp as human-readable date/time
 */
export function formatSyncTime(timestamp: number | null): string {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}