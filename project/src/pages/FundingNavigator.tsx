import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, TrendingUp, CheckCircle, AlertTriangle, FileText, ExternalLink, X, ChevronRight, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGating } from '../hooks/useFeatureGating';
import {
  FundingOpportunity,
  OpportunityQualification,
  OpportunityCitation,
  OpportunityAssumption,
  OpportunityEvidence,
  OpportunitySubmission,
} from '../types';

const STORAGE_KEY_OPPORTUNITIES = 'pnx_funding_opportunities';
const STORAGE_KEY_QUALIFICATIONS = 'pnx_funding_qualifications';
const STORAGE_KEY_CITATIONS = 'pnx_funding_citations';
const STORAGE_KEY_ASSUMPTIONS = 'pnx_funding_assumptions';
const STORAGE_KEY_EVIDENCE = 'pnx_funding_evidence';
const STORAGE_KEY_SUBMISSIONS = 'pnx_funding_submissions';

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

const MOCK_OPPORTUNITIES: FundingOpportunity[] = [
  {
    id: '1',
    organization_id: '1',
    title: 'Small Business Innovation Research (SBIR) Grant',
    description: 'Federal grant program for small businesses engaged in R&D with commercialization potential.',
    provider: 'National Science Foundation',
    amount_min: 50000,
    amount_max: 250000,
    deadline: '2026-03-15',
    category: 'grant',
    status: 'new',
    match_score: 92,
    created_at: '2026-01-20',
    updated_at: '2026-01-20',
  },
  {
    id: '2',
    organization_id: '1',
    title: 'Economic Development Administration Grant',
    description: 'Grants for businesses that create jobs and promote economic development in distressed communities.',
    provider: 'U.S. Economic Development Administration',
    amount_min: 100000,
    amount_max: 500000,
    deadline: '2026-02-28',
    category: 'grant',
    status: 'in_progress',
    match_score: 85,
    created_at: '2026-01-15',
    updated_at: '2026-01-25',
  },
  {
    id: '3',
    organization_id: '1',
    title: 'R&D Tax Credit Program',
    description: 'Federal tax credit for businesses investing in research and development activities.',
    provider: 'Internal Revenue Service',
    amount_min: 10000,
    amount_max: 1000000,
    deadline: '2026-04-15',
    category: 'tax_credit',
    status: 'new',
    match_score: 78,
    created_at: '2026-01-22',
    updated_at: '2026-01-22',
  },
  {
    id: '4',
    organization_id: '1',
    title: 'Green Business Fund',
    description: 'Funding for businesses implementing sustainable practices and green technologies.',
    provider: 'State Environmental Agency',
    amount_min: 25000,
    amount_max: 150000,
    deadline: '2026-03-01',
    category: 'grant',
    status: 'submitted',
    match_score: 88,
    created_at: '2026-01-10',
    updated_at: '2026-01-27',
  },
];

const MOCK_QUALIFICATIONS: OpportunityQualification[] = [
  {
    id: '1',
    opportunity_id: '1',
    reason: 'Your business meets all eligibility criteria for SBIR Phase I funding',
    confidence: 'high',
    supporting_factors: [
      'Registered as a for-profit small business with <500 employees',
      'Engaged in R&D activities documented in your project records',
      'U.S.-based operations and majority U.S. ownership',
      'Novel technical approach documented in recent filings',
    ],
  },
  {
    id: '2',
    opportunity_id: '2',
    reason: 'Your business qualifies based on location and job creation potential',
    confidence: 'high',
    supporting_factors: [
      'Located in an eligible economic development zone',
      'Demonstrated job creation track record (15 jobs in past year)',
      'Clear business expansion plan documented',
      'Financial viability confirmed through recent statements',
    ],
  },
  {
    id: '3',
    opportunity_id: '3',
    reason: 'Your R&D expenses qualify for federal tax credits',
    confidence: 'medium',
    supporting_factors: [
      'Documented R&D expenses totaling $120,000 in past year',
      'Qualified research activities in software development',
      'Employee time logs showing R&D activities',
    ],
  },
  {
    id: '4',
    opportunity_id: '4',
    reason: 'Your sustainability initiatives align with program goals',
    confidence: 'high',
    supporting_factors: [
      'Documented energy efficiency improvements',
      'Investment in renewable energy systems',
      'Waste reduction metrics showing 40% improvement',
      'Environmental compliance records clean',
    ],
  },
];

