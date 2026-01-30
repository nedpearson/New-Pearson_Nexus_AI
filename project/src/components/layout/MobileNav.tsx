import { Home, FileText, Camera, Scale, FileBarChart, CreditCard, Settings, Shield, X, FileCheck, DollarSign, Award, Package, Briefcase, TrendingUp, Building2, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFeatureGating } from '../../hooks/useFeatureGating';
import { useUiMode } from '../../state/uiMode';
import { BrandMark } from '../../branding/BrandMark';
import { brand } from '../../branding/brand';
import { InstallButton } from '../pwa/InstallButton';

interface MobileNavProps {
  isOpen: boolean;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onClose: () => void;
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

export function MobileNav({ isOpen, currentRoute, onNavigate, onClose }: MobileNavProps) {
  const { user } = useAuth();
  const { hasFeature } = useFeatureGating();
  const { mode, setMode } = useUiMode();
  const isAdmin = user?.role === 'owner' || user?.role === 'admin';
  const isSimpleView = mode === 'simple';

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />
      <aside className="fixed top-0 left-0 h-full w-72 bg-slate-950/95 backdrop-blur-xl z-50 md:hidden shadow-2xl border-r border-gray-800/50">
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BrandMark variant="emblem" size="lg" />
              <div>
                <h2 className="text-lg font-bold text-white">{brand.appName}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <InstallButton />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/50 rounded-xl flex-shrink-0 smooth-transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setMode('simple')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md smooth-transition ${
                mode === 'simple'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md smooth-transition ${
                mode === 'advanced'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        <nav className="overflow-y-auto p-4 h-[calc(100%-8.5rem)]">
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
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
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
                  onClick={() => {
                    onNavigate('admin');
                    onClose();
                  }}
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
    </>
  );
}
