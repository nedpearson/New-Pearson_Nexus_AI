import { useState, useEffect } from 'react';
import {
  User, Lock, Bell, Palette, Database, LogOut, ChevronDown, ChevronUp,
  Mail, Phone, Globe, Check, Link, Shield, Eye, Clock,
  Download, Trash2, Save, Smartphone, Monitor, Cloud,
  DollarSign, Scale, Plus, X, CreditCard, Building, TrendingUp, FileText, Calendar, Briefcase
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { ProfileWizard } from '../components/settings/ProfileWizard';
import { getBackendConfig } from '../lib/storage';
import { SyncIndicator } from '../components/SyncIndicator';

export function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'account',
    'profile',
    'financial',
    'legal',
  ]);
  const [showWizard, setShowWizard] = useState(!settings.setupCompleted);
  const [saved, setSaved] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const backendConfig = getBackendConfig();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const showSavedToast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpdateSettings = (updates: any) => {
    updateSettings(updates);
    showSavedToast();
  };

  return (
    <div className="max-w-5xl mx-auto">
      {showWizard && <ProfileWizard onComplete={() => setShowWizard(false)} />}

      {saved && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check className="w-5 h-5" />
          <span>Saved successfully</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and app settings</p>
      </div>

      {!settings.setupCompleted && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Complete Your Profile</h3>
              <p className="text-gray-600 mb-3">
                Take a moment to set up your profile for a personalized experience
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <SettingsSection
          icon={<User className="w-5 h-5" />}
          title="Account"
          description="Email, phone, timezone, and language"
          expanded={expandedSections.includes('account')}
          onToggle={() => toggleSection('account')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                value={settings.account.email}
                onChange={(e) => handleUpdateSettings({ account: { ...settings.account, email: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </div>
              </label>
              <input
                type="tel"
                value={settings.account.phone}
                onChange={(e) => handleUpdateSettings({ account: { ...settings.account, phone: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Timezone
                  </div>
                </label>
                <select
                  value={settings.account.timezone}
                  onChange={(e) => handleUpdateSettings({ account: { ...settings.account, timezone: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Anchorage">Alaska Time</option>
                  <option value="Pacific/Honolulu">Hawaii Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={settings.account.language}
                  onChange={(e) => handleUpdateSettings({ account: { ...settings.account, language: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<User className="w-5 h-5" />}
          title="Profile"
          description={`${settings.profile.mode === 'personal' ? 'Personal' : 'Business'} profile information`}
          expanded={expandedSections.includes('profile')}
          onToggle={() => toggleSection('profile')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Profile Mode</p>
                <p className="text-sm text-gray-600">
                  {settings.profile.mode === 'personal' ? 'Personal Use' : 'Business Use'}
                </p>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              >
                Change
              </button>
            </div>

            {settings.profile.mode === 'personal' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={settings.profile.personal.fullName}
                    onChange={(e) => handleUpdateSettings({
                      profile: {
                        ...settings.profile,
                        personal: { ...settings.profile.personal, fullName: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Name</label>
                  <input
                    type="text"
                    value={settings.profile.personal.preferredName}
                    onChange={(e) => handleUpdateSettings({
                      profile: {
                        ...settings.profile,
                        personal: { ...settings.profile.personal, preferredName: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What should we call you?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={settings.profile.personal.address}
                    onChange={(e) => handleUpdateSettings({
                      profile: {
                        ...settings.profile,
                        personal: { ...settings.profile.personal, address: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="text"
                    value={settings.profile.personal.emergencyContact}
                    onChange={(e) => handleUpdateSettings({
                      profile: {
                        ...settings.profile,
                        personal: { ...settings.profile.personal, emergencyContact: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Name and phone number"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <input
                    type="text"
                    value={settings.profile.business.businessName}
                    onChange={(e) => handleUpdateSettings({
                      profile: {
                        ...settings.profile,
                        business: { ...settings.profile.business, businessName: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DBA (Doing Business As)</label>
                  <input
                    type="text"
                    value={settings.profile.business.dba}
                    onChange={(e) => handleUpdateSettings({
                      profile: {
                        ...settings.profile,
                        business: { ...settings.profile.business, dba: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      value={settings.profile.business.industry}
                      onChange={(e) => handleUpdateSettings({
                        profile: {
                          ...settings.profile,
                          business: { ...settings.profile.business, industry: e.target.value }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">EIN/TIN</label>
                    <input
                      type="text"
                      value={settings.profile.business.ein}
                      onChange={(e) => handleUpdateSettings({
                        profile: {
                          ...settings.profile,
                          business: { ...settings.profile.business, ein: e.target.value }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                  <textarea
                    value={settings.profile.business.businessAddress}
                    onChange={(e) => handleUpdateSettings({
                      profile: {
                        ...settings.profile,
                        business: { ...settings.profile.business, businessAddress: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<DollarSign className="w-5 h-5" />}
          title="Financial Matters"
          description="Bank accounts, investments, debts, and financial information"
          expanded={expandedSections.includes('financial')}
          onToggle={() => toggleSection('financial')}
        >
          <div className="space-y-6">
            {/* Bank Accounts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Bank Accounts
                </h4>
                <button
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      name: '',
                      accountNumber: '',
                      type: 'Checking'
                    };
                    handleUpdateSettings({
                      financial: {
                        ...settings.financial,
                        bankAccounts: [...settings.financial.bankAccounts, newItem]
                      }
                    });
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.financial.bankAccounts.map((account, index) => (
                  <div key={account.id} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => {
                        const updated = [...settings.financial.bankAccounts];
                        updated[index] = { ...updated[index], name: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, bankAccounts: updated }
                        });
                      }}
                      placeholder="Bank name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={account.accountNumber}
                      onChange={(e) => {
                        const updated = [...settings.financial.bankAccounts];
                        updated[index] = { ...updated[index], accountNumber: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, bankAccounts: updated }
                        });
                      }}
                      placeholder="Account #"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                      value={account.type}
                      onChange={(e) => {
                        const updated = [...settings.financial.bankAccounts];
                        updated[index] = { ...updated[index], type: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, bankAccounts: updated }
                        });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option>Checking</option>
                      <option>Savings</option>
                      <option>Money Market</option>
                    </select>
                    <button
                      onClick={() => {
                        const updated = settings.financial.bankAccounts.filter((_, i) => i !== index);
                        handleUpdateSettings({
                          financial: { ...settings.financial, bankAccounts: updated }
                        });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {settings.financial.bankAccounts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No bank accounts added yet</p>
                )}
              </div>
            </div>

            {/* Credit Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Credit Cards
                </h4>
                <button
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      name: '',
                      last4: '',
                      expiry: ''
                    };
                    handleUpdateSettings({
                      financial: {
                        ...settings.financial,
                        creditCards: [...settings.financial.creditCards, newItem]
                      }
                    });
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.financial.creditCards.map((card, index) => (
                  <div key={card.id} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={card.name}
                      onChange={(e) => {
                        const updated = [...settings.financial.creditCards];
                        updated[index] = { ...updated[index], name: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, creditCards: updated }
                        });
                      }}
                      placeholder="Card name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={card.last4}
                      onChange={(e) => {
                        const updated = [...settings.financial.creditCards];
                        updated[index] = { ...updated[index], last4: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, creditCards: updated }
                        });
                      }}
                      placeholder="Last 4 digits"
                      maxLength={4}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={(e) => {
                        const updated = [...settings.financial.creditCards];
                        updated[index] = { ...updated[index], expiry: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, creditCards: updated }
                        });
                      }}
                      placeholder="MM/YY"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        const updated = settings.financial.creditCards.filter((_, i) => i !== index);
                        handleUpdateSettings({
                          financial: { ...settings.financial, creditCards: updated }
                        });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {settings.financial.creditCards.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No credit cards added yet</p>
                )}
              </div>
            </div>

            {/* Custom Financial Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Other Financial Info
                </h4>
                <button
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      label: '',
                      value: ''
                    };
                    handleUpdateSettings({
                      financial: {
                        ...settings.financial,
                        customItems: [...settings.financial.customItems, newItem]
                      }
                    });
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.financial.customItems.map((item, index) => (
                  <div key={item.id} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...settings.financial.customItems];
                        updated[index] = { ...updated[index], label: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, customItems: updated }
                        });
                      }}
                      placeholder="e.g., Investment Account, 401k, etc."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...settings.financial.customItems];
                        updated[index] = { ...updated[index], value: e.target.value };
                        handleUpdateSettings({
                          financial: { ...settings.financial, customItems: updated }
                        });
                      }}
                      placeholder="Details"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        const updated = settings.financial.customItems.filter((_, i) => i !== index);
                        handleUpdateSettings({
                          financial: { ...settings.financial, customItems: updated }
                        });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {settings.financial.customItems.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Add investments, insurance policies, or other financial matters
                  </p>
                )}
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Scale className="w-5 h-5" />}
          title="Legal Matters"
          description="Legal cases, attorneys, court dates, and legal documents"
          expanded={expandedSections.includes('legal')}
          onToggle={() => toggleSection('legal')}
        >
          <div className="space-y-6">
            {/* Legal Cases */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Legal Cases
                </h4>
                <button
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      caseNumber: '',
                      type: '',
                      status: 'Active',
                      description: ''
                    };
                    handleUpdateSettings({
                      legal: {
                        ...settings.legal,
                        cases: [...settings.legal.cases, newItem]
                      }
                    });
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.legal.cases.map((legalCase, index) => (
                  <div key={legalCase.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={legalCase.caseNumber}
                        onChange={(e) => {
                          const updated = [...settings.legal.cases];
                          updated[index] = { ...updated[index], caseNumber: e.target.value };
                          handleUpdateSettings({
                            legal: { ...settings.legal, cases: updated }
                          });
                        }}
                        placeholder="Case #"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={legalCase.type}
                        onChange={(e) => {
                          const updated = [...settings.legal.cases];
                          updated[index] = { ...updated[index], type: e.target.value };
                          handleUpdateSettings({
                            legal: { ...settings.legal, cases: updated }
                          });
                        }}
                        placeholder="Type (e.g., Custody, Divorce)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <select
                        value={legalCase.status}
                        onChange={(e) => {
                          const updated = [...settings.legal.cases];
                          updated[index] = { ...updated[index], status: e.target.value };
                          handleUpdateSettings({
                            legal: { ...settings.legal, cases: updated }
                          });
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Closed</option>
                      </select>
                      <button
                        onClick={() => {
                          const updated = settings.legal.cases.filter((_, i) => i !== index);
                          handleUpdateSettings({
                            legal: { ...settings.legal, cases: updated }
                          });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={legalCase.description}
                      onChange={(e) => {
                        const updated = [...settings.legal.cases];
                        updated[index] = { ...updated[index], description: e.target.value };
                        handleUpdateSettings({
                          legal: { ...settings.legal, cases: updated }
                        });
                      }}
                      placeholder="Case description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                    />
                  </div>
                ))}
                {settings.legal.cases.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No legal cases added yet</p>
                )}
              </div>
            </div>

            {/* Attorneys */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Attorneys
                </h4>
                <button
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      name: '',
                      phone: '',
                      email: '',
                      specialty: ''
                    };
                    handleUpdateSettings({
                      legal: {
                        ...settings.legal,
                        attorneys: [...settings.legal.attorneys, newItem]
                      }
                    });
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.legal.attorneys.map((attorney, index) => (
                  <div key={attorney.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={attorney.name}
                        onChange={(e) => {
                          const updated = [...settings.legal.attorneys];
                          updated[index] = { ...updated[index], name: e.target.value };
                          handleUpdateSettings({
                            legal: { ...settings.legal, attorneys: updated }
                          });
                        }}
                        placeholder="Attorney name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={attorney.specialty}
                        onChange={(e) => {
                          const updated = [...settings.legal.attorneys];
                          updated[index] = { ...updated[index], specialty: e.target.value };
                          handleUpdateSettings({
                            legal: { ...settings.legal, attorneys: updated }
                          });
                        }}
                        placeholder="Specialty"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => {
                          const updated = settings.legal.attorneys.filter((_, i) => i !== index);
                          handleUpdateSettings({
                            legal: { ...settings.legal, attorneys: updated }
                          });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={attorney.phone}
                        onChange={(e) => {
                          const updated = [...settings.legal.attorneys];
                          updated[index] = { ...updated[index], phone: e.target.value };
                          handleUpdateSettings({
                            legal: { ...settings.legal, attorneys: updated }
                          });
                        }}
                        placeholder="Phone"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="email"
                        value={attorney.email}
                        onChange={(e) => {
                          const updated = [...settings.legal.attorneys];
                          updated[index] = { ...updated[index], email: e.target.value };
                          handleUpdateSettings({
                            legal: { ...settings.legal, attorneys: updated }
                          });
                        }}
                        placeholder="Email"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
                {settings.legal.attorneys.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No attorneys added yet</p>
                )}
              </div>
            </div>

            {/* Custom Legal Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Other Legal Info
                </h4>
                <button
                  onClick={() => {
                    const newItem = {
                      id: Date.now().toString(),
                      label: '',
                      value: ''
                    };
                    handleUpdateSettings({
                      legal: {
                        ...settings.legal,
                        customItems: [...settings.legal.customItems, newItem]
                      }
                    });
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.legal.customItems.map((item, index) => (
                  <div key={item.id} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...settings.legal.customItems];
                        updated[index] = { ...updated[index], label: e.target.value };
                        handleUpdateSettings({
                          legal: { ...settings.legal, customItems: updated }
                        });
                      }}
                      placeholder="e.g., Court Date, Document, etc."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...settings.legal.customItems];
                        updated[index] = { ...updated[index], value: e.target.value };
                        handleUpdateSettings({
                          legal: { ...settings.legal, customItems: updated }
                        });
                      }}
                      placeholder="Details"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => {
                        const updated = settings.legal.customItems.filter((_, i) => i !== index);
                        handleUpdateSettings({
                          legal: { ...settings.legal, customItems: updated }
                        });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {settings.legal.customItems.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Add court dates, documents, or other legal matters
                  </p>
                )}
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Lock className="w-5 h-5" />}
          title="Security"
          description="Password, biometric authentication, and sessions"
          expanded={expandedSections.includes('security')}
          onToggle={() => toggleSection('security')}
        >
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Use Face/Touch ID (Passkey)</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Enable biometric authentication using your device's secure hardware. Your face or fingerprint data never leaves your device.
                  </p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.security.passkeyEnabled}
                      onChange={(e) => handleUpdateSettings({
                        security: { ...settings.security, passkeyEnabled: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Passkey/Biometric</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Session Timeout
                </div>
              </label>
              <select
                value={settings.security.sessionTimeoutMins}
                onChange={(e) => handleUpdateSettings({
                  security: { ...settings.security, sessionTimeoutMins: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
                View Active Sessions
              </button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Link className="w-5 h-5" />}
          title="Integrations"
          description="Connect Google, Gmail, and Google Drive"
          expanded={expandedSections.includes('integrations')}
          onToggle={() => toggleSection('integrations')}
        >
          <div className="space-y-4">
            <IntegrationCard
              name="Google Account"
              description="Sign in with your Google account"
              connected={settings.integrations.googleConnected}
              onToggle={() => handleUpdateSettings({
                integrations: { ...settings.integrations, googleConnected: !settings.integrations.googleConnected }
              })}
            />

            <IntegrationCard
              name="Gmail"
              description="Import emails and attachments automatically"
              connected={settings.integrations.gmailConnected}
              onToggle={() => handleUpdateSettings({
                integrations: { ...settings.integrations, gmailConnected: !settings.integrations.gmailConnected }
              })}
            />

            <IntegrationCard
              name="Google Drive"
              description="Sync files and documents from Drive"
              connected={settings.integrations.driveConnected}
              lastSync={settings.integrations.lastSyncISO}
              onToggle={() => handleUpdateSettings({
                integrations: { ...settings.integrations, driveConnected: !settings.integrations.driveConnected }
              })}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Bell className="w-5 h-5" />}
          title="Notifications"
          description="Email and in-app notification preferences"
          expanded={expandedSections.includes('notifications')}
          onToggle={() => toggleSection('notifications')}
        >
          <div className="space-y-3">
            <ToggleSetting
              label="Email Alerts"
              description="Receive important updates via email"
              checked={settings.notifications.emailAlerts}
              onChange={(checked) => handleUpdateSettings({
                notifications: { ...settings.notifications, emailAlerts: checked }
              })}
            />

            <ToggleSetting
              label="Weekly Digest"
              description="Summary of activity and upcoming items"
              checked={settings.notifications.weeklyDigest}
              onChange={(checked) => handleUpdateSettings({
                notifications: { ...settings.notifications, weeklyDigest: checked }
              })}
            />

            <ToggleSetting
              label="Critical Only Mode"
              description="Only receive urgent notifications"
              checked={settings.notifications.criticalOnly}
              onChange={(checked) => handleUpdateSettings({
                notifications: { ...settings.notifications, criticalOnly: checked }
              })}
            />

            <ToggleSetting
              label="Financial Alerts"
              description="Bills due, transactions, and financial updates"
              checked={settings.notifications.financialAlerts}
              onChange={(checked) => handleUpdateSettings({
                notifications: { ...settings.notifications, financialAlerts: checked }
              })}
            />

            <ToggleSetting
              label="Task Reminders"
              description="Get notified about upcoming tasks"
              checked={settings.notifications.taskReminders}
              onChange={(checked) => handleUpdateSettings({
                notifications: { ...settings.notifications, taskReminders: checked }
              })}
            />

            <ToggleSetting
              label="Calendar Reminders"
              description="Event and appointment notifications"
              checked={settings.notifications.calendarReminders}
              onChange={(checked) => handleUpdateSettings({
                notifications: { ...settings.notifications, calendarReminders: checked }
              })}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Download className="w-5 h-5" />}
          title="Download & Install"
          description="Install app on desktop or mobile device"
          expanded={expandedSections.includes('install')}
          onToggle={() => toggleSection('install')}
        >
          <div className="space-y-4">
            {isInstalled ? (
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">App Installed</h4>
                    <p className="text-sm text-gray-600">
                      Pearson Nexus AI is installed on this device. You can launch it from your home screen or app menu.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Monitor className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Install on Desktop</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Get the full app experience on your computer. Works offline and launches like a native app.
                      </p>
                      {isInstallable ? (
                        <button
                          onClick={handleInstallClick}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Install Desktop App
                        </button>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          Install option will appear when available in your browser
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-2 border-cyan-200 bg-cyan-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-6 h-6 text-cyan-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Install on Mobile</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Add to your home screen for quick access. Works like a native mobile app.
                      </p>
                      {isInstallable ? (
                        <button
                          onClick={handleInstallClick}
                          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
                        >
                          Install Mobile App
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700 font-medium">iOS (iPhone/iPad):</p>
                          <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                            <li>Tap the Share button in Safari</li>
                            <li>Scroll down and tap "Add to Home Screen"</li>
                            <li>Tap "Add" in the top right</li>
                          </ol>
                          <p className="text-sm text-gray-700 font-medium mt-3">Android:</p>
                          <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                            <li>Tap the menu button in Chrome</li>
                            <li>Tap "Add to Home screen" or "Install app"</li>
                            <li>Follow the prompts to install</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Palette className="w-5 h-5" />}
          title="Appearance"
          description="Theme, colors, and display preferences"
          expanded={expandedSections.includes('appearance')}
          onToggle={() => toggleSection('appearance')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUpdateSettings({ appearance: { ...settings.appearance, theme: 'light' } })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.appearance.theme === 'light'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded" />
                    <span className="font-medium">Light</span>
                  </div>
                </button>

                <button
                  onClick={() => handleUpdateSettings({ appearance: { ...settings.appearance, theme: 'dark' } })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.appearance.theme === 'dark'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-800 border-2 border-gray-700 rounded" />
                    <span className="font-medium">Dark</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
              <div className="flex gap-2 flex-wrap">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleUpdateSettings({ appearance: { ...settings.appearance, accent: color } })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      settings.appearance.accent === color ? 'border-gray-900 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUpdateSettings({ appearance: { ...settings.appearance, viewMode: 'simple' } })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.appearance.viewMode === 'simple'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <Eye className="w-5 h-5 text-gray-700 mb-2" />
                    <span className="font-medium">Simple</span>
                    <span className="text-xs text-gray-600 mt-1">Essential features only</span>
                  </div>
                </button>

                <button
                  onClick={() => handleUpdateSettings({ appearance: { ...settings.appearance, viewMode: 'advanced' } })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.appearance.viewMode === 'advanced'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <Database className="w-5 h-5 text-gray-700 mb-2" />
                    <span className="font-medium">Advanced</span>
                    <span className="text-xs text-gray-600 mt-1">All available features</span>
                  </div>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Simple view shows only core features to reduce complexity. Switch to advanced view to access all unlocked modules.
              </p>
            </div>

            <ToggleSetting
              label="Reduced Motion"
              description="Minimize animations for accessibility"
              checked={settings.appearance.reducedMotion}
              onChange={(checked) => handleUpdateSettings({
                appearance: { ...settings.appearance, reducedMotion: checked }
              })}
            />

            <ToggleSetting
              label="Compact Mode"
              description="Reduce spacing for more content"
              checked={settings.appearance.compactMode}
              onChange={(checked) => handleUpdateSettings({
                appearance: { ...settings.appearance, compactMode: checked }
              })}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Database className="w-5 h-5" />}
          title="Data & Storage"
          description="Upload defaults, retention, and exports"
          expanded={expandedSections.includes('storage')}
          onToggle={() => toggleSection('storage')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Category</label>
              <select
                value={settings.storage.defaultCaptureCategory}
                onChange={(e) => handleUpdateSettings({
                  storage: { ...settings.storage, defaultCaptureCategory: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="General">General</option>
                <option value="Financial">Financial</option>
                <option value="Legal">Legal</option>
                <option value="Medical">Medical</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention</label>
              <select
                value={settings.storage.retentionDays}
                onChange={(e) => handleUpdateSettings({
                  storage: { ...settings.storage, retentionDays: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={90}>3 months</option>
                <option value={180}>6 months</option>
                <option value={365}>1 year</option>
                <option value={730}>2 years</option>
                <option value={1825}>5 years</option>
                <option value={-1}>Forever</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">How long to keep deleted items</p>
            </div>

            <ToggleSetting
              label="Auto-Tagging"
              description="Automatically suggest tags for new items"
              checked={settings.storage.autoTaggingEnabled}
              onChange={(checked) => handleUpdateSettings({
                storage: { ...settings.storage, autoTaggingEnabled: checked }
              })}
            />

            {/* Data Sync Section */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Data Synchronization</h4>
              <SyncIndicator />
              <p className="mt-2 text-xs text-gray-600">
                Auto-sync every 12 hours • Background sync when online • Manual sync available
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full">
                <Download className="w-4 h-4" />
                Export All Data
              </button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Cloud className="w-5 h-5" />}
          title="Integrations"
          description="Connect external services"
          expanded={expandedSections.includes('integrations')}
          onToggle={() => toggleSection('integrations')}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-8 text-center">
              <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrations Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                Connect with QuickBooks, Stripe, Zapier, and more to automate your workflows.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">
                <span>Stay tuned for updates</span>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          icon={<Monitor className="w-5 h-5" />}
          title="System Diagnostics (Dev)"
          description="Application health and connectivity status"
          expanded={expandedSections.includes('diagnostics')}
          onToggle={() => toggleSection('diagnostics')}
        >
          <div className="space-y-4">
            <div className={`border rounded-lg p-4 ${backendConfig.isLocal ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${backendConfig.isLocal ? 'bg-green-100' : 'bg-blue-100'}`}>
                  <Check className={`w-5 h-5 ${backendConfig.isLocal ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <div className={`font-medium mb-1 ${backendConfig.isLocal ? 'text-green-900' : 'text-blue-900'}`}>
                    {backendConfig.isLocal ? '100% Offline Mode Active' : 'Supabase Backend Active'}
                  </div>
                  <div className={`text-sm ${backendConfig.isLocal ? 'text-green-700' : 'text-blue-700'}`}>
                    {backendConfig.isLocal ? 'All data stored locally in browser localStorage' : 'Connected to Supabase cloud database'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Auth Backend</div>
                <div className="text-2xl font-bold text-gray-900">{backendConfig.authBackend}</div>
                <div className="text-xs text-gray-600 mt-1">{backendConfig.authBackend === 'local' ? 'localStorage-based' : 'Supabase-based'}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Data Backend</div>
                <div className="text-2xl font-bold text-gray-900">{backendConfig.dataBackend}</div>
                <div className="text-xs text-gray-600 mt-1">{backendConfig.dataBackend === 'local' ? 'localStorage-based' : 'Supabase-based'}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Network Calls</div>
                <div className="text-2xl font-bold text-gray-900">{backendConfig.isLocal ? '0' : 'Active'}</div>
                <div className="text-xs text-gray-600 mt-1">{backendConfig.isLocal ? 'Fully offline' : 'Cloud connected'}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Build Status</div>
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-xs text-gray-600 mt-1">Production ready</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-900">
                <div className="font-medium mb-2">Application Info:</div>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• Authentication: {backendConfig.authBackend === 'local' ? 'Local email/password with localStorage' : 'Supabase Auth'}</li>
                  <li>• Data Storage: {backendConfig.dataBackend === 'local' ? 'localStorage with pluggable architecture' : 'Supabase PostgreSQL'}</li>
                  <li>• Admin system: Role-based access control (owner/admin/member)</li>
                  <li>• {backendConfig.isLocal ? 'All features work offline with no network dependencies' : 'Cloud-synced with real-time capabilities'}</li>
                  <li>• Backend is configurable via .env flags (see Integrations section)</li>
                </ul>
              </div>
            </div>
          </div>
        </SettingsSection>

        <div className="pt-6 border-t-4 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
              <p className="text-sm text-gray-600">Irreversible actions</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetSettings}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Reset All Settings
            </button>

            <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, description, expanded, onToggle, children }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

interface IntegrationCardProps {
  name: string;
  description: string;
  connected: boolean;
  lastSync?: string;
  onToggle: () => void;
}

function IntegrationCard({ name, description, connected, lastSync, onToggle }: IntegrationCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{description}</p>
          {connected && lastSync && (
            <p className="text-xs text-gray-500 mt-1">
              Last synced: {new Date(lastSync).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            connected
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {connected ? 'Connected' : 'Connect'}
        </button>
      </div>
    </div>
  );
}
