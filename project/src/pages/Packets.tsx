import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Copy, Lock, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureGating } from '../hooks/useFeatureGating';
import { Packet, PacketField, Binder, BinderSection, Document, Bill } from '../types';

const STORAGE_KEY_PACKETS = 'pnx_packets';
const STORAGE_KEY_BINDERS = 'pnx_binders';

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

const MOCK_PROFILE = {
  business_name: 'Acme Corp',
  ein: '12-3456789',
  address: '123 Main St, Springfield, IL 62701',
  phone: '(555) 123-4567',
  email: 'contact@acmecorp.com',
  owner_name: 'John Smith',
  owner_ssn: 'XXX-XX-1234',
  annual_revenue: '$500,000',
  employees: '12',
  business_type: 'LLC',
  incorporation_date: '2020-01-15',
};

const TEMPLATE_TYPES = [
  { id: 'loan', name: 'Loan Application', fields: ['business_name', 'ein', 'address', 'annual_revenue', 'owner_name', 'purpose'] },
  { id: 'grant', name: 'Grant Application', fields: ['business_name', 'ein', 'address', 'employees', 'project_description', 'budget'] },
  { id: 'tax', name: 'Tax Credit Form', fields: ['business_name', 'ein', 'business_type', 'annual_revenue', 'expenses', 'credits'] },
  { id: 'license', name: 'Business License', fields: ['business_name', 'address', 'owner_name', 'business_type', 'incorporation_date'] },
];

