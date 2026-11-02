import express from 'express';
import { supabaseClient } from '../config/supabase.js';

const router = express.Router();

// Production Registered User Store
const registeredUsers = new Map();

// Seed initial founder account
registeredUsers.set('founder@rankmonk.in', {
  id: 'usr_founder_01',
  email: 'founder@rankmonk.in',
  name: 'Rank Monk Architect',
  phone: '+91 98765 43210',
  password: 'Password123!',
  role: 'owner',
  plan: 'grow',
  created_at: new Date().toISOString()
});

let currentUser = registeredUsers.get('founder@rankmonk.in');

router.get('/user', (req, res) => {
  res.json({
    success: true,
    user: currentUser
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const normEmail = email.toLowerCase().trim();

  // 1. Check Supabase Auth if available
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email: normEmail, password });
      if (!error && data.user) {
        currentUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || normEmail.split('@')[0],
          phone: data.user.user_metadata?.phone || '',
          role: 'owner',
          plan: 'grow'
        };
        return res.json({ success: true, user: currentUser, session: data.session });
      }
    } catch {}
  }

  // 2. Check strict registered user registry
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
    role: existing.role || 'owner',
    plan: existing.plan || 'grow'
  };

  return res.json({ success: true, user: currentUser });
});

router.post('/signup', async (req, res) => {
  const { email, password, name, phone, domain, plan = 'grow' } = req.body || {};
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

  // Check if user already exists
  if (registeredUsers.has(normEmail)) {
    return res.status(409).json({
      success: false,
      error: 'An account with this email already exists. Please log in.'
    });
  }

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
    role: 'owner',
    plan: plan || 'grow',
    created_at: new Date().toISOString()
  };

  registeredUsers.set(normEmail, newUser);
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

export default router;