const MOCK_CITATIONS: OpportunityCitation[] = [
  {
    id: '1',
    opportunity_id: '2',
    text: 'Company expanded workforce from 12 to 27 employees between Jan 2025 and Dec 2025',
    source: 'Employment Records 2025',
    document_id: 'doc_emp_2025',
    verified: true,
  },
  {
    id: '2',
    opportunity_id: '2',
    text: 'Business operates in Census Tract 42101, designated as economically distressed',
    source: 'EDA Distressed Communities Database',
    verified: true,
  },
  {
    id: '3',
    opportunity_id: '4',
    text: 'Energy consumption reduced by 35% after solar panel installation in Q2 2025',
    source: 'Utility Bills Q2-Q4 2025',
    document_id: 'doc_util_2025',
    verified: true,
  },
];

const MOCK_ASSUMPTIONS: OpportunityAssumption[] = [
  {
    id: '1',
    opportunity_id: '1',
    assumption: 'Principal investigator meets educational requirements (PhD or equivalent experience)',
    risk_level: 'medium',
    missing_data: 'Educational credentials not on file',
  },
  {
    id: '2',
    opportunity_id: '3',
    assumption: 'R&D expenses can be clearly segregated from general business expenses',
    risk_level: 'low',
  },
  {
    id: '3',
    opportunity_id: '1',
    assumption: 'Technology has not been previously commercialized',
    risk_level: 'low',
  },
];

const MOCK_EVIDENCE: OpportunityEvidence[] = [
  {
    id: '1',
    opportunity_id: '1',
    requirement: 'Project proposal (max 15 pages)',
    status: 'missing',
    documents: [],
    notes: 'Must include technical approach, commercialization plan, and budget',
  },
  {
    id: '2',
    opportunity_id: '1',
    requirement: 'Company registration documents',
    status: 'complete',
    documents: ['Articles of Incorporation', 'Business License'],
  },
  {
    id: '3',
    opportunity_id: '2',
    requirement: 'Job creation plan',
    status: 'partial',
    documents: ['Hiring Projections 2026'],
    notes: 'Need detailed timeline and job descriptions',
  },
  {
    id: '4',
    opportunity_id: '2',
    requirement: 'Financial statements (past 3 years)',
    status: 'complete',
    documents: ['2023 Tax Return', '2024 Tax Return', '2025 Tax Return'],
  },
  {
    id: '5',
    opportunity_id: '4',
    requirement: 'Environmental impact assessment',
    status: 'complete',
    documents: ['Sustainability Report 2025', 'Energy Audit'],
  },
];

const MOCK_SUBMISSIONS: OpportunitySubmission[] = [
  {
    id: '1',
    opportunity_id: '1',
    platform: 'Grants.gov',
    url: 'https://www.grants.gov/web/grants/view-opportunity.html',
    deadline: '2026-03-15',
  },
  {
    id: '2',
    opportunity_id: '2',
    platform: 'EDA Portal',
    url: 'https://www.eda.gov/apply',
    deadline: '2026-02-28',
  },
  {
    id: '3',
    opportunity_id: '4',
    platform: 'State Environmental Portal',
    url: 'https://environment.state.gov/grants',
    deadline: '2026-03-01',
    submitted_at: '2026-01-27',
  },
];

