import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Document, Bill, Transaction, Task, CalendarEvent, LegalCase, Recommendation } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  documents: Document[];
  bills: Bill[];
  transactions: Transaction[];
  tasks: Task[];
  events: CalendarEvent[];
  cases: LegalCase[];
  recommendations: Recommendation[];
  loading: boolean;
  refresh: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  documents: 'pnx_documents',
  bills: 'pnx_bills',
  transactions: 'pnx_transactions',
  tasks: 'pnx_tasks',
  events: 'pnx_events',
  cases: 'pnx_cases',
  recommendations: 'pnx_recommendations',
};

function loadFromLocalStorage<T>(key: string, orgId: string): T[] {
  try {
    if (!localStorage?.getItem) return [];
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const allData = JSON.parse(stored) as T[];
    if (!Array.isArray(allData)) return [];
    return allData.filter((item: any) => item?.organization_id === orgId || item?.organizationId === orgId);
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return [];
  }
}

function seedMockData(orgId: string) {
  if (!localStorage?.getItem || !localStorage?.setItem) return;

  const keys = Object.values(STORAGE_KEYS);
  const hasAnyData = keys.some(key => {
    const stored = localStorage.getItem(key);
    if (!stored) return false;
    try {
      const data = JSON.parse(stored);
      return Array.isArray(data) && data.some((item: any) =>
        item?.organization_id === orgId || item?.organizationId === orgId
      );
    } catch {
      return false;
    }
  });

  if (hasAnyData) return;

  const mockDocuments: Document[] = [
    {
      id: 'doc-1',
      title: 'January Invoice',
      type: 'Invoice',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Financial',
      summary: 'Monthly service invoice',
      status: 'Needs Review',
      tags: ['billing', 'monthly'],
      organizationId: orgId,
    },
    {
      id: 'doc-2',
      title: 'Tax Form W-2',
      type: 'Tax Document',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Tax',
      summary: 'Annual W-2 form',
      status: 'Approved',
      tags: ['tax', 'important'],
      organizationId: orgId,
    },
  ];

  const mockBills: Bill[] = [
    {
      id: 'bill-1',
      organization_id: orgId,
      title: 'Electric Bill',
      payee: 'City Power & Light',
      amount: 125.50,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      frequency: 'monthly',
      status: 'upcoming',
      category: 'Utilities',
      recurring: true,
      recurring_frequency: 'monthly',
      payment_url: 'https://example.com/pay/electric',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bill-2',
      organization_id: orgId,
      title: 'Internet Service',
      payee: 'FastNet ISP',
      amount: 79.99,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      frequency: 'monthly',
      status: 'upcoming',
      category: 'Utilities',
      recurring: true,
      recurring_frequency: 'monthly',
      payment_url: 'https://example.com/pay/internet',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'txn-1',
      organization_id: orgId,
      title: 'Client Payment',
      amount: 2500.00,
      type: 'income',
      category: 'Revenue',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      payment_method: 'Bank Transfer',
      description: 'Monthly retainer payment',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'txn-2',
      organization_id: orgId,
      title: 'Office Supplies',
      amount: 150.00,
      type: 'expense',
      category: 'Operating Expenses',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'completed',
      payment_method: 'Credit Card',
      description: 'Paper, pens, and supplies',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      organization_id: orgId,
      title: 'Review Q1 Financials',
      description: 'Prepare quarterly financial review',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      priority: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-2',
      organization_id: orgId,
      title: 'File Tax Extension',
      description: 'Submit extension request for business taxes',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'in_progress',
      priority: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockEvents: CalendarEvent[] = [
    {
      id: 'event-1',
      organization_id: orgId,
      title: 'Client Meeting',
      description: 'Quarterly business review',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00',
      end_time: '15:00',
      event_type: 'meeting',
      all_day: false,
      notes: 'Prepare presentation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'event-2',
      organization_id: orgId,
      title: 'Tax Filing Deadline',
      description: 'Submit business tax returns',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      event_type: 'deadline',
      all_day: true,
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockCases: LegalCase[] = [
    {
      id: 'case-1',
      organization_id: orgId,
      title: 'Contract Review',
      case_type: 'business',
      status: 'active',
      description: 'Review and negotiate vendor contract',
      attorney_name: 'Sarah Johnson',
      attorney_contact: 'sarah@lawfirm.com',
      notes: 'Negotiating payment terms',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec-1',
      title: 'Reduce Utility Costs',
      type: 'savings',
      explanation: 'Your utility bills have increased 15% this quarter. Consider energy audit.',
      status: 'new',
      organizationId: orgId,
    },
    {
      id: 'rec-2',
      title: 'Upcoming Tax Deadline',
      type: 'alert',
      explanation: 'Q1 estimated taxes due in 30 days. Review payment schedule.',
      status: 'new',
      organizationId: orgId,
    },
  ];

  localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(mockDocuments));
  localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(mockBills));
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(mockTransactions));
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(mockEvents));
  localStorage.setItem(STORAGE_KEYS.cases, JSON.stringify(mockCases));
  localStorage.setItem(STORAGE_KEYS.recommendations, JSON.stringify(mockRecommendations));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { organization } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = () => {
    if (!organization) {
      setLoading(false);
      return;
    }

    const orgId = organization.id;
    seedMockData(orgId);

    setDocuments(loadFromLocalStorage<Document>(STORAGE_KEYS.documents, orgId));
    setBills(loadFromLocalStorage<Bill>(STORAGE_KEYS.bills, orgId));
    setTransactions(loadFromLocalStorage<Transaction>(STORAGE_KEYS.transactions, orgId));
    setTasks(loadFromLocalStorage<Task>(STORAGE_KEYS.tasks, orgId));
    setEvents(loadFromLocalStorage<CalendarEvent>(STORAGE_KEYS.events, orgId));
    setCases(loadFromLocalStorage<LegalCase>(STORAGE_KEYS.cases, orgId));
    setRecommendations(loadFromLocalStorage<Recommendation>(STORAGE_KEYS.recommendations, orgId));

    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [organization]);

  const value: DataContextType = {
    documents,
    bills,
    transactions,
    tasks,
    events,
    cases,
    recommendations,
    loading,
    refresh: loadAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
