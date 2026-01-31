import { useEffect, useState } from 'react';
import { Download, FileText, RefreshCcw } from 'lucide-react';

type UploadRecord = {
  id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
  sha256: string;
  case_id: string | null;
  tags: string[];
  notes: string;
  captured_at: string | null;
  location: string | null;
  created_at: string;
};

export function Uploads() {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/uploads', { credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || 'FAILED_TO_LOAD_UPLOADS');
      setUploads(Array.isArray(body.uploads) ? body.uploads : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'FAILED_TO_LOAD_UPLOADS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Uploads</h1>
          <p className="text-gray-400">Uploaded photos/files stored in your local database</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-xl bg-gray-800/50 text-gray-200 hover:bg-gray-800/70 border border-gray-700/50 smooth-transition flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-gray-300">Loading…</p>
        </div>
      ) : uploads.length === 0 ? (
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-gray-300">No uploads yet.</p>
          <p className="text-sm text-gray-500 mt-1">Go to Capture and upload a photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploads
            .slice()
            .reverse()
            .map((u) => (
              <div key={u.id} className="glass-panel rounded-2xl p-5 border border-gray-700/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <p className="text-white font-semibold truncate">{u.original_name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {u.mime_type} • {(u.size / 1024).toFixed(1)} KB • {new Date(u.created_at).toLocaleString()}
                    </p>
                  </div>

                  <a
                    href={`/uploads/${encodeURIComponent(u.stored_name)}`}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 smooth-transition flex items-center gap-2 shrink-0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>

                {(u.tags?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {u.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 rounded-lg bg-gray-800/60 text-gray-200 border border-gray-700/50">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {u.notes && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{u.notes}</p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  <div>Case: {u.case_id || '—'}</div>
                  <div>Captured: {u.captured_at || '—'}</div>
                  <div>Location: {u.location || '—'}</div>
                  <div className="mt-1 break-all">SHA-256: {u.sha256}</div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

