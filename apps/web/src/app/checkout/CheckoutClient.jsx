'use client';

import React, { useState, useMemo } from 'react';

export default function CheckoutClient({ product, plan }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedVariant = product.variants[selectedVariantIdx];
  const price = selectedVariant?.price || product.price;

  const computed = useMemo(() => {
    const downPayment = plan.downPayment || 0;
    const principal = price - downPayment;
    let monthlyAmount;
    if (plan.interestRate === 0) {
      monthlyAmount = Math.round(principal / plan.tenureMonths);
    } else {
      const r = plan.interestRate / (12 * 100);
      const n = plan.tenureMonths;
      monthlyAmount = Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }
    return { monthlyAmount, downPayment, principal };
  }, [plan, price]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/preorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: product.slug,
          planTenure: plan.tenureMonths,
          variantSku: selectedVariant?.sku || '',
          email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-3xl shadow-[0_20px_60px_rgba(52,211,153,0.55)]">
          🎉
        </div>
        <h2 className="mt-5 font-display text-3xl font-semibold text-white">Pre-order confirmed</h2>
        <p className="mt-2 text-sm text-slate-300">
          We sent a confirmation to <span className="font-semibold text-white">{email}</span>. Your device is locked in.
        </p>

        <div className="mt-6 inline-flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-left shadow-inner">
          <p className="font-semibold text-white">{product.name}</p>
          <p className="text-sm text-slate-300">{selectedVariant?.storage} · {selectedVariant?.color}</p>
          <p className="text-sm text-slate-300">
            {plan.tenureMonths} months × ₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo
          </p>
        </div>

        <div className="mt-6">
          <a href="/" className="text-sm font-semibold text-cyan-100 underline decoration-cyan-300/60 underline-offset-4 transition hover:text-white">
            Continue shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)] lg:items-start">
      {/* Left: Order Summary */}
      <div className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-white">Order summary</h2>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
            {plan.tenureMonths}m plan
          </span>
        </div>

        <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-slate-900/60">
            <img
              src={product.images[selectedVariant?.imageIndex || 0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{product.name}</h3>
            <p className="text-sm text-slate-300 mt-1">{selectedVariant?.storage} · {selectedVariant?.color}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-semibold text-white">₹{price.toLocaleString('en-IN')}</span>
              {product.mrp && product.mrp !== price && (
                <span className="text-sm text-slate-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        </div>

        {product.variants.length > 1 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 mb-2">Select variant</label>
            <select
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2.5 text-sm text-white shadow-inner outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
              value={selectedVariantIdx}
              onChange={(e) => setSelectedVariantIdx(parseInt(e.target.value))}
            >
              {product.variants.map((v, i) => (
                <option key={i} value={i} className="text-slate-900">
                  {v.storage} - {v.color} (₹{v.price.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200 shadow-inner">
          <div className="flex justify-between">
            <span>Product price</span>
            <span className="font-semibold text-white">₹{price.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span>Down payment</span>
            <span className="font-semibold text-white">₹{computed.downPayment}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span>EMI tenure</span>
            <span className="font-semibold text-white">{plan.tenureMonths} months</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span>Interest rate</span>
            <span className="font-semibold text-white">
              {plan.interestRate === 0 ? '0% (no-cost)' : `${plan.interestRate}% p.a.`}
            </span>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
            <span>Monthly EMI</span>
            <span>₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo</span>
          </div>
        </div>
      </div>

      {/* Right: Email & Confirm */}
      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-7 lg:p-8">
        <h2 className="font-display text-2xl font-semibold text-white">Confirm & pay</h2>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-400/15 via-emerald-400/12 to-indigo-400/15 px-4 py-4 text-slate-100 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-200">Pay now</p>
              <p className="text-3xl font-semibold text-white">₹{computed.downPayment}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-200">Then</p>
              <p className="text-lg font-semibold text-white">₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo</p>
              <p className="text-xs text-slate-200">× {plan.tenureMonths} months</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-3 text-sm text-white shadow-inner outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
            />
            <p className="mt-1 text-xs text-slate-400">We’ll send your confirmation and payment link here.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300 px-5 py-3 text-base font-semibold text-slate-950 shadow-[0_22px_70px_rgba(52,211,153,0.6)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(52,211,153,0.72)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Processing…' : `Confirm & pay ₹${computed.downPayment}`}
          </button>

          <p className="text-center text-xs text-slate-400">
            By confirming, you accept the EMI schedule of ₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo for {plan.tenureMonths} months.
          </p>
        </form>
      </div>
    </div>
  );
}
