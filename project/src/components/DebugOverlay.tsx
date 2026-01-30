import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface DebugOverlayProps {
  currentRoute: string;
  authLoading: boolean;
  featureLoading: boolean;
  showAfterMs?: number;
}

export function DebugOverlay({
  currentRoute,
  authLoading,
  featureLoading,
  showAfterMs = 1000
}: DebugOverlayProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { user, organization, isAuthenticated, authInitStart, authInitEnd, timeoutFired } = useAuth();

  useEffect(() => {
    if (dismissed) return;

    if (authLoading || featureLoading) {
      const timer = setTimeout(() => {
        setShow(true);
      }, showAfterMs);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [authLoading, featureLoading, showAfterMs, dismissed]);

  if (!show || dismissed) return null;

  const pnxCurrentUserExists = localStorage?.getItem?.('pnx_current_user') !== null;
  const pnxCurrentOrgExists = localStorage?.getItem?.('pnx_current_org') !== null;
  const pnxUsersExists = localStorage?.getItem?.('pnx_users') !== null;

  let pnxUsersCount = 0;
  try {
    if (localStorage?.getItem) {
      const users = localStorage.getItem('pnx_users');
      if (users) {
        const parsed = JSON.parse(users);
        pnxUsersCount = Array.isArray(parsed) ? parsed.length : 0;
      }
    }
  } catch (e) {
    console.error('Error parsing pnx_users', e);
  }

  const initDuration = authInitEnd > 0 ? authInitEnd - authInitStart : Date.now() - authInitStart;

  return (
    <div className="fixed top-4 right-4 bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-2xl p-4 z-[9999] max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-yellow-400 font-bold text-sm">Debug: Loading State</h3>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-xs font-mono">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-400">Route:</div>
          <div className="text-white">{currentRoute}</div>

          <div className="text-gray-400">Auth Loading:</div>
          <div className={authLoading ? 'text-red-400' : 'text-green-400'}>
            {authLoading ? 'TRUE (blocking)' : 'false'}
          </div>

          <div className="text-gray-400">Feature Loading:</div>
          <div className={featureLoading ? 'text-red-400' : 'text-green-400'}>
            {featureLoading ? 'TRUE (blocking)' : 'false'}
          </div>

          <div className="text-gray-400">Authenticated:</div>
          <div className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
            {isAuthenticated ? 'true' : 'FALSE'}
          </div>

          <div className="text-gray-400">User Email:</div>
          <div className="text-white">{user?.email || 'null'}</div>

          <div className="text-gray-400">User ID:</div>
          <div className="text-white text-[10px]">
            {user?.id ? user.id.substring(0, 12) + '...' : 'null'}
          </div>

          <div className="text-gray-400">Organization:</div>
          <div className="text-white">{organization?.name || 'null'}</div>

          <div className="text-gray-400">Org ID:</div>
          <div className="text-white text-[10px]">
            {organization?.id ? organization.id.substring(0, 12) + '...' : 'null'}
          </div>

          <div className="text-gray-400">Plan:</div>
          <div className="text-white">{organization?.plan || 'null'}</div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="text-gray-400 mb-1">Auth Timing:</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-400">Init Duration:</div>
            <div className={`${initDuration > 500 ? 'text-red-400' : 'text-green-400'}`}>
              {initDuration}ms
            </div>

            <div className="text-gray-400">Timeout Fired:</div>
            <div className={timeoutFired ? 'text-red-400' : 'text-green-400'}>
              {timeoutFired ? 'YES (500ms)' : 'no'}
            </div>

            <div className="text-gray-400">Init Complete:</div>
            <div className={authInitEnd > 0 ? 'text-green-400' : 'text-red-400'}>
              {authInitEnd > 0 ? 'yes' : 'NO (stuck)'}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-2 mt-2">
          <div className="text-gray-400 mb-1">LocalStorage Keys:</div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${pnxCurrentUserExists ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className="text-gray-300 text-[10px]">pnx_current_user</div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${pnxCurrentOrgExists ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className="text-gray-300 text-[10px]">pnx_current_org</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${pnxUsersExists ? 'bg-green-400' : 'bg-red-400'}`} />
            <div className="text-gray-300 text-[10px]">pnx_users ({pnxUsersCount} total)</div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-700">
        <p className="text-yellow-300 text-[10px]">
          This panel appears when loading takes &gt;1s
        </p>
        <p className="text-yellow-300 text-[10px] mt-1">
          Max auth timeout: 500ms
        </p>
      </div>
    </div>
  );
}
