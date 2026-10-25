import express from 'express';

const router = express.Router();

let tickets = [
  {
    id: 'tkt_01',
    subject: 'Google Search Console Domain Property Verification',
    priority: 'Normal',
    status: 'In Progress',
    created_at: '2026-10-24T14:20:00Z',
    messages: [
      { sender: 'user', text: 'Need assistance verifying DNS TXT record for subdomains.' },
      { sender: 'support', text: 'Our growth engineering team is inspecting your DNS records now.' }
    ]
  }
];

router.get('/tickets', (req, res) => {
  res.json({ success: true, tickets });
});

router.post('/tickets', (req, res) => {
  const { subject, message, priority = 'Normal', category = 'Technical' } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const newTicket = {
    id: `tkt_${Date.now()}`,
    subject,
    priority,
    category,
    status: 'Open',
    created_at: new Date().toISOString(),
    messages: [{ sender: 'user', text: message }]
  };

  tickets.unshift(newTicket);
  res.json({ success: true, ticket: newTicket, message: 'Support ticket opened with SLA guarantee.' });
});

export default router;
