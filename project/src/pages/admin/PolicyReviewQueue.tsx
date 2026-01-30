import { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Eye, ExternalLink, AlertTriangle, Calendar } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { featureFlags } from '../../lib/featureFlags';

interface QueueItem {
  id: string;
  source_id: string;
  title: string;
  summary: string;
  published_date: string;
  who_benefits: string;
  required_actions: string;
  submission_links: Array<{ label: string; url: string }>;
  confidence_score: number;
  needs_human_review: boolean;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  policy_sources?: {
    name: string;
    url: string;
    category: string;
  };
}

export function PolicyReviewQueue() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadQueueItems();
  }, [filter]);

  const loadQueueItems = async () => {
    try {
      if (!isSupabaseAvailable() || !featureFlags.enableSupabase) {
        console.log('Policy review queue requires Supabase - running in offline mode');
        setQueueItems([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('policy_updates_queue')
        .select(`
          *,
          policy_sources (
            name,
            url,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('review_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setQueueItems(data || []);
    } catch (error) {
      console.error('Error loading queue items:', error);
      setQueueItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      if (!isSupabaseAvailable() || !featureFlags.enableSupabase) {
        alert('This feature requires Supabase connection');
        return;
      }

      const { error } = await supabase
        .from('policy_updates_queue')
        .update({
          review_status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      if (action === 'approve') {
        await publishUpdate(itemId);
      }

      loadQueueItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error reviewing item:', error);
      alert('Failed to review item');
    }
  };

  const publishUpdate = async (queueItemId: string) => {
    try {
      if (!isSupabaseAvailable() || !featureFlags.enableSupabase) {
        return;
      }

      const item = queueItems.find(i => i.id === queueItemId);
      if (!item) return;

      const { error } = await supabase
        .from('published_policy_updates')
        .insert({
          queue_id: item.id,
          title: item.title,
          summary: item.summary,
          source_name: item.policy_sources?.name || 'Unknown Source',
          source_url: item.policy_sources?.url || '',
          published_date: item.published_date,
          who_benefits: item.who_benefits,
          required_actions: item.required_actions,
          submission_links: item.submission_links || [],
          target_audience: {},
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error publishing update:', error);
    }
  };

  const stats = {
    pending: queueItems.filter(i => i.review_status === 'pending').length,
    approved: queueItems.filter(i => i.review_status === 'approved').length,
    rejected: queueItems.filter(i => i.review_status === 'rejected').length,
    needsReview: queueItems.filter(i => i.needs_human_review).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Policy Review Queue</h1>
        <p className="text-gray-300 mt-1">
          Review and approve policy updates before publishing to users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel-hover rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-900/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel-hover rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-900/30 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel-hover rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-900/30 rounded-xl">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel-hover rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Needs Review</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.needsReview}</p>
            </div>
            <div className="p-3 bg-cyan-900/30 rounded-xl">
              <Eye className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-bold smooth-transition ${
            filter === 'all'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-800/70'
          }`}
        >
          All ({queueItems.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl font-bold smooth-transition ${
            filter === 'pending'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-800/70'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-xl font-bold smooth-transition ${
            filter === 'approved'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-800/70'
          }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-xl font-bold smooth-transition ${
            filter === 'rejected'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-800/70'
          }`}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      <div className="space-y-4">
        {queueItems.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-xl">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Items</h3>
            <p className="text-gray-300">No policy updates in this category.</p>
          </div>
        ) : (
          queueItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel-hover rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                      item.review_status === 'pending' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' :
                      item.review_status === 'approved' ? 'bg-green-900/30 text-green-300 border-green-500/30' :
                      'bg-red-900/30 text-red-300 border-red-500/30'
                    }`}>
                      {item.review_status}
                    </span>
                    {item.needs_human_review && (
                      <span className="px-2 py-1 rounded-lg text-xs font-bold bg-orange-900/30 text-orange-300 border border-orange-500/30">
                        Needs Review
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-cyan-900/30 text-cyan-300 border border-cyan-500/30">
                      {item.confidence_score}% Confidence
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.published_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <FileText className="w-4 h-4" />
                    <span>{item.policy_sources?.name || 'Unknown Source'}</span>
                    <span className="px-2 py-0.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-xs">
                      {item.policy_sources?.category || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-300 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800/70 smooth-transition"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </button>
                {item.review_status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleReview(item.id, 'reject')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-300 bg-red-900/30 border border-red-500/30 rounded-xl hover:bg-red-900/40 smooth-transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleReview(item.id, 'approve')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-500 hover:to-emerald-500 smooth-transition shadow-lg shadow-green-500/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Publish
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <ReviewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onApprove={() => handleReview(selectedItem.id, 'approve')}
          onReject={() => handleReview(selectedItem.id, 'reject')}
        />
      )}
    </div>
  );
}

interface ReviewModalProps {
  item: QueueItem;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

function ReviewModal({ item, onClose, onApprove, onReject }: ReviewModalProps) {
  const actions = item.required_actions.split(/\d+\./).filter(a => a.trim());

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-panel border-b border-gray-700/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {item.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                  item.review_status === 'pending' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' :
                  item.review_status === 'approved' ? 'bg-green-900/30 text-green-300 border-green-500/30' :
                  'bg-red-900/30 text-red-300 border-red-500/30'
                }`}>
                  {item.review_status}
                </span>
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-cyan-900/30 text-cyan-300 border border-cyan-500/30">
                  {item.confidence_score}% Confidence
                </span>
                {item.needs_human_review && (
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-orange-900/30 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Needs Review
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200 smooth-transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-2">Source</h3>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <a
                href={item.policy_sources?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {item.policy_sources?.name || 'Unknown Source'}
                <ExternalLink className="w-4 h-4" />
              </a>
              <span className="px-2 py-0.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-xs text-gray-300">
                {item.policy_sources?.category || 'N/A'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-2">Published Date</h3>
            <p className="text-white">{new Date(item.published_date).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-2">Summary</h3>
            <p className="text-white">{item.summary}</p>
          </div>

          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
            <h3 className="text-sm font-bold text-green-300 mb-2">Who Benefits</h3>
            <p className="text-green-200">{item.who_benefits}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3">Required Actions</h3>
            <div className="space-y-2">
              {actions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-900/30 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/30">
                    {idx + 1}
                  </div>
                  <p className="text-gray-300 pt-0.5">{action.trim()}</p>
                </div>
              ))}
            </div>
          </div>

          {item.submission_links && item.submission_links.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-300 mb-3">Submission Links</h3>
              <div className="space-y-2">
                {item.submission_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-cyan-500/30 smooth-transition"
                  >
                    <span className="text-sm font-semibold text-white">{link.label}</span>
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {item.review_status === 'pending' && (
          <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 p-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-300 bg-gray-800/50 border border-gray-700/50 rounded-xl font-bold hover:bg-gray-800/70 smooth-transition"
            >
              Cancel
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:from-red-500 hover:to-red-600 smooth-transition shadow-lg shadow-red-500/20"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 smooth-transition shadow-lg shadow-green-500/20"
            >
              <CheckCircle className="w-5 h-5" />
              Approve & Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