export function Packets() {
  const { user, organization } = useAuth();
  const { hasFeature } = useFeatureGating();
  const [packets, setPackets] = useState<Packet[]>([]);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBinderModal, setShowBinderModal] = useState(false);

  useEffect(() => {
    if (organization) {
      loadData();
    }
  }, [organization]);

  const loadData = () => {
    const loadedPackets = loadFromLocalStorage<Packet[]>(STORAGE_KEY_PACKETS, []);
    setPackets(loadedPackets);
    const loadedBinders = loadFromLocalStorage<Binder[]>(STORAGE_KEY_BINDERS, []);
    setBinders(loadedBinders);
  };

  const createPacket = (templateType: string, name: string) => {
    const template = TEMPLATE_TYPES.find(t => t.id === templateType);
    if (!template) return;

    const fields: PacketField[] = template.fields.map(fieldName => {
      const value = (MOCK_PROFILE as any)[fieldName] || '';
      return {
        id: Math.random().toString(36).substr(2, 9),
        label: fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value,
        source: Object.keys(MOCK_PROFILE).includes(fieldName) ? 'profile' : 'manual',
      };
    });

    const newPacket: Packet = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: organization?.id || '',
      name,
      description: `${template.name} - Version 1`,
      template_type: templateType,
      version: 1,
      fields,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user?.id || '',
    };

    const updated = [...packets, newPacket];
    setPackets(updated);
    saveToLocalStorage(STORAGE_KEY_PACKETS, updated);
    setShowCreateModal(false);
  };

  const createNewVersion = (basePacket: Packet) => {
    const maxVersion = packets
      .filter(p => p.name === basePacket.name)
      .reduce((max, p) => Math.max(max, p.version), 0);

    const newPacket: Packet = {
      ...basePacket,
      id: Math.random().toString(36).substr(2, 9),
      version: maxVersion + 1,
      description: `${basePacket.name} - Version ${maxVersion + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...packets, newPacket];
    setPackets(updated);
    saveToLocalStorage(STORAGE_KEY_PACKETS, updated);
    setSelectedPacket(newPacket);
  };

  const updatePacketField = (packetId: string, fieldId: string, newValue: string) => {
    const updated = packets.map(p => {
      if (p.id === packetId) {
        return {
          ...p,
          fields: p.fields.map(f => f.id === fieldId ? { ...f, value: newValue } : f),
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
    setPackets(updated);
    saveToLocalStorage(STORAGE_KEY_PACKETS, updated);
    if (selectedPacket?.id === packetId) {
      setSelectedPacket(updated.find(p => p.id === packetId) || null);
    }
  };

  const exportIndexedBinder = (selectedPacketIds: string[]) => {
    const selectedPackets = packets.filter(p => selectedPacketIds.includes(p.id));
    const documents = loadFromLocalStorage<Document[]>('pnx_documents', []).slice(0, 5);
    const bills = loadFromLocalStorage<Bill[]>('pnx_bills', []).slice(0, 3);

    let pageNumber = 1;
    const sections: BinderSection[] = [];

    const packetSection: BinderSection = {
      id: 'packets',
      title: 'Application Packets',
      page_number: pageNumber,
      items: selectedPackets.map(p => {
        const item = {
          id: p.id,
          title: `${p.name} (v${p.version})`,
          type: 'packet' as const,
          reference_id: p.id,
          page_number: pageNumber,
          description: p.description,
        };
        pageNumber += 2;
        return item;
      }),
    };
    sections.push(packetSection);

    if (documents.length > 0) {
      const docSection: BinderSection = {
        id: 'documents',
        title: 'Supporting Documents',
        page_number: pageNumber,
        items: documents.map(doc => {
          const item = {
            id: doc.id,
            title: doc.title,
            type: 'document' as const,
            reference_id: doc.id,
            page_number: pageNumber,
            description: doc.summary,
          };
          pageNumber += 1;
          return item;
        }),
      };
      sections.push(docSection);
    }

    if (bills.length > 0) {
      const financialSection: BinderSection = {
        id: 'financial',
        title: 'Financial Records',
        page_number: pageNumber,
        items: bills.map(bill => {
          const item = {
            id: bill.id,
            title: `${bill.payee} - ${bill.category}`,
            type: 'financial' as const,
            reference_id: bill.id,
            page_number: pageNumber,
            description: `$${bill.amount.toFixed(2)} due ${bill.due_date}`,
          };
          pageNumber += 1;
          return item;
        }),
      };
      sections.push(financialSection);
    }

    const tableOfContents = sections.map(s =>
      `${s.title} .......................... Page ${s.page_number}`
    );

    const evidenceIndex = sections.flatMap(s =>
      s.items.map(item =>
        `${item.title} .......................... Page ${item.page_number}`
      )
    );

    const newBinder: Binder = {
      id: Math.random().toString(36).substr(2, 9),
      organization_id: organization?.id || '',
      name: `Binder - ${new Date().toLocaleDateString()}`,
      description: `Indexed binder with ${selectedPackets.length} packets, ${documents.length} documents, ${bills.length} financial records`,
      sections,
      table_of_contents: tableOfContents,
      evidence_index: evidenceIndex,
      created_at: new Date().toISOString(),
      created_by: user?.id || '',
    };

    const updated = [...binders, newBinder];
    setBinders(updated);
    saveToLocalStorage(STORAGE_KEY_BINDERS, updated);

    const binderContent = generateBinderText(newBinder);
    downloadBinder(binderContent, newBinder.name);
    setShowBinderModal(false);
  };

  const generateBinderText = (binder: Binder): string => {
    let content = `INDEXED BINDER\n`;
    content += `${binder.name}\n`;
    content += `Generated: ${new Date(binder.created_at).toLocaleString()}\n`;
    content += `\n${'='.repeat(80)}\n\n`;

    content += `TABLE OF CONTENTS\n`;
    content += `${'='.repeat(80)}\n\n`;
    binder.table_of_contents.forEach(line => {
      content += `${line}\n`;
    });
    content += `\n${'='.repeat(80)}\n\n`;

    content += `EVIDENCE INDEX\n`;
    content += `${'='.repeat(80)}\n\n`;
    binder.evidence_index.forEach(line => {
      content += `${line}\n`;
    });
    content += `\n${'='.repeat(80)}\n\n`;

    binder.sections.forEach(section => {
      content += `\n\nSECTION: ${section.title.toUpperCase()}\n`;
      content += `Page ${section.page_number}\n`;
      content += `${'-'.repeat(80)}\n\n`;

      section.items.forEach(item => {
        content += `\n[Page ${item.page_number}]\n`;
        content += `${item.title}\n`;
        if (item.description) {
          content += `${item.description}\n`;
        }
        content += `\n`;

        if (item.type === 'packet') {
          const packet = packets.find(p => p.id === item.reference_id);
          if (packet) {
            packet.fields.forEach(field => {
              content += `  ${field.label}: ${field.value}\n`;
            });
          }
        }
        content += `\n`;
      });
    });

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

  if (!hasFeature('packets')) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Lock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prefilled Packets Not Available</h2>
          <p className="text-gray-600 mb-4">Upgrade to Business plan to access Prefilled Packets and Indexed Binder Export.</p>
        </div>
      </div>
    );
  }

  if (selectedPacket) {
    return (
      <PacketDetail
        packet={selectedPacket}
        onBack={() => setSelectedPacket(null)}
        onUpdateField={updatePacketField}
        onCreateVersion={() => createNewVersion(selectedPacket)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Prefilled Packets</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBinderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            <span>Export Binder</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Create Packet</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Packets</h2>
        {packets.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No packets created yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Packet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {packets.map(packet => (
              <PacketCard
                key={packet.id}
                packet={packet}
                onClick={() => setSelectedPacket(packet)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePacketModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createPacket}
        />
      )}

      {showBinderModal && (
        <BinderExportModal
          packets={packets}
          onClose={() => setShowBinderModal(false)}
          onExport={exportIndexedBinder}
        />
      )}
    </div>
  );
}

interface PacketCardProps {
  packet: Packet;
  onClick: () => void;
}

function PacketCard({ packet, onClick }: PacketCardProps) {
  const template = TEMPLATE_TYPES.find(t => t.id === packet.template_type);
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{packet.name}</h3>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              v{packet.version}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{template?.name || packet.template_type}</p>
          <p className="text-sm text-gray-700">{packet.fields.length} fields prefilled</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Updated {new Date(packet.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

interface CreatePacketModalProps {
  onClose: () => void;
  onCreate: (templateType: string, name: string) => void;
}

function CreatePacketModal({ onClose, onCreate }: CreatePacketModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (selectedTemplate && name) {
      onCreate(selectedTemplate, name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Prefilled Packet</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Packet Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., SBA Loan Application"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATE_TYPES.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.fields.length} fields</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            Fields will be automatically prefilled from your profile, financial records, and documents.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedTemplate || !name}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Packet
          </button>
        </div>
      </div>
    </div>
  );
}

interface BinderExportModalProps {
  packets: Packet[];
  onClose: () => void;
  onExport: (selectedPacketIds: string[]) => void;
}

function BinderExportModal({ packets, onClose, onExport }: BinderExportModalProps) {
  const [selectedPackets, setSelectedPackets] = useState<string[]>([]);

  const togglePacket = (id: string) => {
    setSelectedPackets(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Export Indexed Binder</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Select packets to include in your indexed binder. The binder will include a table of contents and evidence index.
        </p>

        <div className="mb-6 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {packets.map(packet => (
              <label
                key={packet.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPackets.includes(packet.id)}
                  onChange={() => togglePacket(packet.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{packet.name}</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      v{packet.version}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{packet.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-900">
            Binder will include: Table of Contents, Evidence Index, and all selected packets with supporting documents.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onExport(selectedPackets)}
            disabled={selectedPackets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export Binder</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PacketDetailProps {
  packet: Packet;
  onBack: () => void;
  onUpdateField: (packetId: string, fieldId: string, newValue: string) => void;
  onCreateVersion: () => void;
}

function PacketDetail({ packet, onBack, onUpdateField, onCreateVersion }: PacketDetailProps) {
  const template = TEMPLATE_TYPES.find(t => t.id === packet.template_type);

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
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{packet.name}</h1>
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg">
                Version {packet.version}
              </span>
            </div>
            <p className="text-lg text-gray-600">{template?.name || packet.template_type}</p>
          </div>
          <button
            onClick={onCreateVersion}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Copy className="w-4 h-4" />
            <span>New Version</span>
          </button>
        </div>

        <div className="space-y-4">
          {packet.fields.map(field => (
            <div key={field.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <span className={`text-xs px-2 py-1 rounded ${
                  field.source === 'profile' ? 'bg-green-100 text-green-800' :
                  field.source === 'financial' ? 'bg-blue-100 text-blue-800' :
                  field.source === 'document' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {field.source}
                </span>
              </div>
              <input
                type="text"
                value={field.value}
                onChange={(e) => onUpdateField(packet.id, field.id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Created: {new Date(packet.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(packet.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
