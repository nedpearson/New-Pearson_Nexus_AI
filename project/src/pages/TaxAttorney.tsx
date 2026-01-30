import { useState, useEffect } from 'react';
import { Scale, Plus, FileCheck, AlertTriangle, BookOpen, CheckSquare, Download, Lock, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGating } from '../hooks/useFeatureGating';
import { AttorneyPacket, AttorneyRiskFlag, AttorneyCitation, AttorneyAssumption, EvidenceChecklistItem } from '../types';

const STORAGE_KEY = 'pnx_attorney_packets';

function saveToLocalStorage(data: AttorneyPacket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromLocalStorage(): AttorneyPacket[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const PACKET_CATEGORIES = [
  { id: 'tax_credit', name: 'Tax Credit', color: 'blue' },
  { id: 'deduction', name: 'Deduction', color: 'green' },
  { id: 'exemption', name: 'Exemption', color: 'purple' },
  { id: 'compliance', name: 'Compliance', color: 'yellow' },
  { id: 'audit_defense', name: 'Audit Defense', color: 'red' },
  { id: 'planning', name: 'Tax Planning', color: 'indigo' },
];

export function TaxAttorney() {
  const { user, organization } = useAuth();
  const { hasFeature } = useFeatureGating();
  const [packets, setPackets] = useState<AttorneyPacket[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<AttorneyPacket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs_review' | 'ready_to_export'>('all');

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  const loadData = () => {
    const loadedPackets = loadFromLocalStorage();
    setPackets(loadedPackets);
  };

  const createPacket = (data: Partial<AttorneyPacket>) => {
    const newPacket: AttorneyPacket = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: organization?.id || '',
      name: data.name || 'Untitled Packet',
      description: data.description || '',
      category: data.category || 'tax_credit',
      status: 'needs_review',
      rationale: data.rationale || '',
      citations: data.citations || [],
      assumptions: data.assumptions || [],
      risk_flags: data.risk_flags || [],
      evidence_checklist: data.evidence_checklist || [],
      estimated_benefit: data.estimated_benefit,
      confidence_level: data.confidence_level || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user?.id || '',
    };

    const updated = [...packets, newPacket];
    setPackets(updated);
    saveToLocalStorage(updated);
    setShowCreateModal(false);
  };

  const updatePacket = (id: string, updates: Partial<AttorneyPacket>) => {
    const updated = packets.map(p =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    setPackets(updated);
    saveToLocalStorage(updated);
    if (selectedPacket?.id === id) {
      setSelectedPacket(updated.find(p => p.id === id) || null);
    }
  };

  const markAsReviewed = (id: string) => {
    updatePacket(id, {
      status: 'ready_to_export',
      reviewed_at: new Date().toISOString(),
    });
  };

  const exportPacketBinder = (packet: AttorneyPacket) => {
    const content = generatePacketBinder(packet);
    downloadBinder(content, `${packet.name}-attorney-packet`);
  };

  const generatePacketBinder = (packet: AttorneyPacket): string => {
    let content = `ATTORNEY-READY TAX PACKET\n`;
    content += `${packet.name}\n`;
    content += `${'='.repeat(80)}\n\n`;

    content += `CATEGORY: ${PACKET_CATEGORIES.find(c => c.id === packet.category)?.name || packet.category}\n`;
    content += `STATUS: ${packet.status === 'ready_to_export' ? 'READY TO EXPORT' : 'NEEDS REVIEW'}\n`;
    content += `CONFIDENCE LEVEL: ${packet.confidence_level.toUpperCase()}\n`;
    if (packet.estimated_benefit) {
      content += `ESTIMATED BENEFIT: ${packet.estimated_benefit}\n`;
    }
    content += `CREATED: ${new Date(packet.created_at).toLocaleString()}\n`;
    if (packet.reviewed_at) {
      content += `REVIEWED: ${new Date(packet.reviewed_at).toLocaleString()}\n`;
    }
    content += `\n${'='.repeat(80)}\n\n`;

    content += `DESCRIPTION\n`;
    content += `${'-'.repeat(80)}\n`;
    content += `${packet.description}\n\n`;

    content += `RATIONALE\n`;
    content += `${'-'.repeat(80)}\n`;
    content += `${packet.rationale}\n\n`;

    if (packet.citations.length > 0) {
      content += `LEGAL CITATIONS\n`;
      content += `${'-'.repeat(80)}\n`;
      packet.citations.forEach((citation, idx) => {
        content += `\n${idx + 1}. [${citation.type.toUpperCase()}] ${citation.reference}\n`;
        content += `   ${citation.description}\n`;
        if (citation.url) {
          content += `   URL: ${citation.url}\n`;
        }
      });
      content += `\n`;
    }

    if (packet.assumptions.length > 0) {
      content += `ASSUMPTIONS\n`;
      content += `${'-'.repeat(80)}\n`;
      packet.assumptions.forEach((assumption, idx) => {
        content += `\n${idx + 1}. ${assumption.description}\n`;
        content += `   Verification Required: ${assumption.verification_required ? 'YES' : 'NO'}\n`;
        if (assumption.source) {
          content += `   Source: ${assumption.source}\n`;
        }
      });
      content += `\n`;
    }

    if (packet.risk_flags.length > 0) {
      content += `RISK FLAGS\n`;
      content += `${'-'.repeat(80)}\n`;
      packet.risk_flags.forEach((risk, idx) => {
        content += `\n${idx + 1}. [${risk.level.toUpperCase()}] ${risk.category}\n`;
        content += `   ${risk.description}\n`;
        if (risk.mitigation) {
          content += `   Mitigation: ${risk.mitigation}\n`;
        }
      });
      content += `\n`;
    }

    if (packet.evidence_checklist.length > 0) {
      content += `EVIDENCE CHECKLIST\n`;
      content += `${'-'.repeat(80)}\n`;
      packet.evidence_checklist.forEach((item, idx) => {
        const status = item.collected ? '[X]' : '[ ]';
        const required = item.required ? '(REQUIRED)' : '(OPTIONAL)';
        content += `\n${status} ${idx + 1}. ${item.item} ${required}\n`;
        if (item.notes) {
          content += `   Notes: ${item.notes}\n`;
        }
      });
      content += `\n`;
    }

    content += `\n${'='.repeat(80)}\n`;
    content += `END OF ATTORNEY PACKET\n`;

    return content;
  };

  const downloadBinder = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!hasFeature('tax_attorney')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Lock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Attorney Mode Not Available</h2>
          <p className="text-gray-600 mb-4">Upgrade to Business plan to access Tax Attorney Mode with guided intake and attorney-ready packets.</p>
        </div>
      </div>
    );
  }

  if (selectedPacket) {
    return (
      <PacketDetail
        packet={selectedPacket}
        onBack={() => setSelectedPacket(null)}
        onUpdate={updatePacket}
        onMarkReviewed={markAsReviewed}
        onExport={exportPacketBinder}
      />
    );
  }

  const filteredPackets = packets.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const needsReviewCount = packets.filter(p => p.status === 'needs_review').length;
  const readyCount = packets.filter(p => p.status === 'ready_to_export').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Attorney Mode</h1>
          <p className="text-gray-600 mt-1">Attorney-ready packets with guided intake</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>New Packet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Packets</span>
            <Scale className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{packets.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Needs Review</span>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{needsReviewCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Ready to Export</span>
            <FileCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{readyCount}</p>
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
              All ({packets.length})
            </button>
            <button
              onClick={() => setFilterStatus('needs_review')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'needs_review'
                  ? 'bg-yellow-100 text-yellow-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Needs Review ({needsReviewCount})
            </button>
            <button
              onClick={() => setFilterStatus('ready_to_export')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'ready_to_export'
                  ? 'bg-green-100 text-green-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ready to Export ({readyCount})
            </button>
          </div>
        </div>

        <div className="p-6">
          {filteredPackets.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {filterStatus === 'all'
                  ? 'No attorney packets yet.'
                  : filterStatus === 'needs_review'
                  ? 'No packets need review.'
                  : 'No packets ready to export.'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Packet
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPackets.map(packet => (
                <PacketCard
                  key={packet.id}
                  packet={packet}
                  onClick={() => setSelectedPacket(packet)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePacketModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createPacket}
        />
      )}
    </div>
  );
}

interface PacketCardProps {
  packet: AttorneyPacket;
  onClick: () => void;
}

function PacketCard({ packet, onClick }: PacketCardProps) {
  const category = PACKET_CATEGORIES.find(c => c.id === packet.category);
  const riskCount = packet.risk_flags.length;
  const criticalRisks = packet.risk_flags.filter(r => r.level === 'critical' || r.level === 'high').length;
  const evidenceComplete = packet.evidence_checklist.filter(e => e.collected).length;
  const evidenceTotal = packet.evidence_checklist.length;

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{packet.name}</h3>
            <span className={`px-2 py-1 text-xs rounded ${
              packet.status === 'ready_to_export'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {packet.status === 'ready_to_export' ? 'Ready' : 'Review'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{packet.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className={`px-2 py-1 rounded text-xs font-medium bg-${category?.color}-100 text-${category?.color}-800`}>
          {category?.name}
        </span>
        {riskCount > 0 && (
          <span className={`flex items-center gap-1 ${criticalRisks > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
            <AlertTriangle className="w-4 h-4" />
            <span>{riskCount} risk{riskCount !== 1 ? 's' : ''}</span>
          </span>
        )}
        {evidenceTotal > 0 && (
          <span className="flex items-center gap-1 text-gray-600">
            <CheckSquare className="w-4 h-4" />
            <span>{evidenceComplete}/{evidenceTotal} evidence</span>
          </span>
        )}
        <span className={`ml-auto text-xs px-2 py-1 rounded ${
          packet.confidence_level === 'high' ? 'bg-green-100 text-green-800' :
          packet.confidence_level === 'medium' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {packet.confidence_level} confidence
        </span>
      </div>
    </div>
  );
}

interface CreatePacketModalProps {
  onClose: () => void;
  onCreate: (data: Partial<AttorneyPacket>) => void;
}

function CreatePacketModal({ onClose, onCreate }: CreatePacketModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AttorneyPacket>>({
    name: '',
    description: '',
    category: 'tax_credit',
    rationale: '',
    estimated_benefit: '',
    confidence_level: 'medium',
    citations: [],
    assumptions: [],
    risk_flags: [],
    evidence_checklist: [],
  });

  const handleSubmit = () => {
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Attorney Packet</h2>
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
          <Step2Legal formData={formData} setFormData={setFormData} onBack={() => setStep(1)} onNext={() => setStep(3)} />
        )}

        {step === 3 && (
          <Step3Evidence formData={formData} setFormData={setFormData} onBack={() => setStep(2)} onSubmit={handleSubmit} />
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Packet Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., R&D Tax Credit - 2023"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this tax matter..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {PACKET_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setFormData({ ...formData, category: category.id })}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  formData.category === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Benefit (Optional)</label>
          <input
            type="text"
            value={formData.estimated_benefit || ''}
            onChange={(e) => setFormData({ ...formData, estimated_benefit: e.target.value })}
            placeholder="e.g., $25,000 - $40,000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
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
          Next: Legal Analysis
        </button>
      </div>
    </div>
  );
}

function Step2Legal({ formData, setFormData, onBack, onNext }: any) {
  const addCitation = () => {
    const newCitation: AttorneyCitation = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'statute',
      reference: '',
      description: '',
    };
    setFormData({ ...formData, citations: [...(formData.citations || []), newCitation] });
  };

  const addAssumption = () => {
    const newAssumption: AttorneyAssumption = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      verification_required: true,
    };
    setFormData({ ...formData, assumptions: [...(formData.assumptions || []), newAssumption] });
  };

  const addRisk = () => {
    const newRisk: AttorneyRiskFlag = {
      id: Math.random().toString(36).substr(2, 9),
      level: 'medium',
      category: '',
      description: '',
    };
    setFormData({ ...formData, risk_flags: [...(formData.risk_flags || []), newRisk] });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Legal Analysis</h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rationale</label>
          <textarea
            value={formData.rationale}
            onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
            placeholder="Explain the legal basis for this tax position..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Citations</label>
            <button onClick={addCitation} className="text-sm text-blue-600 hover:text-blue-700">
              + Add Citation
            </button>
          </div>
          <div className="space-y-2">
            {(formData.citations || []).map((citation: AttorneyCitation, idx: number) => (
              <div key={citation.id} className="p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={citation.reference}
                  onChange={(e) => {
                    const updated = [...formData.citations];
                    updated[idx] = { ...citation, reference: e.target.value };
                    setFormData({ ...formData, citations: updated });
                  }}
                  placeholder="IRC §41, 26 U.S.C. §41"
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2"
                />
                <input
                  type="text"
                  value={citation.description}
                  onChange={(e) => {
                    const updated = [...formData.citations];
                    updated[idx] = { ...citation, description: e.target.value };
                    setFormData({ ...formData, citations: updated });
                  }}
                  placeholder="Description"
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
            {(formData.assumptions || []).map((assumption: AttorneyAssumption, idx: number) => (
              <div key={assumption.id} className="p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={assumption.description}
                  onChange={(e) => {
                    const updated = [...formData.assumptions];
                    updated[idx] = { ...assumption, description: e.target.value };
                    setFormData({ ...formData, assumptions: updated });
                  }}
                  placeholder="e.g., Business revenue exceeds $1M annually"
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
            {(formData.risk_flags || []).map((risk: AttorneyRiskFlag, idx: number) => (
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
          Next: Evidence
        </button>
      </div>
    </div>
  );
}

function Step3Evidence({ formData, setFormData, onBack, onSubmit }: any) {
  const addEvidence = () => {
    const newItem: EvidenceChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      item: '',
      required: true,
      collected: false,
    };
    setFormData({ ...formData, evidence_checklist: [...(formData.evidence_checklist || []), newItem] });
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Evidence Checklist</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Required Evidence</label>
            <button onClick={addEvidence} className="text-sm text-blue-600 hover:text-blue-700">
              + Add Item
            </button>
          </div>
          <div className="space-y-2">
            {(formData.evidence_checklist || []).map((item: EvidenceChecklistItem, idx: number) => (
              <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={item.item}
                  onChange={(e) => {
                    const updated = [...formData.evidence_checklist];
                    updated[idx] = { ...item, item: e.target.value };
                    setFormData({ ...formData, evidence_checklist: updated });
                  }}
                  placeholder="e.g., W-2 forms for all employees"
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) => {
                        const updated = [...formData.evidence_checklist];
                        updated[idx] = { ...item, required: e.target.checked };
                        setFormData({ ...formData, evidence_checklist: updated });
                      }}
                      className="w-4 h-4"
                    />
                    Required
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            This packet will be created with "Needs Review" status. You can review and mark it ready to export later.
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
          Create Packet
        </button>
      </div>
    </div>
  );
}

interface PacketDetailProps {
  packet: AttorneyPacket;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<AttorneyPacket>) => void;
  onMarkReviewed: (id: string) => void;
  onExport: (packet: AttorneyPacket) => void;
}

function PacketDetail({ packet, onBack, onUpdate, onMarkReviewed, onExport }: PacketDetailProps) {
  const category = PACKET_CATEGORIES.find(c => c.id === packet.category);
  const requiredEvidence = packet.evidence_checklist.filter(e => e.required).length;
  const collectedEvidence = packet.evidence_checklist.filter(e => e.required && e.collected).length;
  const allRequiredCollected = requiredEvidence === collectedEvidence;

  const toggleEvidence = (itemId: string) => {
    const updated = packet.evidence_checklist.map(item =>
      item.id === itemId ? { ...item, collected: !item.collected } : item
    );
    onUpdate(packet.id, { evidence_checklist: updated });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <X className="w-5 h-5" />
        <span>Back to packets</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{packet.name}</h1>
              <span className={`px-3 py-1 text-sm rounded ${
                packet.status === 'ready_to_export'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {packet.status === 'ready_to_export' ? 'Ready to Export' : 'Needs Review'}
              </span>
              <span className={`px-3 py-1 text-sm rounded bg-${category?.color}-100 text-${category?.color}-800`}>
                {category?.name}
              </span>
            </div>
            <p className="text-lg text-gray-600">{packet.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            {packet.status === 'needs_review' && allRequiredCollected && (
              <button
                onClick={() => onMarkReviewed(packet.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FileCheck className="w-4 h-4" />
                <span>Mark Ready</span>
              </button>
            )}
            <button
              onClick={() => onExport(packet)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
            <p className="text-xl font-bold text-gray-900 capitalize">{packet.confidence_level}</p>
          </div>
          {packet.estimated_benefit && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Estimated Benefit</p>
              <p className="text-xl font-bold text-gray-900">{packet.estimated_benefit}</p>
            </div>
          )}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Evidence Progress</p>
            <p className="text-xl font-bold text-gray-900">{collectedEvidence}/{requiredEvidence}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Rationale
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{packet.rationale}</p>
            </div>
          </div>

          {packet.citations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Legal Citations</h2>
              <div className="space-y-2">
                {packet.citations.map((citation, idx) => (
                  <div key={citation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {citation.type.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-gray-900">{citation.reference}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{citation.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {packet.assumptions.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Assumptions</h2>
              <div className="space-y-2">
                {packet.assumptions.map((assumption, idx) => (
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

          {packet.risk_flags.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Risk Flags
              </h2>
              <div className="space-y-2">
                {packet.risk_flags.map((risk, idx) => (
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

          {packet.evidence_checklist.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Evidence Checklist
              </h2>
              <div className="space-y-2">
                {packet.evidence_checklist.map((item, idx) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.collected}
                      onChange={() => toggleEvidence(item.id)}
                      className="w-5 h-5 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-500">{idx + 1}.</span>
                        <span className={`text-gray-900 ${item.collected ? 'line-through' : ''}`}>
                          {item.item}
                        </span>
                        {item.required && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            REQUIRED
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 ml-7">{item.notes}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Created: {new Date(packet.created_at).toLocaleString()}</span>
            {packet.reviewed_at && (
              <span>Reviewed: {new Date(packet.reviewed_at).toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
