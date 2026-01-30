import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStore } from '../lib/storage';
import { User as StorageUser, Organization as StorageOrg } from '../lib/storage/interfaces';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'member';
  organizationId: string;
  isDemo: boolean;
  faceRecognitionEnabled?: boolean;
}

interface Organization {
  id: string;
  name: string;
  plan: 'basic' | 'professional' | 'business';
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  loading: boolean;
  authInitStart: number;
  authInitEnd: number;
  timeoutFired: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, faceRecognition?: boolean) => Promise<void>;
  loginDemo: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  resetLocalData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapStorageUserToAppUser(storageUser: StorageUser): User {
  return {
    id: storageUser.id,
    email: storageUser.email,
    name: storageUser.name,
    role: storageUser.role,
    organizationId: storageUser.organization_id,
    isDemo: storageUser.isDemo,
    faceRecognitionEnabled: storageUser.faceRecognitionEnabled
  };
}

function mapStorageOrgToAppOrg(storageOrg: StorageOrg): Organization {
  return {
    id: storageOrg.id,
    name: storageOrg.name,
    plan: storageOrg.plan
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authInitStart] = useState(Date.now());
  const [authInitEnd, setAuthInitEnd] = useState(0);
  const [timeoutFired, setTimeoutFired] = useState(false);

  useEffect(() => {
    let resolved = false;

    const initAuth = async () => {
      try {
        await authStore.seedDefaultUser?.();

        const session = await authStore.getSession();
        if (session) {
          const appUser = mapStorageUserToAppUser(session.user);
          const appOrg = mapStorageOrgToAppOrg(session.organization);

          setUser(appUser);
          setOrganization(appOrg);
          setOrganizations([appOrg]);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (!resolved) {
          resolved = true;
          setAuthInitEnd(Date.now());
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        console.warn('Auth initialization timeout (500ms) - forcing loading to false');
        resolved = true;
        setTimeoutFired(true);
        setAuthInitEnd(Date.now());
        setLoading(false);
      }
    }, 500);

    initAuth();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const result = await authStore.signIn(email, password, rememberMe);
    if (!result) {
      throw new Error('Invalid email or password');
    }

    const appUser = mapStorageUserToAppUser(result.user);
    const appOrg = mapStorageOrgToAppOrg(result.organization);

    // Remember-me semantics are implemented in the AuthStore:
    // - server mode: httpOnly cookie refresh token rotation
    // - local mode: sessionStorage vs localStorage + different expirations

    setUser(appUser);
    setOrganization(appOrg);
    setOrganizations([appOrg]);
    setIsAuthenticated(true);
  };

  const signup = async (email: string, password: string, name: string, faceRecognition?: boolean) => {
    const result = await authStore.signUp(email, password, name);
    if (!result) {
      throw new Error('ACCOUNT_EXISTS');
    }

    if (faceRecognition) {
      await authStore.updateUser(result.user.id, { faceRecognitionEnabled: true });
      result.user.faceRecognitionEnabled = true;
    }

    const appUser = mapStorageUserToAppUser(result.user);
    const appOrg = mapStorageOrgToAppOrg(result.organization);

    setUser(appUser);
    setOrganization(appOrg);
    setOrganizations([appOrg]);
    setIsAuthenticated(true);
  };

  const loginDemo = async () => {
    const demoEmail = `demo-${Date.now()}@demo.pearsonnexus.ai`;
    const demoPassword = Math.random().toString(36).slice(-8);

    const result = await authStore.signUp(demoEmail, demoPassword, 'Demo User');
    if (!result) {
      throw new Error('Failed to create demo user');
    }

    await authStore.updateUser(result.user.id, { isDemo: true });
    result.user.isDemo = true;

    const appUser = mapStorageUserToAppUser(result.user);
    const appOrg = mapStorageOrgToAppOrg(result.organization);

    setUser(appUser);
    setOrganization(appOrg);
    setOrganizations([appOrg]);
    setIsAuthenticated(true);
  };

  const loginWithGoogle = async () => {
    // Placeholder for Google OAuth integration
    // In a production app, this would redirect to Google OAuth
    // For now, we'll simulate it with a demo account
    
    // This is a placeholder - in production, you would integrate with Google OAuth:
    // 1. Redirect to Google OAuth consent screen
    // 2. Get authorization code
    // 3. Exchange for access token
    // 4. Get user info from Google
    // 5. Create or login user with Google credentials
    
    throw new Error('Google login coming soon! This feature requires OAuth integration.');
    
    // Example implementation (commented out):
    // const googleUser = await authenticateWithGoogle();
    // const result = await authStore.signUp(googleUser.email, generateSecurePassword(), googleUser.name);
    // if (result) {
    //   const appUser = mapStorageUserToAppUser(result.user);
    //   const appOrg = mapStorageOrgToAppOrg(result.organization);
    //   setUser(appUser);
    //   setOrganization(appOrg);
    //   setOrganizations([appOrg]);
    //   setIsAuthenticated(true);
    // }
  };

  const forgotPassword = async (email: string) => {
    // Standardized: delegate to active AuthStore implementation.
    // - server mode: hits /api/auth/forgot-password (no user enumeration)
    // - local mode : logs a dev hint (no email)
    await authStore.requestPasswordReset?.(email);
    return;
  };

  const logout = async () => {
    await authStore.signOut();
    setUser(null);
    setOrganization(null);
    setOrganizations([]);
    setIsAuthenticated(false);
  };

  const signOut = async () => {
    await logout();
  };

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org && user) {
      const updatedUser = { ...user, organizationId: orgId };
      setUser(updatedUser);
      setOrganization(org);
    }
  };

  const resetLocalData = () => {
    // Only supported for local/offline auth store
    authStore.resetAllData?.();

    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pnx_')) {
        allKeys.push(key);
      }
    }
    allKeys.forEach(key => localStorage.removeItem(key));

    setUser(null);
    setOrganization(null);
    setOrganizations([]);
    setIsAuthenticated(false);

    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      organizations,
      isAuthenticated,
      loading,
      authInitStart,
      authInitEnd,
      timeoutFired,
      login,
      signup,
      loginDemo,
      loginWithGoogle,
      forgotPassword,
      logout,
      signOut,
      switchOrganization,
      resetLocalData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
