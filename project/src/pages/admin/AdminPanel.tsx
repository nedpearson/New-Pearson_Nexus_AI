import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboardSection from '../../components/admin/sections/AdminDashboardSection';
import UsersSection from '../../components/admin/sections/UsersSection';
import TenantsSection from '../../components/admin/sections/TenantsSection';
import RolesSection from '../../components/admin/sections/RolesSection';
import FeatureFlagsSection from '../../components/admin/sections/FeatureFlagsSection';
import BillingSection from '../../components/admin/sections/BillingSection';
import RulesSection from '../../components/admin/sections/RulesSection';
import IntegrationsSection from '../../components/admin/sections/IntegrationsSection';
import AuditLogsSection from '../../components/admin/sections/AuditLogsSection';
import JobsSection from '../../components/admin/sections/JobsSection';
import SystemSettingsSection from '../../components/admin/sections/SystemSettingsSection';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminPanel() {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboardSection />;
      case 'users':
        return <UsersSection />;
      case 'tenants':
        return <TenantsSection />;
      case 'roles':
        return <RolesSection />;
      case 'features':
        return <FeatureFlagsSection />;
      case 'billing':
        return <BillingSection />;
      case 'rules':
        return <RulesSection />;
      case 'integrations':
        return <IntegrationsSection />;
      case 'audit':
        return <AuditLogsSection />;
      case 'jobs':
        return <JobsSection />;
      case 'settings':
        return <SystemSettingsSection />;
      default:
        return <AdminDashboardSection />;
    }
  };

  return (
    <AdminLayout currentSection={currentSection} onSectionChange={setCurrentSection}>
      {renderSection()}
    </AdminLayout>
  );
}
