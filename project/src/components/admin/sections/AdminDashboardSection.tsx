import { useState, useEffect } from 'react';
import { Users, Building2, FileText, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';
import type { SystemMetrics, AuditLog } from '../../../types/admin';

export default function AdminDashboardSection() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalTenants: 0,
    documentsProcessed: 0,
    jobsQueued: 0,
    jobsRunning: 0,
    errorRate: 0,
  });
  const [recentActions, setRecentActions] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    loadRecentActions();
  }, []);

  const loadMetrics = () => {
    try {
      const mockMetrics: SystemMetrics = {
        activeUsers: 12,
        totalTenants: 3,
        documentsProcessed: 1247,
        jobsQueued: 5,
        jobsRunning: 2,
        errorRate: 1.2,
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActions = () => {
    try {
      const auditLogs = JSON.parse(localStorage.getItem('pnx_audit_logs') || '[]');
      setRecentActions(auditLogs.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent actions:', error);
    }
  };

  const statCards = [
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      icon: Users,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'Total Tenants',
      value: metrics.totalTenants,
      icon: Building2,
      color: 'green',
      trend: '+5%',
    },
    {
      title: 'Documents Processed',
      value: metrics.documentsProcessed,
      icon: FileText,
      color: 'purple',
      trend: '+23%',
    },
    {
      title: 'Jobs Queued',
      value: metrics.jobsQueued,
      icon: Briefcase,
      color: 'orange',
      trend: '-8%',
    },
    {
      title: 'Jobs Running',
      value: metrics.jobsRunning,
      icon: TrendingUp,
      color: 'teal',
      trend: '+3%',
    },
    {
      title: 'Error Rate',
      value: `${metrics.errorRate.toFixed(1)}%`,
      icon: AlertCircle,
      color: 'red',
      trend: '-15%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <p className="text-gray-600 mt-1">Monitor key metrics and recent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Actions</h3>
        {recentActions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent audit logs</p>
        ) : (
          <div className="space-y-3">
            {recentActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{action.action}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {action.resource_type} {action.resource_id && `• ${action.resource_id}`}
                  </div>
                </div>
                <div className="text-xs text-gray-500">{action.created_at}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
