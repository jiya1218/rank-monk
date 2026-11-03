'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PLAN_CONFIG, type PlanTier } from '@/types';

interface PricingSectionProps {
  initialPlan?: PlanTier;
  requirePaymentNotice?: boolean;
}

export function PricingSection({ initialPlan, requirePaymentNotice }: PricingSectionProps) {
  const router = useRouter();
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // 99.99% Discount Promo States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('rankmonk_user') || localStorage.getItem('rankmonk_active_user_v3');
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      }
    } catch (e) {}

    // Load Razorpay checkout script if not present
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleApplyCoupon = (manualCode?: string) => {
    const code = (manualCode || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'RANKMONK001' || code === 'RANKMONK100' || code === 'FREE100') {
      setAppliedCoupon(code);
      setIsDiscountActive(true);
      setCouponError('');
      setCouponInput(code);
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setIsDiscountActive(false);
    setCouponInput('');
    setCouponError('');
  };

  const handleSelectPlan = async (tier: PlanTier) => {
    setLoadingTier(tier);

    try {
      const email = user ? user.email : 'subscriber@rankmonk.in';
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: tier,
          cycle,
          email,
          couponCode: appliedCoupon
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to initialize payment order');
      }

      const orderData = json.data;

      // Handle 100% Free Activation (Bypass Razorpay for ₹0 orders)
      if (json.isFree || orderData.amount === 0) {
        try {
          await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user ? user.email : email,
              plan: tier,
              paymentId: `free_coupon_${Date.now()}`,
              couponCode: appliedCoupon
            })
          });
        } catch (e) {}

        if (user) {
          user.paid = true;
          user.plan = tier;
          localStorage.setItem('rankmonk_user', JSON.stringify(user));
          localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(user));
        }

        alert(`🎉 100% Discount Applied!\n\nYour account has been upgraded to ${PLAN_CONFIG[tier].name} Plan for ₹0.`);
        router.push('/dashboard');
        return;
      }

      // Handle Razorpay Checkout
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: 'INR',
          name: 'Rank Monk',
          description: `${PLAN_CONFIG[tier].name} Tier (${cycle === 'annual' ? 'Annual' : 'Monthly'})`,
          image: '/assets/rank-monk-icon.png',
          order_id: orderData.isLiveOrder ? orderData.orderId : undefined,
          handler: async function (response: any) {
            try {
              await fetch('/api/checkout/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user ? user.email : email,
                  plan: tier,
                  paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                  couponCode: appliedCoupon
                })
              });

              if (user) {
                user.paid = true;
                user.plan = tier;
                localStorage.setItem('rankmonk_user', JSON.stringify(user));
                localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(user));
              }

              alert(`✓ Payment Successful (₹${orderData.amountINR})!\n\nYour account has been upgraded to ${PLAN_CONFIG[tier].name} Plan.`);
              router.push('/dashboard');
            } catch (err) {}
          },
          prefill: {
            name: user ? user.name : '',
            email: user ? user.email : '',
            contact: user ? user.phone : ''
          },
          theme: {
            color: '#c5a059'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation if script is blocked
        if (user) {
          user.paid = true;
          user.plan = tier;
          localStorage.setItem('rankmonk_user', JSON.stringify(user));
          localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(user));
        }
        alert(`✓ Test Payment Activated (₹${orderData.amountINR})!\n\nAccount upgraded to ${PLAN_CONFIG[tier].name} Plan.`);
        router.push('/dashboard');
      }
    } catch (err) {
      alert((err as Error).message || 'Checkout failed');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section className="section" id="pricing-section">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Predictable Pricing</span>
          <h2>Pick your pace. Three simple tiers.</h2>
          <p className="lead" style={{ margin: '0 auto' }}>
            All plans include full platform access with zero setup fees. Cancel anytime.
          </p>

          {/* Monthly / Annual Toggle */}
          <div style={{ marginTop: '20px', display: 'inline-flex', gap: '8px', padding: '4px', background: 'var(--bg-alt)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <button
              onClick={() => setCycle('monthly')}
              className={`btn-fix-sm ${cycle === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700 }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={`btn-fix-sm ${cycle === 'annual' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700 }}
            >
              Annual Billing (20% OFF)
            </button>
          </div>
        </div>

        {/* PROMO COUPON CODE (DISCREET / HIDDEN BY DEFAULT) */}
        <div style={{ maxWidth: '420px', margin: '0 auto 28px' }}>
          {isDiscountActive ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>🏷️</span>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--ink)' }}>
                    Coupon <strong style={{ color: 'var(--success)' }}>{appliedCoupon}</strong> Applied
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    100% OFF discount active
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
              >
                Remove
              </button>
            </div>
          ) : showCouponInput ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '14px', padding: '12px 16px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', background: 'var(--bg-alt)', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '0.84rem', color: 'var(--ink)', textTransform: 'uppercase', fontWeight: 700, outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '9px 16px', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCouponInput(false); setCouponError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer', padding: '4px' }}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {couponError && (
                <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '8px', fontWeight: 600 }}>
                  {couponError}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowCouponInput(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'underline'
                }}
              >
                <span>Have a promo code?</span>
              </button>
            </div>
          )}
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="pricing-grid">
          {/* 1. Seed Plan */}
          <div className="plan">
            <div className="plan-name">Seed Plan</div>
            <div className="price">
              {isDiscountActive ? (
                <div>
                  <span style={{ fontSize: '1rem', color: 'var(--muted)', textDecoration: 'line-through', marginRight: '8px' }}>
                    {cycle === 'annual' ? '₹8,000' : '₹10,000'}
                  </span>
                  <strong style={{ color: 'var(--success)', fontSize: '2.4rem' }}>₹0</strong>
                  <small style={{ color: 'var(--success)', fontWeight: 700 }}> (100% OFF FREE)</small>
                </div>
              ) : (
                <div>
                  <span>{cycle === 'annual' ? '₹8,000' : '₹10,000'}</span>
                  <small> / month</small>
                </div>
              )}
            </div>
            <p>For early startups and creators finding their organic footing.</p>

            <ul>
              <li><strong>SEO Audit:</strong> Up to 200 pages / scan & 2 rescans</li>
              <li><strong>5 Auto-fixes</strong> per day (1-click code remedies)</li>
              <li><strong>Automatic Audit Report</strong> (Instant PDF & Web)</li>
              <li><strong>Real-time Prompt & Keyword Recs</strong> (5 tracked)</li>
              <li><strong>4 AI Prompt Agents</strong> (AEO / GEO Radar)</li>
              <li><strong>8 Autonomous SEO Blogs / mo</strong></li>
              <li><strong>15 AI Image Generations / mo</strong> (Media Studio)</li>
              <li><strong>Social Media Auto-Scheduling</strong> (30 posts / mo)</li>
            </ul>

            <button
              onClick={() => handleSelectPlan('seed')}
              disabled={loadingTier === 'seed'}
              className="btn btn-ghost btn-block"
              style={{ marginTop: 'auto' }}
            >
              {loadingTier === 'seed'
                ? 'Preparing checkout...'
                : isDiscountActive
                ? 'Unlock Seed Tier Free (₹0) →'
                : 'Choose Seed (₹10,000)'}
            </button>
          </div>

          {/* 2. Grow Plan (Featured) */}
          <div className="plan featured">
            <span className="plan-tag">Most Chosen</span>
            <div className="plan-name">Grow Plan</div>
            <div className="price">
              {isDiscountActive ? (
                <div>
                  <span style={{ fontSize: '1rem', color: '#d7c4b2', textDecoration: 'line-through', marginRight: '8px' }}>
                    {cycle === 'annual' ? '₹16,000' : '₹20,000'}
                  </span>
                  <strong style={{ color: '#84e1bc', fontSize: '2.4rem' }}>₹0</strong>
                  <small style={{ color: '#84e1bc', fontWeight: 700 }}> (100% OFF FREE)</small>
                </div>
              ) : (
                <div>
                  <span>{cycle === 'annual' ? '₹16,000' : '₹20,000'}</span>
                  <small> / month</small>
                </div>
              )}
            </div>
            <p>For fast-moving brands ready to dominate search and AEO citations.</p>

            <ul>
              <li><strong>SEO Audit:</strong> Up to 300 pages / scan & 4 rescans</li>
              <li><strong>7 Auto-fixes</strong> per day (1-click code remedies)</li>
              <li><strong>Automatic Audit Reports</strong> (Weekly executive insights)</li>
              <li><strong>Real-time Prompt & Keyword Recs</strong> (10 tracked)</li>
              <li><strong>4 AI Prompt Agents</strong> across 4 LLMs</li>
              <li><strong>30 Autonomous SEO Blogs / mo</strong></li>
              <li><strong>50 AI Image Generations / mo</strong> (Media Studio 8K)</li>
              <li><strong>Unlimited Multi-Channel Social Auto-Scheduling</strong></li>
            </ul>

            <button
              onClick={() => handleSelectPlan('grow')}
              disabled={loadingTier === 'grow'}
              className="btn btn-primary btn-block"
              style={{ marginTop: 'auto', background: '#c5a059', color: '#1b120c' }}
            >
              {loadingTier === 'grow'
                ? 'Preparing checkout...'
                : isDiscountActive
                ? 'Unlock Grow Tier Free (₹0) →'
                : 'Choose Grow (₹20,000) →'}
            </button>
          </div>

          {/* 3. Scale Plan */}
          <div className="plan">
            <div className="plan-name">Scale Plan</div>
            <div className="price">
              {isDiscountActive ? (
                <div>
                  <span style={{ fontSize: '1rem', color: 'var(--muted)', textDecoration: 'line-through', marginRight: '8px' }}>
                    {cycle === 'annual' ? '₹32,000' : '₹40,000'}
                  </span>
                  <strong style={{ color: 'var(--success)', fontSize: '2.4rem' }}>₹0</strong>
                  <small style={{ color: 'var(--success)', fontWeight: 700 }}> (100% OFF FREE)</small>
                </div>
              ) : (
                <div>
                  <span>{cycle === 'annual' ? '₹32,000' : '₹40,000'}</span>
                  <small> / month</small>
                </div>
              )}
            </div>
            <p>For high-velocity platforms, multi-domain brands, and agencies.</p>

            <ul>
              <li><strong>SEO Audit:</strong> Up to 500 pages / scan & 6 rescans</li>
              <li><strong>10 Auto-fixes</strong> per day (1-click code remedies)</li>
              <li><strong>Continuous Automatic Audit Reports</strong></li>
              <li><strong>Real-time Prompt & Keyword Recs</strong> (15 tracked)</li>
              <li><strong>4 AI Prompt Agents</strong> + custom queries</li>
              <li><strong>100 Autonomous SEO Blogs / mo</strong></li>
              <li><strong>Unlimited AI Image Generations</strong> (Media Studio 8K)</li>
              <li><strong>Unlimited Multi-Channel Social Auto-Scheduling</strong></li>
            </ul>

            <button
              onClick={() => handleSelectPlan('scale')}
              disabled={loadingTier === 'scale'}
              className="btn btn-ghost btn-block"
              style={{ marginTop: 'auto' }}
            >
              {loadingTier === 'scale'
                ? 'Preparing checkout...'
                : isDiscountActive
                ? 'Unlock Scale Tier Free (₹0) →'
                : 'Choose Scale (₹40,000)'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Need enterprise custom domain limits or agency multi-seats?{' '}
            <a href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'underline' }}>
              Book an Executive Demo →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
