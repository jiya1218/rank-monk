import express from 'express';
import { createCheckoutOrder, verifyPaymentSignature } from '../services/checkout.js';
import { memoryStore } from '../config/supabase.js';

const router = express.Router();

router.get('/subscription', (req, res) => {
  res.json({
    success: true,
    subscription: memoryStore.subscription,
    plans: [
      {
        id: 'seed',
        name: 'Seed',
        priceINR: 10000,
        formatted: '₹10,000 / mo',
        credits: 50,
        articlesPerMonth: 15,
        targetDomains: 1
      },
      {
        id: 'grow',
        name: 'Grow',
        priceINR: 20000,
        formatted: '₹20,000 / mo',
        credits: 200,
        articlesPerMonth: 45,
        targetDomains: 3,
        popular: true
      },
      {
        id: 'scale',
        name: 'Scale',
        priceINR: 40000,
        formatted: '₹40,000 / mo',
        credits: 600,
        articlesPerMonth: 120,
        targetDomains: 'Unlimited'
      }
    ]
  });
});

router.get('/config', (req, res) => {
  res.json({
    success: true,
    key_id: env.RAZORPAY_KEY_ID || 'rzp_live_TuVbNSiePj0Pz7'
  });
});

router.post('/razorpay-order', handleCreateOrder);
router.post('/create-order', handleCreateOrder);

async function handleCreateOrder(req, res) {
  try {
    const { planId = req.body.plan || 'grow', email, couponCode } = req.body;
    const order = await createCheckoutOrder({ planId, userEmail: email, couponCode });
    res.json({ success: true, order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

router.post('/verify', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId = 'grow', email } = req.body;
    const verification = await verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planId,
      userEmail: email
    });
    res.json({ success: true, ...verification });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
