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
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:space-y-16 lg:px-0 lg:py-14">
      <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600">
            1Fi Device Store
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {product.name}
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-500 sm:text-lg">
            {product.description}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 text-right sm:items-end">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
            Effective price
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900 sm:text-[32px]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {product.mrp && (
              <span className="text-base text-slate-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-[13px] text-emerald-700">
            From ₹{Math.round(price / 12).toLocaleString('en-IN')}/mo on 1Fi EMI
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        {/* Left: Gallery & Variants */}
        <div className="space-y-6 lg:space-y-7">
          <div className="grid gap-5 lg:grid-cols-[96px,minmax(0,1fr)] lg:items-start">
            {/* Thumbnails */}
            <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMainImageIdx(idx)}
                  className={`group flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 transition-all duration-200 hover:border-emerald-300 hover:bg-slate-100 lg:h-24 lg:w-24 ${
                    mainImageIdx === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-200'
                      : 'border-slate-200/80'
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
            <div className="order-1 overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-5 shadow-[0_32px_90px_rgba(15,23,42,0.85)] lg:order-2 lg:p-8">
              <div className="relative flex h-[420px] items-center justify-center sm:h-[520px]">
                <div className="absolute inset-10 rounded-[2.4rem] bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.55),_transparent_60%)] blur-xl" />
                <img
                  src={currentMainImage}
                  alt={product.name}
                  className="relative z-[1] max-h-full max-w-full object-contain drop-shadow-[0_18px_35px_rgba(15,23,42,0.30)] transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>

          {/* Variant selector */}
          <div className="space-y-3 rounded-2xl bg-white/80 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100/70 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Variant
                </p>
                <p className="mt-1 text-[15px] text-slate-600">
                  {selectedVariant?.storage} • {selectedVariant?.color}
                </p>
              </div>
              <div className="sm:min-w-[220px]">
                <label className="sr-only" htmlFor="variant">
                  Choose variant
                </label>
                <select
                  id="variant"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                    <option key={i} value={i}>
                      {v.storage} — {v.color}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Variant pills for quick color switching */}
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
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="inline-flex h-3 w-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-500" />
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
        <div className="space-y-7">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-slate-50 shadow-[0_20px_60px_rgba(16,185,129,0.55)] sm:px-5 sm:py-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-emerald-100/80">
              Instant credit eligibility
            </p>
            <p className="mt-2 text-[15px] font-medium text-emerald-50">
              Get pre-approved 1Fi limit in minutes with fully digital KYC.
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 sm:p-5">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Total device price
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[26px] font-semibold text-slate-900">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-[12px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                {selectedVariant?.storage} • {selectedVariant?.color}
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50/80 px-3 py-3 text-[13px] text-slate-500 sm:grid-cols-2 sm:px-4 sm:py-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                  ₹
                </span>
                <p>
                  Downpayment as low as{' '}
                  <span className="font-semibold text-slate-800">
                    ₹{(selectedPlan?.downPayment || 0).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-700">
                  ⏱
                </span>
                <p>
                  Tenure up to{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedPlan?.tenureMonths} months
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Choose EMI plan
              </p>
              <p className="text-[12px] text-slate-500">
                Monthly from{' '}
                <span className="font-semibold text-slate-800">
                  ₹{selectedPlan?.monthlyAmount.toLocaleString('en-IN')}/mo
                </span>
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
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition-all duration-200 sm:px-4 sm:py-3.5 ${
                      isSelected
                        ? 'border-2 border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-200 shadow-[0_16px_45px_rgba(16,185,129,0.35)]'
                        : 'border border-slate-200 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.04)] hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      <div>
                        <p className="text-[15px] font-medium text-slate-900">
                          {plan.tenureMonths} months
                        </p>
                        <p className="mt-0.5 text-[12px] text-slate-500">
                          ₹{plan.monthlyAmount.toLocaleString('en-IN')}/mo
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {plan.interestRate === 0 ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          0% interest
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                          {plan.interestRate}% p.a.
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Total ₹
                        {(plan.monthlyAmount * plan.tenureMonths).toLocaleString(
                          'en-IN'
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckout}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 text-sm font-semibold text-white shadow-[0_20px_55px_rgba(16,185,129,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_80px_rgba(16,185,129,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            >
              <span>Buy now with 1Fi EMI</span>
              {selectedPlan?.tenureMonths && (
                <span className="rounded-full bg-emerald-500/80 px-3 py-1 text-[11px] font-medium">
                  {selectedPlan.tenureMonths} months
                </span>
              )}
            </button>
            <p className="text-[11px] text-slate-500">
              No hidden charges. Exact EMI and charges shown on the next step
              before you confirm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}