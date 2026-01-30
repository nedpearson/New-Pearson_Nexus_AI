import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const ACCESS_TTL_SECONDS = 2 * 60 * 60; // 2 hours
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';

export function newJti() {
  return crypto.randomUUID();
}

export function signAccessToken({ userId }) {
  return jwt.sign(
    { sub: userId, typ: 'access' },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL_SECONDS }
  );
}

export function signRefreshToken({ userId, jti }) {
  return jwt.sign(
    { sub: userId, jti, typ: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TTL_SECONDS }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, ACCESS_SECRET);
  if (!payload || payload.typ !== 'access') throw new Error('INVALID_TOKEN_TYPE');
  return payload;
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, REFRESH_SECRET);
  if (!payload || payload.typ !== 'refresh') throw new Error('INVALID_TOKEN_TYPE');
  return payload;
}

export function getExpiryMsFromJwtPayload(payload) {
  // jwt "exp" is seconds since epoch
  if (!payload?.exp) return 0;
  return payload.exp * 1000;
}

export function cookieOptions({ rememberMe }) {
  const secure = process.env.NODE_ENV === 'production';
  const common = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/'
  };

  // Access cookie is a session cookie in both modes (no maxAge), so non-remember sessions
  // do not persist across browser restarts; rememberMe relies on the refresh cookie.
  const access = { ...common };

  const refresh = rememberMe
    ? { ...common, maxAge: REFRESH_TTL_SECONDS * 1000 }
    : { ...common };

  return { access, refresh, secure };
}

