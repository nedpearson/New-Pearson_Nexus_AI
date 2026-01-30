import { Home, FileText, Camera, Scale, FileBarChart, CreditCard, Settings, Shield, FileCheck, DollarSign, Award, Package, Briefcase, TrendingUp, Building2, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGating } from '../../hooks/useFeatureGating';
import { useUiMode } from '../../state/uiMode';
import { BrandMark } from '../../branding/BrandMark';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, featureKey: null, simpleView: true },
  { id: 'capture', label: 'Capture', icon: Camera, featureKey: null, simpleView: true },
  { id: 'documents', label: 'Documents', icon: FileText, featureKey: 'documents', simpleView: true },
  { id: 'policy_updates', label: 'Policy Updates', icon: Bell, featureKey: null, simpleView: true },
  { id: 'templates', label: 'Templates', icon: FileCheck, featureKey: 'templates', simpleView: false },
  { id: 'quickbooks', label: 'QuickBooks', icon: DollarSign, featureKey: 'quickbooks', simpleView: false },
  { id: 'funding', label: 'Funding Navigator', icon: Award, featureKey: 'funding', simpleView: false },
  { id: 'packets', label: 'Prefilled Packets', icon: Package, featureKey: 'packets', simpleView: false },
  { id: 'tax_attorney', label: 'Tax Attorney Mode', icon: Briefcase, featureKey: 'tax_attorney', simpleView: false },
  { id: 'financial_advisor', label: 'Financial Advisor', icon: TrendingUp, featureKey: 'financial_advisor', simpleView: false },
  { id: 'entity_builder', label: 'Entity Builder', icon: Building2, featureKey: 'entity_builder', simpleView: false },
  { id: 'legal', label: 'Legal', icon: Scale, featureKey: 'legal', simpleView: false },
  { id: 'reports', label: 'Reports', icon: FileBarChart, featureKey: 'reports', simpleView: false },
  { id: 'pricing', label: 'Pricing', icon: CreditCard, featureKey: null, simpleView: false },
  { id: 'settings', label: 'Settings', icon: Settings, featureKey: null, simpleView: true },
];

export function Sidebar({ currentRoute, onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const { hasFeature } = useFeatureGating();
  const { mode } = useUiMode();
  const isAdmin = user?.role === 'owner' || user?.role === 'admin';
  const isSimpleView = mode === 'simple';

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-slate-950/50 border-r border-gray-800/50 h-screen backdrop-blur-xl">
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-center">
          <BrandMark
            variant="emblem"
            size="xl"
            onClick={() => onNavigate('dashboard')}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            const isLocked = item.featureKey && !hasFeature(item.featureKey);
            const isHiddenInSimpleView = isSimpleView && !item.simpleView;

            if (isLocked || isHiddenInSimpleView) {
              return null;
            }

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium smooth-transition ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-700/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
          {isAdmin && (
            <li>
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium smooth-transition ${
                  currentRoute === 'admin'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-700/50 border border-transparent'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
