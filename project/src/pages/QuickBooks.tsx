import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Settings, ArrowRightLeft, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGating } from '../hooks/useFeatureGating';
import {
  QuickBooksConnection,
  QuickBooksSyncSettings,
  QuickBooksAccount,
  QuickBooksCategory,
  QuickBooksVendor,
  CategoryMappingRule,
  QuickBooksTransaction,
} from '../types';

const STORAGE_KEY_CONNECTION = 'pnx_qb_connection';
const STORAGE_KEY_SETTINGS = 'pnx_qb_sync_settings';
const STORAGE_KEY_ACCOUNTS = 'pnx_qb_accounts';
const STORAGE_KEY_CATEGORIES = 'pnx_qb_categories';
const STORAGE_KEY_VENDORS = 'pnx_qb_vendors';
const STORAGE_KEY_MAPPINGS = 'pnx_qb_category_mappings';
const STORAGE_KEY_TRANSACTIONS = 'pnx_qb_transactions';

function saveToLocalStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

const MOCK_ACCOUNTS: QuickBooksAccount[] = [
  { id: '1', qb_id: 'qb_acc_1', name: 'Operating Account', type: 'Bank', balance: 15000, active: true, sync_enabled: true },
  { id: '2', qb_id: 'qb_acc_2', name: 'Savings Account', type: 'Bank', balance: 50000, active: true, sync_enabled: true },
  { id: '3', qb_id: 'qb_acc_3', name: 'Credit Card', type: 'Credit Card', balance: -2500, active: true, sync_enabled: false },
];

const MOCK_CATEGORIES: QuickBooksCategory[] = [
  { id: '1', qb_id: 'qb_cat_1', name: 'Office Supplies', type: 'expense', sync_enabled: true },
  { id: '2', qb_id: 'qb_cat_2', name: 'Utilities', type: 'expense', sync_enabled: true },
  { id: '3', qb_id: 'qb_cat_3', name: 'Consulting Income', type: 'income', sync_enabled: true },
  { id: '4', qb_id: 'qb_cat_4', name: 'Product Sales', type: 'income', sync_enabled: true },
];

const MOCK_VENDORS: QuickBooksVendor[] = [
  { id: '1', qb_id: 'qb_ven_1', name: 'Office Depot', email: 'support@officedepot.com', balance: 150, sync_enabled: true },
  { id: '2', qb_id: 'qb_ven_2', name: 'Electric Company', phone: '555-0100', balance: 320, sync_enabled: true },
  { id: '3', qb_id: 'qb_ven_3', name: 'Internet Provider', email: 'billing@isp.com', balance: 89, sync_enabled: false },
];

const MOCK_TRANSACTIONS: QuickBooksTransaction[] = [
  {
    id: '1', qb_id: 'qb_txn_1', type: 'expense', date: '2026-01-25', amount: 150.00,
    vendor: 'Office Depot', category: 'Office Supplies', account: 'Operating Account',
    description: 'Office supplies purchase', status: 'synced', reconciled: true,
  },
  {
    id: '2', qb_id: 'qb_txn_2', type: 'bill', date: '2026-01-20', amount: 320.00,
    vendor: 'Electric Company', category: 'Utilities', account: 'Operating Account',
    description: 'Monthly electricity bill', status: 'synced', reconciled: false,
  },
  {
    id: '3', qb_id: 'qb_txn_3', type: 'invoice', date: '2026-01-15', amount: 5000.00,
    customer: 'ABC Corporation', category: 'Consulting Income', account: 'Operating Account',
    description: 'Consulting services - January', status: 'synced', reconciled: true,
  },
];

