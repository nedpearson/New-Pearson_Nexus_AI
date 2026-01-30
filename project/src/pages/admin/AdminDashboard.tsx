import { useEffect, useState } from 'react';
import {
  Users, DollarSign, TrendingUp, TrendingDown, Activity,
  Target, Clock, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';

interface SubscriberData {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  mrr: number;
  joinedDate: string;
}

interface MarketingCampaign {
  id: string;
  name: string;
  status: string;
  leads: number;
  conversions: number;
  spent: number;
  revenue: number;
}

interface PolicyUpdate {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
}

export function AdminDashboard() {
  const [subscribers, setSubscribers] = useState<SubscriberData[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [policyUpdates, setPolicyUpdates] = useState<PolicyUpdate[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const mockSubscribers: SubscriberData[] = [
      { id: '1', name: 'Acme Corp', email: 'admin@acme.com', plan: 'Pro', status: 'active', mrr: 99, joinedDate: '2024-01-15' },
      { id: '2', name: 'Tech Startup Inc', email: 'ceo@techstartup.com', plan: 'Plus', status: 'active', mrr: 49, joinedDate: '2024-02-01' },
      { id: '3', name: 'Global Enterprises', email: 'it@global.com', plan: 'Enterprise', status: 'active', mrr: 299, joinedDate: '2023-12-10' },
      { id: '4', name: 'Small Business LLC', email: 'owner@smallbiz.com', plan: 'Plus', status: 'trial', mrr: 0, joinedDate: '2024-03-20' },
      { id: '5', name: 'Innovation Labs', email: 'lead@innovate.com', plan: 'Pro', status: 'active', mrr: 99, joinedDate: '2024-01-28' },
    ];

    const mockCampaigns: MarketingCampaign[] = [
      { id: '1', name: 'Q1 Product Launch', status: 'active', leads: 450, conversions: 68, spent: 12000, revenue: 6732 },
      { id: '2', name: 'SEO Content Marketing', status: 'active', leads: 892, conversions: 134, spent: 5500, revenue: 13266 },
      { id: '3', name: 'LinkedIn Outreach', status: 'paused', leads: 234, conversions: 23, spent: 3200, revenue: 2277 },
      { id: '4', name: 'Partner Referrals', status: 'active', leads: 156, conversions: 47, spent: 1000, revenue: 4653 },
    ];

    const mockPolicyUpdates: PolicyUpdate[] = [
      { id: '1', title: 'Privacy Policy Update', type: 'Legal', date: '2024-03-15', status: 'published' },
      { id: '2', title: 'Terms of Service 2024', type: 'Legal', date: '2024-03-10', status: 'published' },
      { id: '3', title: 'GDPR Compliance Update', type: 'Compliance', date: '2024-03-08', status: 'published' },
      { id: '4', title: 'Data Retention Policy', type: 'Security', date: '2024-03-01', status: 'draft' },
    ];

    setSubscribers(mockSubscribers);
    setCampaigns(mockCampaigns);
    setPolicyUpdates(mockPolicyUpdates);
  };

  const totalMRR = subscribers.filter(s => s.status === 'active').reduce((sum, s) => sum + s.mrr, 0);
  const activeSubs = subscribers.filter(s => s.status === 'active').length;
  const churnRate = 2.3;
  const cac = 127;
  const ltv = 2847;

  const conversionFunnel = [
    { stage: 'Visitors', count: 15420, percent: 100 },
    { stage: 'Signups', count: 892, percent: 5.8 },
    { stage: 'Trials', count: 234, percent: 1.5 },
    { stage: 'Paid', count: 68, percent: 0.4 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-300 mt-1">Comprehensive business metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="MRR"
          value={`$${totalMRR.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
          trend="+12.5%"
          trendUp={true}
        />
        <MetricCard
          title="Active Subscribers"
          value={activeSubs}
          icon={<Users className="w-5 h-5" />}
          color="blue"
          trend="+8"
          trendUp={true}
        />
        <MetricCard
          title="Churn Rate"
          value={`${churnRate}%`}
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
          trend="-0.3%"
          trendUp={true}
        />
        <MetricCard
          title="CAC"
          value={`$${cac}`}
          icon={<Target className="w-5 h-5" />}
          color="orange"
          trend="-5%"
          trendUp={true}
        />
        <MetricCard
          title="LTV"
          value={`$${ltv.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="cyan"
          trend="+18%"
          trendUp={true}
        />
        <MetricCard
          title="LTV:CAC Ratio"
          value={`${(ltv / cac).toFixed(1)}:1`}
          icon={<Activity className="w-5 h-5" />}
          color="purple"
          trend="Healthy"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{stage.stage}</span>
                  <span className="text-sm text-gray-300">{stage.count.toLocaleString()} ({stage.percent}%)</span>
                </div>
                <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      idx === 0 ? 'bg-cyan-600' :
                      idx === 1 ? 'bg-cyan-500' :
                      idx === 2 ? 'bg-blue-500' :
                      'bg-blue-400'
                    }`}
                    style={{ width: `${stage.percent * 10}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Campaign ROI</h3>
          <div className="space-y-3">
            {campaigns.slice(0, 4).map((campaign) => {
              const roi = ((campaign.revenue - campaign.spent) / campaign.spent * 100);
              return (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{campaign.name}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs border ${
                        campaign.status === 'active' ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-gray-700/50 text-gray-300 border-gray-600/50'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {campaign.conversions} conversions / {campaign.leads} leads
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-400">${campaign.revenue.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Subscriber Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Organization</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase">MRR</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-800/30 smooth-transition">
                  <td className="px-4 py-3 text-sm font-semibold text-white">{sub.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                      sub.plan === 'Enterprise' ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' :
                      sub.plan === 'Pro' ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30' :
                      'bg-blue-900/30 text-blue-300 border-blue-500/30'
                    }`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                      sub.status === 'active' ? 'bg-green-900/30 text-green-300 border-green-500/30' :
                      sub.status === 'trial' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30' :
                      'bg-gray-700/50 text-gray-300 border-gray-600/50'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-cyan-300 text-right">
                    ${sub.mrr}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(sub.joinedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Marketing Pipeline</h3>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{campaign.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {campaign.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : campaign.status === 'paused' ? (
                        <Clock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-xs text-gray-400 capitalize">{campaign.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-300">
                      ${campaign.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Revenue</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{campaign.leads}</div>
                    <div className="text-xs text-gray-400">Leads</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{campaign.conversions}</div>
                    <div className="text-xs text-gray-400">Conversions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {((campaign.conversions / campaign.leads) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">CVR</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Policy Updates (Weekly)</h3>
          <div className="space-y-3">
            {policyUpdates.map((policy) => (
              <div key={policy.id} className="flex items-start gap-3 p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                <div className={`p-2 rounded-lg ${
                  policy.type === 'Legal' ? 'bg-cyan-900/30' :
                  policy.type === 'Compliance' ? 'bg-purple-900/30' :
                  'bg-green-900/30'
                }`}>
                  {policy.status === 'published' ? (
                    <CheckCircle className={`w-4 h-4 ${
                      policy.type === 'Legal' ? 'text-cyan-400' :
                      policy.type === 'Compliance' ? 'text-purple-400' :
                      'text-green-400'
                    }`} />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{policy.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-lg text-xs border ${
                      policy.type === 'Legal' ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30' :
                      policy.type === 'Compliance' ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' :
                      'bg-green-900/30 text-green-300 border-green-500/30'
                    }`}>
                      {policy.type}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(policy.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                  policy.status === 'published' ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-gray-700/50 text-gray-300 border-gray-600/50'
                }`}>
                  {policy.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({ title, value, icon, color, trend, trendUp }: MetricCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-900/30 text-emerald-400',
    blue: 'bg-cyan-900/30 text-cyan-400',
    red: 'bg-red-900/30 text-red-400',
    orange: 'bg-orange-900/30 text-orange-400',
    cyan: 'bg-cyan-900/30 text-cyan-400',
    purple: 'bg-purple-900/30 text-purple-400',
  }[color];

  return (
    <div className="glass-panel-hover rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses}`}>{icon}</div>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${
            trendUp ? 'text-green-400' : 'text-red-400'
          }`}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="text-xs text-gray-400 mt-1">{title}</p>
    </div>
  );
}
