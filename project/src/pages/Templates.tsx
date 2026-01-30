import { useState, useEffect } from 'react';
import { FileText, Plus, Download, CheckCircle, X, FileCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGating } from '../hooks/useFeatureGating';
import { Template, PacketDraft } from '../types';
import { ProofLinks } from '../components/ProofLinks';

const STORAGE_KEY = 'pnx_packet_drafts';

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

const TEMPLATE_LIBRARY: Template[] = [
  {
    id: 'loan-app-1',
    name: 'Loan Application Packet',
    type: 'loan',
    description: 'Complete loan application with financial documentation',
    sections: [
      {
        id: 'personal-info',
        title: 'Personal Information',
        fields: [
          { id: 'full_name', label: 'Full Name', type: 'text', required: true, prefill_source: 'profile', prefill_path: 'name' },
          { id: 'email', label: 'Email', type: 'text', required: true, prefill_source: 'profile', prefill_path: 'email' },
          { id: 'phone', label: 'Phone', type: 'text', required: true },
          { id: 'address', label: 'Address', type: 'textarea', required: true },
        ],
        evidence_checklist: ['Government-issued ID', 'Proof of residence'],
      },
      {
        id: 'financial-info',
        title: 'Financial Information',
        fields: [
          { id: 'annual_income', label: 'Annual Income', type: 'number', required: true },
          { id: 'employment_status', label: 'Employment Status', type: 'select', required: true, options: ['Employed', 'Self-Employed', 'Retired', 'Unemployed'] },
          { id: 'loan_amount', label: 'Loan Amount Requested', type: 'number', required: true },
          { id: 'loan_purpose', label: 'Loan Purpose', type: 'textarea', required: true },
        ],
        evidence_checklist: ['Recent pay stubs', 'Bank statements (3 months)', 'Tax returns (2 years)'],
      },
      {
        id: 'assets-liabilities',
        title: 'Assets and Liabilities',
        fields: [
          { id: 'total_assets', label: 'Total Assets', type: 'number', required: true, prefill_source: 'financial', prefill_path: 'assets' },
          { id: 'total_liabilities', label: 'Total Liabilities', type: 'number', required: true, prefill_source: 'financial', prefill_path: 'liabilities' },
          { id: 'net_worth', label: 'Net Worth', type: 'number', required: false, prefill_source: 'financial', prefill_path: 'networth' },
        ],
        evidence_checklist: ['Asset documentation', 'Liability statements'],
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'grant-app-1',
    name: 'Grant Application Packet',
    type: 'grant',
    description: 'Grant application with project details and budget',
    sections: [
      {
        id: 'applicant-info',
        title: 'Applicant Information',
        fields: [
          { id: 'org_name', label: 'Organization Name', type: 'text', required: true },
          { id: 'contact_name', label: 'Contact Name', type: 'text', required: true, prefill_source: 'profile', prefill_path: 'name' },
          { id: 'contact_email', label: 'Contact Email', type: 'text', required: true, prefill_source: 'profile', prefill_path: 'email' },
          { id: 'tax_id', label: 'Tax ID', type: 'text', required: true },
        ],
        evidence_checklist: ['501(c)(3) determination letter', 'Articles of incorporation'],
      },
      {
        id: 'project-info',
        title: 'Project Information',
        fields: [
          { id: 'project_title', label: 'Project Title', type: 'text', required: true },
          { id: 'project_description', label: 'Project Description', type: 'textarea', required: true },
          { id: 'grant_amount', label: 'Grant Amount Requested', type: 'number', required: true },
          { id: 'project_duration', label: 'Project Duration (months)', type: 'number', required: true },
        ],
        evidence_checklist: ['Project budget', 'Timeline', 'Letters of support'],
      },
      {
        id: 'budget',
        title: 'Budget Information',
        fields: [
          { id: 'personnel_costs', label: 'Personnel Costs', type: 'number', required: true },
          { id: 'equipment_costs', label: 'Equipment Costs', type: 'number', required: true },
          { id: 'other_costs', label: 'Other Costs', type: 'number', required: true },
        ],
        evidence_checklist: ['Detailed budget breakdown', 'Cost justification'],
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tax-credit-1',
    name: 'Tax Credit Support Packet',
    type: 'tax_credit',
    description: 'Documentation for tax credit applications',
    sections: [
      {
        id: 'taxpayer-info',
        title: 'Taxpayer Information',
        fields: [
          { id: 'taxpayer_name', label: 'Taxpayer Name', type: 'text', required: true, prefill_source: 'profile', prefill_path: 'name' },
          { id: 'ssn_ein', label: 'SSN/EIN', type: 'text', required: true },
          { id: 'tax_year', label: 'Tax Year', type: 'number', required: true },
          { id: 'filing_status', label: 'Filing Status', type: 'select', required: true, options: ['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household'] },
        ],
        evidence_checklist: ['Previous tax returns', 'W-2 forms', '1099 forms'],
      },
      {
        id: 'credit-info',
        title: 'Credit Information',
        fields: [
          { id: 'credit_type', label: 'Credit Type', type: 'text', required: true },
          { id: 'credit_amount', label: 'Credit Amount', type: 'number', required: true },
          { id: 'qualification_basis', label: 'Qualification Basis', type: 'textarea', required: true },
        ],
        evidence_checklist: ['Qualifying expenses', 'Supporting receipts', 'Certification documents'],
      },
      {
        id: 'financial-summary',
        title: 'Financial Summary',
        fields: [
          { id: 'total_income', label: 'Total Income', type: 'number', required: true, prefill_source: 'financial', prefill_path: 'income' },
          { id: 'total_expenses', label: 'Total Expenses', type: 'number', required: true, prefill_source: 'financial', prefill_path: 'expenses' },
        ],
        evidence_checklist: ['Income statements', 'Expense documentation'],
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function Templates() {
  const { organization } = useAuth();
  const { hasFeature } = useFeatureGating();
  const [drafts, setDrafts] = useState<PacketDraft[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<PacketDraft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      loadDrafts();
    }
  }, [organization]);

  const loadDrafts = () => {
    setLoading(true);
    const orgId = organization?.id || '1';
    const allDrafts = loadFromLocalStorage<PacketDraft>(STORAGE_KEY);
    setDrafts(allDrafts.filter(d => d.organization_id === orgId));
    setLoading(false);
  };

  const createDraftFromTemplate = (template: Template) => {
    const prefillData = prefillTemplateData(template);
    const evidenceChecklist: Record<string, boolean> = {};
    template.sections.forEach(section => {
      section.evidence_checklist.forEach(item => {
        evidenceChecklist[item] = false;
      });
    });

    const newDraft: PacketDraft = {
      id: `draft-${Date.now()}`,
      organization_id: organization?.id || '1',
      template_id: template.id,
      template_name: template.name,
      template_type: template.type,
      data: prefillData,
      attached_documents: [],
      evidence_checklist: evidenceChecklist,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allDrafts = loadFromLocalStorage<PacketDraft>(STORAGE_KEY);
    allDrafts.push(newDraft);
    saveToLocalStorage(STORAGE_KEY, allDrafts);
    loadDrafts();
    setSelectedDraft(newDraft);
    setSelectedTemplate(template);
  };

  const prefillTemplateData = (template: Template): Record<string, any> => {
    const data: Record<string, any> = {};
    const userProfile = JSON.parse(localStorage.getItem('pnx_user_profile') || '{}');
    const assets = loadFromLocalStorage('pnx_assets');
    const liabilities = loadFromLocalStorage('pnx_liabilities');
    const transactions = loadFromLocalStorage('pnx_transactions');

    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.prefill_source === 'profile' && field.prefill_path) {
          data[field.id] = userProfile[field.prefill_path] || '';
        } else if (field.prefill_source === 'financial' && field.prefill_path) {
          if (field.prefill_path === 'assets') {
            data[field.id] = assets.reduce((sum: number, a: any) => sum + Number(a.value), 0);
          } else if (field.prefill_path === 'liabilities') {
            data[field.id] = liabilities.reduce((sum: number, l: any) => sum + Number(l.value), 0);
          } else if (field.prefill_path === 'networth') {
            const totalAssets = assets.reduce((sum: number, a: any) => sum + Number(a.value), 0);
            const totalLiabilities = liabilities.reduce((sum: number, l: any) => sum + Number(l.value), 0);
            data[field.id] = totalAssets - totalLiabilities;
          } else if (field.prefill_path === 'income') {
            data[field.id] = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
          } else if (field.prefill_path === 'expenses') {
            data[field.id] = transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
          }
        } else {
          data[field.id] = field.value || '';
        }
      });
    });

    return data;
  };

  const exportToPDF = () => {
    window.print();
  };

  if (!hasFeature('templates')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <FileText className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Templates Feature Not Available</h2>
          <p className="text-gray-600 mb-4">Upgrade to Professional or Business plan to access packet templates.</p>
        </div>
      </div>
    );
  }

  if (selectedDraft && selectedTemplate) {
    return <PacketBuilder draft={selectedDraft} template={selectedTemplate} onClose={() => { setSelectedDraft(null); setSelectedTemplate(null); loadDrafts(); }} onExportPDF={exportToPDF} />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Templates & Packets</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Template Library</h2>
          <div className="space-y-3">
            {TEMPLATE_LIBRARY.map(template => (
              <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{template.sections.length} sections</p>
                  </div>
                  <button
                    onClick={() => createDraftFromTemplate(template)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Create</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Packet Drafts</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : drafts.length === 0 ? (
            <p className="text-gray-500">No drafts yet. Create a packet from a template.</p>
          ) : (
            <div className="space-y-3">
              {drafts.map(draft => {
                const template = TEMPLATE_LIBRARY.find(t => t.id === draft.template_id);
                return (
                  <button
                    key={draft.id}
                    onClick={() => {
                      setSelectedDraft(draft);
                      setSelectedTemplate(template || null);
                    }}
                    className="w-full bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{draft.template_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">Status: {draft.status}</p>
                        <p className="text-xs text-gray-500 mt-1">Created: {new Date(draft.created_at).toLocaleDateString()}</p>
                      </div>
                      <FileCheck className={`w-5 h-5 ${draft.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PacketBuilderProps {
  draft: PacketDraft;
  template: Template;
  onClose: () => void;
  onExportPDF: () => void;
}

function PacketBuilder({ draft, template, onClose, onExportPDF }: PacketBuilderProps) {
  const [data, setData] = useState(draft.data);
  const [evidenceChecklist, setEvidenceChecklist] = useState(draft.evidence_checklist);
  const [saving, setSaving] = useState(false);

  const updateField = (fieldId: string, value: any) => {
    setData(prev => ({ ...prev, [fieldId]: value }));
  };

  const toggleEvidence = (item: string) => {
    setEvidenceChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const saveDraft = () => {
    setSaving(true);
    const allDrafts = loadFromLocalStorage<PacketDraft>(STORAGE_KEY);
    const updatedDrafts = allDrafts.map(d =>
      d.id === draft.id
        ? { ...d, data, evidence_checklist: evidenceChecklist, updated_at: new Date().toISOString() }
        : d
    );
    saveToLocalStorage(STORAGE_KEY, updatedDrafts);
    setSaving(false);
  };

  const completeDraft = () => {
    const allDrafts = loadFromLocalStorage<PacketDraft>(STORAGE_KEY);
    const updatedDrafts = allDrafts.map(d =>
      d.id === draft.id
        ? { ...d, data, evidence_checklist: evidenceChecklist, status: 'completed' as const, updated_at: new Date().toISOString() }
        : d
    );
    saveToLocalStorage(STORAGE_KEY, updatedDrafts);
    onClose();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
        <div className="flex gap-2">
          <button onClick={onExportPDF} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button onClick={saveDraft} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={completeDraft} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Complete</span>
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {template.sections.map(section => (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-600">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={data[field.id] || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        required={field.required}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={data[field.id] || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        required={field.required}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={data[field.id] || ''}
                        onChange={(e) => updateField(field.id, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        required={field.required}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 print:hidden">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Evidence Checklist</h3>
            <div className="space-y-3">
              {template.sections.map(section => (
                <div key={section.id}>
                  <p className="text-sm font-semibold text-gray-700 mb-2">{section.title}</p>
                  {section.evidence_checklist.map(item => (
                    <label key={item} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={evidenceChecklist[item] || false}
                        onChange={() => toggleEvidence(item)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attached Documents</h3>
            <ProofLinks entityType="recommendation" entityId={draft.id} />
            <p className="text-xs text-gray-500 mt-2">Attach proof documents from your Documents page</p>
          </div>
        </div>
      </div>
    </div>
  );
}
