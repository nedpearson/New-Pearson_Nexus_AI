import type { AuthStore, Session, User, Organization } from './interfaces';

type AuthResult = { user: User; organization: Organization } | null;

async function jsonFetch<T>(
  input: RequestInfo | URL,
  init: RequestInit & { json?: unknown } = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const { json, headers, ...rest } = init;
  const res = await fetch(input, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    },
    body: json === undefined ? rest.body : JSON.stringify(json)
  });

  const text = await res.text();
  let parsed: any = undefined;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = undefined;
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: (parsed && (parsed.error || parsed.message)) || text || `Request failed (${res.status})`
    };
  }

  return { ok: true, status: res.status, data: parsed as T };
}

export class ApiAuthStore implements AuthStore {
  private baseUrl = '/api/auth';

  async seedDefaultUser(): Promise<void> {
    // Backend seeds on boot; keep for compatibility.
    return;
  }

  async signUp(email: string, password: string, name?: string): Promise<AuthResult> {
    const res = await jsonFetch<{ user: User; organization: Organization }>(`${this.baseUrl}/signup`, {
      method: 'POST',
      json: { email, password, name }
    });
    return res.ok ? (res.data ?? null) : null;
  }

  async signIn(email: string, password: string, rememberMe: boolean = false): Promise<AuthResult> {
    const res = await jsonFetch<{ user: User; organization: Organization }>(`${this.baseUrl}/login`, {
      method: 'POST',
      json: { email, password, rememberMe }
    });
    if (!res.ok) return null;
    return res.data ?? null;
  }

  async signOut(): Promise<void> {
    await jsonFetch(`${this.baseUrl}/logout`, { method: 'POST' });
  }

  async getSession(): Promise<Session | null> {
    // 1) Try access token
    const me = await jsonFetch<{ session: Session }>(`${this.baseUrl}/me`, { method: 'GET' });
    if (me.ok && me.data?.session) return me.data.session;

    // 2) If access expired but refresh cookie exists, backend will rotate and set new cookies
    const refreshed = await jsonFetch<{ session: Session }>(`${this.baseUrl}/refresh`, { method: 'POST' });
    if (refreshed.ok && refreshed.data?.session) return refreshed.data.session;

    return null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const res = await jsonFetch<{ user: User }>(`${this.baseUrl}/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      json: { updates }
    });
    return res.ok ? (res.data?.user ?? null) : null;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await jsonFetch(`${this.baseUrl}/forgot-password`, {
      method: 'POST',
      json: { email }
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await jsonFetch(`${this.baseUrl}/reset-password`, {
      method: 'POST',
      json: { token, newPassword }
    });
  }

  resetAllData(): Promise<void> {
    // Not supported in server mode
    return Promise.resolve();
  }
}

