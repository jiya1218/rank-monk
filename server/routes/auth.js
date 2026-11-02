import express from 'express';
import fs from 'fs';
import path from 'path';
import { supabaseClient, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Persistent User Database File
const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
}

// In-Memory User Registry
const registeredUsers = new Map();

// Seed Founder Account & Demo Account
const founderAccount = {
  id: 'usr_founder_01',
  email: 'founder@rankmonk.in',
  name: 'Rank Monk Architect',
  phone: '+91 98765 43210',
  password: 'Password123!',
  role: 'owner',
  plan: 'scale',
  paid: true,
  domain: 'rankmonk.in',
  created_at: new Date().toISOString()
};
registeredUsers.set('founder@rankmonk.in', founderAccount);

const demoAccount = {
  id: 'usr_jiya_01',
  email: 'jiya@gmail.com',
  name: 'Jiya',
  phone: '+91 98253 58617',
  password: '123456',
  role: 'owner',
  plan: 'scale',
  paid: true,
  domain: 'scalezix.com',
  created_at: new Date().toISOString()
};
registeredUsers.set('jiya@gmail.com', demoAccount);

// Load persisted users from file
function loadUsersFromFile() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(u => {
          if (u && u.email) registeredUsers.set(u.email.toLowerCase().trim(), u);
        });
      }
    }
  } catch (err) {
    console.warn('[Auth] Error loading users.json:', err.message);
  }
}

// Save users to file
function saveUsersToFile() {
  try {
    const list = Array.from(registeredUsers.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Auth] Error saving users.json:', err.message);
  }
}

// Initialize on server start
loadUsersFromFile();
saveUsersToFile();

let currentUser = registeredUsers.get('founder@rankmonk.in');

router.get('/user', (req, res) => {
  res.json({
    success: true,
    user: currentUser
  });
});

// Update User Payment Status (called on successful checkout)
router.post('/update-payment', (req, res) => {
  const { email, plan = 'grow', paymentId, cycle = 'monthly' } = req.body || {};
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

  const normEmail = email.toLowerCase().trim();
  const user = registeredUsers.get(normEmail);
  if (user) {
    user.paid = true;
    user.plan = plan;
    user.cycle = cycle;
    user.paymentId = paymentId || `pay_${Date.now()}`;
    user.updated_at = new Date().toISOString();
    registeredUsers.set(normEmail, user);
    saveUsersToFile();
  }

  // Update Supabase if available
  if (supabaseAdmin) {
    try {
      supabaseAdmin.from('profiles').upsert({
        email: normEmail,
        plan: plan,
        paid: true,
        last_payment_id: paymentId,
        updated_at: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}
  }

  return res.json({ success: true, user });
});

// Update User Domain
router.post('/update-domain', (req, res) => {
  const { email, domain } = req.body || {};
  if (!email || !domain) return res.status(400).json({ success: false, error: 'Email and domain required' });

  const normEmail = email.toLowerCase().trim();
  const user = registeredUsers.get(normEmail);
  if (user) {
    user.domain = domain;
    user.updated_at = new Date().toISOString();
    registeredUsers.set(normEmail, user);
    saveUsersToFile();
  }

  if (supabaseAdmin) {
    try {
      supabaseAdmin.from('profiles').upsert({
        email: normEmail,
        domain: domain,
        updated_at: new Date().toISOString()
      }).catch(() => {});
    } catch (e) {}
  }

  return res.json({ success: true, domain });
});

// Strict Login Handler
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const normEmail = email.toLowerCase().trim();

  // 1. Check Supabase Auth
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email: normEmail, password });
      if (!error && data.user) {
        let existing = registeredUsers.get(normEmail);
        currentUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || (existing && existing.name) || normEmail.split('@')[0],
          phone: data.user.user_metadata?.phone || (existing && existing.phone) || '',
          domain: (existing && existing.domain) || data.user.user_metadata?.domain || '',
          role: (existing && existing.role) || 'member',
          plan: (existing && existing.plan) || 'seed',
          paid: (existing && existing.paid) || false
        };
        return res.json({ success: true, user: currentUser, session: data.session });
      }
    } catch {}
  }

  // 2. Check Local Registered Registry
  const existing = registeredUsers.get(normEmail);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'No account found with this email address. Please sign up first.'
    });
  }

  if (existing.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect password. Please verify and try again.'
    });
  }

  currentUser = {
    id: existing.id,
    email: existing.email,
    name: existing.name,
    phone: existing.phone,
    domain: existing.domain,
    role: existing.role || 'member',
    plan: existing.plan || 'seed',
    paid: existing.paid === true || existing.role === 'owner' || normEmail === 'founder@rankmonk.in'
  };

  return res.json({ success: true, user: currentUser });
});

// Strict Signup Handler
router.post('/signup', async (req, res) => {
  const { email, password, name, phone, domain, plan = 'seed' } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email address is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Full name is required' });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, error: 'Contact phone number is required' });
  }

  const normEmail = email.toLowerCase().trim();

  // Duplicate Check
  if (registeredUsers.has(normEmail)) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email already exists. Please log in.'
    });
  }

  // Sync to Supabase Auth & Supabase DB if reachable
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: normEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
            domain: domain ? domain.trim() : ''
          }
        }
      });
      if (error && error.message.toLowerCase().includes('already registered')) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists. Please log in.'
        });
      }
    } catch {}
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email: normEmail,
    name: name.trim(),
    phone: phone.trim(),
    password: password,
    domain: domain ? domain.trim() : '',
    role: 'member',
    plan: plan || 'seed',
    paid: false, // Must complete payment to unlock dashboard
    created_at: new Date().toISOString()
  };

  // Sync to Supabase Profiles Table if available
  if (supabaseAdmin) {
    try {
      supabaseAdmin.from('profiles').insert([{
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        domain: newUser.domain,
        plan: newUser.plan,
        paid: false,
        created_at: newUser.created_at
      }]).catch(() => {});
    } catch (e) {}
  }

  registeredUsers.set(normEmail, newUser);
  saveUsersToFile();

  currentUser = { ...newUser };
  delete currentUser.password;

  res.json({ success: true, user: currentUser });
});

router.post('/logout', (req, res) => {
  if (supabaseClient) {
    try {
      supabaseClient.auth.signOut();
    } catch {}
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

export { registeredUsers };
export default router;
