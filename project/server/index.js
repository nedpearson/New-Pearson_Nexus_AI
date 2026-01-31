import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import { createProxyMiddleware } from 'http-proxy-middleware';
import QRCode from 'qrcode';

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
// Use IPv4 loopback to avoid localhost->IPv6 (::1) issues on Windows
const UI_DEV_TARGET = process.env.PNX_UI_PROXY_TARGET || 'http://127.0.0.1:5174';
const HOSTNAME = os.hostname();

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

// Serve uploaded files (local testing convenience)
app.use('/uploads', express.static(UPLOAD_DIR));

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

// Phone-friendly landing page: save this URL on your home screen.
app.get('/launch', (req, res) => {
  const hostHeader = String(req.headers.host || '');
  const hostOnly = hostHeader.includes(':') ? hostHeader.split(':')[0] : hostHeader;
  const preferredHost = hostOnly || HOSTNAME;

  const baseUrl = `http://${preferredHost}:${PORT}`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pearson Nexus AI — Launch</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0f172a;color:#fff;margin:0;padding:24px}
    .card{max-width:720px;margin:0 auto;background:rgba(31,41,55,.45);border:1px solid rgba(75,85,99,.5);border-radius:16px;padding:20px}
    a{color:#67e8f9}
    .btn{display:inline-block;margin-top:12px;padding:12px 14px;border-radius:12px;background:linear-gradient(90deg,#0891b2,#2563eb);color:#fff;text-decoration:none;font-weight:600}
    .muted{color:#9ca3af;font-size:14px}
    code{background:rgba(0,0,0,.25);padding:2px 6px;border-radius:8px}
  </style>
  <meta name="apple-mobile-web-app-capable" content="yes" />
</head>
<body>
  <div class="card">
    <h1 style="margin:0 0 8px 0;">Pearson Nexus AI</h1>
    <div class="muted">
      Save this page to your phone Home Screen. It uses your PC name (<code>${HOSTNAME}</code>) so the link keeps working on the same Wi‑Fi even if your PC’s IP changes.
    </div>

    <div style="margin-top:14px">
      <div><strong>Phone bookmark link:</strong> <a href="${baseUrl}/launch">${baseUrl}/launch</a></div>
      <div style="margin-top:8px"><a href="${baseUrl}/qr">Open QR code to scan</a></div>
      <div class="muted" style="margin-top:6px">If this hostname doesn’t resolve on your phone, use the Network URL printed in the PC terminal instead.</div>
    </div>

    <a class="btn" href="/">Open App</a>
    <div style="margin-top:10px" class="muted">
      Useful pages: <a href="/capture">Capture</a> • <a href="/uploads">Uploads</a>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

// QR code page for easy phone setup
app.get('/qr', async (req, res) => {
  const hostHeader = String(req.headers.host || '');
  const hostOnly = hostHeader.includes(':') ? hostHeader.split(':')[0] : hostHeader;
  const preferredHost = hostOnly || HOSTNAME;

  const url = `http://${preferredHost}:${PORT}/launch`;

  let dataUrl = '';
  try {
    dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 });
  } catch (e) {
    return res.status(500).send('Failed to generate QR code');
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pearson Nexus AI — QR</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0f172a;color:#fff;margin:0;padding:24px}
    .card{max-width:520px;margin:0 auto;background:rgba(31,41,55,.45);border:1px solid rgba(75,85,99,.5);border-radius:16px;padding:20px;text-align:center}
    .muted{color:#9ca3af;font-size:14px}
    a{color:#67e8f9}
    img{border-radius:12px;background:#fff;padding:10px}
    code{background:rgba(0,0,0,.25);padding:2px 6px;border-radius:8px}
  </style>
</head>
<body>
  <div class="card">
    <h1 style="margin:0 0 8px 0;">Scan to open</h1>
    <div class="muted">Save to Home Screen after it opens.</div>
    <div style="margin-top:14px">
      <img src="${dataUrl}" alt="QR code for ${url}" />
    </div>
    <div class="muted" style="margin-top:14px">
      Link: <a href="${url}"><code>${url}</code></a>
    </div>
    <div style="margin-top:12px"><a href="/launch">Back</a></div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

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

// Single-port mode for phones: proxy the UI through this server (dev).
// This makes your saved link stable: http://<PC-NAME>:3001/...
app.use(
  createProxyMiddleware({
    target: UI_DEV_TARGET,
    changeOrigin: true,
    ws: true,
    logLevel: 'silent',
    /**
     * Do NOT proxy API, upload files, or launch page.
     */
    pathFilter: (pathName) => {
      return !(
        pathName.startsWith('/api') ||
        pathName.startsWith('/uploads') ||
        pathName.startsWith('/launch')
      );
    }
  })
);

app.listen(PORT, () => {
  console.log(`✅ Auth server listening on http://localhost:${PORT}`);
  console.log(`📱 Phone link (hostname): http://${HOSTNAME}:${PORT}/launch`);
  console.log(`🖥️  Local link: http://localhost:${PORT}/launch`);
});

