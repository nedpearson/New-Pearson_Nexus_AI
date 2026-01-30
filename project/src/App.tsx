import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useFeatureGating } from './hooks/useFeatureGating';
import { useSettings } from './contexts/SettingsContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { DesktopDashboard } from './routes/DesktopDashboard';
import MobileDashboard from './pages/MobileDashboard';
import { Capture } from './pages/Capture';
import { Documents } from './pages/Documents';
import { Legal } from './pages/Legal';
import { Reports } from './pages/Reports';
import { Pricing } from './pages/Pricing';
import { Settings } from './pages/Settings';
import { Paywall } from './pages/Paywall';
import { HiddenFeature } from './pages/HiddenFeature';
import AdminPanel from './pages/admin/AdminPanel';
import { DebugOverlay } from './components/DebugOverlay';
import { Financial } from './pages/Financial';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Recommendations } from './pages/Recommendations';
import { Templates } from './pages/Templates';
import { QuickBooks } from './pages/QuickBooks';
import { FundingNavigator } from './pages/FundingNavigator';
import { Packets } from './pages/Packets';
import { TaxAttorney } from './pages/TaxAttorney';
import { FinancialAdvisor } from './pages/FinancialAdvisor';
import { EntityBuilder } from './pages/EntityBuilder';
import { PolicyUpdates } from './pages/PolicyUpdates';
import { FeatureFlagsPanel } from './components/FeatureFlagsPanel';
import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasFeature, loading: featureLoading } = useFeatureGating();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const isSimpleView = settings.appearance.viewMode === 'simple';

  const currentRoute = location.pathname.slice(1) || 'dashboard';

  const handleNavigate = (route: string, state?: any) => {
    navigate(`/${route}`, { state });
  };

  if (authLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
        <DebugOverlay
          currentRoute={currentRoute}
          authLoading={authLoading}
          featureLoading={featureLoading}
        />
      </>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (featureLoading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 text-sm">Loading features...</p>
          </div>
        </div>
        <DebugOverlay
          currentRoute={currentRoute}
          authLoading={authLoading}
          featureLoading={featureLoading}
        />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/mobile" element={<MobileDashboard />} />
        <Route path="/m" element={<MobileDashboard />} />
        <Route
          path="/*"
          element={
            <Layout currentRoute={currentRoute} onNavigate={handleNavigate}>
              <Routes>
                <Route path="/" element={<DesktopDashboard onNavigate={handleNavigate} />} />
                <Route path="/dashboard" element={<DesktopDashboard onNavigate={handleNavigate} />} />
                <Route path="/capture" element={<Capture />} />
                <Route
                  path="/documents"
                  element={
                    hasFeature('documents') ? (
                      <Documents />
                    ) : (
                      <Paywall feature="documents" />
                    )
                  }
                />
                <Route path="/financial" element={<Financial />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/policy_updates" element={<PolicyUpdates />} />
                <Route
                  path="/templates"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Templates" />
                    ) : hasFeature('templates') ? (
                      <Templates />
                    ) : (
                      <Paywall feature="templates" />
                    )
                  }
                />
                <Route
                  path="/quickbooks"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="QuickBooks" />
                    ) : hasFeature('quickbooks') ? (
                      <QuickBooks />
                    ) : (
                      <Paywall feature="quickbooks" />
                    )
                  }
                />
                <Route
                  path="/funding"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Funding Navigator" />
                    ) : hasFeature('funding') ? (
                      <FundingNavigator />
                    ) : (
                      <Paywall feature="funding" />
                    )
                  }
                />
                <Route
                  path="/packets"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Prefilled Packets" />
                    ) : hasFeature('packets') ? (
                      <Packets />
                    ) : (
                      <Paywall feature="packets" />
                    )
                  }
                />
                <Route
                  path="/tax_attorney"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Tax Attorney Mode" />
                    ) : hasFeature('tax_attorney') ? (
                      <TaxAttorney />
                    ) : (
                      <Paywall feature="tax_attorney" />
                    )
                  }
                />
                <Route
                  path="/financial_advisor"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Financial Advisor" />
                    ) : hasFeature('financial_advisor') ? (
                      <FinancialAdvisor />
                    ) : (
                      <Paywall feature="financial_advisor" />
                    )
                  }
                />
                <Route
                  path="/entity_builder"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Entity Builder" />
                    ) : hasFeature('entity_builder') ? (
                      <EntityBuilder />
                    ) : (
                      <Paywall feature="entity_builder" />
                    )
                  }
                />
                <Route
                  path="/legal"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Legal" />
                    ) : hasFeature('legal') ? (
                      <Legal />
                    ) : (
                      <Paywall feature="legal" />
                    )
                  }
                />
                <Route
                  path="/reports"
                  element={
                    isSimpleView ? (
                      <HiddenFeature featureName="Reports" />
                    ) : hasFeature('reports') ? (
                      <Reports />
                    ) : (
                      <Paywall feature="reports" />
                    )
                  }
                />
                <Route
                  path="/pricing"
                  element={isSimpleView ? <HiddenFeature featureName="Pricing" /> : <Pricing />}
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
      <DebugOverlay
        currentRoute={currentRoute}
        authLoading={authLoading}
        featureLoading={featureLoading}
      />
      <FeatureFlagsPanel />
    </>
  );
}

export default App;
