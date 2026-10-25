import express from 'express';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Rank Monk Autonomous Organic Growth Platform',
    version: '2.2.0',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    environment: env.NODE_ENV,
    services: {
      aws_bedrock: {
        configured: Boolean(env.BEDROCK_BEARER_TOKEN),
        region: env.BEDROCK_REGION,
        model: env.BEDROCK_DEFAULT_MODEL
      },
      supabase: {
        configured: Boolean(env.SUPABASE_URL),
        active: Boolean(supabaseAdmin)
      },
      razorpay: {
        currency: 'INR',
        key_configured: Boolean(env.RAZORPAY_KEY_ID)
      }
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
