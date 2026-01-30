import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const DATA_PATH = path.resolve(process.cwd(), 'server', 'data.json');

function nowIso() {
  return new Date().toISOString();
}

function generateId() {
  return crypto.randomUUID();
}

export async function loadData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { users: {}, orgs: {}, refreshTokens: {}, passwordResets: {} };
  }
}

export async function saveData(data) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function ensureSeeded(data) {
  const users = Object.values(data.users || {});
  if (users.length > 0) return data;

  const orgId = generateId();
  const userId = generateId();

  const org = {
    id: orgId,
    name: 'Pearson Nexus AI',
    plan: 'business',
    created_at: nowIso()
  };

  const user = {
    id: userId,
    email: 'nedpearson@gmail.com',
    role: 'owner',
    name: 'Ned Pearson',
    organization_id: orgId,
    isDemo: false,
    faceRecognitionEnabled: false,
    created_at: nowIso()
  };

  const passwordHash = await bcrypt.hash('1Pearson2', 10);

  data.orgs[orgId] = org;
  data.users[userId] = { ...user, passwordHash };

  await saveData(data);
  return data;
}

export function findUserByEmail(data, email) {
  const lower = String(email || '').toLowerCase();
  return Object.values(data.users).find(u => u.email.toLowerCase() === lower) || null;
}

export function getOrgForUser(data, user) {
  return data.orgs[user.organization_id] || null;
}

export async function createUserWithOrg(data, { email, password, name }) {
  const existing = findUserByEmail(data, email);
  if (existing) {
    return { ok: false, error: 'ACCOUNT_EXISTS' };
  }

  const orgId = generateId();
  const userId = generateId();

  const org = {
    id: orgId,
    name: `${name || email}'s Organization`,
    plan: 'basic',
    created_at: nowIso()
  };

  const user = {
    id: userId,
    email,
    role: 'owner',
    name,
    organization_id: orgId,
    isDemo: false,
    faceRecognitionEnabled: false,
    created_at: nowIso()
  };

  const passwordHash = await bcrypt.hash(password, 10);

  data.orgs[orgId] = org;
  data.users[userId] = { ...user, passwordHash };
  await saveData(data);

  return { ok: true, user, org };
}

export async function verifyPassword(userRecord, password) {
  return bcrypt.compare(password, userRecord.passwordHash);
}

export function publicUser(userRecord) {
  const { passwordHash, ...rest } = userRecord;
  return rest;
}

export function sha256Base64url(input) {
  return crypto.createHash('sha256').update(input).digest('base64url');
}

export function randomTokenBase64url(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

