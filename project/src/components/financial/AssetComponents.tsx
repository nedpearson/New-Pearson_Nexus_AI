import { useState } from 'react';
import { X, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Asset, Liability, Transaction } from '../../types';
import { ProofLinks } from '../ProofLinks';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEYS = {
  assets: 'pnx_assets',
  liabilities: 'pnx_liabilities',
};

function saveToLocalStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function AssetsView({ assets, onViewAsset }: { assets: Asset[]; onViewAsset: (asset: Asset) => void }) {
  const totalValue = assets.reduce((sum, a) => sum + Number(a.value), 0);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Assets - Total: ${totalValue.toFixed(2)}</h3>
      {assets.length === 0 ? <p className="text-gray-500 py-8">No assets yet</p> : (
        <div className="space-y-2">
          {assets.map((asset) => (
            <button key={asset.id} onClick={() => onViewAsset(asset)} className="w-full flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
              <div><p className="font-bold text-gray-900">{asset.name}</p><p className="text-sm text-gray-600">{asset.type}</p></div>
              <span className="text-xl font-bold text-green-600">${Number(asset.value).toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LiabilitiesView({ liabilities, onViewLiability }: { liabilities: Liability[]; onViewLiability: (liability: Liability) => void }) {
  const totalValue = liabilities.reduce((sum, l) => sum + Number(l.value), 0);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Liabilities - Total: ${totalValue.toFixed(2)}</h3>
      {liabilities.length === 0 ? <p className="text-gray-500 py-8">No liabilities yet</p> : (
        <div className="space-y-2">
          {liabilities.map((liability) => (
            <button key={liability.id} onClick={() => onViewLiability(liability)} className="w-full flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
              <div><p className="font-bold text-gray-900">{liability.name}</p><p className="text-sm text-gray-600">{liability.type}</p></div>
              <span className="text-xl font-bold text-red-600">${Number(liability.value).toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NetWorthView({ netWorth, assets, liabilities, onViewAsset, onViewLiability }: { netWorth: number; assets: Asset[]; liabilities: Liability[]; onViewAsset: (asset: Asset) => void; onViewLiability: (liability: Liability) => void }) {
  const totalAssets = assets.reduce((sum, a) => sum + Number(a.value), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + Number(l.value), 0);
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8">
        <div className="flex items-center justify-between mb-2"><h3 className="text-lg font-semibold text-gray-900">Net Worth</h3><PieChart className="w-6 h-6 text-blue-600" /></div>
        <p className={`text-4xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netWorth.toFixed(2)}</p>
        <p className="text-sm text-gray-600 mt-2">Assets - Liabilities</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">Assets</h3><TrendingUp className="w-5 h-5 text-green-600" /></div>
          <p className="text-3xl font-bold text-green-600 mb-4">${totalAssets.toFixed(2)}</p>
          <div className="space-y-2">{assets.slice(0, 3).map((asset) => (
            <button key={asset.id} onClick={() => onViewAsset(asset)} className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{asset.name}</span><span className="text-sm font-semibold text-gray-900">${Number(asset.value).toFixed(2)}</span>
            </button>
          ))}{assets.length > 3 && <p className="text-sm text-gray-500 mt-2">+{assets.length - 3} more...</p>}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">Liabilities</h3><TrendingDown className="w-5 h-5 text-red-600" /></div>
          <p className="text-3xl font-bold text-red-600 mb-4">${totalLiabilities.toFixed(2)}</p>
          <div className="space-y-2">{liabilities.slice(0, 3).map((liability) => (
            <button key={liability.id} onClick={() => onViewLiability(liability)} className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{liability.name}</span><span className="text-sm font-semibold text-gray-900">${Number(liability.value).toFixed(2)}</span>
            </button>
          ))}{liabilities.length > 3 && <p className="text-sm text-gray-500 mt-2">+{liabilities.length - 3} more...</p>}</div>
        </div>
      </div>
    </div>
  );
}

export function TransactionDetailModal({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><p className="text-sm text-gray-600 mb-1">Title</p><p className="text-lg font-semibold text-gray-900">{transaction.title}</p></div>
          <div><p className="text-sm text-gray-600 mb-1">Amount</p><p className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}</p></div>
          <div><p className="text-sm text-gray-600 mb-1">Date</p><p className="text-gray-900">{new Date(transaction.date).toLocaleDateString()}</p></div>
          {transaction.description && <div><p className="text-sm text-gray-600 mb-1">Description</p><p className="text-gray-900">{transaction.description}</p></div>}
          <div className="pt-4 border-t border-gray-200"><p className="text-sm font-medium text-gray-700 mb-2">Proof Documents</p><ProofLinks entityType="transaction" entityId={transaction.id} /></div>
        </div>
      </div>
    </div>
  );
}

export function AssetDetailModal({ asset, onClose, onUpdate }: { asset: Asset; onClose: () => void; onUpdate: () => void }) {
  const handleClose = () => {
    onUpdate();
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Asset Details</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><p className="text-sm text-gray-600 mb-1">Name</p><p className="text-lg font-semibold text-gray-900">{asset.name}</p></div>
          <div><p className="text-sm text-gray-600 mb-1">Type</p><p className="text-gray-900">{asset.type}</p></div>
          <div><p className="text-sm text-gray-600 mb-1">Value</p><p className="text-2xl font-bold text-green-600">${Number(asset.value).toFixed(2)}</p></div>
          <div className="pt-4 border-t border-gray-200"><p className="text-sm font-medium text-gray-700 mb-2">Proof Documents</p><ProofLinks entityType="asset" entityId={asset.id} /></div>
        </div>
      </div>
    </div>
  );
}

export function LiabilityDetailModal({ liability, onClose, onUpdate }: { liability: Liability; onClose: () => void; onUpdate: () => void }) {
  const handleClose = () => {
    onUpdate();
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Liability Details</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div><p className="text-sm text-gray-600 mb-1">Name</p><p className="text-lg font-semibold text-gray-900">{liability.name}</p></div>
          <div><p className="text-sm text-gray-600 mb-1">Type</p><p className="text-gray-900">{liability.type}</p></div>
          <div><p className="text-sm text-gray-600 mb-1">Value</p><p className="text-2xl font-bold text-red-600">${Number(liability.value).toFixed(2)}</p></div>
          <div className="pt-4 border-t border-gray-200"><p className="text-sm font-medium text-gray-700 mb-2">Proof Documents</p><ProofLinks entityType="liability" entityId={liability.id} /></div>
        </div>
      </div>
    </div>
  );
}

export function AddAssetModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { organization } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const allAssets = loadFromLocalStorage<Asset>(STORAGE_KEYS.assets);
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      organization_id: organization?.id || '1',
      name,
      type,
      value: parseFloat(value),
      last_updated: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allAssets.push(newAsset);
    saveToLocalStorage(STORAGE_KEYS.assets, allAssets);
    setSaving(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Asset</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Type *</label><input type="text" value={type} onChange={(e) => setType(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Value *</label><input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add Asset'}</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddLiabilityModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { organization } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const allLiabilities = loadFromLocalStorage<Liability>(STORAGE_KEYS.liabilities);
    const newLiability: Liability = {
      id: `liability-${Date.now()}`,
      organization_id: organization?.id || '1',
      name,
      type,
      value: parseFloat(value),
      last_updated: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allLiabilities.push(newLiability);
    saveToLocalStorage(STORAGE_KEYS.liabilities, allLiabilities);
    setSaving(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Liability</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Type *</label><input type="text" value={type} onChange={(e) => setType(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Value *</label><input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">{saving ? 'Adding...' : 'Add Liability'}</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
