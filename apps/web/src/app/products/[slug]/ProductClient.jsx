'use client';

import React, { useState, useMemo } from 'react';

export default function ProductClient({ initialProduct, initialEmiPlans }) {
  const [product] = useState(initialProduct);
  const [emiPlans] = useState(initialEmiPlans);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);

  const selectedVariant = product.variants[selectedVariantIdx];
  const price = selectedVariant?.price || product.price;

  const currentMainImage = product.images[mainImageIdx];

  const calculatedPlans = useMemo(() => {
    return emiPlans.map(plan => {
      let monthlyAmount = 0;
      const principal = price - (plan.downPayment || 0);
      
      if (plan.interestRate === 0) {
        monthlyAmount = Math.round(principal / plan.tenureMonths);
      } else {
        // Standard EMI calculation formula
        const r = plan.interestRate / (12 * 100); // monthly interest rate
        const n = plan.tenureMonths;
        monthlyAmount = Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      }
      return { ...plan, monthlyAmount };
    });
  }, [emiPlans, price]);

  const selectedPlan = calculatedPlans[selectedPlanIdx];

  const handleCheckout = () => {
    window.location.href = `/checkout?product=${product.slug}&plan=${selectedPlan.tenureMonths}`;
  };

  return (
    <div className="space-y-12 lg:space-y-16">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Live preview • EMI-ready
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl lg:text-[58px]">
                {product.name}
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-200/90">
                {product.description}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm text-slate-200 shadow-inner sm:px-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Effective price</p>
            <div className="mt-2 flex items-baseline justify-end gap-2">
              <span className="text-3xl font-semibold text-white sm:text-[34px]">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {product.mrp && (
                <span className="text-sm text-slate-500 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[12px] text-emerald-200">
              From ₹{Math.round(price / 12).toLocaleString('en-IN')}/mo on 1Fi EMI
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-start">
        {/* Left: Gallery & Variants */}
        <div className="space-y-6 lg:space-y-8">
          <div className="grid gap-5 lg:grid-cols-[100px,minmax(0,1fr)] lg:items-start">
            {/* Thumbnails */}
            <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMainImageIdx(idx)}
                  className={`group flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:border-cyan-300/60 hover:bg-white/10 ${
                    mainImageIdx === idx ? 'ring-2 ring-cyan-300/80' : ''
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} angle ${idx + 1}`}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="order-1 overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:order-2 lg:p-8">
              <div className="relative flex h-[420px] items-center justify-center sm:h-[520px]">
                <div className="absolute inset-12 rounded-[2rem] bg-[radial-gradient(circle_at_28%_20%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_72%_18%,rgba(52,211,153,0.32),transparent_40%)] blur-2xl" />
                <img
                  src={currentMainImage}
                  alt={product.name}
                  className="relative z-[1] max-h-full max-w-full object-contain drop-shadow-[0_26px_70px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-[1.05]"
                />
              </div>
            </div>
          </div>

          {/* Variant selector */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Variant</p>
                <p className="mt-1 text-[15px] text-slate-200/90">
                  {selectedVariant?.storage} • {selectedVariant?.color}
                </p>
              </div>
              <div className="sm:min-w-[240px]">
                <label className="sr-only" htmlFor="variant">
                  Choose variant
                </label>
                <select
                  id="variant"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-3 py-2.5 text-sm text-white shadow-inner outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
                  value={selectedVariantIdx}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    setSelectedVariantIdx(idx);
                    if (product.variants[idx].imageIndex !== undefined) {
                      setMainImageIdx(product.variants[idx].imageIndex);
                    }
                  }}
                >
                  {product.variants.map((v, i) => (
                    <option key={i} value={i} className="text-slate-900">
                      {v.storage} — {v.color}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {product.variants.map((v, i) => {
                const isActive = selectedVariantIdx === i;
                return (
                  <button
                    key={`${v.storage}-${v.color}-${i}`}
                    type="button"
                    onClick={() => {
                      setSelectedVariantIdx(i);
                      if (v.imageIndex !== undefined) {
                        setMainImageIdx(v.imageIndex);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.35)]'
                        : 'border-white/15 bg-white/5 text-slate-200 hover:border-cyan-300/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="inline-flex h-3 w-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-400" />
                    <span>
                      {v.storage} · {v.color}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Pricing & EMI Panel */}
        <div className="space-y-6 lg:space-y-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-400/20 via-emerald-400/15 to-indigo-400/20 px-5 py-5 text-slate-50 shadow-[0_20px_70px_rgba(34,211,238,0.35)] sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-50/80">
              Instant credit eligibility
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-100">
              Get pre-approved 1Fi limit in minutes with digital KYC. No paperwork, fully transparent charges.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Device total
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[28px] font-semibold text-white">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp && (
                    <span className="text-sm text-slate-500 line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-slate-100">
                {selectedVariant?.storage} • {selectedVariant?.color}
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-[13px] text-slate-200 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-xs text-emerald-100">
                  ₹
                </span>
                <p>
                  Downpayment from{' '}
                  <span className="font-semibold text-white">
                    ₹{(selectedPlan?.downPayment || 0).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/20 text-xs text-slate-100">
                  ⏱
                </span>
                <p>
                  Tenure up to{' '}
                  <span className="font-semibold text-white">
                    {selectedPlan?.tenureMonths} months
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                Choose EMI plan
              </p>
              <p className="text-[12px] text-slate-300">
                From ₹{selectedPlan?.monthlyAmount.toLocaleString('en-IN')}/mo
              </p>
            </div>

            <div className="space-y-3">
              {calculatedPlans.map((plan, idx) => {
                const isSelected = selectedPlanIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPlanIdx(idx)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm transition-all duration-200 sm:px-4 sm:py-4 ${
                      isSelected
                        ? 'border-cyan-300 bg-cyan-300/10 shadow-[0_20px_60px_rgba(34,211,238,0.3)]'
                        : 'border-white/12 bg-white/5 hover:border-cyan-200/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected ? 'border-cyan-300 bg-cyan-300' : 'border-slate-400/50 bg-transparent'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                      </span>
                      <div>
                        <p className="text-[15px] font-semibold text-white">{plan.tenureMonths} months</p>
                        <p className="mt-0.5 text-[12px] text-slate-300">
                          ₹{plan.monthlyAmount.toLocaleString('en-IN')}/mo
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {plan.interestRate === 0 ? (
                        <span className="rounded-full bg-emerald-300/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100">
                          0% interest
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-100">
                          {plan.interestRate}% p.a.
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Total ₹
                        {(plan.monthlyAmount * plan.tenureMonths).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={handleCheckout}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_22px_70px_rgba(52,211,153,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_90px_rgba(52,211,153,0.72)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-0"
              >
                <span>Buy now with 1Fi EMI</span>
                {selectedPlan?.tenureMonths && (
                  <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-900">
                    {selectedPlan.tenureMonths} months
                  </span>
                )}
              </button>
              <p className="text-[11px] text-slate-400">
                Transparent breakup before you confirm. No hidden fees, ever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}