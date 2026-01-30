import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';

import {
  loadData,
  saveData,
  ensureSeeded,
  findUserByEmail,
  getOrgForUser,
  createUserWithOrg,
  verifyPassword,
  publicUser,
  sha256Base64url,
  randomTokenBase64url,
  generateId
} from './store.js';

import {
  newJti,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getExpiryMsFromJwtPayload,
  cookieOptions
} from './tokens.js';

const PORT = Number(process.env.AUTH_PORT || 3001);

const COOKIE_ACCESS = 'pnx_access';
const COOKIE_REFRESH = 'pnx_refresh';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Dev-friendly CORS: reflect requesting origin (works for phone on LAN) + allow credentials for cookies
app.use(cors({ origin: true, credentials: true }));

const UPLOAD_DIR = path.resolve(process.cwd(), 'server', 'uploads');
const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
      } catch (e) {
        cb(e, UPLOAD_DIR);
      }
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      cb(null, `${crypto.randomUUID()}${ext}`);
    }
  }),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

let data = await ensureSeeded(await loadData());

function setAuthCookies(res, { accessToken, refreshToken, rememberMe }) {
  const { access, refresh } = cookieOptions({ rememberMe });
  res.cookie(COOKIE_ACCESS, accessToken, access);
  if (refreshToken) {
    res.cookie(COOKIE_REFRESH, refreshToken, refresh);
  } else {
    res.clearCookie(COOKIE_REFRESH, { path: '/' });
  }
}

function clearAuthCookies(res) {
  res.clearCookie(COOKIE_ACCESS, { path: '/' });
  res.clearCookie(COOKIE_REFRESH, { path: '/' });
}

function getAccessToken(req) {
  return req.cookies?.[COOKIE_ACCESS] || null;
}

function getRefreshToken(req) {
  return req.cookies?.[COOKIE_REFRESH] || null;
}

function sessionFromUser(userRecord, orgRecord, accessPayload) {
  return {
    user: publicUser(userRecord),
    organization: orgRecord,
    token: 'cookie',
    expiresAt: getExpiryMsFromJwtPayload(accessPayload)
  };
}

function requireAccess(req, res, next) {
  const token = getAccessToken(req);
  if (!token) return res.status(401).json({ error: 'UNAUTHENTICATED' });
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub };
    req.accessPayload = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  }
}

// --- Auth routes ---

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'MISSING_FIELDS' });

  const created = await createUserWithOrg(data, { email, password, name });
  if (!created.ok) return res.status(409).json({ error: created.error || 'SIGNUP_FAILED' });

  // Short-lived session by default after signup (no rememberMe persistence)
  const accessToken = signAccessToken({ userId: created.user.id });
  const accessPayload = verifyAccessToken(accessToken);
  setAuthCookies(res, { accessToken, refreshToken: null, rememberMe: false });

  return res.json({
    user: created.user,
    organization: created.org,
    session: sessionFromUser({ ...created.user, passwordHash: '' }, created.org, accessPayload)
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'MISSING_FIELDS' });

  const userRecord = findUserByEmail(data, email);
  if (!userRecord) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const ok = await verifyPassword(userRecord, password);
  if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });

  const org = getOrgForUser(data, userRecord);
  if (!org) return res.status(500).json({ error: 'ORG_NOT_FOUND' });

  // Always issue a new access token (short-lived)
  const accessToken = signAccessToken({ userId: userRecord.id });
  const accessPayload = verifyAccessToken(accessToken);

  // If rememberMe is enabled, issue a long-lived refresh token (rotation stored server-side)
  let refreshToken = null;
  if (rememberMe) {
    const jti = newJti();
    refreshToken = signRefreshToken({ userId: userRecord.id, jti });
    data.refreshTokens[userRecord.id] = {
      tokenHash: sha256Base64url(refreshToken),
      jti,
      // server-side expiration mirror (ms)
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };
    await saveData(data);
  } else {
    // Non-remember sessions must not persist across restarts; also revoke any existing refresh token
    if (data.refreshTokens[userRecord.id]) {
      delete data.refreshTokens[userRecord.id];
      await saveData(data);
    }
  }

  // Refresh token is refreshed on each successful login (new token + overwrite stored hash)
  setAuthCookies(res, { accessToken, refreshToken, rememberMe: Boolean(rememberMe) });

  return res.json({
    user: publicUser(userRecord),
    organization: org,
    session: sessionFromUser(userRecord, org, accessPayload)
  });
});

app.get('/api/auth/me', requireAccess, async (req, res) => {
  const userRecord = data.users[req.auth.userId];
  if (!userRecord) return res.status(401).json({ error: 'UNAUTHENTICATED' });
  const org = getOrgForUser(data, userRecord);
  if (!org) return res.status(500).json({ error: 'ORG_NOT_FOUND' });

  return res.json({ session: sessionFromUser(userRecord, org, req.accessPayload) });
});