export function FundingNavigator() {
  const { organization } = useAuth();
  const { hasFeature } = useFeatureGating();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [qualifications, setQualifications] = useState<OpportunityQualification[]>([]);
  const [citations, setCitations] = useState<OpportunityCitation[]>([]);
  const [assumptions, setAssumptions] = useState<OpportunityAssumption[]>([]);
  const [evidence, setEvidence] = useState<OpportunityEvidence[]>([]);
  const [submissions, setSubmissions] = useState<OpportunitySubmission[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null);

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  const loadData = () => {
    let opps = loadFromLocalStorage<FundingOpportunity[]>(STORAGE_KEY_OPPORTUNITIES, []);
    if (opps.length === 0) {
      opps = MOCK_OPPORTUNITIES;
      saveToLocalStorage(STORAGE_KEY_OPPORTUNITIES, opps);
    }
    setOpportunities(opps);

    let quals = loadFromLocalStorage<OpportunityQualification[]>(STORAGE_KEY_QUALIFICATIONS, []);
    if (quals.length === 0) {
      quals = MOCK_QUALIFICATIONS;
      saveToLocalStorage(STORAGE_KEY_QUALIFICATIONS, quals);
    }
    setQualifications(quals);

    let cites = loadFromLocalStorage<OpportunityCitation[]>(STORAGE_KEY_CITATIONS, []);
    if (cites.length === 0) {
      cites = MOCK_CITATIONS;
      saveToLocalStorage(STORAGE_KEY_CITATIONS, cites);
    }
    setCitations(cites);

    let assums = loadFromLocalStorage<OpportunityAssumption[]>(STORAGE_KEY_ASSUMPTIONS, []);
    if (assums.length === 0) {
      assums = MOCK_ASSUMPTIONS;
      saveToLocalStorage(STORAGE_KEY_ASSUMPTIONS, assums);
    }
    setAssumptions(assums);

    let evid = loadFromLocalStorage<OpportunityEvidence[]>(STORAGE_KEY_EVIDENCE, []);
    if (evid.length === 0) {
      evid = MOCK_EVIDENCE;
      saveToLocalStorage(STORAGE_KEY_EVIDENCE, evid);
    }
    setEvidence(evid);

    let subs = loadFromLocalStorage<OpportunitySubmission[]>(STORAGE_KEY_SUBMISSIONS, []);
    if (subs.length === 0) {
      subs = MOCK_SUBMISSIONS;
      saveToLocalStorage(STORAGE_KEY_SUBMISSIONS, subs);
    }
    setSubmissions(subs);
  };

  const updateOpportunityStatus = (id: string, status: FundingOpportunity['status']) => {
    const updated = opportunities.map(opp =>
      opp.id === id ? { ...opp, status, updated_at: new Date().toISOString() } : opp
    );
    saveToLocalStorage(STORAGE_KEY_OPPORTUNITIES, updated);
    setOpportunities(updated);
    if (selectedOpportunity?.id === id) {
      setSelectedOpportunity({ ...selectedOpportunity, status });
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || opp.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (!hasFeature('funding')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Award className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Funding Navigator Not Available</h2>
          <p className="text-gray-600 mb-4">Upgrade to Professional or Business plan to access Funding Navigator.</p>
        </div>
      </div>
    );
  }

  if (selectedOpportunity) {
    return (
      <OpportunityDetail
        opportunity={selectedOpportunity}
        qualification={qualifications.find(q => q.opportunity_id === selectedOpportunity.id)}
        citations={citations.filter(c => c.opportunity_id === selectedOpportunity.id)}
        assumptions={assumptions.filter(a => a.opportunity_id === selectedOpportunity.id)}
        evidence={evidence.filter(e => e.opportunity_id === selectedOpportunity.id)}
        submission={submissions.find(s => s.opportunity_id === selectedOpportunity.id)}
        onBack={() => setSelectedOpportunity(null)}
        onUpdateStatus={updateOpportunityStatus}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Funding Navigator</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="grant">Grants</option>
            <option value="loan">Loans</option>
            <option value="equity">Equity</option>
            <option value="prize">Prizes</option>
            <option value="tax_credit">Tax Credits</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredOpportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onClick={() => setSelectedOpportunity(opp)}
            />
          ))}
          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No opportunities match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: FundingOpportunity;
  onClick: () => void;
}

