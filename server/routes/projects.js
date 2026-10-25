import express from 'express';
import { memoryStore, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('projects').select('*');
      if (!error && data && data.length > 0) {
        return res.json({ success: true, projects: data });
      }
    } catch {}
  }
  res.json({ success: true, projects: memoryStore.projects });
});

router.post('/', async (req, res) => {
  const { name, domain, brand_name, brand_tagline, brand_description, target_audience, tone } = req.body;
  if (!name || !domain) {
    return res.status(400).json({ error: 'Project name and domain are required' });
  }

  const newProject = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name,
    domain: domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
    brand_name: brand_name || name,
    brand_tagline: brand_tagline || 'Autonomous Organic Growth',
    brand_description: brand_description || '',
    target_audience: target_audience || 'Modern SaaS and e-commerce founders',
    tone: tone || 'Zen, Authoritative, Clear',
    created_at: new Date().toISOString()
  };

  memoryStore.projects.unshift(newProject);

  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('projects').insert(newProject);
    } catch (err) {
      console.warn('[Projects Route] Supabase insert note:', err.message);
    }
  }

  res.json({ success: true, project: newProject });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const project = memoryStore.projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  Object.assign(project, req.body);

  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('projects').update(req.body).eq('id', id);
    } catch {}
  }

  res.json({ success: true, project });
});

export default router;