app.post('/api/auth/refresh', async (req, res) => {
  const token = getRefreshToken(req);
  if (!token) return res.status(401).json({ error: 'NO_REFRESH_TOKEN' });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
  }

  const userId = payload.sub;
  const stored = data.refreshTokens[userId];
  if (!stored) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'REFRESH_REVOKED' });
  }

  // Replay protection: refresh tokens are rotated and only the latest token hash is accepted.
  const presentedHash = sha256Base64url(token);
  if (presentedHash !== stored.tokenHash || payload.jti !== stored.jti) {
    // Token reuse detected -> revoke the refresh token family for this user
    delete data.refreshTokens[userId];
    await saveData(data);
    clearAuthCookies(res);
    return res.status(401).json({ error: 'REFRESH_REUSE_DETECTED' });
  }

  const userRecord = data.users[userId];
  if (!userRecord) {
    delete data.refreshTokens[userId];
    await saveData(data);
    clearAuthCookies(res);
    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  }

  const org = getOrgForUser(data, userRecord);
  if (!org) return res.status(500).json({ error: 'ORG_NOT_FOUND' });

  // Rotate refresh token
  const newTokenJti = newJti();
  const newRefresh = signRefreshToken({ userId, jti: newTokenJti });
  data.refreshTokens[userId] = {
    tokenHash: sha256Base64url(newRefresh),
    jti: newTokenJti,
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
  };
  await saveData(data);

  const accessToken = signAccessToken({ userId });
  const accessPayload = verifyAccessToken(accessToken);

  setAuthCookies(res, { accessToken, refreshToken: newRefresh, rememberMe: true });
  return res.json({ session: sessionFromUser(userRecord, org, accessPayload) });
});

app.post('/api/auth/logout', async (req, res) => {
  // Invalidate refresh token server-side (if present)
  const refresh = getRefreshToken(req);
  if (refresh) {
    try {
      const payload = verifyRefreshToken(refresh);
      if (payload?.sub && data.refreshTokens[payload.sub]) {
        delete data.refreshTokens[payload.sub];
        await saveData(data);
      }
    } catch {
      // ignore invalid refresh token, just clear cookies
    }
  }

  clearAuthCookies(res);
  return res.json({ ok: true });
});

// Standardized forgot password:
// - Always returns 200 (prevents user enumeration)
// - In dev, logs a reset link with a one-time token
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return res.status(200).json({ ok: true });

  const userRecord = findUserByEmail(data, normalizedEmail);

  if (userRecord) {
    const token = randomTokenBase64url(32);
    const tokenHash = sha256Base64url(token);
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour

    data.passwordResets ||= {};
    data.passwordResets[tokenHash] = {
      userId: userRecord.id,
      expiresAt,
      usedAt: null
    };
    await saveData(data);

    // Dev-only: log the reset link (no email integration in this repo yet)
    const origin = req.headers?.origin || 'http://localhost:5174';
    console.log(`[auth] Password reset link for ${normalizedEmail}: ${origin}/reset-password?token=${token}`);
  }

  return res.status(200).json({ ok: true });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'INVALID_REQUEST' });
  }

  const tokenHash = sha256Base64url(String(token));
  const entry = data.passwordResets?.[tokenHash];
  if (!entry) return res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });
  if (entry.usedAt) return res.status(400).json({ error: 'TOKEN_ALREADY_USED' });
  if (entry.expiresAt < Date.now()) return res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });

  const userRecord = data.users?.[entry.userId];
  if (!userRecord) return res.status(400).json({ error: 'INVALID_OR_EXPIRED_TOKEN' });

  // Update password
  // bcrypt is only used inside store.js currently; import here lazily to keep dependencies simple.
  const bcrypt = (await import('bcryptjs')).default;
  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  data.users[entry.userId] = { ...userRecord, passwordHash };

  // Mark token used and revoke refresh tokens (force re-login everywhere)
  data.passwordResets[tokenHash] = { ...entry, usedAt: Date.now() };
  if (data.refreshTokens?.[entry.userId]) delete data.refreshTokens[entry.userId];
  await saveData(data);

  clearAuthCookies(res);
  return res.json({ ok: true });
});

app.patch('/api/auth/users/:userId', requireAccess, async (req, res) => {
  const { userId } = req.params;
  if (req.auth.userId !== userId) return res.status(403).json({ error: 'FORBIDDEN' });

  const record = data.users[userId];
  if (!record) return res.status(404).json({ error: 'NOT_FOUND' });

  const { updates } = req.body || {};
  if (!updates || typeof updates !== 'object') return res.status(400).json({ error: 'INVALID_UPDATES' });

  // Only allow a small safe subset
  const allowed = ['name', 'faceRecognitionEnabled'];
  for (const key of Object.keys(updates)) {
    if (!allowed.includes(key)) delete updates[key];
  }

  data.users[userId] = { ...record, ...updates };
  await saveData(data);

  return res.json({ user: publicUser(data.users[userId]) });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// File upload (photos/docs) -> stores metadata in server/data.json and file on disk.
app.post('/api/uploads', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'NO_FILE' });

  const { caseId, tags, notes, capturedAt, location } = req.body || {};

  const record = {
    id: generateId(),
    original_name: file.originalname,
    stored_name: file.filename,
    mime_type: file.mimetype,
    size: file.size,
    sha256: sha256Base64url(await fs.readFile(file.path)),
    path: file.path,
    case_id: caseId || null,
    tags: typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    notes: typeof notes === 'string' ? notes : '',
    captured_at: typeof capturedAt === 'string' ? capturedAt : null,
    location: typeof location === 'string' ? location : null,
    created_at: new Date().toISOString()
  };

  data.uploads ||= [];
  data.uploads.push(record);
  await saveData(data);

  return res.json({ upload: record });
});

app.get('/api/uploads', async (_req, res) => {
  data.uploads ||= [];
  return res.json({ uploads: data.uploads });
});

app.listen(PORT, () => {
  console.log(`✅ Auth server listening on http://localhost:${PORT}`);
});

