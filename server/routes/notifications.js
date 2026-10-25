import express from 'express';
import { memoryStore } from '../config/supabase.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    notifications: memoryStore.notifications,
    unreadCount: memoryStore.notifications.filter(n => !n.read).length
  });
});

router.post('/mark-read', (req, res) => {
  const { id } = req.body;
  if (id) {
    const item = memoryStore.notifications.find(n => n.id === id);
    if (item) item.read = true;
  } else {
    memoryStore.notifications.forEach(n => n.read = true);
  }
  res.json({ success: true, message: 'Notifications marked as read' });
});

export default router;
