import { useState } from 'react';
import { Shield, Plus } from 'lucide-react';

export default function RolesSection() {
  const [roles] = useState([
    { id: 'role-1', name: 'Owner', permissions: ['*'], userCount: 1 },
    { id: 'role-2', name: 'Admin', permissions: ['read', 'write', 'delete'], userCount: 2 },
    { id: 'role-3', name: 'Member', permissions: ['read'], userCount: 9 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
          <p className="text-gray-600 mt-1">Manage user roles and access control</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{role.name}</div>
                <div className="text-sm text-gray-500">{role.userCount} users</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase">Permissions</div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
