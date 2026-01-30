import { useState, useEffect } from 'react';
import { TrendingUp, Plus, CheckSquare, AlertTriangle, BookOpen, ExternalLink, Lock, ChevronRight, X, DollarSign, Target, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGating } from '../hooks/useFeatureGating';
import { FinancialAdvicePlan, FinancialRiskFlag, FinancialCitation, FinancialAssumption, ActionChecklistItem } from '../types';

const STORAGE_KEY = 'pnx_financial_plans';

function saveToLocalStorage(data: FinancialAdvicePlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage(): FinancialAdvicePlan[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const PLAN_CATEGORIES = [
  { id: 'savings', name: 'Savings Plan', color: 'green', icon: DollarSign },
  { id: 'investment', name: 'Investment Strategy', color: 'blue', icon: TrendingUp },
  { id: 'debt_management', name: 'Debt Management', color: 'red', icon: Target },
  { id: 'insurance', name: 'Insurance Coverage', color: 'purple', icon: Shield },
  { id: 'retirement', name: 'Retirement Planning', color: 'indigo', icon: Target },
  { id: 'tax_optimization', name: 'Tax Optimization', color: 'yellow', icon: DollarSign },
];

export function FinancialAdvisor() {
  const { user, organization } = useAuth();
  const { hasFeature } = useFeatureGating();
  const [plans, setPlans] = useState<FinancialAdvicePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<FinancialAdvicePlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  const loadData = () => {
    const loadedPlans = loadFromLocalStorage();
    setPlans(loadedPlans);
  };

  const createPlan = (data: Partial<FinancialAdvicePlan>) => {
    const newPlan: FinancialAdvicePlan = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: organization?.id || '',
      name: data.name || 'Untitled Plan',
      description: data.description || '',
      category: data.category || 'savings',
      status: 'draft',
      rationale: data.rationale || '',
      citations: data.citations || [],
      assumptions: data.assumptions || [],
      risk_flags: data.risk_flags || [],
      action_checklist: data.action_checklist || [],
      estimated_savings: data.estimated_savings,
      timeframe: data.timeframe,
      confidence_level: data.confidence_level || 'medium',
      template_url: data.template_url,
      submission_url: data.submission_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user?.id || '',
    };

    const updated = [...plans, newPlan];
    setPlans(updated);
    saveToLocalStorage(updated);
    setShowCreateModal(false);
  };

  const updatePlan = (id: string, updates: Partial<FinancialAdvicePlan>) => {
    const updated = plans.map(p =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    setPlans(updated);
    saveToLocalStorage(updated);
    if (selectedPlan?.id === id) {
      setSelectedPlan(updated.find(p => p.id === id) || null);
    }
  };

  if (!hasFeature('financial_advisor')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Lock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Financial Advisor Mode Not Available</h2>
          <p className="text-gray-600 mb-4">Upgrade to Business plan to access Financial Advisor Mode with structured savings and optimization plans.</p>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <PlanDetail
        plan={selectedPlan}
        onBack={() => setSelectedPlan(null)}
        onUpdate={updatePlan}
      />
    );
  }

  const filteredPlans = plans.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const draftCount = plans.filter(p => p.status === 'draft').length;
  const activeCount = plans.filter(p => p.status === 'active').length;
  const completedCount = plans.filter(p => p.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Advisor Mode</h1>
          <p className="text-gray-600 mt-1">Structured savings & optimization plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Plans</span>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{plans.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Draft</span>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-600">{draftCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckSquare className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{activeCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completed</span>
            <CheckSquare className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({plans.length})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'draft'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Draft ({draftCount})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-green-100 text-green-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        <div className="p-6">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all'
                  ? 'No financial plans yet.'
                  : `No ${filterStatus} plans.`}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onClick={() => setSelectedPlan(plan)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createPlan}
        />
      )}
    </div>
  );
}

interface PlanCardProps {
  plan: FinancialAdvicePlan;
  onClick: () => void;
}

