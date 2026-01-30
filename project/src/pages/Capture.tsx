import { useState } from 'react';
import { Camera, Upload, FileText, Tag, Calendar, MapPin } from 'lucide-react';

export function Capture() {
  const [selectedCase, setSelectedCase] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const legalTags = [
    'Violation',
    'Communication',
    'Finance',
    'Safety',
    'Parenting',
    'Court',
    'Evidence',
    'Documentation'
  ];

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Capture</h1>
        <p className="text-gray-400">Document evidence and attach to legal cases</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 mb-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Evidence</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button className="p-6 border-2 border-dashed border-gray-700/50 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/10 smooth-transition">
            <Camera className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">Take Photo</p>
          </button>

          <button className="p-6 border-2 border-dashed border-gray-700/50 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/10 smooth-transition">
            <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">Upload File</p>
          </button>

          <button className="p-6 border-2 border-dashed border-gray-700/50 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/10 smooth-transition">
            <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-300">Create Note</p>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Attach to Legal Case</label>
            <select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
            >
              <option value="">Select a case...</option>
              <option value="case-1">Smith v. Smith</option>
              <option value="case-2">Estate Planning - Johnson</option>
              <option value="case-3">Custody Matter - Davis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Legal Tags
              </div>
            </label>
            <div className="flex flex-wrap gap-2">
              {legalTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium smooth-transition ${
                    tags.includes(tag)
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
              placeholder="Add context, details, or observations..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date & Time
                </div>
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location (Optional)
                </div>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition"
                placeholder="Where did this occur?"
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 smooth-transition font-medium shadow-lg shadow-cyan-500/30">
              Save Evidence
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 border-cyan-500/20 shadow-xl">
        <h3 className="font-semibold text-cyan-300 mb-2">Chain of Custody</h3>
        <p className="text-sm text-gray-400">
          All captured evidence includes automatic metadata: timestamp, user, device info, and file hash for forensic integrity.
        </p>
      </div>
    </div>
  );
}
