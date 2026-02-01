/**
 * OfflineQueue - Manages offline data and syncs when online
 * Stores all captures, uploads, and changes locally until sync
 */

interface QueuedItem {
  id: string;
  type: 'photo' | 'voice' | 'file' | 'note';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineQueue {
  private QUEUE_KEY = 'pnx_offline_queue';
  private PENDING_UPLOADS_KEY = 'pnx_pending_uploads';
  private OFFLINE_MODE_KEY = 'pnx_offline_mode';

  /**
   * Add item to offline queue
   */
  addToQueue(type: 'photo' | 'voice' | 'file' | 'note', data: any): string {
    const item: QueuedItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    const queue = this.getQueue();
    queue.push(item);
    this.saveQueue(queue);

    console.log('[OfflineQueue] Added to queue:', item.id, type);
    return item.id;
  }

  /**
   * Get all queued items
   */
  getQueue(): QueuedItem[] {
    try {
      const data = localStorage.getItem(this.QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[OfflineQueue] Error reading queue:', error);
      return [];
    }
  }

  /**
   * Get unsynced items count
   */
  getUnsyncedCount(): number {
    const queue = this.getQueue();
    return queue.filter(item => !item.synced).length;
  }

  /**
   * Get all unsynced items
   */
  getUnsyncedItems(): QueuedItem[] {
    return this.getQueue().filter(item => !item.synced);
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(queue: QueuedItem[]): void {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[OfflineQueue] Error saving queue:', error);
    }
  }

  /**
   * Mark item as synced
   */
  markAsSynced(itemId: string): void {
    const queue = this.getQueue();
    const item = queue.find(i => i.id === itemId);
    if (item) {
      item.synced = true;
      this.saveQueue(queue);
      console.log('[OfflineQueue] Marked as synced:', itemId);
    }
  }

  /**
   * Remove synced items (cleanup)
   */
  clearSyncedItems(): void {
    const queue = this.getQueue();
    const unsynced = queue.filter(item => !item.synced);
    this.saveQueue(unsynced);
    console.log('[OfflineQueue] Cleared synced items');
  }

  /**
   * Clear all queue items
   */
  clearQueue(): void {
    localStorage.removeItem(this.QUEUE_KEY);
    console.log('[OfflineQueue] Queue cleared');
  }

  /**
   * Store file data for offline access
   */
  async storeFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const fileData = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result, // Base64 string
          timestamp: Date.now()
        };

        try {
          // Store in IndexedDB for larger files, or localStorage for small files
          if (file.size < 1024 * 1024) { // < 1MB, use localStorage
            const files = this.getStoredFiles();
            files.push(fileData);
            localStorage.setItem(this.PENDING_UPLOADS_KEY, JSON.stringify(files));
          } else {
            // For larger files, use IndexedDB (implement if needed)
            this.storeInIndexedDB(fileData);
          }

          console.log('[OfflineQueue] File stored:', fileData.id);
          resolve(fileData.id);
        } catch (error) {
          console.error('[OfflineQueue] Error storing file:', error);
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get stored files
   */
  getStoredFiles(): any[] {
    try {
      const data = localStorage.getItem(this.PENDING_UPLOADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[OfflineQueue] Error reading files:', error);
      return [];
    }
  }

  /**
   * Get stored file by ID
   */
  getStoredFile(fileId: string): any | null {
    const files = this.getStoredFiles();
    return files.find(f => f.id === fileId) || null;
  }

  /**
   * Remove stored file
   */
  removeStoredFile(fileId: string): void {
    const files = this.getStoredFiles();
    const filtered = files.filter(f => f.id !== fileId);
    localStorage.setItem(this.PENDING_UPLOADS_KEY, JSON.stringify(filtered));
    console.log('[OfflineQueue] File removed:', fileId);
  }

  /**
   * Store in IndexedDB for larger files
   */
  private async storeInIndexedDB(fileData: any): Promise<void> {
    // Basic IndexedDB implementation
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PearsonNexusAI', 1);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        store.add(fileData);
        
        transaction.oncomplete = () => {
          console.log('[OfflineQueue] File stored in IndexedDB');
          resolve();
        };
        
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Check if app is in offline mode
   */
  isOfflineMode(): boolean {
    return localStorage.getItem(this.OFFLINE_MODE_KEY) === 'true';
  }

  /**
   * Set offline mode
   */
  setOfflineMode(offline: boolean): void {
    localStorage.setItem(this.OFFLINE_MODE_KEY, offline.toString());
    console.log('[OfflineQueue] Offline mode:', offline);
  }

  /**
   * Get queue summary
   */
  getSummary(): { total: number; unsynced: number; synced: number } {
    const queue = this.getQueue();
    return {
      total: queue.length,
      unsynced: queue.filter(i => !i.synced).length,
      synced: queue.filter(i => i.synced).length
    };
  }

  /**
   * Export queue for debugging
   */
  exportQueue(): string {
    const queue = this.getQueue();
    return JSON.stringify(queue, null, 2);
  }
}

// Singleton instance
let offlineQueueInstance: OfflineQueue | null = null;

/**
 * Get offline queue instance
 */
export function getOfflineQueue(): OfflineQueue {
  if (!offlineQueueInstance) {
    offlineQueueInstance = new OfflineQueue();
  }
  return offlineQueueInstance;
}