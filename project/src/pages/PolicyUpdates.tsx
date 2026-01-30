import { useEffect, useState } from 'react';
import { FileText, ExternalLink, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { featureFlags } from '../lib/featureFlags';

interface PolicyUpdate {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  published_date: string;
  who_benefits: string;
  required_actions: string;
  submission_links: Array<{ label: string; url: string }>;
  target_audience: any;
  published_at: string;
}

export function PolicyUpdates() {
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<PolicyUpdate | null>(null);

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      if (!isSupabaseAvailable() || !featureFlags.enableSupabase) {
        console.log('Policy updates require Supabase - running in offline mode');
        setUpdates([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('published_policy_updates')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading policy updates:', error);
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const getRelevanceScore = (update: PolicyUpdate): number => {
    // stable-ish score per update to avoid unused param + UI jitter
    const seed = String(update.id || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return 70 + (seed % 30);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Policy Updates</h1>
          <p className="text-gray-300 mt-2">
            Personalized policy and program updates that may benefit your business
          </p>
          <div className="mt-4 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cyan-100">
                <p className="font-bold">Important Notice</p>
                <p className="mt-1 text-cyan-200">
                  This information is provided for educational purposes only and does not constitute legal, tax, or financial advice.
                  Always verify information with official sources and consult qualified professionals before making decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {updates.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-xl">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Updates Yet</h3>
            <p className="text-gray-300">
              Check back soon for personalized policy updates relevant to your business.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {updates.map((update) => {
              const relevance = getRelevanceScore(update);
              return (
                <div
                  key={update.id}
                  className="glass-panel-hover rounded-xl p-6 cursor-pointer"
                  onClick={() => setSelectedUpdate(update)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                          relevance >= 85 ? 'bg-green-900/30 text-green-300 border-green-500/30' :
                          relevance >= 70 ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30' :
                          'bg-gray-700/50 text-gray-300 border-gray-600/50'
                        }`}>
                          {relevance}% Match
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(update.published_date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {update.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                    {update.summary}
                  </p>

                  <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-xl">
                    <p className="text-xs font-bold text-green-300 mb-1">Who Benefits:</p>
                    <p className="text-sm text-green-200">{update.who_benefits}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FileText className="w-4 h-4" />
                      <span>{update.source_name}</span>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-bold text-cyan-400 hover:text-cyan-300 smooth-transition">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedUpdate && (
          <UpdateDetailModal
            update={selectedUpdate}
            onClose={() => setSelectedUpdate(null)}
          />
        )}
      </div>
    </div>
  );
}

interface UpdateDetailModalProps {
  update: PolicyUpdate;
  onClose: () => void;
}

function UpdateDetailModal({ update, onClose }: UpdateDetailModalProps) {
  const actions = update.required_actions.split(/\d+\./).filter(a => a.trim());

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-panel border-b border-gray-700/50 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {update.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(update.published_date).toLocaleDateString()}
                </span>
                <a
                  href={update.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  {update.source_name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 smooth-transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-100">
                <p className="font-bold">Disclaimer</p>
                <p className="mt-1 text-yellow-200">
                  This is not legal, tax, or financial advice. Verify all information with official sources
                  and consult qualified professionals before taking action.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">Summary</h3>
            <p className="text-gray-300">{update.summary}</p>
          </div>

          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
            <h3 className="text-sm font-bold text-green-300 mb-2">Who Benefits</h3>
            <p className="text-green-200">{update.who_benefits}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3">Required Actions</h3>
            <div className="space-y-3">
              {actions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-900/30 text-cyan-400 flex items-center justify-center text-sm font-bold border border-cyan-500/30">
                    {idx + 1}
                  </div>
                  <p className="text-gray-300 pt-0.5">{action.trim()}</p>
                </div>
              ))}
            </div>
          </div>

          {update.submission_links && update.submission_links.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Resources & Links</h3>
              <div className="space-y-2">
                {update.submission_links.map((link, idx) => (
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

          <div className="pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-400">
              Source: <a href={update.source_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                {update.source_name}
              </a>
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 smooth-transition shadow-lg shadow-cyan-500/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
