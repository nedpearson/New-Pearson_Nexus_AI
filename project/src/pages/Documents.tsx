import { useState, useEffect } from 'react';
import { Plus, FileText, Filter, X, Search, CheckCircle, AlertCircle, Link, Upload, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Document, DocumentLink } from '../types';
import * as documentStore from '../lib/documentStore';
import { uploadDocumentFile, downloadDocumentFile } from '../lib/documentStorage';

export function Documents() {
  const { organization } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (organization) {
      loadDocuments();
    }
  }, [organization]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, categoryFilter, statusFilter]);

  const loadDocuments = () => {
    try {
      setLoading(true);
      const docs = documentStore.listDocuments(organization?.id || '1');
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocs(filtered);
  };

  const categories = Array.from(new Set(documents.map(d => d.category)));

  const approveCategory = (docId: string) => {
    try {
      documentStore.updateDocument(docId, { status: 'Approved' });
      loadDocuments();
      if (selectedDoc?.id === docId) {
        setSelectedDoc({ ...selectedDoc, status: 'Approved' });
      }
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Documents</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 glass-panel-hover rounded-xl smooth-transition"
          >
            <Filter className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-medium text-gray-200">Filters</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 smooth-transition shadow-lg shadow-cyan-500/30"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Document</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 glass-panel rounded-xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
              >
                <option value="all">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="glass-panel-hover rounded-xl p-5 smooth-transition text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-8 h-8 text-cyan-400" />
                {doc.status === 'Approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                )}
              </div>
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{doc.title}</h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{doc.summary}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30">{doc.category}</span>
                <span className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()}</span>
              </div>
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-400 rounded-lg border border-gray-700/50">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && filteredDocs.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-2xl">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No documents found</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 smooth-transition shadow-lg shadow-cyan-500/30"
          >
            Add Your First Document
          </button>
        </div>
      )}

      {selectedDoc && (
        <DocumentDetailModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onApprove={() => approveCategory(selectedDoc.id)}
          onUpdate={loadDocuments}
        />
      )}

      {showAddModal && (
        <AddDocumentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadDocuments();
          }}
        />
      )}
    </div>
  );
}

interface DocumentDetailModalProps {
  document: Document;
  onClose: () => void;
  onApprove: () => void;
  onUpdate: () => void;
}

function DocumentDetailModal({ document, onClose, onApprove, onUpdate }: DocumentDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(document.category);
  const [subcategory, setSubcategory] = useState(document.subcategory || '');
  const [linkedItems, setLinkedItems] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    loadLinkedItems();
  }, [document.id]);

  const loadLinkedItems = () => {
    try {
      setLoadingLinks(true);
      const links = documentStore.getDocumentLinks('document', document.id);

      if (links && links.length > 0) {
        const items = links.map((link: DocumentLink) => {
          return {
            type: link.linked_entity_type,
            title: `Linked ${link.linked_entity_type}`,
            id: link.linked_entity_id,
          };
        });

        setLinkedItems(items.filter(item => item !== null));
      } else {
        setLinkedItems([]);
      }
    } catch (error) {
      console.error('Error loading linked items:', error);
      setLinkedItems([]);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleSaveCategory = () => {
    try {
      documentStore.updateDocument(document.id, { category, subcategory });
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Document Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">{document.title}</h3>
            </div>
            <p className="text-gray-600">{document.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="font-medium text-gray-900">{document.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-medium text-gray-900">{new Date(document.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Category</p>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="Subcategory (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setCategory(document.category);
                      setSubcategory(document.subcategory || '');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                  {document.category}
                </span>
                {document.subcategory && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                    {document.subcategory}
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <div className="flex items-center gap-3">
              {document.status === 'Approved' ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Approved</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Needs Review</span>
                  </div>
                  <button
                    onClick={onApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Category
                  </button>
                </>
              )}
            </div>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {document.file_path && document.file_name && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Attached File</p>
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{document.file_name}</p>
                  {document.file_size && (
                    <p className="text-sm text-gray-600">
                      {(document.file_size / 1024).toFixed(1)} KB
                      {document.file_type && ` • ${document.file_type.split('/')[1]?.toUpperCase()}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    try {
                      await downloadDocumentFile(document.file_path!, document.file_name!);
                    } catch (error) {
                      console.error('Error downloading file:', error);
                      alert('Failed to download file. Please try again.');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Linked Items</h3>
            </div>
            {loadingLinks ? (
              <p className="text-sm text-gray-500">Loading linked items...</p>
            ) : linkedItems.length > 0 ? (
              <div className="space-y-2">
                {linkedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                      {item.type}
                    </span>
                    <span className="text-sm text-gray-900 flex-1">{item.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No linked items. This document can be used as proof for bills, transactions, legal cases, tasks, events, and recommendations.</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 This document serves as proof/evidence for the items listed above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AddDocumentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddDocumentModal({ onClose, onSuccess }: AddDocumentModalProps) {
  const { organization } = useAuth();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const suggestCategory = () => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('bill') || titleLower.includes('utility')) {
      setCategory('Utilities');
      setType('Bill');
    } else if (titleLower.includes('insurance')) {
      setCategory('Insurance');
      setType('Insurance');
    } else if (titleLower.includes('tax')) {
      setCategory('Finance');
      setSubcategory('Tax Documents');
      setType('Tax');
    } else if (titleLower.includes('lease') || titleLower.includes('contract')) {
      setCategory('Legal');
      setType('Legal');
    } else {
      setCategory('General');
      setType('Document');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setUploadProgress('');

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      let fileData: { path: string; name: string; size: number; type: string } | undefined;

      if (file && organization?.id) {
        setUploadProgress('Uploading file...');
        try {
          fileData = await uploadDocumentFile(file, organization.id);
          setUploadProgress('File uploaded successfully!');
        } catch (error) {
          console.error('Error uploading file:', error);
          setUploadProgress('File upload failed. Document will be saved without file.');
        }
      }

      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        organizationId: organization?.id || '1',
        title,
        type: type || 'Document',
        summary,
        category: category || 'General',
        subcategory: subcategory || undefined,
        tags: tagsArray,
        status: 'Needs Review',
        date: new Date().toISOString().split('T')[0],
        file_path: fileData?.path,
        file_name: fileData?.name,
        file_size: fileData?.size,
        file_type: fileData?.type,
      };

      documentStore.addDocument(newDoc);
      onSuccess();
    } catch (error) {
      console.error('Error adding document:', error);
      setUploadProgress('Error saving document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add Document</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={suggestCategory}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary *
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., utility, monthly, important"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (optional)
            </label>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'Choose a file or drag here'}
                </span>
              </label>
            </div>
            {file && (
              <div className="mt-2 flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {uploadProgress && (
              <p className="mt-2 text-sm text-gray-600">{uploadProgress}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Document'}
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
