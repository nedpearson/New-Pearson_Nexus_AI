import { Check, Sparkles } from 'lucide-react';

export function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Essential tools for personal use',
      features: [
        'Up to 10 documents',
        'Basic document organization',
        'Mobile access',
        'Email support',
      ],
      cta: 'Current Plan',
      highlighted: false
    },
    {
      name: 'Forensic Legal W/ Data Integration',
      price: '$29',
      period: 'per month',
      description: 'Professional legal case management',
      badge: 'Most Popular',
      features: [
        'Unlimited documents & evidence',
        'Chain-of-custody tracking',
        'Forensic timeline builder',
        'Evidence sealing & watermarking',
        'Audit log export',
        'Cross-source data linking',
        'Divorce Toolkit (inside Legal):',
        '  • Violations tracking',
        '  • Custody documentation',
        '  • Property settlement tools',
        '  • Legal document vault',
        'Gmail & Drive integration',
        'Priority support',
      ],
      cta: 'Upgrade Now',
      highlighted: true
    },
    {
      name: 'Pro',
      price: '$79',
      period: 'per month',
      description: 'Advanced features for businesses',
      features: [
        'Everything in Forensic Legal',
        'Multi-user collaboration',
        'Custom templates & workflows',
        'Advanced reporting & analytics',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'SSO & advanced security',
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600">Select the perfect plan for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-2xl border-2 p-8 ${
              plan.highlighted
                ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-white shadow-xl'
                : 'border-gray-200 bg-white'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  {plan.badge}
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">/ {plan.period}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className={`w-5 h-5 flex-shrink-0 ${
                    plan.highlighted ? 'text-blue-600' : 'text-green-600'
                  } mt-0.5`} />
                  <span className={`text-sm ${
                    feature.startsWith('  •') ? 'ml-4 text-gray-600' : 'text-gray-700'
                  }`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.highlighted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What's included in Forensic Legal W/ Data Integration?</h3>
              <p className="text-sm text-gray-600">
                This tier includes professional legal case management with chain-of-custody tracking, evidence sealing,
                audit logs, and the complete Divorce Toolkit (violations, custody, property settlement, legal document vault).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Can I switch plans anytime?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Is my data secure?</h3>
              <p className="text-sm text-gray-600">
                All data is encrypted at rest (AES-256) and in transit. We maintain comprehensive audit logs
                and support chain-of-custody tracking for forensic readiness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
