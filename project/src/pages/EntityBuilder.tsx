import { useState, useEffect } from 'react';
import { Building2, Lock, FileText, Download, AlertTriangle, CheckCircle, MapPin, DollarSign, Scale, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGating } from '../hooks/useFeatureGating';
import { EntityDecision, EntityComparison, StateStrategy, EntityType, EntityDecisionRisk, EntityDecisionResource } from '../types';

const STORAGE_KEY = 'pnx_entity_decisions';

function saveToLocalStorage(data: EntityDecision[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage(): EntityDecision[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const ENTITY_COMPARISONS: EntityComparison[] = [
  {
    type: 'LLC',
    description: 'Limited Liability Company - Flexible structure with pass-through taxation',
    pros: [
      'Simple to set up and maintain',
      'Pass-through taxation (no double tax)',
      'Flexible management structure',
      'Personal liability protection',
      'Fewer compliance requirements'
    ],
    cons: [
      'Self-employment tax on all profits',
      'Limited ability to raise capital',
      'Less attractive to investors',
      'Varying state regulations'
    ],
    bestFor: [
      'Small businesses and startups',
      'Solo entrepreneurs',
      'Real estate investors',
      'Professional services'
    ],
    taxTreatment: 'Pass-through: profits taxed once at individual level',
    complexity: 'Low',
    cost: 'Low'
  },
  {
    type: 'S-Corp',
    description: 'S Corporation - Pass-through taxation with corporate structure',
    pros: [
      'Pass-through taxation',
      'Self-employment tax savings',
      'Personal liability protection',
      'Transferable ownership',
      'Credibility with customers'
    ],
    cons: [
      'Strict IRS requirements',
      'Limited to 100 shareholders',
      'Only one class of stock',
      'More compliance requirements',
      'Required reasonable salary'
    ],
    bestFor: [
      'Profitable small businesses',
      'Service-based businesses',
      'Companies with 2-100 owners',
      'Businesses seeking tax savings'
    ],
    taxTreatment: 'Pass-through with payroll tax advantages',
    complexity: 'Medium',
    cost: 'Medium'
  },
  {
    type: 'C-Corp',
    description: 'C Corporation - Separate legal entity with corporate taxation',
    pros: [
      'Unlimited shareholders',
      'Multiple classes of stock',
      'Easier to raise capital',
      'Attractive to investors/VCs',
      'Perpetual existence'
    ],
    cons: [
      'Double taxation',
      'Complex compliance requirements',
      'Expensive to maintain',
      'Extensive record keeping',
      'Board of directors required'
    ],
    bestFor: [
      'High-growth startups',
      'Businesses seeking VC funding',
      'Companies planning IPO',
      'International operations'
    ],
    taxTreatment: 'Double taxation: corporate + individual',
    complexity: 'High',
    cost: 'High'
  }
];

const STATE_STRATEGIES: StateStrategy[] = [
  {
    state: 'Delaware',
    code: 'DE',
    filingFee: '$90',
    annualFee: '$300',
    taxRate: '8.7%',
    pros: [
      'Business-friendly laws',
      'Specialized Court of Chancery',
      'Strong legal precedents',
      'Preferred by investors'
    ],
    cons: [
      'Must pay franchise tax',
      'Need registered agent',
      'Higher annual fees'
    ],
    popularity: 95
  },
  {
    state: 'Wyoming',
    code: 'WY',
    filingFee: '$100',
    annualFee: '$60',
    taxRate: '0%',
    pros: [
      'No state income tax',
      'Low filing fees',
      'Strong privacy protection',
      'Asset protection laws'
    ],
    cons: [
      'Less legal precedent',
      'May need to qualify in home state',
      'Less familiar to investors'
    ],
    popularity: 75
  },
  {
    state: 'Nevada',
    code: 'NV',
    filingFee: '$75',
    annualFee: '$350',
    taxRate: '0%',
    pros: [
      'No corporate income tax',
      'No franchise tax',
      'Strong privacy laws',
      'Business-friendly'
    ],
    cons: [
      'Higher annual fees',
      'Commerce tax on revenue',
      'May need to qualify in home state'
    ],
    popularity: 70
  },
  {
    state: 'Your Home State',
    code: 'HOME',
    filingFee: 'Varies',
    annualFee: 'Varies',
    taxRate: 'Varies',
    pros: [
      'No need to qualify as foreign entity',
      'Lower overall costs',
      'Easier to manage locally',
      'Avoid double filing'
    ],
    cons: [
      'May have higher taxes',
      'State-specific regulations',
      'Less investor recognition'
    ],
    popularity: 85
  }
];

export function EntityBuilder() {
  const { organization } = useAuth();
  const { hasFeature } = useFeatureGating();
  const [decisions, setDecisions] = useState<EntityDecision[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'compare' | 'worksheet'>('list');
  const [selectedDecision, setSelectedDecision] = useState<EntityDecision | null>(null);

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  const loadData = () => {
    const loadedDecisions = loadFromLocalStorage();
    setDecisions(loadedDecisions);
  };

  if (!hasFeature('entity_builder')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Lock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Entity Builder Not Available</h2>
          <p className="text-gray-600 mb-4">Upgrade to Business plan to access Entity Builder for LLC, S-Corp, and C-Corp comparisons.</p>
        </div>
      </div>
    );
  }

  if (currentView === 'compare') {
    return (
      <ComparisonView
        onBack={() => setCurrentView('list')}
        onStartWorksheet={() => setCurrentView('worksheet')}
      />
    );
  }

  if (currentView === 'worksheet') {
    return (
      <WorksheetView
        onBack={() => setCurrentView('list')}
        onSave={(decision) => {
          const updated = [...decisions, decision];
          setDecisions(updated);
          saveToLocalStorage(updated);
          setSelectedDecision(decision);
          setCurrentView('list');
        }}
      />
    );
  }

  if (selectedDecision) {
    return (
      <DecisionDetail
        decision={selectedDecision}
        onBack={() => setSelectedDecision(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entity Builder</h1>
          <p className="text-gray-600 mt-1">Compare entity types and build your formation strategy</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('compare')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Compare Entities
          </button>
          <button
            onClick={() => setCurrentView('worksheet')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Decision Worksheet
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Educational Use Only</p>
            <p className="text-sm text-yellow-800 mt-1">
              This tool provides educational guidance only. All recommendations must be reviewed by a qualified attorney or tax professional before making any legal or tax decisions.
            </p>
          </div>
        </div>
      </div>

      {decisions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Decisions Yet</h3>
          <p className="text-gray-600 mb-6">Start by comparing entity types or using the decision worksheet.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCurrentView('compare')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Compare Entities
            </button>
            <button
              onClick={() => setCurrentView('worksheet')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Worksheet
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisions.map(decision => (
            <div
              key={decision.id}
              onClick={() => setSelectedDecision(decision)}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{decision.name}</h3>
                  <p className="text-sm text-gray-600">{decision.business_description}</p>
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-4 text-sm mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {decision.recommended_entity}
                </span>
                <span className="text-gray-600">{decision.recommended_state}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{decision.rationale}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComparisonView({ onBack, onStartWorksheet }: { onBack: () => void; onStartWorksheet: () => void }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entity Comparison</h1>
          <p className="text-gray-600 mt-1">Compare LLC, S-Corp, and C-Corp structures</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Decisions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {ENTITY_COMPARISONS.map(entity => (
          <div key={entity.type} className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="text-center mb-4">
              <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{entity.type}</h2>
              <p className="text-sm text-gray-600">{entity.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Complexity</p>
                <p className="text-sm font-bold text-gray-900">{entity.complexity}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Cost</p>
                <p className="text-sm font-bold text-gray-900">{entity.cost}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Tax</p>
                <p className="text-sm font-bold text-gray-900">{entity.type === 'C-Corp' ? 'Double' : 'Pass'}</p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Tax Treatment</h3>
              <p className="text-sm text-gray-600">{entity.taxTreatment}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Pros
              </h3>
              <ul className="space-y-1">
                {entity.pros.map((pro, idx) => (
                  <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0">
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Cons
              </h3>
              <ul className="space-y-1">
                {entity.cons.map((con, idx) => (
                  <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0">
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Best For</h3>
              <ul className="space-y-1">
                {entity.bestFor.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 pl-4 relative before:content-['✓'] before:absolute before:left-0 before:text-green-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          State Strategy Comparison
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATE_STRATEGIES.map(state => (
            <div key={state.code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{state.state}</h3>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Popularity</p>
                  <p className="text-sm font-bold text-blue-600">{state.popularity}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-xs text-gray-600">Filing</p>
                  <p className="text-sm font-bold text-gray-900">{state.filingFee}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Annual</p>
                  <p className="text-sm font-bold text-gray-900">{state.annualFee}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Tax Rate</p>
                  <p className="text-sm font-bold text-gray-900">{state.taxRate}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-bold text-green-900 mb-1">Pros:</p>
                <ul className="space-y-0.5">
                  {state.pros.map((pro, idx) => (
                    <li key={idx} className="text-xs text-gray-700 pl-3 relative before:content-['✓'] before:absolute before:left-0 before:text-green-600">
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-red-900 mb-1">Cons:</p>
                <ul className="space-y-0.5">
                  {state.cons.map((con, idx) => (
                    <li key={idx} className="text-xs text-gray-700 pl-3 relative before:content-['×'] before:absolute before:left-0 before:text-red-600">
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onStartWorksheet}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
        >
          Ready to Decide? Start Decision Worksheet →
        </button>
      </div>
    </div>
  );
}

function WorksheetView({ onBack, onSave }: { onBack: () => void; onSave: (decision: EntityDecision) => void }) {
  const { user, organization } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    business_description: '',
    annual_revenue: '',
    num_owners: 1,
    state: '',
    seeking_investment: false,
    growth_plans: 'stable',
    tax_priority: 'minimize'
  });

  const generateRecommendation = () => {
    let recommendedEntity: EntityType = 'LLC';
    let recommendedState = formData.state || 'Your Home State';
    let rationale = '';

    const revenue = parseInt(formData.annual_revenue.replace(/\D/g, '')) || 0;

    if (formData.seeking_investment || formData.growth_plans === 'rapid' || revenue > 10000000) {
      recommendedEntity = 'C-Corp';
      recommendedState = 'Delaware';
      rationale = 'C-Corp is recommended for high-growth businesses seeking investment. Delaware offers the most established corporate law framework and is preferred by investors and VCs.';
    } else if (revenue > 100000 && formData.num_owners <= 100) {
      recommendedEntity = 'S-Corp';
      rationale = 'S-Corp is recommended for profitable businesses seeking tax savings. You can save on self-employment taxes while maintaining pass-through taxation benefits.';
    } else {
      recommendedEntity = 'LLC';
      rationale = 'LLC is recommended for its simplicity and flexibility. It provides liability protection with minimal compliance requirements and pass-through taxation.';
    }

    const assumptions = [
      {
        id: '1',
        description: 'Business will operate primarily in the specified state',
        verification_required: true
      },
      {
        id: '2',
        description: 'Revenue projections are based on current business model',
        verification_required: true
      },
      {
        id: '3',
        description: 'All owners are U.S. citizens or residents',
        verification_required: recommendedEntity === 'S-Corp'
      }
    ];

    const risks: EntityDecisionRisk[] = [
      {
        id: '1',
        category: 'Tax Compliance',
        description: `${recommendedEntity} requires specific tax filings and ongoing compliance`,
        severity: recommendedEntity === 'C-Corp' ? 'high' : 'medium',
        mitigation: 'Work with a CPA familiar with your entity type'
      },
      {
        id: '2',
        category: 'State Requirements',
        description: 'Each state has different filing requirements and ongoing obligations',
        severity: 'medium',
        mitigation: 'Research specific requirements for your formation state'
      }
    ];

    if (recommendedEntity === 'S-Corp') {
      risks.push({
        id: '3',
        category: 'Reasonable Salary',
        description: 'S-Corp owners must pay themselves reasonable salaries',
        severity: 'medium',
        mitigation: 'Consult with tax professional to determine appropriate salary'
      });
    }

    const resources: EntityDecisionResource[] = [
      {
        id: '1',
        title: 'IRS Business Structures',
        description: 'Official IRS guidance on business entity types',
        url: 'https://www.irs.gov/businesses/small-businesses-self-employed/business-structures',
        type: 'irs'
      },
      {
        id: '2',
        title: `${recommendedState} Secretary of State`,
        description: 'File formation documents with your state',
        url: `https://www.google.com/search?q=${encodeURIComponent(recommendedState + ' secretary of state business filing')}`,
        type: 'state'
      },
      {
        id: '3',
        title: 'Small Business Administration Guide',
        description: 'Choose a business structure guide',
        url: 'https://www.sba.gov/business-guide/launch-your-business/choose-business-structure',
        type: 'guide'
      }
    ];

    if (recommendedEntity === 'S-Corp') {
      resources.push({
        id: '4',
        title: 'Form 2553 (S-Corp Election)',
        description: 'File this form to elect S-Corp status',
        url: 'https://www.irs.gov/forms-pubs/about-form-2553',
        type: 'form'
      });
    }

    const nextSteps = [
      'Review this recommendation with a qualified attorney',
      'Consult with a CPA about tax implications',
      `File formation documents with ${recommendedState}`,
      'Obtain EIN from the IRS',
      'Open business bank account',
      'Set up accounting system'
    ];

    if (recommendedEntity === 'S-Corp') {
      nextSteps.splice(3, 0, 'File Form 2553 for S-Corp election');
    }

    const decision: EntityDecision = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: organization?.id || '',
      name: formData.name,
      business_description: formData.business_description,
      annual_revenue: formData.annual_revenue,
      num_owners: formData.num_owners,
      state: formData.state,
      recommended_entity: recommendedEntity,
      recommended_state: recommendedState,
      rationale,
      assumptions,
      risks,
      resources,
      tax_implications: ENTITY_COMPARISONS.find(e => e.type === recommendedEntity)?.taxTreatment || '',
      next_steps: nextSteps,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user?.id || ''
    };

    onSave(decision);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entity Decision Worksheet</h1>
          <p className="text-gray-600 mt-1">Step {step} of 2</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Educational Use Only</p>
            <p className="text-sm text-yellow-800">
              This worksheet provides educational guidance. All decisions must be reviewed by a qualified attorney or tax professional.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Business Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your business name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
              <textarea
                value={formData.business_description}
                onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                placeholder="Briefly describe your business..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Annual Revenue</label>
                <input
                  type="text"
                  value={formData.annual_revenue}
                  onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
                  placeholder="e.g., $250,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Owners</label>
                <input
                  type="number"
                  value={formData.num_owners}
                  onChange={(e) => setFormData({ ...formData, num_owners: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Operating State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., California, Texas, New York"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.business_description}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next: Growth Plans
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Growth & Tax Strategy</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Are you seeking outside investment?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.seeking_investment === true}
                    onChange={() => setFormData({ ...formData, seeking_investment: true })}
                    className="w-4 h-4"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.seeking_investment === false}
                    onChange={() => setFormData({ ...formData, seeking_investment: false })}
                    className="w-4 h-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Growth Plans</label>
              <select
                value={formData.growth_plans}
                onChange={(e) => setFormData({ ...formData, growth_plans: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="stable">Stable - Maintain current size</option>
                <option value="moderate">Moderate - Gradual growth</option>
                <option value="rapid">Rapid - Aggressive expansion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Priority</label>
              <select
                value={formData.tax_priority}
                onChange={(e) => setFormData({ ...formData, tax_priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="minimize">Minimize taxes</option>
                <option value="simplicity">Simplicity over savings</option>
                <option value="flexibility">Maximum flexibility</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={generateRecommendation}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Generate Recommendation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionDetail({ decision, onBack }: { decision: EntityDecision; onBack: () => void }) {
  const exportMemo = () => {
    const memo = `
ENTITY FORMATION DECISION MEMO
Generated: ${new Date(decision.created_at).toLocaleDateString()}

EDUCATIONAL USE ONLY - REQUIRES PROFESSIONAL REVIEW
This document is for educational purposes only and does not constitute legal or tax advice.
All recommendations must be reviewed by a qualified attorney and tax professional.

═══════════════════════════════════════════════════════════════

BUSINESS INFORMATION
Business Name: ${decision.name}
Description: ${decision.business_description}
Annual Revenue: ${decision.annual_revenue}
Number of Owners: ${decision.num_owners}
Operating State: ${decision.state}

═══════════════════════════════════════════════════════════════

RECOMMENDATION

Recommended Entity Type: ${decision.recommended_entity}
Recommended Formation State: ${decision.recommended_state}

RATIONALE:
${decision.rationale}

TAX IMPLICATIONS:
${decision.tax_implications}

═══════════════════════════════════════════════════════════════

ASSUMPTIONS

${decision.assumptions.map((a, i) => `${i + 1}. ${a.description}${a.verification_required ? ' [VERIFICATION REQUIRED]' : ''}`).join('\n')}

═══════════════════════════════════════════════════════════════

RISK FACTORS

${decision.risks.map((r, i) => `${i + 1}. [${r.severity.toUpperCase()}] ${r.category}
   ${r.description}
   ${r.mitigation ? `Mitigation: ${r.mitigation}` : ''}`).join('\n\n')}

═══════════════════════════════════════════════════════════════

NEXT STEPS

${decision.next_steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

═══════════════════════════════════════════════════════════════

RESOURCES & REFERENCES

${decision.resources.map((r, i) => `${i + 1}. ${r.title} (${r.type.toUpperCase()})
   ${r.description}
   ${r.url}`).join('\n\n')}

═══════════════════════════════════════════════════════════════

DISCLAIMER

This decision memo is provided for educational purposes only and does not constitute
legal, tax, or financial advice. Entity formation involves complex legal and tax
considerations that vary by jurisdiction and individual circumstances.

You MUST consult with:
- A qualified business attorney in your jurisdiction
- A certified public accountant (CPA) or tax professional
- Any other relevant professionals based on your specific situation

Do not make entity formation decisions based solely on this document.

═══════════════════════════════════════════════════════════════
`;

    const blob = new Blob([memo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${decision.name.replace(/\s+/g, '_')}_Entity_Decision_Memo.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back to Decisions
        </button>
        <button
          onClick={exportMemo}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-5 h-5" />
          Export Decision Memo
        </button>
      </div>

      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">EDUCATIONAL USE ONLY - REQUIRES PROFESSIONAL REVIEW</p>
            <p className="text-sm text-red-800 mt-1">
              This recommendation does not constitute legal or tax advice. You must consult with a qualified attorney and tax professional before making any entity formation decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{decision.name}</h1>
          <p className="text-gray-600">{decision.business_description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600">Revenue</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{decision.annual_revenue}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600">Owners</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{decision.num_owners}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600">State</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{decision.state}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-gray-600" />
              <p className="text-xs text-gray-600">Created</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{new Date(decision.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">Recommendation</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xl font-bold">
              {decision.recommended_entity}
            </span>
            <span className="text-lg text-gray-700">
              in <strong>{decision.recommended_state}</strong>
            </span>
          </div>
          <p className="text-gray-700 mb-4">{decision.rationale}</p>
          <div className="bg-white border border-blue-200 rounded p-3">
            <p className="text-sm font-medium text-gray-900 mb-1">Tax Implications:</p>
            <p className="text-sm text-gray-700">{decision.tax_implications}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Assumptions
            </h2>
            <div className="space-y-2">
              {decision.assumptions.map((assumption, idx) => (
                <div key={assumption.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-gray-700">{assumption.description}</p>
                    {assumption.verification_required && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Verification Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Risk Factors
            </h2>
            <div className="space-y-3">
              {decision.risks.map((risk, idx) => (
                <div
                  key={risk.id}
                  className={`p-4 border-2 rounded-lg ${
                    risk.severity === 'high' ? 'border-red-500 bg-red-50' :
                    risk.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          risk.severity === 'high' ? 'bg-red-200 text-red-900' :
                          risk.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                          'bg-gray-200 text-gray-900'
                        }`}>
                          {risk.severity.toUpperCase()}
                        </span>
                        <span className="font-bold text-gray-900">{risk.category}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{risk.description}</p>
                      {risk.mitigation && (
                        <div className="p-2 bg-white rounded border">
                          <p className="text-sm text-gray-600"><strong>Mitigation:</strong> {risk.mitigation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Next Steps
            </h2>
            <div className="space-y-2">
              {decision.next_steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Resources & References
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {decision.resources.map((resource, idx) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{resource.title}</p>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {resource.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                  <Download className="w-5 h-5 text-blue-600 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
