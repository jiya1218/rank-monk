'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { PLAN_CONFIG, type PlanTier } from '@/types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PricingModal({ isOpen, onClose, onSuccess }: PricingModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // 99.99% Discount Promo States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      const rawUser = localStorage.getItem('rankmonk_user') || localStorage.getItem('rankmonk_active_user_v3');
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      }
    } catch (e) {}

    // Ensure Razorpay script is loaded
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen || !mounted) return null;

  const handleApplyCoupon = (manualCode?: string) => {
    const code = (manualCode || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (code === 'RANKMONK001') {
      setAppliedCoupon('RANKMONK001');
      setIsDiscountActive(true);
      setCouponError('');
      setCouponInput('RANKMONK001');
    } else {
      setCouponError('Invalid coupon code. Try RANKMONK001 for ₹10 testing.');
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
              onClose();
              if (onSuccess) {
                onSuccess();
              } else {
                router.push('/dashboard');
              }
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
        // Fallback simulation
        if (user) {
          user.paid = true;
          user.plan = tier;
          localStorage.setItem('rankmonk_user', JSON.stringify(user));
          localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(user));
        }
        alert(`✓ Test Payment Activated (₹${orderData.amountINR})!\n\nAccount upgraded to ${PLAN_CONFIG[tier].name} Plan.`);
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      alert((err as Error).message || 'Checkout failed');
    } finally {
      setLoadingTier(null);
    }
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(30, 18, 12, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: '#fffcf7',
          border: '1px solid #e4d6c6',
          borderRadius: '24px',
          maxWidth: '1040px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          margin: 'auto',
          padding: '32px 28px',
          position: 'relative',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          color: '#2b1b12'
        }}
      >
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#f1e8dc',
            border: '1px solid #e4d6c6',
            color: '#2b1b12',
            fontWeight: 800,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            zIndex: 10
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#f1e8dc',
              border: '1px solid #d8c09e',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              color: '#c5a059',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ✦
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.75rem', fontWeight: 800, color: '#2b1b12', margin: '0 0 6px' }}>
            Subscribe to Access Rank Monk Console
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#6f5a4c', maxWidth: '480px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            Choose a plan to unlock autonomous technical site audits, brand identity extraction, AI blog generation, and multi-LLM citation calibration.
          </p>

          {/* Billing Cycle Toggle */}
          <div style={{ display: 'inline-flex', gap: '6px', padding: '4px', backgroundColor: '#f1e8dc', borderRadius: '12px', border: '1px solid #e4d6c6' }}>
            <button
              onClick={() => setCycle('monthly')}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: cycle === 'monthly' ? '#2b1b12' : 'transparent',
                color: cycle === 'monthly' ? '#fffcf7' : '#6f5a4c',
                transition: 'all 0.2s ease'
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setCycle('annual')}
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: cycle === 'annual' ? '#2b1b12' : 'transparent',
                color: cycle === 'annual' ? '#fffcf7' : '#6f5a4c',
                transition: 'all 0.2s ease'
              }}
            >
              Annual (20% OFF)
            </button>
          </div>
        </div>

        {/* Promo Coupon Code Bar */}
        <div style={{ maxWidth: '440px', margin: '0 auto 24px' }}>
          {isDiscountActive ? (
            <div style={{ padding: '12px 16px', backgroundColor: '#eef7ec', border: '1px solid #84e1bc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                <div>
                  <span style={{ fontWeight: 800, color: '#03543f', textTransform: 'uppercase', display: 'block', fontSize: '10.5px' }}>
                    Coupon RANKMONK001 Active!
                  </span>
                  <span style={{ color: '#2b1b12', fontSize: '11px' }}>
                    99.99% Discount — Pay only <strong style={{ color: '#03543f' }}>₹10</strong> for testing!
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                style={{ fontSize: '11px', color: '#7a5242', textDecoration: 'underline', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{ padding: '12px 16px', backgroundColor: '#f8f3ec', border: '1px solid #e4d6c6', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. RANKMONK001)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', backgroundColor: '#fffcf7', border: '1px solid #e4d6c6', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.78rem', color: '#2b1b12', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  style={{ padding: '8px 16px', backgroundColor: '#2b1b12', color: '#fffcf7', fontWeight: 700, borderRadius: '10px', fontSize: '0.78rem', border: 'none', cursor: 'pointer' }}
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>{couponError}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6f5a4c', paddingTop: '6px', borderTop: '1px solid #e4d6c6' }}>
                <span>Testing gateway with ₹10?</span>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon('RANKMONK001')}
                  style={{ fontWeight: 800, color: '#7a5242', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ⚡ Apply RANKMONK001 (₹10 Test)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3 Complete Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', alignItems: 'stretch' }}>
          {/* 1. Seed Plan */}
          <div
            style={{
              backgroundColor: '#fffcf7',
              border: '1px solid #e4d6c6',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(43, 27, 18, 0.05)'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '11px', color: '#2b1b12', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Seed Plan</div>
              <div style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.65rem', fontWeight: 800, color: '#2b1b12', margin: '4px 0 8px' }}>
                {isDiscountActive ? (
                  <span>
                    <span style={{ textDecoration: 'line-through', fontSize: '11px', color: '#6f5a4c', marginRight: '6px' }}>
                      {cycle === 'annual' ? '₹8,000' : '₹10,000'}
                    </span>
                    <strong style={{ color: '#03543f', fontSize: '1.65rem' }}>₹10</strong>
                    <small style={{ color: '#03543f', fontSize: '10px', fontWeight: 700 }}> (99.99% OFF)</small>
                  </span>
                ) : (
                  <span>
                    {cycle === 'annual' ? '₹8,000' : '₹10,000'}
                    <small style={{ fontSize: '11px', fontWeight: 'normal', color: '#6f5a4c' }}> / month</small>
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11.5px', color: '#6f5a4c', marginBottom: '14px', lineHeight: 1.4 }}>Ideal for solo creators and founders getting started.</p>

              {/* Exact Features for Seed */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', borderTop: '1px solid #e4d6c6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11.5px', color: '#6f5a4c' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>SEO Audit:</strong> Up to 200 pages / scan & 2 rescans</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>5 Auto-fixes</strong> per day (1-click code remedies)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>Automatic Audit Report</strong> (Instant PDF & Web)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>Real-time Prompt & Keyword Recs</strong> (5 tracked)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>4 AI Prompt Agents</strong> (AEO / GEO Radar)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>8 Autonomous SEO Blogs / mo</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>15 AI Image Generations / mo</strong> (Media Studio)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>Social Media Auto-Scheduling</strong> (30 posts / mo)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('seed')}
              disabled={loadingTier === 'seed'}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid #2b1b12',
                color: '#2b1b12',
                backgroundColor: 'transparent',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                marginTop: 'auto'
              }}
            >
              {loadingTier === 'seed'
                ? 'Processing...'
                : isDiscountActive
                ? 'Pay ₹10 to Unlock Seed Tier →'
                : 'Choose Seed (₹10,000)'}
            </button>
          </div>

          {/* 2. Grow Plan (Featured - Most Chosen) */}
          <div
            style={{
              backgroundColor: '#3b2519',
              color: '#fbf6ef',
              border: '2px solid #c5a059',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 16px 36px -10px rgba(59, 37, 25, 0.45)',
              position: 'relative'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-11px',
                left: '20px',
                backgroundColor: '#c5a059',
                color: '#1b120c',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '99px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
              }}
            >
              Most Chosen
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '11px', color: '#c5a059', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Grow Plan</div>
              <div style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.65rem', fontWeight: 800, color: '#fbf6ef', margin: '4px 0 8px' }}>
                {isDiscountActive ? (
                  <span>
                    <span style={{ textDecoration: 'line-through', fontSize: '11px', color: '#d7c4b2', marginRight: '6px' }}>
                      {cycle === 'annual' ? '₹16,000' : '₹20,000'}
                    </span>
                    <strong style={{ color: '#84e1bc', fontSize: '1.65rem' }}>₹10</strong>
                    <small style={{ color: '#84e1bc', fontSize: '10px', fontWeight: 700 }}> (99.99% OFF)</small>
                  </span>
                ) : (
                  <span>
                    {cycle === 'annual' ? '₹16,000' : '₹20,000'}
                    <small style={{ fontSize: '11px', fontWeight: 'normal', color: '#d7c4b2' }}> / month</small>
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11.5px', color: '#d7c4b2', marginBottom: '14px', lineHeight: 1.4 }}>Designed for fast-growing brands needing deeper AI velocity.</p>

              {/* Exact Features for Grow */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', borderTop: '1px solid #54392b', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11.5px', color: '#d7c4b2' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>SEO Audit:</strong> Up to 300 pages / scan & 4 rescans</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>7 Auto-fixes</strong> per day (1-click code remedies)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>Automatic Audit Reports</strong> (Weekly executive insights)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>Real-time Prompt & Keyword Recs</strong> (10 tracked)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>4 AI Prompt Agents</strong> across 4 LLMs</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>30 Autonomous SEO Blogs / mo</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>50 AI Image Generations / mo</strong> (Media Studio 8K)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#84e1bc', fontWeight: 800 }}>✓</span>
                  <span><strong>Unlimited Multi-Channel Social Auto-Scheduling</strong></span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('grow')}
              disabled={loadingTier === 'grow'}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                border: 'none',
                color: '#1b120c',
                backgroundColor: '#c5a059',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 4px 12px rgba(197, 160, 89, 0.3)',
                marginTop: 'auto'
              }}
            >
              {loadingTier === 'grow'
                ? 'Processing...'
                : isDiscountActive
                ? 'Pay ₹10 to Unlock Grow Tier →'
                : 'Choose Grow (₹20,000) →'}
            </button>
          </div>

          {/* 3. Scale Plan */}
          <div
            style={{
              backgroundColor: '#fffcf7',
              border: '1px solid #e4d6c6',
              borderRadius: '18px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(43, 27, 18, 0.05)'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '11px', color: '#2b1b12', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scale Plan</div>
              <div style={{ fontFamily: 'var(--font-heading, serif)', fontSize: '1.65rem', fontWeight: 800, color: '#2b1b12', margin: '4px 0 8px' }}>
                {isDiscountActive ? (
                  <span>
                    <span style={{ textDecoration: 'line-through', fontSize: '11px', color: '#6f5a4c', marginRight: '6px' }}>
                      {cycle === 'annual' ? '₹32,000' : '₹40,000'}
                    </span>
                    <strong style={{ color: '#03543f', fontSize: '1.65rem' }}>₹10</strong>
                    <small style={{ color: '#03543f', fontSize: '10px', fontWeight: 700 }}> (99.99% OFF)</small>
                  </span>
                ) : (
                  <span>
                    {cycle === 'annual' ? '₹32,000' : '₹40,000'}
                    <small style={{ fontSize: '11px', fontWeight: 'normal', color: '#6f5a4c' }}> / month</small>
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11.5px', color: '#6f5a4c', marginBottom: '14px', lineHeight: 1.4 }}>Built for power creators and high-volume operators.</p>

              {/* Exact Features for Scale */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', borderTop: '1px solid #e4d6c6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11.5px', color: '#6f5a4c' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>SEO Audit:</strong> Up to 500 pages / scan & 6 rescans</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>10 Auto-fixes</strong> per day (1-click code remedies)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>Continuous Automatic Audit Reports</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>Real-time Prompt & Keyword Recs</strong> (15 tracked)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>4 AI Prompt Agents</strong> + custom queries</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>100 Autonomous SEO Blogs / mo</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>Unlimited AI Image Generations</strong> (Media Studio 8K)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#5d7a4f', fontWeight: 800 }}>✓</span>
                  <span><strong>Unlimited Multi-Channel Social Auto-Scheduling</strong></span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('scale')}
              disabled={loadingTier === 'scale'}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid #2b1b12',
                color: '#2b1b12',
                backgroundColor: 'transparent',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                marginTop: 'auto'
              }}
            >
              {loadingTier === 'scale'
                ? 'Processing...'
                : isDiscountActive
                ? 'Pay ₹10 to Unlock Scale Tier →'
                : 'Choose Scale (₹40,000)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
