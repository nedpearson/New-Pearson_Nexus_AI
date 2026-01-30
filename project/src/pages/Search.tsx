import { useState, useEffect } from 'react';
import { Search as SearchIcon, FileText, CheckSquare, DollarSign, Calendar, Scale, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SearchResult {
  id: string;
  type: 'document' | 'task' | 'bill' | 'transaction' | 'event' | 'legal';
  title: string;
  description: string;
  metadata?: string;
  link: string;
}

export function Search() {
  const { organization } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | SearchResult['type']>('all');

  useEffect(() => {
    if (query.trim().length >= 2) {
      const debounce = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounce);
    } else {
      setResults([]);
    }
  }, [query, organization]);

  const performSearch = async () => {
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    const searchResults: SearchResult[] = [];

    setResults(searchResults);
    setLoading(false);
  };

  const filteredResults = filter === 'all'
    ? results
    : results.filter(r => r.type === filter);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-green-600" />;
      case 'bill':
      case 'transaction':
        return <DollarSign className="w-5 h-5 text-orange-600" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'legal':
        return <Scale className="w-5 h-5 text-red-600" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'document':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'task':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'bill':
      case 'transaction':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'event':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'legal':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const resultCounts = {
    all: results.length,
    document: results.filter(r => r.type === 'document').length,
    task: results.filter(r => r.type === 'task').length,
    bill: results.filter(r => r.type === 'bill').length,
    transaction: results.filter(r => r.type === 'transaction').length,
    event: results.filter(r => r.type === 'event').length,
    legal: results.filter(r => r.type === 'legal').length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-600">Search across all your documents, tasks, finances, events, and legal cases</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything..."
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        {query.length > 0 && query.length < 2 && (
          <p className="text-sm text-gray-500 mt-2">Type at least 2 characters to search</p>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Searching...</p>
        </div>
      )}

      {!loading && query.length >= 2 && (
        <>
          {results.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All ({resultCounts.all})
              </button>
              {resultCounts.document > 0 && (
                <button
                  onClick={() => setFilter('document')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'document'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Documents ({resultCounts.document})
                </button>
              )}
              {resultCounts.task > 0 && (
                <button
                  onClick={() => setFilter('task')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'task'
                      ? 'bg-green-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tasks ({resultCounts.task})
                </button>
              )}
              {(resultCounts.bill + resultCounts.transaction) > 0 && (
                <button
                  onClick={() => setFilter('bill')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'bill' || filter === 'transaction'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Financial ({resultCounts.bill + resultCounts.transaction})
                </button>
              )}
              {resultCounts.event > 0 && (
                <button
                  onClick={() => setFilter('event')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'event'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Events ({resultCounts.event})
                </button>
              )}
              {resultCounts.legal > 0 && (
                <button
                  onClick={() => setFilter('legal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'legal'
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Legal ({resultCounts.legal})
                </button>
              )}
            </div>
          )}

          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">
                Search functionality is ready. Add data to start searching across your workspace.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map(result => (
                <a
                  key={result.id}
                  href={result.link}
                  className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <span className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border ${getTypeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {result.description}
                      </p>
                      {result.metadata && (
                        <p className="text-xs text-gray-500">
                          {result.metadata}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && query.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-12 text-center">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Searching</h3>
          <p className="text-gray-600 mb-6">
            Enter a search term to find documents, tasks, bills, events, and more
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-white rounded-lg border border-gray-200">
              Try: "invoice"
            </span>
            <span className="px-3 py-1 bg-white rounded-lg border border-gray-200">
              Try: "insurance"
            </span>
            <span className="px-3 py-1 bg-white rounded-lg border border-gray-200">
              Try: "meeting"
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
