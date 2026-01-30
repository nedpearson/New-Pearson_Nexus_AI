import { FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface RecentDocumentsWidgetProps {
  onClick: () => void;
}

export function RecentDocumentsWidget({ onClick }: RecentDocumentsWidgetProps) {
  const { documents } = useData();
  const recentDocs = documents
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <div className="glass-panel-hover rounded-xl p-6 cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Recent Documents</h3>
        <FileText className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="space-y-2">
        {recentDocs.map((doc) => (
          <div key={doc.id} className="p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl">
            <p className="font-semibold text-white text-sm">{doc.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs px-2 py-0.5 bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 rounded">{doc.category}</span>
              <span className="text-xs text-gray-400">{new Date(doc.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      {recentDocs.length === 0 && (
        <p className="text-gray-500 text-sm">No documents</p>
      )}
    </div>
  );
}
