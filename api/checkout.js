/**
 * Rank Monk - Vercel Serverless Function: /api/checkout
 * Direct, zero-latency Razorpay Checkout Engine
 */

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_TuVbNSiePj0Pz7';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'V6JoLMEMEOaR2qvWODv2blGB';
const AUTH_HEADER = 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

// Plan Pricing Architecture (INR)
// Seed: ₹10,000 / mo | Grow: ₹20,000 / mo | Scale: ₹40,000 / mo
// 99% Test Mode for immediate gateway verification:
// Seed: ₹100 / ₹80 | Grow: ₹200 / ₹160 | Scale: ₹400 / ₹320
const PLAN_CONFIGS = {
  seed: { name: 'Seed Tier', baseINR: 10000, testINR: 100, annualTestINR: 80 },
  grow: { name: 'Grow Tier', baseINR: 20000, testINR: 200, annualTestINR: 160 },
  scale: { name: 'Scale Tier', baseINR: 40000, testINR: 400, annualTestINR: 320 }
};

export const config = {
  maxDuration: 60
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Health / Config check
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'Rank Monk Razorpay Checkout Engine',
      keyId: KEY_ID,
      currency: 'INR',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { planId = 'grow', cycle = 'monthly', customerEmail = 'client@rankmonk.in' } = req.body || {};
    const normPlan = (planId || 'grow').toLowerCase().trim();
    const planInfo = PLAN_CONFIGS[normPlan] || PLAN_CONFIGS.grow;

    const isAnnual = cycle === 'annual';
    const amountINR = isAnnual ? planInfo.annualTestINR : planInfo.testINR;
    const amountPaise = amountINR * 100;
    const receiptId = `rcpt_${normPlan}_${Date.now()}`;

    // 1. Create Razorpay Order
    let orderData = null;
    try {
      const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': AUTH_HEADER,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            plan: normPlan,
            cycle: cycle,
            customer_email: customerEmail
          }
        })
      });

      if (orderRes.ok) {
        orderData = await orderRes.json();
      } else {
        const errJson = await orderRes.json().catch(() => ({}));
        console.error('[Razorpay Order API Error]:', orderRes.status, errJson);
      }
    } catch (orderErr) {
      console.error('[Razorpay Order Fetch Error]:', orderErr);
    }

    // 2. Also Create Razorpay Hosted Payment Link (foolproof fallback)
    let paymentLinkUrl = null;
    try {
      const linkRes = await fetch('https://api.razorpay.com/v1/payment_links', {
        method: 'POST',
        headers: {
          'Authorization': AUTH_HEADER,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          accept_partial: false,
          description: `${planInfo.name} (${isAnnual ? 'Annual' : 'Monthly'}) - Rank Monk`,
          customer: {
            name: customerEmail.split('@')[0] || 'Customer',
            email: customerEmail
          },
          notify: { sms: false, email: false },
          reminder_enable: false,
          callback_url: 'https://www.rankmonk.in/dashboard?status=success&plan=' + normPlan,
          callback_method: 'get'
        })
      });
      if (linkRes.ok) {
        const linkData = await linkRes.json();
        paymentLinkUrl = linkData.short_url;
      }
    } catch (linkErr) {
      console.error('[Razorpay Link Fetch Error]:', linkErr);
    }

    if (!orderData && !paymentLinkUrl) {
      return res.status(500).json({
        success: false,
        error: 'Unable to communicate with Razorpay API. Please verify network or key.'
      });
    }

    return res.status(200).json({
      success: true,
      keyId: KEY_ID,
      orderId: orderData ? orderData.id : null,
      amount: amountPaise,
      amountINR: amountINR,
      currency: 'INR',
      planId: normPlan,
      planName: planInfo.name,
      cycle: cycle,
      paymentUrl: paymentLinkUrl
    });
  } catch (err) {
    console.error('[Checkout Handler Crash]:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
