import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface PersonalProfile {
  fullName: string;
  preferredName: string;
  phone: string;
  address: string;
  emergencyContact: string;
  defaultCategory: string;
}

interface BusinessProfile {
  businessName: string;
  dba: string;
  industry: string;
  ein: string;
  businessAddress: string;
  billingEmail: string;
}

interface SettingsState {
  account: {
    email: string;
    phone: string;
    timezone: string;
    language: string;
  };
  profile: {
    mode: 'personal' | 'business';
    avatar: string;
    personal: PersonalProfile;
    business: BusinessProfile;
  };
  financial: {
    bankAccounts: Array<{ id: string; name: string; accountNumber: string; type: string }>;
    creditCards: Array<{ id: string; name: string; last4: string; expiry: string }>;
    investments: Array<{ id: string; name: string; type: string; value: string }>;
    debts: Array<{ id: string; name: string; amount: string; dueDate: string }>;
    customItems: Array<{ id: string; label: string; value: string }>;
  };
  legal: {
    cases: Array<{ id: string; caseNumber: string; type: string; status: string; description: string }>;
    attorneys: Array<{ id: string; name: string; phone: string; email: string; specialty: string }>;
    courtDates: Array<{ id: string; date: string; court: string; purpose: string }>;
    documents: Array<{ id: string; name: string; type: string; date: string }>;
    customItems: Array<{ id: string; label: string; value: string }>;
  };
  security: {
    passkeyEnabled: boolean;
    allowBiometric: boolean;
    sessionTimeoutMins: number;
  };
  integrations: {
    googleConnected: boolean;
    gmailConnected: boolean;
    driveConnected: boolean;
    lastSyncISO: string;
  };
  notifications: {
    emailAlerts: boolean;
    weeklyDigest: boolean;
    criticalOnly: boolean;
    financialAlerts: boolean;
    taskReminders: boolean;
    calendarReminders: boolean;
  };
  appearance: {
    theme: 'light' | 'dark';
    accent: string;
    reducedMotion: boolean;
    compactMode: boolean;
    viewMode: 'simple' | 'advanced';
  };
  storage: {
    defaultCaptureCategory: string;
    retentionDays: number;
    autoTaggingEnabled: boolean;
    defaultExportFormat: 'pdf' | 'zip';
  };
  billing: {
    plan: 'Free' | 'Plus' | 'Pro';
    nextRenewalISO: string;
  };
  admin: {
    isAdmin: boolean;
    orgName: string;
  };
  setupCompleted: boolean;
}

const defaultSettings: SettingsState = {
  account: {
    email: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
  },
  profile: {
    mode: 'personal',
    avatar: '',
    personal: {
      fullName: '',
      preferredName: '',
      phone: '',
      address: '',
      emergencyContact: '',
      defaultCategory: 'General',
    },
    business: {
      businessName: '',
      dba: '',
      industry: '',
      ein: '',
      businessAddress: '',
      billingEmail: '',
    },
  },
  financial: {
    bankAccounts: [],
    creditCards: [],
    investments: [],
    debts: [],
    customItems: [],
  },
  legal: {
    cases: [],
    attorneys: [],
    courtDates: [],
    documents: [],
    customItems: [],
  },
  security: {
    passkeyEnabled: false,
    allowBiometric: false,
    sessionTimeoutMins: 60,
  },
  integrations: {
    googleConnected: false,
    gmailConnected: false,
    driveConnected: false,
    lastSyncISO: '',
  },
  notifications: {
    emailAlerts: true,
    weeklyDigest: true,
    criticalOnly: false,
    financialAlerts: true,
    taskReminders: true,
    calendarReminders: true,
  },
  appearance: {
    theme: 'light',
    accent: '#3b82f6',
    reducedMotion: false,
    compactMode: false,
    viewMode: 'simple',
  },
  storage: {
    defaultCaptureCategory: 'General',
    retentionDays: 365,
    autoTaggingEnabled: true,
    defaultExportFormat: 'pdf',
  },
  billing: {
    plan: 'Free',
    nextRenewalISO: '',
  },
  admin: {
    isAdmin: false,
    orgName: '',
  },
  setupCompleted: false,
};

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
  resetSettings: () => void;
  completeSetup: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'app_settings';
const VIEW_MODE_KEY = 'pnx_user_preferences';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    if (user) {
      loadViewMode();
    }
  }, [user]);

  const loadViewMode = () => {
    if (!user) return;

    try {
      const stored = localStorage.getItem(`${VIEW_MODE_KEY}_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setSettings(prev => ({
          ...prev,
          appearance: {
            ...prev.appearance,
            viewMode: data.view_mode as 'simple' | 'advanced',
          },
        }));
      }
    } catch (error) {
      console.error('Error loading view mode:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<SettingsState>) => {
    setSettings(prev => {
      const merged = { ...prev };
      Object.keys(updates).forEach(key => {
        const k = key as keyof SettingsState;
        const updateValue = updates[k];
        if (updateValue && typeof updateValue === 'object' && !Array.isArray(updateValue)) {
          merged[k] = { ...(prev[k] as object), ...(updateValue as object) } as any;
        } else {
          merged[k] = updateValue as any;
        }
      });
      return merged;
    });

    if (user && updates.appearance?.viewMode) {
      try {
        localStorage.setItem(`${VIEW_MODE_KEY}_${user.id}`, JSON.stringify({
          view_mode: updates.appearance.viewMode,
          updated_at: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error saving view mode:', error);
      }
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  };

  const completeSetup = () => {
    updateSettings({ setupCompleted: true });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, completeSetup }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