export function QuickBooks() {
  const { organization } = useAuth();
  const { hasFeature } = useFeatureGating();
  const [activeTab, setActiveTab] = useState<'connection' | 'settings' | 'mapping' | 'reconciliation'>('connection');
  const [connection, setConnection] = useState<QuickBooksConnection | null>(null);
  const [syncSettings, setSyncSettings] = useState<QuickBooksSyncSettings | null>(null);
  const [accounts, setAccounts] = useState<QuickBooksAccount[]>([]);
  const [categories, setCategories] = useState<QuickBooksCategory[]>([]);
  const [vendors, setVendors] = useState<QuickBooksVendor[]>([]);
  const [mappings, setMappings] = useState<CategoryMappingRule[]>([]);
  const [transactions, setTransactions] = useState<QuickBooksTransaction[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  const loadData = () => {
    const conn = loadFromLocalStorage<QuickBooksConnection | null>(
      STORAGE_KEY_CONNECTION,
      null
    );
    const settings = loadFromLocalStorage<QuickBooksSyncSettings | null>(
      STORAGE_KEY_SETTINGS,
      null
    );
    const accs = loadFromLocalStorage<QuickBooksAccount[]>(STORAGE_KEY_ACCOUNTS, []);
    const cats = loadFromLocalStorage<QuickBooksCategory[]>(STORAGE_KEY_CATEGORIES, []);
    const vens = loadFromLocalStorage<QuickBooksVendor[]>(STORAGE_KEY_VENDORS, []);
    const maps = loadFromLocalStorage<CategoryMappingRule[]>(STORAGE_KEY_MAPPINGS, []);
    const txns = loadFromLocalStorage<QuickBooksTransaction[]>(STORAGE_KEY_TRANSACTIONS, []);

    setConnection(conn);
    setSyncSettings(settings);
    setAccounts(accs);
    setCategories(cats);
    setVendors(vens);
    setMappings(maps);
    setTransactions(txns);
  };

  const connectQuickBooks = () => {
    const newConnection: QuickBooksConnection = {
      id: `qb_conn_${Date.now()}`,
      organization_id: organization?.id || '1',
      connected: true,
      company_name: 'Demo Company Inc.',
      realm_id: 'demo_realm_123',
      connected_at: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      status: 'connected',
    };
    saveToLocalStorage(STORAGE_KEY_CONNECTION, newConnection);
    setConnection(newConnection);

    const defaultSettings: QuickBooksSyncSettings = {
      id: `qb_settings_${Date.now()}`,
      organization_id: organization?.id || '1',
      sync_accounts: true,
      sync_categories: true,
      sync_vendors: true,
      sync_customers: true,
      sync_invoices: true,
      sync_bills: true,
      auto_sync: false,
      sync_frequency: 'manual',
      last_updated: new Date().toISOString(),
    };
    saveToLocalStorage(STORAGE_KEY_SETTINGS, defaultSettings);
    setSyncSettings(defaultSettings);

    saveToLocalStorage(STORAGE_KEY_ACCOUNTS, MOCK_ACCOUNTS);
    saveToLocalStorage(STORAGE_KEY_CATEGORIES, MOCK_CATEGORIES);
    saveToLocalStorage(STORAGE_KEY_VENDORS, MOCK_VENDORS);
    saveToLocalStorage(STORAGE_KEY_TRANSACTIONS, MOCK_TRANSACTIONS);
    setAccounts(MOCK_ACCOUNTS);
    setCategories(MOCK_CATEGORIES);
    setVendors(MOCK_VENDORS);
    setTransactions(MOCK_TRANSACTIONS);
  };

  const disconnectQuickBooks = () => {
    if (confirm('Are you sure you want to disconnect QuickBooks?')) {
      localStorage.removeItem(STORAGE_KEY_CONNECTION);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
      setConnection(null);
      setSyncSettings(null);
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (connection) {
      const updatedConnection = { ...connection, last_sync: new Date().toISOString() };
      saveToLocalStorage(STORAGE_KEY_CONNECTION, updatedConnection);
      setConnection(updatedConnection);
    }
    setSyncing(false);
  };

  const updateSyncSettings = (updates: Partial<QuickBooksSyncSettings>) => {
    if (syncSettings) {
      const updated = { ...syncSettings, ...updates, last_updated: new Date().toISOString() };
      saveToLocalStorage(STORAGE_KEY_SETTINGS, updated);
      setSyncSettings(updated);
    }
  };

  const addCategoryMapping = () => {
    const newMapping: CategoryMappingRule = {
      id: `map_${Date.now()}`,
      organization_id: organization?.id || '1',
      qb_category_id: '',
      qb_category_name: '',
      local_category: '',
      auto_apply: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...mappings, newMapping];
    saveToLocalStorage(STORAGE_KEY_MAPPINGS, updated);
    setMappings(updated);
  };

  const updateMapping = (id: string, updates: Partial<CategoryMappingRule>) => {
    const updated = mappings.map(m =>
      m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
    );
    saveToLocalStorage(STORAGE_KEY_MAPPINGS, updated);
    setMappings(updated);
  };

  const deleteMapping = (id: string) => {
    const updated = mappings.filter(m => m.id !== id);
    saveToLocalStorage(STORAGE_KEY_MAPPINGS, updated);
    setMappings(updated);
  };

  if (!hasFeature('quickbooks')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Settings className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">QuickBooks Integration Not Available</h2>
          <p className="text-gray-600 mb-4">Upgrade to Professional or Business plan to enable QuickBooks integration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">QuickBooks Integration</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'connection'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Connection
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sync Settings
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'mapping'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Category Mapping
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reconciliation'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reconciliation
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'connection' && (
            <ConnectionTab
              connection={connection}
              syncing={syncing}
              onConnect={connectQuickBooks}
              onDisconnect={disconnectQuickBooks}
              onSync={syncNow}
            />
          )}
          {activeTab === 'settings' && (
            <SyncSettingsTab
              connection={connection}
              settings={syncSettings}
              accounts={accounts}
              categories={categories}
              vendors={vendors}
              onUpdateSettings={updateSyncSettings}
            />
          )}
          {activeTab === 'mapping' && (
            <CategoryMappingTab
              connection={connection}
              categories={categories}
              mappings={mappings}
              onAddMapping={addCategoryMapping}
              onUpdateMapping={updateMapping}
              onDeleteMapping={deleteMapping}
            />
          )}
          {activeTab === 'reconciliation' && (
            <ReconciliationTab
              connection={connection}
              transactions={transactions}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface ConnectionTabProps {
  connection: QuickBooksConnection | null;
  syncing: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

function ConnectionTab({ connection, syncing, onConnect, onDisconnect, onSync }: ConnectionTabProps) {
  return (
    <div className="space-y-6">
      {!connection || !connection.connected ? (
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Connected</h2>
          <p className="text-gray-600 mb-6">Connect your QuickBooks account to sync financial data.</p>
          <button
            onClick={onConnect}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Connect to QuickBooks
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Connected</h2>
                <p className="text-sm text-gray-600">{connection.company_name}</p>
              </div>
            </div>
            <button
              onClick={onDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Disconnect
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Realm ID</p>
              <p className="text-lg font-semibold text-gray-900">{connection.realm_id}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-lg font-semibold text-gray-900">
                {connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>

          <button
            onClick={onSync}
            disabled={syncing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface SyncSettingsTabProps {
  connection: QuickBooksConnection | null;
  settings: QuickBooksSyncSettings | null;
  accounts: QuickBooksAccount[];
  categories: QuickBooksCategory[];
  vendors: QuickBooksVendor[];
  onUpdateSettings: (updates: Partial<QuickBooksSyncSettings>) => void;
}

function SyncSettingsTab({ connection, settings, accounts, categories, vendors, onUpdateSettings }: SyncSettingsTabProps) {
  if (!connection || !connection.connected) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please connect to QuickBooks first.</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sync Options</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sync_accounts}
              onChange={(e) => onUpdateSettings({ sync_accounts: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Sync Accounts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sync_categories}
              onChange={(e) => onUpdateSettings({ sync_categories: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Sync Categories</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sync_vendors}
              onChange={(e) => onUpdateSettings({ sync_vendors: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Sync Vendors</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.auto_sync}
              onChange={(e) => onUpdateSettings({ auto_sync: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Enable Auto Sync</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
        <select
          value={settings.sync_frequency}
          onChange={(e) => onUpdateSettings({ sync_frequency: e.target.value as any })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="manual">Manual</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Accounts ({accounts.length})</h3>
        <div className="space-y-2">
          {accounts.map(account => (
            <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{account.name}</p>
                <p className="text-sm text-gray-600">{account.type} - ${account.balance.toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${account.sync_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {account.sync_enabled ? 'Syncing' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Categories ({categories.length})</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-sm text-gray-600">{category.type}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${category.sync_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {category.sync_enabled ? 'Syncing' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Vendors ({vendors.length})</h3>
        <div className="space-y-2">
          {vendors.map(vendor => (
            <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{vendor.name}</p>
                <p className="text-sm text-gray-600">{vendor.email || vendor.phone || 'No contact'}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${vendor.sync_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {vendor.sync_enabled ? 'Syncing' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CategoryMappingTabProps {
  connection: QuickBooksConnection | null;
  categories: QuickBooksCategory[];
  mappings: CategoryMappingRule[];
  onAddMapping: () => void;
  onUpdateMapping: (id: string, updates: Partial<CategoryMappingRule>) => void;
  onDeleteMapping: (id: string) => void;
}

function CategoryMappingTab({ connection, categories, mappings, onAddMapping, onUpdateMapping, onDeleteMapping }: CategoryMappingTabProps) {
  if (!connection || !connection.connected) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please connect to QuickBooks first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Category Mapping Rules</h3>
        <button
          onClick={onAddMapping}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Add Mapping Rule
        </button>
      </div>

      {mappings.length === 0 ? (
        <div className="text-center py-8">
          <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No mapping rules yet. Add a rule to map QuickBooks categories to local categories.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mappings.map(mapping => (
            <div key={mapping.id} className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">QuickBooks Category</label>
                  <select
                    value={mapping.qb_category_id}
                    onChange={(e) => {
                      const cat = categories.find(c => c.qb_id === e.target.value);
                      onUpdateMapping(mapping.id, {
                        qb_category_id: e.target.value,
                        qb_category_name: cat?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.qb_id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Local Category</label>
                  <input
                    type="text"
                    value={mapping.local_category}
                    onChange={(e) => onUpdateMapping(mapping.id, { local_category: e.target.value })}
                    placeholder="Enter local category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={mapping.auto_apply}
                      onChange={(e) => onUpdateMapping(mapping.id, { auto_apply: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xs text-gray-700">Auto-apply</span>
                  </label>
                  <button
                    onClick={() => onDeleteMapping(mapping.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ReconciliationTabProps {
  connection: QuickBooksConnection | null;
  transactions: QuickBooksTransaction[];
}

function ReconciliationTab({ connection, transactions }: ReconciliationTabProps) {
  if (!connection || !connection.connected) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please connect to QuickBooks first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Transactions ({transactions.length})</h3>
        <p className="text-sm text-gray-600 mb-4">Read-only view of synced transactions from QuickBooks</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No transactions synced yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map(txn => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{txn.description}</p>
                      <p className="text-xs text-gray-600">{txn.vendor || txn.customer}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{txn.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    ${txn.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      {txn.reconciled ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        txn.status === 'synced' ? 'bg-green-100 text-green-800' :
                        txn.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
