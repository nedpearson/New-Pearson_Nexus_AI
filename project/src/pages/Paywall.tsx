import { Lock, Check, ArrowRight } from 'lucide-react';

interface PaywallProps {
  feature: string;
  requiredPlan?: string;
}

const featureDetails: Record<string, {
  title: string;
  benefits: string[];
  plan: string;
}> = {
  legal: {
    title: 'Legal Case Management',
    benefits: [
      'Track legal cases and deadlines',
      'Organize legal documents securely',
      'Manage court dates and filings'
    ],
    plan: 'Professional Plan'
  },
  reports: {
    title: 'Advanced Reports',
    benefits: [
      'Generate detailed analytics reports',
      'Export data in multiple formats',
      'Custom report templates'
    ],
    plan: 'Professional Plan'
  },
  financial: {
    title: 'Financial Management',
    benefits: [
      'Track income and expenses',
      'Manage bills and payments',
      'Financial forecasting tools'
    ],
    plan: 'Professional Plan'
  },
  integrations: {
    title: 'Third-Party Integrations',
    benefits: [
      'Connect with QuickBooks and other tools',
      'Automatic data synchronization',
      'API access for custom integrations'
    ],
    plan: 'Enterprise Plan'
  },
  api: {
    title: 'API Access',
    benefits: [
      'Full REST API access',
      'Webhook support',
      'Custom automation capabilities'
    ],
    plan: 'Enterprise Plan'
  }
};

export function Paywall({ feature, requiredPlan }: PaywallProps) {
  const details = featureDetails[feature] || {
    title: 'Premium Feature',
    benefits: [
      'Access advanced capabilities',
      'Enhanced productivity tools',
      'Priority support'
    ],
    plan: requiredPlan || 'Professional Plan'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upgrade Required
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Unlock <span className="font-semibold text-gray-900">{details.title}</span> with {details.plan}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">What you'll get:</h2>
            <ul className="space-y-3">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => window.location.href = '#pricing'}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <span>Upgrade to {details.plan}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="mt-6 text-sm text-gray-500">
            Need help? <a href="#" className="text-blue-600 hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
