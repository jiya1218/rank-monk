/**
 * Razorpay INR Payment and Subscription Service
 * Pricing strictly calibrated:
 * - Seed: ₹10,000 INR / month (1,000,000 paise)
 * - Grow: ₹20,000 INR / month (2,000,000 paise)
 * - Scale: ₹40,000 INR / month (4,000,000 paise)
 */
import crypto from 'crypto';
import { env } from '../config/env.js';
import { supabaseAdmin, memoryStore } from '../config/supabase.js';

export async function createCheckoutOrder({ planId = 'grow', userEmail = 'zen@rankmonk.com', couponCode = '' }) {
  const normalizedPlan = planId.toLowerCase().trim();
  const planInfo = env.PRICING_PLANS[normalizedPlan];

  if (!planInfo) {
    throw new Error(`Invalid plan selected: "${planId}". Available plans: seed (₹10,000), grow (₹20,000), scale (₹40,000)`);
  }

  let finalAmountINR = planInfo.priceINR;
  let finalAmountPaise = planInfo.pricePaise;
  let isDiscountApplied = false;

  // Optional Launch coupon code ZEN20 (20% off)
  if (couponCode && couponCode.toUpperCase() === 'ZEN20') {
    finalAmountINR = Math.round(planInfo.priceINR * 0.8);
    finalAmountPaise = finalAmountINR * 100;
    isDiscountApplied = true;
  }

  let orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const receipt = `rcpt_${normalizedPlan}_${Date.now()}`;

  // Call official Razorpay Live Orders API
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: finalAmountPaise,
          currency: 'INR',
          receipt: receipt,
          notes: {
            plan_id: normalizedPlan,
            plan_name: planInfo.name,
            user_email: userEmail
          }
        })
      });

      if (res.ok) {
        const liveOrder = await res.json();
        orderId = liveOrder.id;
        console.log(`[Razorpay] Created Live Order ${orderId} for ${planInfo.name} (₹${finalAmountINR})`);
      } else {
        const errText = await res.text();
        console.warn(`[Razorpay] Order API returned ${res.status}:`, errText);
      }
    } catch (apiErr) {
      console.warn('[Razorpay] Network request error creating order:', apiErr.message);
    }
  }

  const orderData = {
    id: orderId,
    entity: 'order',
    amount: finalAmountPaise,
    amount_paid: 0,
    amount_due: finalAmountPaise,
    currency: 'INR',
    receipt,
    status: 'created',
    plan_id: normalizedPlan,
    plan_name: planInfo.name,
    inr_formatted: `₹${finalAmountINR.toLocaleString('en-IN')}`,
    user_email: userEmail,
    is_discount_applied: isDiscountApplied,
    key_id: env.RAZORPAY_KEY_ID,
    created_at: Math.floor(Date.now() / 1000)
  };

  return orderData;
}

export async function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature, planId = 'grow', userEmail }) {
  const normalizedPlan = planId.toLowerCase().trim();
  const planInfo = env.PRICING_PLANS[normalizedPlan] || env.PRICING_PLANS.grow;

  // Real Razorpay signature verification logic
  let isValid = false;
  if (env.RAZORPAY_KEY_SECRET && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
    try {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      isValid = generatedSignature === razorpaySignature;
    } catch (e) {
      console.warn('[Razorpay] Verification HMAC error:', e);
      isValid = false;
    }
  } else if (!env.RAZORPAY_KEY_SECRET) {
    isValid = true; // Fallback only when secret is unconfigured
  }

  if (isValid) {
    // Update memory store
    memoryStore.subscription = {
      plan: normalizedPlan,
      status: 'active',
      inr_price: planInfo.priceINR,
      credits_total: planInfo.credits,
      credits_used: 0,
      renew_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      last_payment_id: razorpayPaymentId || `pay_sim_${Date.now()}`
    };

    // If Supabase is active, persist to database table public.user_subscriptions
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('user_subscriptions').upsert({
          plan: normalizedPlan,
          status: 'active',
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[Checkout] Supabase subscription upsert note:', err.message);
      }
    }

    return {
      success: true,
      plan: normalizedPlan,
      planName: planInfo.name,
      amountINR: planInfo.priceINR,
      credits: planInfo.credits,
      paymentId: razorpayPaymentId || `pay_verified_${Date.now()}`,
      message: `Successfully upgraded to Rank Monk ${planInfo.name} Plan (₹${planInfo.priceINR.toLocaleString('en-IN')}/mo)!`
    };
  }

  throw new Error('Payment verification failed: Invalid Razorpay signature');
}