function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const daysUntilDeadline = Math.ceil(
    (new Date(opportunity.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-purple-100 text-purple-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-gray-100 text-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{opportunity.title}</h3>
            <span className={`px-2 py-1 text-xs rounded ${statusColors[opportunity.status]}`}>
              {opportunity.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{opportunity.provider}</p>
          <p className="text-sm text-gray-700">{opportunity.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">
              ${opportunity.amount_min.toLocaleString()} - ${opportunity.amount_max.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className={`${daysUntilDeadline <= 7 ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
              {daysUntilDeadline} days left
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-600">{opportunity.match_score}% match</span>
        </div>
      </div>
    </div>
  );
}

interface OpportunityDetailProps {
  opportunity: FundingOpportunity;
  qualification?: OpportunityQualification;
  citations: OpportunityCitation[];
  assumptions: OpportunityAssumption[];
  evidence: OpportunityEvidence[];
  submission?: OpportunitySubmission;
  onBack: () => void;
  onUpdateStatus: (id: string, status: FundingOpportunity['status']) => void;
}

function OpportunityDetail({
  opportunity,
  qualification,
  citations,
  assumptions,
  evidence,
  submission,
  onBack,
  onUpdateStatus,
}: OpportunityDetailProps) {
  const daysUntilDeadline = Math.ceil(
    (new Date(opportunity.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusOptions: FundingOpportunity['status'][] = ['new', 'in_progress', 'submitted', 'won', 'lost'];

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <X className="w-5 h-5" />
        <span>Back to list</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{opportunity.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{opportunity.provider}</p>
            <p className="text-gray-700">{opportunity.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{opportunity.match_score}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Funding Range</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              ${opportunity.amount_min.toLocaleString()} - ${opportunity.amount_max.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Deadline</p>
            </div>
            <p className={`text-lg font-bold ${daysUntilDeadline <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
              {new Date(opportunity.deadline).toLocaleDateString()} ({daysUntilDeadline} days)
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Category</p>
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {opportunity.category.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status Pipeline</label>
          <div className="flex gap-2">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => onUpdateStatus(opportunity.id, status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  opportunity.status === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {qualification && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Why You Qualify</h2>
            <span className={`px-2 py-1 text-xs rounded ${
              qualification.confidence === 'high' ? 'bg-green-100 text-green-800' :
              qualification.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {qualification.confidence} confidence
            </span>
          </div>
          <p className="text-gray-700 mb-4">{qualification.reason}</p>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Supporting Factors:</p>
            <ul className="space-y-2">
              {qualification.supporting_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {citations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Citations</h2>
            <span className="text-sm text-gray-600">(Growth+ Required)</span>
          </div>
          <div className="space-y-3">
            {citations.map(citation => (
              <div key={citation.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-900 flex-1">{citation.text}</p>
                  {citation.verified && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-sm text-gray-600">Source: {citation.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {assumptions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">Assumptions & Risk Flags</h2>
          </div>
          <div className="space-y-3">
            {assumptions.map(assumption => (
              <div key={assumption.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    assumption.risk_level === 'high' ? 'text-red-600' :
                    assumption.risk_level === 'medium' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-gray-900 mb-1">{assumption.assumption}</p>
                    {assumption.missing_data && (
                      <p className="text-sm text-red-600">Missing: {assumption.missing_data}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded flex-shrink-0 ${
                    assumption.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                    assumption.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {assumption.risk_level} risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {evidence.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Evidence Checklist</h2>
          </div>
          <div className="space-y-3">
            {evidence.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{item.requirement}</p>
                    {item.documents.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.documents.map((doc, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600">{item.notes}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded flex-shrink-0 ml-2 ${
                    item.status === 'complete' ? 'bg-green-100 text-green-800' :
                    item.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {submission && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ExternalLink className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Submission</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900 mb-1">{submission.platform}</p>
                <p className="text-sm text-gray-600">Deadline: {new Date(submission.deadline).toLocaleDateString()}</p>
                {submission.submitted_at && (
                  <p className="text-sm text-green-600 mt-1">
                    Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <a
                href={submission.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <span>Open Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
