import { useState } from 'react';
import {
  LayoutDashboard, Users, DollarSign, Briefcase, Shield,
  Flag, Megaphone, FileText, History, Settings, AlertCircle, Clipboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { PolicyReviewQueue } from './admin/PolicyReviewQueue';

type AdminSection =
  | 'dashboard'
  | 'subscribers'
  | 'revenue'
  | 'assets'
  | 'users'
  | 'plans'
  | 'marketing'
  | 'policy'
  | 'policy_review'
  | 'audit'
  | 'settings';

export function Admin() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const isSuperAdmin = user?.email === 'nedpearson@gmail.com';

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md glass-panel p-8 rounded-2xl">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300">
            This Admin Console is only accessible to super-admin users.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Current user: {user?.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {activeSection === 'dashboard' && <AdminDashboard />}
          {activeSection === 'subscribers' && <SubscribersSection />}
          {activeSection === 'revenue' && <RevenueSection />}
          {activeSection === 'assets' && <AssetsSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'plans' && <PlansSection />}
          {activeSection === 'marketing' && <MarketingSection />}
          {activeSection === 'policy' && <PolicySection />}
          {activeSection === 'policy_review' && <PolicyReviewQueue />}
          {activeSection === 'audit' && <AuditSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { user } = useAuth();

  const sections = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'subscribers', label: 'Subscribers', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'assets', label: 'Assets/Expenses', icon: Briefcase },
    { id: 'users', label: 'Users', icon: Shield },
    { id: 'plans', label: 'Plans & Features', icon: Flag },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'policy', label: 'Policy Updates', icon: FileText },
    { id: 'policy_review', label: 'Policy Review Queue', icon: Clipboard },
    { id: 'audit', label: 'Audit Log', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 glass-panel flex flex-col border-r border-gray-700/50">
      <div className="p-6 border-b border-gray-700/50">
        <h2 className="text-xl font-bold text-white">Admin Console</h2>
        <p className="text-sm text-cyan-400 mt-1">Super Admin</p>
        <p className="text-xs text-gray-400 mt-2">{user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id as AdminSection)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl smooth-transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-700/50 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700/50">
        <div className="text-xs text-gray-400">
          Pearson Nexus AI v1.0
        </div>
      </div>
    </div>
  );
}

function SubscribersSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Subscribers</h1>
        <p className="text-gray-300 mt-1">Manage active and trial subscribers</p>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <p className="text-gray-300 mb-6">
          Detailed subscriber management with billing history, plan changes, and customer communications.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel-hover p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-cyan-300">4</div>
            <div className="text-sm text-gray-400 mt-2">Active</div>
          </div>
          <div className="glass-panel-hover p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-yellow-300">1</div>
            <div className="text-sm text-gray-400 mt-2">Trial</div>
          </div>
          <div className="glass-panel-hover p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-red-300">0</div>
            <div className="text-sm text-gray-400 mt-2">Churned (30d)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Revenue</h1>
        <p className="text-gray-300 mt-1">Financial performance and forecasts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel-hover rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">MRR</h3>
          <div className="text-3xl font-bold text-white">$546</div>
          <div className="text-sm text-green-400 mt-1">+12.5% from last month</div>
        </div>
        <div className="glass-panel-hover rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">ARR</h3>
          <div className="text-3xl font-bold text-white">$6,552</div>
          <div className="text-sm text-green-400 mt-1">+15.2% YoY</div>
        </div>
        <div className="glass-panel-hover rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Revenue (30d)</h3>
          <div className="text-3xl font-bold text-white">$1,892</div>
          <div className="text-sm text-gray-300 mt-1">Including one-time fees</div>
        </div>
      </div>
    </div>
  );
}

function AssetsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Assets & Expenses</h1>
        <p className="text-gray-300 mt-1">Track business assets and operational expenses</p>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Assets</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                <span className="text-gray-300">Software Licenses</span>
                <span className="font-bold text-cyan-300">$12,450</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                <span className="text-gray-300">Equipment</span>
                <span className="font-bold text-cyan-300">$8,200</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                <span className="text-gray-300">Cash Reserves</span>
                <span className="font-bold text-cyan-300">$45,000</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Monthly Expenses</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                <span className="text-gray-300">Infrastructure</span>
                <span className="font-bold text-red-400">-$450</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                <span className="text-gray-300">Marketing</span>
                <span className="font-bold text-red-400">-$2,100</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-800/40 rounded-lg">
                <span className="text-gray-300">Operations</span>
                <span className="font-bold text-red-400">-$1,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="text-gray-300 mt-1">Manage user accounts and permissions</p>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <p className="text-gray-300 mb-4">
          User management with role assignments, activity tracking, and access control.
        </p>
        <div className="text-sm text-gray-400">
          Total users: 3 (1 owner, 2 members)
        </div>
      </div>
    </div>
  );
}

function PlansSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Plans & Features</h1>
        <p className="text-gray-300 mt-1">Configure subscription plans and feature flags</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Plus', 'Pro', 'Enterprise'].map((plan) => (
          <div key={plan} className="glass-panel-hover rounded-xl border-2 border-cyan-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-2">{plan}</h3>
            <div className="text-3xl font-bold gradient-text mb-1">
              ${plan === 'Plus' ? 49 : plan === 'Pro' ? 99 : 299}
            </div>
            <div className="text-sm text-gray-400">per month</div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-sm text-gray-300">
                Active subscriptions: {plan === 'Plus' ? 2 : plan === 'Pro' ? 2 : 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Marketing</h1>
        <p className="text-gray-300 mt-1">Campaign management and performance tracking</p>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center glass-panel-hover p-4 rounded-xl">
            <div className="text-2xl font-bold text-cyan-300">4</div>
            <div className="text-sm text-gray-400 mt-1">Active Campaigns</div>
          </div>
          <div className="text-center glass-panel-hover p-4 rounded-xl">
            <div className="text-2xl font-bold text-cyan-300">1,732</div>
            <div className="text-sm text-gray-400 mt-1">Total Leads</div>
          </div>
          <div className="text-center glass-panel-hover p-4 rounded-xl">
            <div className="text-2xl font-bold text-cyan-300">272</div>
            <div className="text-sm text-gray-400 mt-1">Conversions</div>
          </div>
          <div className="text-center glass-panel-hover p-4 rounded-xl">
            <div className="text-2xl font-bold text-cyan-300">15.7%</div>
            <div className="text-sm text-gray-400 mt-1">Avg CVR</div>
          </div>
        </div>
        <p className="text-sm text-gray-300">
          Detailed marketing analytics available in the Admin Dashboard.
        </p>
      </div>
    </div>
  );
}

function PolicySection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Policy Updates</h1>
        <p className="text-gray-300 mt-1">Manage legal documents and compliance policies</p>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="space-y-3">
          {[
            { title: 'Privacy Policy Update', date: '2024-03-15', status: 'published' },
            { title: 'Terms of Service 2024', date: '2024-03-10', status: 'published' },
            { title: 'GDPR Compliance Update', date: '2024-03-08', status: 'published' },
            { title: 'Data Retention Policy', date: '2024-03-01', status: 'draft' },
          ].map((policy, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl hover:bg-gray-800/60 hover:border-gray-600/50 smooth-transition">
              <div>
                <h4 className="text-sm font-semibold text-white">{policy.title}</h4>
                <p className="text-xs text-gray-400 mt-1">{new Date(policy.date).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                policy.status === 'published' ? 'bg-green-900/30 text-green-300 border-green-500/30' : 'bg-gray-700/50 text-gray-300 border-gray-600/50'
              }`}>
                {policy.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Audit Log</h1>
        <p className="text-gray-300 mt-1">Track all administrative actions and changes</p>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <p className="text-gray-300 mb-4">
          Complete audit trail of system changes, user actions, and security events.
        </p>
        <div className="text-sm text-gray-400 p-3 bg-gray-800/40 rounded-lg">
          Last 24 hours: <span className="text-cyan-300 font-semibold">47 events</span> logged
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-300 mt-1">System configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Pearson Nexus AI"
                className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 text-white rounded-xl focus:border-cyan-500/50 smooth-transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@pearsonnexusai.com"
                className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 text-white rounded-xl focus:border-cyan-500/50 smooth-transition"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h3 className="font-bold text-white mb-4">Billing Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Currency
              </label>
              <select className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 text-white rounded-xl focus:border-cyan-500/50 smooth-transition">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Billing Cycle
              </label>
              <select className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 text-white rounded-xl focus:border-cyan-500/50 smooth-transition">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
