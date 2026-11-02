import { NextResponse } from 'next/server';
import { PLAN_CONFIG, type PlanTier } from '@/types';

export async function POST(req: Request) {
  try {
    const { plan = 'grow', cycle = 'monthly', email, couponCode = '' } = await req.json();

    const tier = (plan as PlanTier) in PLAN_CONFIG ? (plan as PlanTier) : 'grow';
    const planInfo = PLAN_CONFIG[tier];
    let baseAmountINR = cycle === 'annual' ? planInfo.priceAnnual : planInfo.priceMonthly;

    // Check for 100% Free Test Discount Coupon (RANKMONK100, RANKMONK001, FREE100)
    const normalizedCoupon = (couponCode || '').trim().toUpperCase();
    const isFreeDiscount = normalizedCoupon === 'RANKMONK100' || normalizedCoupon === 'RANKMONK001' || normalizedCoupon === 'FREE100';

    if (isFreeDiscount) {
      return NextResponse.json({
        success: true,
        isFree: true,
        data: {
          orderId: `free_${tier}_${Date.now()}`,
          amount: 0,
          amountINR: 0,
          currency: 'INR',
          keyId: 'free_coupon',
          isLiveOrder: false,
          plan: tier
        }
      });
    }

    let finalAmountINR = baseAmountINR;
    let finalAmountPaise = finalAmountINR * 100;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TuVbNSiePj0Pz7';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = `order_${tier}_${Date.now()}`;
    let isLiveOrder = false;

    // Call Razorpay Orders API if credentials exist
    if (keyId && keySecret) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: finalAmountPaise,
            currency: 'INR',
            receipt: `rcpt_${tier}_${Date.now()}`,
            notes: {
              plan_id: tier,
              plan_name: planInfo.name,
              billing_cycle: cycle,
              user_email: email || 'client@rankmonk.in',
              coupon_applied: isSpecialDiscount ? 'RANKMONK001 (₹10 Test)' : 'none'
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const liveOrder = await res.json();
          orderId = liveOrder.id;
          isLiveOrder = true;
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('[Razorpay API Error]', errData);
        }
      } catch (e) {
        console.warn('[Razorpay Order Fallback]', (e as Error).message);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        amount: finalAmountPaise,
        amountINR: finalAmountINR,
        originalAmountINR: baseAmountINR,
        currency: 'INR',
        keyId,
        plan: tier,
        cycle,
        email,
        couponApplied: isSpecialDiscount,
        couponCode: isSpecialDiscount ? 'RANKMONK001' : '',
        discountPercentage: isSpecialDiscount ? '99.99%' : '0%',
        isLiveOrder
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
