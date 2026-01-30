import { useState } from 'react';
import { Search, Mic, Bell, Sparkles, X, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { InstallButton } from '../pwa/InstallButton';
import { MobileViewButton } from '../nav/MobileViewButton';
import { useUiMode } from '../../state/uiMode';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate: (route: string) => void;
}

export function Header({ onMenuClick, onNavigate }: HeaderProps) {
  const { user } = useAuth();
  const { mode, setMode } = useUiMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setShowSearchResults(true);
      };

      recognition.start();
    } else {
      alert('Voice search not available on this device');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  return (
    <>
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-30">
        <div className="flex items-center gap-4 px-4 py-3.5">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-800/50 rounded-xl text-gray-300 smooth-transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                placeholder="Search cases, evidence, documents..."
                className="w-full pl-12 pr-24 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 smooth-transition backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-300">Gemini AI</span>
                </div>
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-lg smooth-transition ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                      : 'hover:bg-gray-700/50 text-gray-400'
                  }`}
                  title="Voice search"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 bg-gray-900/50 border border-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setMode('simple')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md smooth-transition ${
                  mode === 'simple'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode('advanced')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md smooth-transition ${
                  mode === 'advanced'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                Advanced
              </button>
            </div>
            <MobileViewButton onNavigate={onNavigate} />
            <InstallButton />
            <button className="relative p-2 hover:bg-gray-800/50 rounded-xl text-gray-300 smooth-transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse"></span>
            </button>

            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-800/50">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || 'Member'}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
                {(user?.name || 'U').charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showSearchResults && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-start justify-center pt-20 px-4" onClick={() => setShowSearchResults(false)}>
          <div className="glass-panel rounded-2xl w-full max-w-3xl max-h-[70vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-950/90 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Search Results</h3>
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Powered by Gemini AI
                </p>
              </div>
              <button
                onClick={() => setShowSearchResults(false)}
                className="p-2 hover:bg-gray-800/50 rounded-xl text-gray-400 smooth-transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {searchQuery ? (
                <>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Cases</h4>
                    <div className="space-y-2">
                      <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-cyan-500/30 smooth-transition cursor-pointer backdrop-blur-sm">
                        <p className="font-semibold text-white">Case: Tenant Dispute & Harassment</p>
                        <p className="text-sm text-gray-400 mt-1">Active • 12 evidence items</p>
                      </div>
                      <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-cyan-500/30 smooth-transition cursor-pointer backdrop-blur-sm">
                        <p className="font-semibold text-white">Case: Family Legal Matter</p>
                        <p className="text-sm text-gray-400 mt-1">Active • 8 evidence items</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Evidence</h4>
                    <div className="space-y-2">
                      <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-cyan-500/30 smooth-transition cursor-pointer backdrop-blur-sm">
                        <p className="font-semibold text-white">Screenshot - Threatening Message</p>
                        <p className="text-sm text-gray-400 mt-1">Jan 15, 2024 • Communication violation</p>
                      </div>
                      <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-cyan-500/30 smooth-transition cursor-pointer backdrop-blur-sm">
                        <p className="font-semibold text-white">Voice Note - Incident Documentation</p>
                        <p className="text-sm text-gray-400 mt-1">Jan 12, 2024 • Evidence</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Documents</h4>
                    <div className="space-y-2">
                      <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-cyan-500/30 smooth-transition cursor-pointer backdrop-blur-sm">
                        <p className="font-semibold text-white">Lease Agreement</p>
                        <p className="text-sm text-gray-400 mt-1">Legal • PDF • Reviewed</p>
                      </div>
                      <div className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-cyan-500/30 smooth-transition cursor-pointer backdrop-blur-sm">
                        <p className="font-semibold text-white">Email Thread Export</p>
                        <p className="text-sm text-gray-400 mt-1">Communication • PDF • Needs Review</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Start typing to search...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
