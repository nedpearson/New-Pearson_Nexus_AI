import { useState } from 'react';
import { X, User, Briefcase, Check } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

interface ProfileWizardProps {
  onComplete: () => void;
}

export function ProfileWizard({ onComplete }: ProfileWizardProps) {
  const { settings, updateSettings, completeSetup } = useSettings();
  const [step, setStep] = useState(1);
  const [profileMode, setProfileMode] = useState<'personal' | 'business'>('personal');
  const [formData, setFormData] = useState({
    fullName: '',
    preferredName: '',
    phone: '',
    businessName: '',
    industry: '',
  });

  const handleNext = () => {
    if (step === 1) {
      updateSettings({ profile: { ...settings.profile, mode: profileMode } });
      setStep(2);
    } else if (step === 2) {
      if (profileMode === 'personal') {
        updateSettings({
          profile: {
            ...settings.profile,
            personal: {
              ...settings.profile.personal,
              fullName: formData.fullName,
              preferredName: formData.preferredName,
              phone: formData.phone,
            },
          },
          account: {
            ...settings.account,
            phone: formData.phone,
          },
        });
      } else {
        updateSettings({
          profile: {
            ...settings.profile,
            business: {
              ...settings.profile.business,
              businessName: formData.businessName,
              industry: formData.industry,
            },
          },
        });
      }
      completeSetup();
      onComplete();
    }
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (profileMode === 'personal') {
        return formData.fullName.length > 0;
      } else {
        return formData.businessName.length > 0;
      }
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome! Let's set up your profile</h2>
            <button onClick={onComplete} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of 2</p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How will you use this app?</h3>
              <p className="text-gray-600 mb-6">Choose the mode that best fits your needs. You can change this later.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setProfileMode('personal')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    profileMode === 'personal'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-lg ${profileMode === 'personal' ? 'bg-blue-600' : 'bg-gray-100'}`}>
                      <User className={`w-6 h-6 ${profileMode === 'personal' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">Personal</h4>
                      {profileMode === 'personal' && <Check className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-left">
                    Manage your personal documents, finances, tasks, and family matters
                  </p>
                </button>

                <button
                  onClick={() => setProfileMode('business')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    profileMode === 'business'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-lg ${profileMode === 'business' ? 'bg-blue-600' : 'bg-gray-100'}`}>
                      <Briefcase className={`w-6 h-6 ${profileMode === 'business' ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">Business</h4>
                      {profileMode === 'business' && <Check className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-left">
                    Track business operations, team tasks, contracts, and financial records
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && profileMode === 'personal' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell us about yourself</h3>
              <p className="text-gray-600 mb-6">This helps us personalize your experience</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.preferredName}
                    onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                  <p className="text-xs text-gray-500 mt-1">What should we call you?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && profileMode === 'business' && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell us about your business</h3>
              <p className="text-gray-600 mb-6">This helps us tailor features to your needs</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="services">Professional Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {step === 2 ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
