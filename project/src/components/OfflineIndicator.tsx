import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Database } from 'lucide-react';
import { getOfflineQueue } from '../lib/offlineQueue';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update unsynced count
    const updateCount = () => {
      const queue = getOfflineQueue();
      setUnsyncedCount(queue.getUnsyncedCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-16 left-4 right-4 z-40 animate-slide-down">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-xl shadow-lg border border-orange-400/30">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Offline Mode</div>
              <div className="text-xs opacity-90">
                {unsyncedCount > 0 
                  ? `${unsyncedCount} item${unsyncedCount > 1 ? 's' : ''} waiting to sync`
                  : 'Data will be stored locally'
                }
              </div>
            </div>
            <Database className="w-4 h-4 opacity-75" />
          </div>
        </div>
      </div>
    );
  }

  if (unsyncedCount > 0) {
    return (
      <div className="fixed top-16 left-4 right-4 z-40 animate-slide-down">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-3 rounded-xl shadow-lg border border-blue-400/30">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Ready to Sync</div>
              <div className="text-xs opacity-90">
                {unsyncedCount} item{unsyncedCount > 1 ? 's' : ''} waiting to sync
              </div>
            </div>
            <Wifi className="w-4 h-4 opacity-75" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface OfflineStatusBadgeProps {
  className?: string;
}

export function OfflineStatusBadge({ className = '' }: OfflineStatusBadgeProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateCount = () => {
      const queue = getOfflineQueue();
      setUnsyncedCount(queue.getUnsyncedCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isOnline ? (
        <>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-slate-400">
            Online {unsyncedCount > 0 && `• ${unsyncedCount} pending`}
          </span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-xs text-slate-400">
            Offline {unsyncedCount > 0 && `• ${unsyncedCount} pending`}
          </span>
        </>
      )}
    </div>
  );
}