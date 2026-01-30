import { useState } from 'react';
import { Building2, Users } from 'lucide-react';

export default function TenantsSection() {
  const [tenants] = useState([
    {
      id: 'tenant-1',
      name: 'Pearson Business',
      plan: 'Business',
      users: 12,
      status: 'active',
      created_at: '2024-01-15',
    },
    {
      id: 'tenant-2',
      name: 'Acme Corp',
      plan: 'Pro',
      users: 5,
      status: 'active',
      created_at: '2024-02-20',
    },
    {
      id: 'tenant-3',
      name: 'Demo Inc',
      plan: 'Free',
      users: 1,
      status: 'trial',
      created_at: '2024-03-01',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-600 mt-1">Manage organization accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-50 mr-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="font-medium text-gray-900">{tenant.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.plan}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                    {tenant.users}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                    tenant.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
