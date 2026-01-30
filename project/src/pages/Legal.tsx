import { useState } from 'react';
import { Scale, AlertTriangle, Users, Home, FileText, Plus, Calendar, DollarSign, MessageSquare, Clock } from 'lucide-react';

export function Legal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'divorce'>('overview');
  const [divorceSection, setDivorceSection] = useState<'violations' | 'custody' | 'property' | 'vault'>('violations');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal</h1>
        <p className="text-gray-600">Forensic legal workspace with data integration</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Forensic Legal W/ Data Integration
              </div>
            </button>
            <button
              onClick={() => setActiveTab('divorce')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'divorce'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Divorce Toolkit
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <ForensicLegalOverview />}
          {activeTab === 'divorce' && (
            <DivorceToolkit section={divorceSection} onSectionChange={setDivorceSection} />
          )}
        </div>
      </div>
    </div>
  );
}

function ForensicLegalOverview() {
  const cases = [
    { id: 1, title: 'Smith v. Smith', type: 'Family Law', status: 'Active', lastUpdated: '2024-01-15' },
    { id: 2, title: 'Estate Planning - Johnson', type: 'Estate', status: 'Pending', lastUpdated: '2024-01-10' },
    { id: 3, title: 'Custody Matter - Davis', type: 'Custody', status: 'Active', lastUpdated: '2024-01-05' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Legal Cases</h2>
          <p className="text-sm text-gray-600">Evidence intake, cross-source data linking, and audit trail management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">New Case</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Active Cases</span>
            <Scale className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">2</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Evidence Items</span>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">47</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-800">Audit Logs</span>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">156</p>
        </div>
      </div>

      <div className="space-y-4">
        {cases.map(c => (
          <div key={c.id} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{c.type}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">{c.status}</span>
                  <span className="text-gray-500">Updated {c.lastUpdated}</span>
                </div>
              </div>
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Chain-of-Custody Tracking</h3>
        <p className="text-sm text-blue-800 mb-3">
          Every evidence item records who/when/how it was captured and edited. All changes maintain forensic integrity with automatic hashing and timestamps.
        </p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            View Audit Logs
          </button>
          <button className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm font-medium">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

interface DivorceToolkitProps {
  section: 'violations' | 'custody' | 'property' | 'vault';
  onSectionChange: (section: 'violations' | 'custody' | 'property' | 'vault') => void;
}

function DivorceToolkit({ section, onSectionChange }: DivorceToolkitProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Divorce Toolkit</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSectionChange('violations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === 'violations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Violations
          </button>
          <button
            onClick={() => onSectionChange('custody')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === 'custody'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Custody
          </button>
          <button
            onClick={() => onSectionChange('property')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === 'property'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Home className="w-4 h-4" />
            Property Settlement
          </button>
          <button
            onClick={() => onSectionChange('vault')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === 'vault'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Legal Document Vault
          </button>
        </div>
      </div>

      {section === 'violations' && <ViolationsSection />}
      {section === 'custody' && <CustodySection />}
      {section === 'property' && <PropertySettlementSection />}
      {section === 'vault' && <LegalDocumentVault />}
    </div>
  );
}

function ViolationsSection() {
  const violations = [
    { id: 1, type: 'Missed Visitation', date: '2024-01-15', severity: 'High', evidence: 3 },
    { id: 2, type: 'Late Child Support', date: '2024-01-10', severity: 'Medium', evidence: 2 },
    { id: 3, type: 'Communication Violation', date: '2024-01-05', severity: 'Low', evidence: 1 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Track violations, build evidence bundles, and view timeline</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Log Violation
        </button>
      </div>

      <div className="space-y-3">
        {violations.map(v => (
          <div key={v.id} className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{v.type}</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                v.severity === 'High' ? 'bg-red-100 text-red-700' :
                v.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {v.severity}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {v.date}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {v.evidence} evidence items
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Evidence Bundle Builder</h4>
            <p className="text-sm text-gray-600">Compile violations into a comprehensive report</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Build Bundle
          </button>
        </div>
      </div>
    </div>
  );
}

function CustodySection() {
  const issues = [
    { id: 1, type: 'Late Pickup', date: '2024-01-15', duration: '45 min', notes: 'No communication' },
    { id: 2, type: 'Missed Exchange', date: '2024-01-10', duration: 'Full day', notes: 'Emergency claimed' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Track parenting schedule, exchanges, and communication logs</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Log Issue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-800">Late Exchanges</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-900">7</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-800">Missed Time</span>
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">3</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {issues.map(issue => (
          <div key={issue.id} className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{issue.type}</h4>
              <span className="text-sm text-gray-600">{issue.duration}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {issue.date}
              </span>
            </div>
            <p className="text-sm text-gray-700">{issue.notes}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Communication Logs</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">Track all co-parent communications</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Logs →</button>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-900">Child Expenses</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">Track and document child-related costs</p>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">View Expenses →</button>
        </div>
      </div>
    </div>
  );
}

function PropertySettlementSection() {
  const assets = [
    { id: 1, name: 'Primary Residence', type: 'Real Estate', value: '$450,000', status: 'Pending' },
    { id: 2, name: 'Investment Account', type: 'Financial', value: '$85,000', status: 'Documented' },
    { id: 3, name: 'Vehicle (2020 Honda)', type: 'Vehicle', value: '$22,000', status: 'Documented' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Asset and debt tracking with documentation checklist</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add Asset/Debt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Total Assets</span>
            <Home className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">$557K</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-800">Total Debts</span>
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-900">$345K</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {assets.map(asset => (
          <div key={asset.id} className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{asset.name}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{asset.type}</span>
                  <span className="font-semibold text-gray-900">{asset.value}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    asset.status === 'Documented' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {asset.status}
                  </span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Documentation Checklist</h4>
        <div className="space-y-2">
          {['Property appraisals', 'Bank statements (6 months)', 'Investment account statements', 'Vehicle titles', 'Debt documentation'].map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked={idx < 2} />
              <span className="text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegalDocumentVault() {
  const documents = [
    { id: 1, name: 'Petition for Dissolution', type: 'Court Filing', date: '2024-01-15', size: '245 KB' },
    { id: 2, name: 'Temporary Orders', type: 'Court Order', date: '2024-01-10', size: '189 KB' },
    { id: 3, name: 'Financial Disclosure', type: 'Agreement', date: '2024-01-05', size: '412 KB' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">Secure organization of court filings, orders, and agreements</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
          <option>All Types</option>
          <option>Court Filings</option>
          <option>Court Orders</option>
          <option>Agreements</option>
          <option>Correspondence</option>
        </select>
        <input
          type="text"
          placeholder="Search documents..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3 mb-6">
        {documents.map(doc => (
          <div key={doc.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">{doc.type}</span>
                    <span>{doc.date}</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium">
                  View
                </button>
                <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Export Document Bundle</h4>
            <p className="text-sm text-gray-600">Create a comprehensive package of all legal documents</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Create Bundle
          </button>
        </div>
      </div>
    </div>
  );
}
