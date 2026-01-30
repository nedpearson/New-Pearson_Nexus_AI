import { useState } from 'react';
import { Search, User, Mail, Shield } from 'lucide-react';

export default function UsersSection() {
  const [users] = useState([
    {
      id: 'user-1',
      name: 'Ned Pearson',
      email: 'nedpearson@gmail.com',
      role: 'owner',
      status: 'active',
      last_login: '2024-01-28',
    },
    {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      status: 'active',
      last_login: '2024-01-27',
    },
    {
      id: 'user-3',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
      status: 'active',
      last_login: '2024-01-25',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600 mt-1">Manage user accounts and access</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="p-3 rounded-full bg-blue-50">
                <User className="w-6 h-6 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700 capitalize">{user.role}</span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status}
                </span>

                <div className="text-sm text-gray-500">
                  Last login: {user.last_login}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
