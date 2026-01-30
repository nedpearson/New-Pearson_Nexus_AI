import { useState } from 'react';
import { CreditCard, DollarSign, Users } from 'lucide-react';
import type { Plan, Subscription } from '../../../types/admin';

export default function BillingSection() {
  const [plans] = useState<Plan[]>([
    {
      id: 'plan-free',
      name: 'Free',
      description: 'Basic features for personal use',
      price: 0,
      billing_period: 'monthly',
      features: { items: ['5GB storage', 'Basic AI features', 'Email support'] },
      limits: { storage_gb: 5 },
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      description: 'Advanced features for professionals',
      price: 29.99,
      billing_period: 'monthly',
      features: { items: ['50GB storage', 'Advanced AI', 'Priority support', 'Custom integrations'] },
      limits: { storage_gb: 50 },
      status: 'active',
      created_at: new Date().toISOString(),
    },
    {
      id: 'plan-business',
      name: 'Business',
      description: 'Full feature set for teams',
      price: 99.99,
      billing_period: 'monthly',
      features: { items: ['Unlimited storage', 'All AI features', '24/7 support', 'API access', 'Multi-user'] },
      limits: { storage_gb: 999999 },
      status: 'active',
      created_at: new Date().toISOString(),
    },
  ]);
  const [subscriptions] = useState<Subscription[]>([]);

  const getSubscriptionCount = (planId: string) => {
    return subscriptions.filter(s => s.plan_id === planId && s.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Plans</h2>
          <p className="text-gray-600 mt-1">Manage subscription plans and pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-blue-50">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">$450</div>
              <div className="text-sm text-gray-600">MRR</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{subscriptions.length}</div>
              <div className="text-sm text-gray-600">Active Subscribers</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-purple-50">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{plans.length}</div>
              <div className="text-sm text-gray-600">Available Plans</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{plan.name}</div>
                <div className="text-sm text-gray-600 mt-1">{plan.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-gray-500">/{plan.billing_period === 'monthly' ? 'month' : 'year'}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {getSubscriptionCount(plan.id)} subscribers
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {plan.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
