import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, DollarSign, Calendar, FileText, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Recommendation {
  id: string;
  type: 'urgent' | 'important' | 'suggestion' | 'success';
  category: 'financial' | 'tasks' | 'calendar' | 'documents' | 'legal';
  title: string;
  description: string;
  action?: string;
  link?: string;
}

export function Recommendations() {
  const { organization } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Recommendation['type']>('all');

  useEffect(() => {
    if (organization) {
      generateRecommendations();
    }
  }, [organization]);

  const generateRecommendations = async () => {
    setLoading(true);
    const recs: Recommendation[] = [];

    recs.push({
      id: 'welcome',
      type: 'success',
      category: 'tasks',
      title: 'Welcome to Recommendations!',
      description: 'This page will provide personalized insights based on your data. Add tasks, documents, and financial information to see smart recommendations.',
    });

    recs.push({
      id: 'get-started',
      type: 'suggestion',
      category: 'documents',
      title: 'Start Capturing Documents',
      description: 'Use the Capture feature to quickly add documents, receipts, and important files to your workspace.',
      action: 'Go to Capture',
      link: '/capture'
    });

    recs.push({
      id: 'organize',
      type: 'suggestion',
      category: 'tasks',
      title: 'Create Your First Task',
      description: 'Stay organized by creating tasks and setting priorities. Track progress and never miss a deadline.',
      action: 'View Tasks',
      link: '/tasks'
    });

    setRecommendations(recs);
    setLoading(false);
  };

  const filteredRecommendations = filter === 'all'
    ? recommendations
    : recommendations.filter(r => r.type === filter);

  const getTypeIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5" />;
      case 'important':
        return <AlertTriangle className="w-5 h-5" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'important':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
    }
  };

  const getCategoryIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="w-4 h-4" />;
      case 'tasks':
        return <Clock className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'documents':
        return <FileText className="w-4 h-4" />;
      case 'legal':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommendations</h1>
        <p className="text-gray-600">Personalized insights and action items based on your data</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Analyzing your data...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({recommendations.length})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'urgent'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Urgent ({recommendations.filter(r => r.type === 'urgent').length})
            </button>
            <button
              onClick={() => setFilter('important')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'important'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Important ({recommendations.filter(r => r.type === 'important').length})
            </button>
            <button
              onClick={() => setFilter('suggestion')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'suggestion'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Suggestions ({recommendations.filter(r => r.type === 'suggestion').length})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Success ({recommendations.filter(r => r.type === 'success').length})
            </button>
          </div>

          <div className="space-y-4">
            {filteredRecommendations.map(rec => (
              <div
                key={rec.id}
                className={`p-5 rounded-xl border-2 ${getTypeColor(rec.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold">{rec.title}</h3>
                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-white bg-opacity-50 rounded">
                        {getCategoryIcon(rec.category)}
                        <span className="capitalize">{rec.category}</span>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{rec.description}</p>
                    {rec.action && rec.link && (
                      <a
                        href={rec.link}
                        className="inline-block px-4 py-2 bg-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
                      >
                        {rec.action}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