function PlanCard({ plan, onClick }: PlanCardProps) {
  const category = PLAN_CATEGORIES.find(c => c.id === plan.category);
  const CategoryIcon = category?.icon || TrendingUp;
  const actionsComplete = plan.action_checklist.filter(a => a.completed).length;
  const actionsTotal = plan.action_checklist.length;
  const highPriorityActions = plan.action_checklist.filter(a => !a.completed && a.priority === 'high').length;

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-5 hover:shadow-md cursor-pointer transition-all bg-white"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg bg-${category?.color}-100`}>
            <CategoryIcon className={`w-6 h-6 text-${category?.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              plan.status === 'completed' ? 'bg-green-100 text-green-800' :
              plan.status === 'active' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {plan.status}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>

      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

      <div className="flex items-center gap-4 text-sm mb-3">
        {plan.estimated_savings && (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <DollarSign className="w-4 h-4" />
            <span>{plan.estimated_savings}</span>
          </span>
        )}
        {plan.timeframe && (
          <span className="text-gray-600">{plan.timeframe}</span>
        )}
        {actionsTotal > 0 && (
          <span className="flex items-center gap-1 text-gray-600">
            <CheckSquare className="w-4 h-4" />
            <span>{actionsComplete}/{actionsTotal}</span>
          </span>
        )}
      </div>

      {highPriorityActions > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">{highPriorityActions} high priority action{highPriorityActions !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}

interface CreatePlanModalProps {
  onClose: () => void;
  onCreate: (data: Partial<FinancialAdvicePlan>) => void;
}

function CreatePlanModal({ onClose, onCreate }: CreatePlanModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FinancialAdvicePlan>>({
    name: '',
    description: '',
    category: 'savings',
    rationale: '',
    estimated_savings: '',
    timeframe: '',
    confidence_level: 'medium',
    citations: [],
    assumptions: [],
    risk_flags: [],
    action_checklist: [],
    template_url: '',
    submission_url: '',
  });

  const handleSubmit = () => {
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Financial Plan</h2>
            <p className="text-sm text-gray-600">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <Step1Basic formData={formData} setFormData={setFormData} onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <Step2Analysis formData={formData} setFormData={setFormData} onBack={() => setStep(1)} onNext={() => setStep(3)} />
        )}

        {step === 3 && (
          <Step3Actions formData={formData} setFormData={setFormData} onBack={() => setStep(2)} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}

function Step1Basic({ formData, setFormData, onNext }: any) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Emergency Fund Strategy"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this financial plan..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {PLAN_CATEGORIES.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setFormData({ ...formData, category: category.id })}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    formData.category === category.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Savings</label>
            <input
              type="text"
              value={formData.estimated_savings || ''}
              onChange={(e) => setFormData({ ...formData, estimated_savings: e.target.value })}
              placeholder="e.g., $5,000/year"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <input
              type="text"
              value={formData.timeframe || ''}
              onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              placeholder="e.g., 6-12 months"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
          <div className="flex gap-3">
            {(['low', 'medium', 'high'] as const).map(level => (
              <button
                key={level}
                onClick={() => setFormData({ ...formData, confidence_level: level })}
                className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                  formData.confidence_level === level
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          disabled={!formData.name || !formData.description}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next: Analysis
        </button>
      </div>
    </div>
  );
}

function Step2Analysis({ formData, setFormData, onBack, onNext }: any) {
  const addCitation = () => {
    const newCitation: FinancialCitation = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'article',
      reference: '',
      description: '',
    };
    setFormData({ ...formData, citations: [...(formData.citations || []), newCitation] });
  };

  const addAssumption = () => {
    const newAssumption: FinancialAssumption = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      verification_required: true,
    };
    setFormData({ ...formData, assumptions: [...(formData.assumptions || []), newAssumption] });
  };

  const addRisk = () => {
    const newRisk: FinancialRiskFlag = {
      id: Math.random().toString(36).substr(2, 9),
      level: 'medium',
      category: '',
      description: '',
    };
    setFormData({ ...formData, risk_flags: [...(formData.risk_flags || []), newRisk] });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis & Rationale</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rationale</label>
          <textarea
            value={formData.rationale}
            onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
            placeholder="Explain the reasoning behind this financial plan..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Citations & References</label>
            <button onClick={addCitation} className="text-sm text-blue-600 hover:text-blue-700">
              + Add Citation
            </button>
          </div>
          <div className="space-y-2">
            {(formData.citations || []).map((citation: FinancialCitation, idx: number) => (
              <div key={citation.id} className="p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={citation.reference}
                  onChange={(e) => {
                    const updated = [...formData.citations];
                    updated[idx] = { ...citation, reference: e.target.value };
                    setFormData({ ...formData, citations: updated });
                  }}
                  placeholder="Reference name or article"
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2"
                />
                <input
                  type="text"
                  value={citation.url || ''}
                  onChange={(e) => {
                    const updated = [...formData.citations];
                    updated[idx] = { ...citation, url: e.target.value };
                    setFormData({ ...formData, citations: updated });
                  }}
                  placeholder="URL (optional)"
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Assumptions</label>
            <button onClick={addAssumption} className="text-sm text-blue-600 hover:text-blue-700">
              + Add Assumption
            </button>
          </div>
          <div className="space-y-2">
            {(formData.assumptions || []).map((assumption: FinancialAssumption, idx: number) => (
              <div key={assumption.id} className="p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={assumption.description}
                  onChange={(e) => {
                    const updated = [...formData.assumptions];
                    updated[idx] = { ...assumption, description: e.target.value };
                    setFormData({ ...formData, assumptions: updated });
                  }}
                  placeholder="e.g., Income remains stable"
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Risk Flags</label>
            <button onClick={addRisk} className="text-sm text-blue-600 hover:text-blue-700">
              + Add Risk
            </button>
          </div>
          <div className="space-y-2">
            {(formData.risk_flags || []).map((risk: FinancialRiskFlag, idx: number) => (
              <div key={risk.id} className="p-3 border border-gray-200 rounded-lg">
                <select
                  value={risk.level}
                  onChange={(e) => {
                    const updated = [...formData.risk_flags];
                    updated[idx] = { ...risk, level: e.target.value as any };
                    setFormData({ ...formData, risk_flags: updated });
                  }}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
                <input
                  type="text"
                  value={risk.description}
                  onChange={(e) => {
                    const updated = [...formData.risk_flags];
                    updated[idx] = { ...risk, description: e.target.value };
                    setFormData({ ...formData, risk_flags: updated });
                  }}
                  placeholder="Describe the risk..."
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!formData.rationale}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next: Actions
        </button>
      </div>
    </div>
  );
}

function Step3Actions({ formData, setFormData, onBack, onSubmit }: any) {
  const addAction = () => {
    const newAction: ActionChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      action: '',
      priority: 'medium',
      completed: false,
    };
    setFormData({ ...formData, action_checklist: [...(formData.action_checklist || []), newAction] });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Action Checklist & Resources</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">What to Do Next</label>
            <button onClick={addAction} className="text-sm text-blue-600 hover:text-blue-700">
              + Add Action
            </button>
          </div>
          <div className="space-y-2">
            {(formData.action_checklist || []).map((action: ActionChecklistItem, idx: number) => (
              <div key={action.id} className="p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={action.action}
                  onChange={(e) => {
                    const updated = [...formData.action_checklist];
                    updated[idx] = { ...action, action: e.target.value };
                    setFormData({ ...formData, action_checklist: updated });
                  }}
                  placeholder="e.g., Open high-yield savings account"
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2"
                />
                <select
                  value={action.priority}
                  onChange={(e) => {
                    const updated = [...formData.action_checklist];
                    updated[idx] = { ...action, priority: e.target.value as any };
                    setFormData({ ...formData, action_checklist: updated });
                  }}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Template URL (Optional)</label>
          <input
            type="text"
            value={formData.template_url || ''}
            onChange={(e) => setFormData({ ...formData, template_url: e.target.value })}
            placeholder="Link to template or form"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Submission URL (Optional)</label>
          <input
            type="text"
            value={formData.submission_url || ''}
            onChange={(e) => setFormData({ ...formData, submission_url: e.target.value })}
            placeholder="Link to submit or apply"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            This plan will be created as a draft. Activate it when you're ready to start implementing.
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Create Plan
        </button>
      </div>
    </div>
  );
}

interface PlanDetailProps {
  plan: FinancialAdvicePlan;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<FinancialAdvicePlan>) => void;
}

function PlanDetail({ plan, onBack, onUpdate }: PlanDetailProps) {
  const category = PLAN_CATEGORIES.find(c => c.id === plan.category);
  const CategoryIcon = category?.icon || TrendingUp;
  const actionsComplete = plan.action_checklist.filter(a => a.completed).length;
  const actionsTotal = plan.action_checklist.length;

  const toggleAction = (actionId: string) => {
    const updated = plan.action_checklist.map(action =>
      action.id === actionId ? { ...action, completed: !action.completed } : action
    );
    onUpdate(plan.id, { action_checklist: updated });
  };

  const updateStatus = (newStatus: 'draft' | 'active' | 'completed') => {
    onUpdate(plan.id, { status: newStatus });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <X className="w-5 h-5" />
        <span>Back to plans</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-4 rounded-lg bg-${category?.color}-100`}>
              <CategoryIcon className={`w-8 h-8 text-${category?.color}-600`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
                <span className={`px-3 py-1 text-sm rounded ${
                  plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                  plan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {plan.status}
                </span>
              </div>
              <p className="text-lg text-gray-600">{plan.description}</p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {plan.status === 'draft' && (
              <button
                onClick={() => updateStatus('active')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Activate
              </button>
            )}
            {plan.status === 'active' && (
              <button
                onClick={() => updateStatus('completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
            <p className="text-xl font-bold text-gray-900 capitalize">{plan.confidence_level}</p>
          </div>
          {plan.estimated_savings && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Est. Savings</p>
              <p className="text-xl font-bold text-green-600">{plan.estimated_savings}</p>
            </div>
          )}
          {plan.timeframe && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Timeframe</p>
              <p className="text-xl font-bold text-gray-900">{plan.timeframe}</p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Progress</p>
            <p className="text-xl font-bold text-gray-900">{actionsComplete}/{actionsTotal}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Rationale
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{plan.rationale}</p>
            </div>
          </div>

          {plan.action_checklist.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                What to Do Next
              </h2>
              <div className="space-y-2">
                {plan.action_checklist.map((action, idx) => (
                  <label
                    key={action.id}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={action.completed}
                      onChange={() => toggleAction(action.id)}
                      className="w-5 h-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                        <span className={`text-gray-900 ${action.completed ? 'line-through' : ''}`}>
                          {action.action}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          action.priority === 'high' ? 'bg-red-100 text-red-800' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {action.priority} priority
                        </span>
                      </div>
                      {action.deadline && (
                        <p className="text-sm text-gray-600 ml-7">Deadline: {action.deadline}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {plan.citations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Citations & References</h2>
              <div className="space-y-2">
                {plan.citations.map((citation, idx) => (
                  <div key={citation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{citation.reference}</span>
                          {citation.url && (
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {citation.description && (
                          <p className="text-gray-700 text-sm">{citation.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.assumptions.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Assumptions</h2>
              <div className="space-y-2">
                {plan.assumptions.map((assumption, idx) => (
                  <div key={assumption.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="text-gray-700">{assumption.description}</p>
                        {assumption.verification_required && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Verification Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.risk_flags.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Risk Flags
              </h2>
              <div className="space-y-2">
                {plan.risk_flags.map((risk, idx) => (
                  <div key={risk.id} className={`p-4 border-2 rounded-lg ${
                    risk.level === 'critical' ? 'border-red-500 bg-red-50' :
                    risk.level === 'high' ? 'border-orange-500 bg-orange-50' :
                    risk.level === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-bold rounded ${
                            risk.level === 'critical' ? 'bg-red-200 text-red-900' :
                            risk.level === 'high' ? 'bg-orange-200 text-orange-900' :
                            risk.level === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                            'bg-gray-200 text-gray-900'
                          }`}>
                            {risk.level.toUpperCase()}
                          </span>
                          <span className="font-bold text-gray-900">{risk.category}</span>
                        </div>
                        <p className="text-gray-700">{risk.description}</p>
                        {risk.mitigation && (
                          <div className="mt-2 p-2 bg-white rounded">
                            <p className="text-sm text-gray-600"><strong>Mitigation:</strong> {risk.mitigation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(plan.template_url || plan.submission_url) && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Resources</h2>
              <div className="space-y-3">
                {plan.template_url && (
                  <a
                    href={plan.template_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Template</p>
                      <p className="text-sm text-gray-600">Download or view template</p>
                    </div>
                  </a>
                )}
                {plan.submission_url && (
                  <a
                    href={plan.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Submit Application</p>
                      <p className="text-sm text-gray-600">Apply or submit online</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Created: {new Date(plan.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(plan.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
