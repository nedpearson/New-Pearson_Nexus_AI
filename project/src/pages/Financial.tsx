import { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, CheckCircle, AlertCircle, X, CreditCard, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Bill, Transaction, CalendarEvent, Asset, Liability } from '../types';
import { ProofLinks } from '../components/ProofLinks';
import { AssetsView, LiabilitiesView, NetWorthView, TransactionDetailModal, AssetDetailModal, LiabilityDetailModal, AddAssetModal, AddLiabilityModal } from '../components/financial/AssetComponents';

type ViewMode = 'bills' | 'transactions' | 'overview' | 'assets' | 'liabilities' | 'networth';

const STORAGE_KEYS = {
  bills: 'pnx_bills',
  transactions: 'pnx_transactions',
  events: 'pnx_events',
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

interface FinancialProps {
  selectedBillId?: string;
  initialView?: string;
}

export function Financial({ selectedBillId, initialView }: FinancialProps) {
  const { organization } = useAuth();
  const { refresh } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>((initialView as ViewMode) || 'overview');
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddLiabilityModal, setShowAddLiabilityModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);

  useEffect(() => {
    if (organization) {
      loadFinancialData();
    }
  }, [organization]);

  useEffect(() => {
    if (initialView) {
      setViewMode((initialView as ViewMode) || 'overview');
    }
  }, [initialView]);

  useEffect(() => {
    if (selectedBillId && bills.length > 0) {
      const bill = bills.find(b => b.id === selectedBillId);
      if (bill) {
        setViewMode('bills');
        setSelectedBill(bill);
      }
    }
  }, [selectedBillId, bills]);

  const loadFinancialData = () => {
    setLoading(true);
    const orgId = organization?.id || '1';

    const allBills = loadFromLocalStorage<Bill>(STORAGE_KEYS.bills);
    const allTransactions = loadFromLocalStorage<Transaction>(STORAGE_KEYS.transactions);
    const allAssets = loadFromLocalStorage<Asset>(STORAGE_KEYS.assets);
    const allLiabilities = loadFromLocalStorage<Liability>(STORAGE_KEYS.liabilities);

    setBills(allBills.filter(b => b.organization_id === orgId));
    setTransactions(allTransactions.filter(t => t.organization_id === orgId));
    setAssets(allAssets.filter(a => a.organization_id === orgId));
    setLiabilities(allLiabilities.filter(l => l.organization_id === orgId));
    setLoading(false);
  };

  const markBillPaid = (billId: string) => {
    const allBills = loadFromLocalStorage<Bill>(STORAGE_KEYS.bills);
    const updatedBills = allBills.map(bill =>
      bill.id === billId
        ? {
            ...bill,
            status: 'paid' as const,
            paid_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString(),
          }
        : bill
    );
    saveToLocalStorage(STORAGE_KEYS.bills, updatedBills);
    loadFinancialData();
    refresh();
  };

  const handlePayNow = (bill: Bill) => {
    if (bill.payment_url) {
      window.open(bill.payment_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddToCalendar = (bill: Bill) => {
    const allEvents = loadFromLocalStorage<CalendarEvent>(STORAGE_KEYS.events);
    const newEvent: CalendarEvent = {
      id: `event-bill-${bill.id}-${Date.now()}`,
      organization_id: bill.organization_id,
      title: `Pay: ${bill.title}`,
      description: `Bill payment due to ${bill.payee}`,
      date: bill.due_date,
      event_type: 'reminder',
      all_day: true,
      notes: `Amount: $${bill.amount.toFixed(2)}`,
      source_bill_id: bill.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allEvents.push(newEvent);
    saveToLocalStorage(STORAGE_KEYS.events, allEvents);
    refresh();
    alert('Bill added to calendar!');
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const upcomingBillsTotal = bills
    .filter(b => b.status === 'upcoming')
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const totalAssets = assets.reduce((sum, a) => sum + Number(a.value), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + Number(l.value), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial</h1>
        <div className="flex gap-2">
          {viewMode === 'bills' && (
            <button
              onClick={() => setShowAddBillModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Bill</span>
            </button>
          )}
          {viewMode === 'transactions' && (
            <button
              onClick={() => setShowAddTransactionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Transaction</span>
            </button>
          )}
          {viewMode === 'assets' && (
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Asset</span>
            </button>
          )}
          {viewMode === 'liabilities' && (
            <button
              onClick={() => setShowAddLiabilityModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Liability</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setViewMode('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('networth')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'networth'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Net Worth
        </button>
        <button
          onClick={() => setViewMode('bills')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'bills'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Bills
        </button>
        <button
          onClick={() => setViewMode('transactions')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'transactions'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setViewMode('assets')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'assets'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Assets
        </button>
        <button
          onClick={() => setViewMode('liabilities')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'liabilities'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Liabilities
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading financial data...</p>
        </div>
      ) : (
        <>
          {viewMode === 'overview' && (
            <OverviewView
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              upcomingBillsTotal={upcomingBillsTotal}
              recentTransactions={transactions.slice(0, 5)}
              upcomingBills={bills.filter(b => b.status === 'upcoming').slice(0, 5)}
              onMarkBillPaid={markBillPaid}
              onPayNow={handlePayNow}
              onViewBill={setSelectedBill}
            />
          )}

          {viewMode === 'bills' && (
            <BillsView
              bills={bills}
              onMarkPaid={markBillPaid}
              onPayNow={handlePayNow}
              onViewBill={setSelectedBill}
            />
          )}

          {viewMode === 'transactions' && (
            <TransactionsView transactions={transactions} onViewTransaction={setSelectedTransaction} />
          )}

          {viewMode === 'assets' && (
            <AssetsView assets={assets} onViewAsset={setSelectedAsset} />
          )}

          {viewMode === 'liabilities' && (
            <LiabilitiesView liabilities={liabilities} onViewLiability={setSelectedLiability} />
          )}

          {viewMode === 'networth' && (
            <NetWorthView
              netWorth={netWorth}
              assets={assets}
              liabilities={liabilities}
              onViewAsset={setSelectedAsset}
              onViewLiability={setSelectedLiability}
            />
          )}
        </>
      )}

      {showAddBillModal && (
        <AddBillModal
          onClose={() => setShowAddBillModal(false)}
          onSuccess={() => {
            setShowAddBillModal(false);
            loadFinancialData();
            refresh();
          }}
        />
      )}

      {showAddTransactionModal && (
        <AddTransactionModal
          onClose={() => setShowAddTransactionModal(false)}
          onSuccess={() => {
            setShowAddTransactionModal(false);
            loadFinancialData();
            refresh();
          }}
        />
      )}

      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onMarkPaid={markBillPaid}
          onPayNow={handlePayNow}
          onAddToCalendar={handleAddToCalendar}
        />
      )}

      {showAddAssetModal && (
        <AddAssetModal
          onClose={() => setShowAddAssetModal(false)}
          onSuccess={() => {
            setShowAddAssetModal(false);
            loadFinancialData();
            refresh();
          }}
        />
      )}

      {showAddLiabilityModal && (
        <AddLiabilityModal
          onClose={() => setShowAddLiabilityModal(false)}
          onSuccess={() => {
            setShowAddLiabilityModal(false);
            loadFinancialData();
            refresh();
          }}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={() => {
            loadFinancialData();
            refresh();
          }}
        />
      )}

      {selectedLiability && (
        <LiabilityDetailModal
          liability={selectedLiability}
          onClose={() => setSelectedLiability(null)}
          onUpdate={() => {
            loadFinancialData();
            refresh();
          }}
        />
      )}
    </div>
  );
}

interface OverviewViewProps {
  totalIncome: number;
  totalExpenses: number;
  upcomingBillsTotal: number;
  recentTransactions: Transaction[];
  upcomingBills: Bill[];
  onMarkBillPaid: (id: string) => void;
  onPayNow: (bill: Bill) => void;
  onViewBill: (bill: Bill) => void;
}

function OverviewView({
  totalIncome,
  totalExpenses,
  upcomingBillsTotal,
  recentTransactions,
  upcomingBills,
  onMarkBillPaid,
  onPayNow,
  onViewBill,
}: OverviewViewProps) {
  const netCashFlow = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Total Income</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-800">Total Expenses</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">${totalExpenses.toFixed(2)}</p>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-6 border ${
          netCashFlow >= 0
            ? 'from-blue-50 to-blue-100 border-blue-200'
            : 'from-orange-50 to-orange-100 border-orange-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${netCashFlow >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              Net Cash Flow
            </span>
            <DollarSign className={`w-5 h-5 ${netCashFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            ${Math.abs(netCashFlow).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Bills</h3>
          {upcomingBills.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming bills</p>
          ) : (
            <div className="space-y-3">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 cursor-pointer" onClick={() => onViewBill(bill)}>
                    <p className="font-medium text-gray-900">{bill.title}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">${Number(bill.amount).toFixed(2)}</span>
                    {bill.payment_url && (
                      <button
                        onClick={() => onPayNow(bill)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Pay Now"
                      >
                        <CreditCard className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onMarkBillPaid(bill.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark Paid"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Total Upcoming: <span className="font-bold text-gray-900">${upcomingBillsTotal.toFixed(2)}</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent transactions</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{transaction.title}</p>
                      <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BillsViewProps {
  bills: Bill[];
  onMarkPaid: (id: string) => void;
  onPayNow: (bill: Bill) => void;
  onViewBill: (bill: Bill) => void;
}

function BillsView({ bills, onMarkPaid, onPayNow, onViewBill }: BillsViewProps) {
  const upcomingBills = bills.filter(b => b.status === 'upcoming');
  const overdueBills = bills.filter(b => b.status === 'overdue');
  const paidBills = bills.filter(b => b.status === 'paid');

  return (
    <div className="space-y-6">
      {overdueBills.length > 0 && (
        <div className="bg-white rounded-xl border border-red-300 p-6">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Overdue Bills
          </h3>
          <div className="space-y-3">
            {overdueBills.map((bill) => (
              <div key={bill.id} className="flex items-start justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex-1 cursor-pointer" onClick={() => onViewBill(bill)}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">{bill.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Payee: {bill.payee}</p>
                  <p className="text-sm text-red-600 font-medium">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                  {bill.frequency && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {bill.frequency}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">${Number(bill.amount).toFixed(2)}</span>
                  {bill.payment_url && (
                    <button
                      onClick={() => onPayNow(bill)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Pay Now</span>
                    </button>
                  )}
                  <button
                    onClick={() => onMarkPaid(bill.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Mark Paid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Bills</h3>
        {upcomingBills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming bills</p>
        ) : (
          <div className="space-y-3">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 cursor-pointer" onClick={() => onViewBill(bill)}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <p className="font-bold text-gray-900">{bill.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Payee: {bill.payee}</p>
                  <p className="text-sm text-gray-600">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                  {bill.frequency && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {bill.frequency}
                    </span>
                  )}
                  {bill.notes && <p className="text-sm text-gray-500 mt-2">{bill.notes}</p>}
                  <ProofLinks entityType="bill" entityId={bill.id} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">${Number(bill.amount).toFixed(2)}</span>
                  {bill.payment_url && (
                    <button
                      onClick={() => onPayNow(bill)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Pay Now</span>
                    </button>
                  )}
                  <button
                    onClick={() => onMarkPaid(bill.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Mark Paid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Paid Bills</h3>
        {paidBills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No paid bills</p>
        ) : (
          <div className="space-y-3">
            {paidBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg cursor-pointer" onClick={() => onViewBill(bill)}>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{bill.title}</p>
                  <p className="text-sm text-gray-600">Payee: {bill.payee}</p>
                  <p className="text-sm text-gray-600">
                    Paid on: {bill.paid_date ? new Date(bill.paid_date).toLocaleDateString() : 'N/A'}
                  </p>
                  <ProofLinks entityType="bill" entityId={bill.id} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">${Number(bill.amount).toFixed(2)}</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface TransactionsViewProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
}

function TransactionsView({ transactions, onViewTransaction }: TransactionsViewProps) {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">All Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => onViewTransaction(transaction)}
                className="w-full flex items-start justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {transaction.type === 'income' ? (
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{transaction.title}</p>
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                    <p className="text-sm text-gray-500 mt-1">{transaction.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</span>
                      {transaction.payment_method && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {transaction.payment_method}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    <ProofLinks entityType="transaction" entityId={transaction.id} />
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Income Summary</h3>
          <p className="text-3xl font-bold text-green-600 mb-4">
            ${incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">{incomeTransactions.length} income transactions</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Summary</h3>
          <p className="text-3xl font-bold text-red-600 mb-4">
            ${expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">{expenseTransactions.length} expense transactions</p>
        </div>
      </div>
    </div>
  );
}

interface BillDetailModalProps {
  bill: Bill;
  onClose: () => void;
  onMarkPaid: (id: string) => void;
  onPayNow: (bill: Bill) => void;
  onAddToCalendar: (bill: Bill) => void;
}

function BillDetailModal({ bill, onClose, onMarkPaid, onPayNow, onAddToCalendar }: BillDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Bill Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Bill Name</label>
              <p className="text-lg font-bold text-gray-900">{bill.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Payee</label>
              <p className="text-lg font-bold text-gray-900">{bill.payee}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
              <p className="text-2xl font-bold text-gray-900">${Number(bill.amount).toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Due Date</label>
              <p className="text-lg font-bold text-gray-900">{new Date(bill.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Frequency</label>
              <p className="text-lg text-gray-900">{bill.frequency || 'One-time'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                bill.status === 'paid'
                  ? 'bg-green-100 text-green-800'
                  : bill.status === 'overdue'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {bill.status}
              </span>
            </div>
          </div>

          {bill.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
              <p className="text-gray-900">{bill.notes}</p>
            </div>
          )}

          {bill.paid_date && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Paid On</label>
              <p className="text-lg text-gray-900">{new Date(bill.paid_date).toLocaleDateString()}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              {bill.payment_url && bill.status !== 'paid' && (
                <button
                  onClick={() => onPayNow(bill)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Pay Now
                </button>
              )}
              {bill.status !== 'paid' && (
                <button
                  onClick={() => {
                    onMarkPaid(bill.id);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Paid
                </button>
              )}
              <button
                onClick={() => {
                  onAddToCalendar(bill);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Add to Calendar
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Proof Documents</h3>
            <ProofLinks entityType="bill" entityId={bill.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddBillModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddBillModal({ onClose, onSuccess }: AddBillModalProps) {
  const { organization } = useAuth();
  const [title, setTitle] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState('');
  const [category, setCategory] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const allBills = loadFromLocalStorage<Bill>(STORAGE_KEYS.bills);
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      organization_id: organization?.id || '1',
      title,
      payee,
      amount: parseFloat(amount),
      due_date: dueDate,
      frequency: frequency || undefined,
      status: 'upcoming',
      category,
      recurring,
      recurring_frequency: recurring ? frequency : undefined,
      payment_url: paymentUrl || undefined,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allBills.push(newBill);
    saveToLocalStorage(STORAGE_KEYS.bills, allBills);

    setSaving(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Bill</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill Name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Electric Bill"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payee *</label>
            <input
              type="text"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              required
              placeholder="e.g., Power Company"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                placeholder="e.g., Utilities"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g., monthly, quarterly"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment URL</label>
            <input
              type="url"
              value={paymentUrl}
              onChange={(e) => setPaymentUrl(e.target.value)}
              placeholder="https://example.com/pay"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
              Recurring Bill
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Bill'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddTransactionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddTransactionModal({ onClose, onSuccess }: AddTransactionModalProps) {
  const { organization } = useAuth();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const allTransactions = loadFromLocalStorage<Transaction>(STORAGE_KEYS.transactions);
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      organization_id: organization?.id || '1',
      title,
      amount: parseFloat(amount),
      type,
      category,
      date,
      payment_method: paymentMethod || undefined,
      description,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    allTransactions.push(newTransaction);
    saveToLocalStorage(STORAGE_KEYS.transactions, allTransactions);

    setSaving(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g., Credit Card, Bank Transfer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Transaction'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
