import { useState, useEffect } from 'react';
import { Search, Flag, Globe, Building2, User } from 'lucide-react';
import type { FeatureFlag } from '../../../types/admin';

export default function FeatureFlagsSection() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = () => {
    try {
      const mockFlags: FeatureFlag[] = [
        {
          id: 'flag-1',
          key: 'advanced_ai_features',
          name: 'advanced_ai_features',
          description: 'Enable advanced AI document processing',
          enabled: true,
          scope: 'global',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'flag-2',
          key: 'beta_dashboard',
          name: 'beta_dashboard',
          description: 'New dashboard UI in beta',
          enabled: false,
          scope: 'tenant',
          tenant_id: 'tenant-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'flag-3',
          key: 'export_to_excel',
          name: 'export_to_excel',
          description: 'Enable Excel export functionality',
          enabled: true,
          scope: 'global',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const stored = localStorage.getItem('pnx_feature_flags');
      if (stored) {
        setFlags(JSON.parse(stored));
      } else {
        setFlags(mockFlags);
        localStorage.setItem('pnx_feature_flags', JSON.stringify(mockFlags));
      }
    } catch (error) {
      console.error('Error loading flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlag = (flagId: string, currentEnabled: boolean) => {
    const updatedFlags = flags.map(flag =>
      flag.id === flagId ? { ...flag, enabled: !currentEnabled } : flag
    );
    setFlags(updatedFlags);
    localStorage.setItem('pnx_feature_flags', JSON.stringify(updatedFlags));
  };

  const filteredFlags = flags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flag.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'all' || flag.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'global': return Globe;
      case 'tenant': return Building2;
      case 'user': return User;
      default: return Flag;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Flags</h2>
          <p className="text-gray-600 mt-1">Control feature rollout and A/B testing</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Scopes</option>
            <option value="global">Global</option>
            <option value="tenant">Tenant</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredFlags.map(flag => {
            const ScopeIcon = getScopeIcon(flag.scope);
            return (
              <div key={flag.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <button
                  onClick={() => handleToggleFlag(flag.id, flag.enabled)}
                  className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
                    flag.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    flag.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900">{flag.name}</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                      <ScopeIcon className="w-3 h-3" />
                      <span>{flag.scope}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{flag.description}</div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
