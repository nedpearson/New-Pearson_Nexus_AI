import { AuthStore, User, Organization, Session } from './interfaces';

const STORAGE_KEYS = {
  USERS: 'pnx_users',
  ORGANIZATIONS: 'pnx_organizations',
  SESSION: 'pnx_session',
  SEEDED: 'pnx_seeded'
};

const SESSION_STORAGE_KEY = STORAGE_KEYS.SESSION;
const REMEMBER_ME_KEY = 'pnx_remember_me';

function getStoredSessionRaw(): string | null {
  // prefer sessionStorage (non-persistent) when present
  return sessionStorage.getItem(SESSION_STORAGE_KEY) ?? localStorage.getItem(SESSION_STORAGE_KEY);
}

function setStoredSessionRaw(value: string, rememberMe: boolean) {
  if (rememberMe) {
    // persist across restarts
    localStorage.setItem(SESSION_STORAGE_KEY, value);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    // do NOT persist across browser restarts
    sessionStorage.setItem(SESSION_STORAGE_KEY, value);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

function clearStoredSessionRaw() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class LocalStorageAuthStore implements AuthStore {
  private getUsers(): Record<string, { user: User; passwordHash: string }> {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : {};
  }

  private setUsers(users: Record<string, { user: User; passwordHash: string }>): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getOrganizations(): Record<string, Organization> {
    const stored = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
    return stored ? JSON.parse(stored) : {};
  }

  private setOrganizations(orgs: Record<string, Organization>): void {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
  }

  async seedDefaultUser(): Promise<void> {
    const seeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    if (seeded === 'true') {
      return;
    }

    const users = this.getUsers();
    const hasUsers = Object.keys(users).length > 0;

    if (!hasUsers) {
      const orgId = generateId();
      const userId = generateId();

      const org: Organization = {
        id: orgId,
        name: 'Pearson Nexus AI',
        plan: 'business',
        created_at: new Date().toISOString()
      };

      const user: User = {
        id: userId,
        email: 'nedpearson@gmail.com',
        role: 'owner',
        name: 'Ned Pearson',
        organization_id: orgId,
        isDemo: false,
        faceRecognitionEnabled: false,
        created_at: new Date().toISOString()
      };

      const orgs = this.getOrganizations();
      orgs[orgId] = org;
      this.setOrganizations(orgs);

      users[userId] = {
        user,
        passwordHash: hashPassword('1Pearson2')
      };
      this.setUsers(users);

      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
      console.log('✅ Default admin user created: nedpearson@gmail.com / 1Pearson2');
    }
  }

  async signUp(email: string, password: string, name?: string): Promise<{ user: User; organization: Organization } | null> {
    try {
      const users = this.getUsers();

      const existingUser = Object.values(users).find(u => u.user.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const orgId = generateId();
      const userId = generateId();

      const org: Organization = {
        id: orgId,
        name: `${name || email}'s Organization`,
        plan: 'basic',
        created_at: new Date().toISOString()
      };

      const user: User = {
        id: userId,
        email,
        role: 'owner',
        name,
        organization_id: orgId,
        isDemo: false,
        faceRecognitionEnabled: false,
        created_at: new Date().toISOString()
      };

      const orgs = this.getOrganizations();
      orgs[orgId] = org;
      this.setOrganizations(orgs);

      users[userId] = {
        user,
        passwordHash: hashPassword(password)
      };
      this.setUsers(users);

      return { user, organization: org };
    } catch (error) {
      console.error('Sign up error:', error);
      return null;
    }
  }

  async signIn(email: string, password: string, rememberMe: boolean = false): Promise<{ user: User; organization: Organization } | null> {
    try {
      const users = this.getUsers();
      const passwordHash = hashPassword(password);

      const entry = Object.values(users).find(u =>
        u.user.email === email && u.passwordHash === passwordHash
      );

      if (!entry) {
        return null;
      }

      const orgs = this.getOrganizations();
      const organization = orgs[entry.user.organization_id];

      if (!organization) {
        console.error('Organization not found for user');
        return null;
      }

      const session: Session = {
        user: entry.user,
        organization,
        token: generateId(),
        // rememberMe=true: long-lived session (30 days)
        // rememberMe=false: short-lived session (2 hours) AND stored in sessionStorage only
        expiresAt: Date.now() + (rememberMe ? (30 * 24 * 60 * 60 * 1000) : (2 * 60 * 60 * 1000))
      };

      setStoredSessionRaw(JSON.stringify(session), rememberMe);

      return { user: entry.user, organization };
    } catch (error) {
      console.error('Sign in error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    clearStoredSessionRaw();
  }

  async requestPasswordReset(email: string): Promise<void> {
    // Avoid user enumeration: always resolve.
    // In local-only mode we can still log a dev-only reset hint if the account exists.
    try {
      const users = this.getUsers();
      const entry = Object.values(users).find(u => u.user.email === email);
      if (entry) {
        // No email service in offline mode. This is a dev hint only.
        console.log(`[local-auth] Password reset requested for ${email}. (No email sent in offline mode)`);
      }
    } catch {
      // ignore
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const stored = getStoredSessionRaw();
      if (!stored) {
        return null;
      }

      const session: Session = JSON.parse(stored);

      if (session.expiresAt < Date.now()) {
        clearStoredSessionRaw();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const users = this.getUsers();
      const entry = users[userId];

      if (!entry) {
        return null;
      }

      entry.user = { ...entry.user, ...updates };
      this.setUsers(users);

      const session = await this.getSession();
      if (session && session.user.id === userId) {
        session.user = entry.user;
        const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
        setStoredSessionRaw(JSON.stringify(session), rememberMe);
      }

      return entry.user;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  async resetAllData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATIONS);
    clearStoredSessionRaw();
    localStorage.removeItem(STORAGE_KEYS.SEEDED);
    console.log('🗑️ All local auth data cleared');
  }
}
