import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, WifiOff, Clock } from 'lucide-react';
import { getSyncManager, formatSyncTime, formatTimeUntilSync, type SyncStatus } from '../lib/syncManager';

export function SyncIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => 
    getSyncManager().getStatus()
  );
  const [isManualSync, setIsManualSync] = useState(false);

  useEffect(() => {
    const syncManager = getSyncManager();
    
    // Subscribe to sync status updates
    const unsubscribe = syncManager.subscribe((status) => {
      setSyncStatus(status);
      if (status.status === 'success' || status.status === 'error') {
        setIsManualSync(false);
      }
    });

    // Update status every minute
    const interval = setInterval(() => {
      setSyncStatus(syncManager.getStatus());
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleSyncNow = async () => {
    setIsManualSync(true);
    const syncManager = getSyncManager();
    await syncManager.syncNow();
  };

  const getIcon = () => {
    if (syncStatus.status === 'syncing' || isManualSync) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    if (syncStatus.status === 'success') {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (syncStatus.status === 'error') {
      return <AlertCircle className="w-4 h-4" />;
    }
    if (syncStatus.status === 'offline') {
      return <WifiOff className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  const getColor = () => {
    if (syncStatus.status === 'syncing' || isManualSync) return 'text-blue-400';
    if (syncStatus.status === 'success') return 'text-green-400';
    if (syncStatus.status === 'error') return 'text-red-400';
    if (syncStatus.status === 'offline') return 'text-orange-400';
    return 'text-slate-400';
  };

  const timeUntilNext = syncStatus.nextSync 
    ? syncStatus.nextSync - Date.now() 
    : null;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className={`${getColor()} flex items-center justify-center`}>
          {getIcon()}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-200">
            {syncStatus.status === 'syncing' || isManualSync ? 'Syncing...' : 'Data Sync'}
          </div>
          <div className="text-xs text-slate-400">
            {syncStatus.lastSync 
              ? `Last: ${formatSyncTime(syncStatus.lastSync)}` 
              : 'Never synced'}
            {timeUntilNext && timeUntilNext > 0 && syncStatus.status !== 'syncing' && (
              <span className="ml-2">
                • Next: {formatTimeUntilSync(timeUntilNext)}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={handleSyncNow}
        disabled={syncStatus.status === 'syncing' || isManualSync || syncStatus.status === 'offline'}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          syncStatus.status === 'syncing' || isManualSync || syncStatus.status === 'offline'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-cyan-500 text-white hover:bg-cyan-600 active:scale-95'
        }`}
      >
        {syncStatus.status === 'syncing' || isManualSync ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}

export function SyncStatusBanner() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => 
    getSyncManager().getStatus()
  );
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const syncManager = getSyncManager();
    
    const unsubscribe = syncManager.subscribe((status) => {
      setSyncStatus(status);
      
      // Show banner for success or error
      if (status.status === 'success' || status.status === 'error') {
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 animate-slide-down ${
      syncStatus.status === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
      {syncStatus.status === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <div className="flex-1">
        <div className="font-medium">
          {syncStatus.status === 'success' ? 'Sync Complete' : 'Sync Failed'}
        </div>
        <div className="text-sm opacity-90">{syncStatus.message}</div>
      </div>
    </div>
  );
}