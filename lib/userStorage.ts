import fs from 'fs';
import path from 'path';
import os from 'os';

// Primary read file in bundle (read-only on Vercel)
const BUNDLE_USERS_FILE = path.join(process.cwd(), 'server', 'data', 'users.json');

// Writable file in /tmp (writable on Vercel serverless)
const TMP_USERS_FILE = path.join(os.tmpdir(), 'rankmonk_users.json');

// In-memory cache to guarantee persistence across requests in same lambda container
let memoryUsersCache: any[] | null = null;

export function getUsers(): any[] {
  if (memoryUsersCache && memoryUsersCache.length > 0) {
    return memoryUsersCache;
  }

  const usersMap = new Map<string, any>();

  // 1. Read from bundle if exists (seed/default registered users)
  if (fs.existsSync(BUNDLE_USERS_FILE)) {
    try {
      const bundleData = JSON.parse(fs.readFileSync(BUNDLE_USERS_FILE, 'utf8'));
      if (Array.isArray(bundleData)) {
        for (const u of bundleData) {
          if (u.email) usersMap.set(u.email.toLowerCase().trim(), u);
        }
      }
    } catch (e) {}
  }

  // 2. Read from /tmp if exists (dynamic signups on Vercel serverless)
  if (fs.existsSync(TMP_USERS_FILE)) {
    try {
      const tmpData = JSON.parse(fs.readFileSync(TMP_USERS_FILE, 'utf8'));
      if (Array.isArray(tmpData)) {
        for (const u of tmpData) {
          if (u.email) usersMap.set(u.email.toLowerCase().trim(), u);
        }
      }
    } catch (e) {}
  }

  memoryUsersCache = Array.from(usersMap.values());
  return memoryUsersCache;
}

export function saveUsers(users: any[]): void {
  memoryUsersCache = users;

  // 1. Try writing to bundle file (succeeds in local development)
  try {
    const dir = path.dirname(BUNDLE_USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BUNDLE_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    // EROFS on Vercel is expected and safely handled
  }

  // 2. Always write to /tmp as well (guaranteed writable on Vercel serverless)
  try {
    fs.writeFileSync(TMP_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Notice: Could not write to tmp users file:', (e as Error).message);
  }
}

export function getUserByEmail(email: string): any | null {
  if (!email) return null;
  const users = getUsers();
  const norm = email.toLowerCase().trim();
  return users.find((u: any) => u.email && u.email.toLowerCase().trim() === norm) || null;
}

export function addUser(user: any): void {
  const users = getUsers();
  const norm = user.email.toLowerCase().trim();
  const existingIdx = users.findIndex((u: any) => u.email && u.email.toLowerCase().trim() === norm);
  if (existingIdx !== -1) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  saveUsers(users);
}

export function updateUser(email: string, updates: Record<string, any>): boolean {
  const users = getUsers();
  const norm = email.toLowerCase().trim();
  const idx = users.findIndex((u: any) => u.email && u.email.toLowerCase().trim() === norm);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return true;
  }
  return false;
}

