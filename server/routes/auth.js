import express from 'express';
import { supabaseClient } from '../config/supabase.js';

const router = express.Router();

let currentUser = {
  id: 'usr_zen_master_01',
  email: 'zen@rankmonk.com',
  name: 'Rank Monk Architect',
  role: 'owner',
  plan: 'grow'
};

router.get('/user', (req, res) => {
  res.json({
    success: true,
    user: currentUser
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (supabaseClient && password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        currentUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: 'owner',
          plan: 'grow'
        };
        return res.json({ success: true, user: currentUser, session: data.session });
      }
    } catch {}
  }

  // Fallback demo/session login
  currentUser = {
    id: `usr_${Date.now()}`,
    email,
    name: email.split('@')[0],
    role: 'owner',
    plan: 'grow'
  };

  res.json({ success: true, user: currentUser });
});

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (supabaseClient && password) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: name || email.split('@')[0] } }
      });
      if (!error && data.user) {
        currentUser = {
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
          role: 'owner',
          plan: 'seed'
        };
        return res.json({ success: true, user: currentUser, session: data.session });
      }
    } catch {}
  }

  currentUser = {
    id: `usr_${Date.now()}`,
    email,
    name: name || email.split('@')[0],
    role: 'owner',
    plan: 'seed'
  };

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
