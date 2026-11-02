import express from 'express';
import { createCheckoutOrder, verifyPaymentSignature } from '../services/checkout.js';
import { memoryStore } from '../config/supabase.js';
import { env } from '../config/env.js';

const router = express.Router();

router.get('/subscription', (req, res) => {
  res.json({
    success: true,
    subscription: memoryStore.subscription,
    plans: [
      { id: 'seed', name: 'Seed', priceINR: 10000, formatted: '₹10,000 / mo', credits: 50 },
      { id: 'grow', name: 'Grow', priceINR: 20000, formatted: '₹20,000 / mo', credits: 200, popular: true },
      { id: 'scale', name: 'Scale', priceINR: 40000, formatted: '₹40,000 / mo', credits: 600 }
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
router.post('/', handleCreateOrder);
router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Rank Monk Razorpay Checkout Engine',
    keyId: env.RAZORPAY_KEY_ID || 'rzp_live_TuVbNSiePj0Pz7',
    currency: 'INR'
  });
});

async function handleCreateOrder(req, res) {
  try {
    const {
      planId = req.body.plan || 'grow',
      cycle = 'monthly',
      email = req.body.customerEmail || 'client@rankmonk.in',
      customerName = req.body.customerName || '',
      customerPhone = req.body.customerPhone || '',
      couponCode
    } = req.body;
    const order = await createCheckoutOrder({ planId, cycle, userEmail: email, customerName, customerPhone, couponCode });
    res.json({
      success: true,
      keyId: env.RAZORPAY_KEY_ID || 'rzp_live_TuVbNSiePj0Pz7',
      orderId: order.id || order.orderId,
      amount: order.amount || order.amountPaise,
      amountINR: Math.round((order.amount || 10000) / 100),
      currency: 'INR',
      planId: order.plan_id || order.planId,
      planName: order.plan_name || order.planName,
      cycle: order.billing_cycle || cycle,
      paymentUrl: order.paymentUrl || null,
      order: order
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
