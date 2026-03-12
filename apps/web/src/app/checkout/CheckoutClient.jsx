'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Lock, ShieldCheck } from 'lucide-react';

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function CheckoutClient({ product, plan }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedVariant = product.variants?.[selectedVariantIdx] || product.variants?.[0] || null;
  const price = selectedVariant?.price || product.price || 0;
  const imageIndex = typeof selectedVariant?.imageIndex === 'number' ? selectedVariant.imageIndex : 0;
  const selectedImage = product.images?.[imageIndex] || product.images?.[0] || '/placeholder.png';

  // Group variants by color for the cleaner UI
  const groupedVariants = useMemo(() => {
    if (!product?.variants) return [];
    const groups = [];
    product.variants.forEach((variant, index) => {
      let group = groups.find((g) => g.color === variant.color);
      if (!group) {
        group = { color: variant.color, variants: [] };
        groups.push(group);
      }
      group.variants.push({ ...variant, index });
    });
    return groups;
  }, [product?.variants]);

  const computed = useMemo(() => {
    const downPayment = Number(plan.downPayment || 0);
    const principal = price - downPayment;
    let monthlyAmount = 0;

    if (plan.interestRate === 0) {
      monthlyAmount = Math.round(principal / plan.tenureMonths);
    } else {
      const monthlyRate = plan.interestRate / (12 * 100);
      const tenure = plan.tenureMonths;
      monthlyAmount = Math.round(
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
          (Math.pow(1 + monthlyRate, tenure) - 1)
      );
    }

    return {
      downPayment,
      principal,
      monthlyAmount,
      totalPayable: downPayment + monthlyAmount * plan.tenureMonths,
    };
  }, [plan, price]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/preorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: product.slug,
          planTenure: plan.tenureMonths,
          variantSku: selectedVariant?.sku || '',
          email,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- SUCCESS STATE ---
  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10 sm:px-6 bg-[#fafafa]">
        <div className="w-full rounded-[2.5rem] bg-white p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-[8px] ring-emerald-50/50 mb-8">
            <CheckCircle2 className="h-12 w-12" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Order confirmed</h1>
          <p className="mt-4 text-base font-medium text-slate-500">
            Your secure payment link has been sent to <span className="font-bold text-slate-900">{email}</span>.
          </p>

          <div className="mt-10 mx-auto max-w-md rounded-[1.5rem] bg-[#f8f9fa] p-8 text-left ring-1 ring-slate-100">
            <p className="text-xl font-bold text-slate-900">{product.name}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{selectedVariant?.color} · {selectedVariant?.storage}</p>
            <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-6 text-sm">
              <span className="font-bold text-slate-500">Monthly EMI</span>
              <span className="text-xl font-black text-emerald-600">{formatCurrency(computed.monthlyAmount)}<span className="text-sm font-bold text-slate-400">/mo</span></span>
            </div>
          </div>

          <Link
            href="/"
            className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-slate-900 px-10 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-500 hover:shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:-translate-y-0.5"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER AREA */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link
              href={`/products/${product.slug}`}
              className="group inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-500 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to {product.name}
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900">
              Complete your order
            </h1>
            <p className="mt-3 text-base font-medium text-slate-500">
              Review your selection and enter your details to generate your EMI link.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 ring-1 ring-emerald-100/50">
            <ShieldCheck className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Secure Checkout</span>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          
          {/* LEFT COLUMN: Product Configuration */}
          <section className="space-y-10">
            
            {/* Product Preview Bar */}
            <div className="flex items-center gap-6 rounded-[1.5rem] bg-white p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/60">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-[#f8f9fa] p-2 border border-slate-100">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="112px"
                  className="object-contain p-2 mix-blend-multiply drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xl font-extrabold text-slate-900 tracking-tight">{product.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{selectedVariant?.color} · {selectedVariant?.storage}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tighter text-slate-900">{formatCurrency(price)}</span>
                  {product.mrp && product.mrp !== price ? (
                    <span className="text-sm font-bold text-slate-400 line-through">{formatCurrency(product.mrp)}</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* GROUPED VARIANT SELECTOR */}
            {product.variants?.length > 1 ? (
              <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] ring-1 ring-slate-100">
                <label className="mb-6 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Choose Finish & Storage</label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {groupedVariants.map((group) => {
                    const isActiveGroup = group.variants.some((v) => v.index === selectedVariantIdx);
                    const activeVariantInGroup = isActiveGroup 
                      ? group.variants.find((v) => v.index === selectedVariantIdx) 
                      : group.variants[0];

                    return (
                      <div
                        key={group.color}
                        onClick={() => {
                          if (!isActiveGroup) setSelectedVariantIdx(group.variants[0].index);
                        }}
                        className={`relative flex flex-col justify-between p-5 rounded-[1.5rem] text-left transition-all duration-300 border-2 overflow-hidden cursor-pointer ${
                          isActiveGroup
                            ? 'border-slate-900 bg-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.2)] scale-[1.02] z-10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                        }`}
                      >
                        {isActiveGroup && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
                        
                        <div className="flex justify-between w-full items-start mb-2">
                          <p className={`text-base font-bold ${isActiveGroup ? 'text-white' : 'text-slate-900'}`}>
                            {group.color}
                          </p>
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${isActiveGroup ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />
                          </div>
                        </div>

                        <p className={`text-2xl font-black tracking-tight ${isActiveGroup ? 'text-emerald-400' : 'text-slate-900'}`}>
                          {formatCurrency(activeVariantInGroup.price)}
                        </p>

                        {/* Inline Storage Toggles */}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {group.variants.map((v) => {
                            const isStorageActive = selectedVariantIdx === v.index;
                            return (
                              <button
                                key={v.index}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedVariantIdx(v.index);
                                }}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 uppercase tracking-wide ${
                                  isStorageActive
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : isActiveGroup
                                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                              >
                                {v.storage}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </section>

          {/* RIGHT COLUMN: Summary & Action Form (Light Theme) */}
          <aside className="lg:sticky lg:top-12">
            <div className="rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-[0_16px_50px_rgba(15,23,42,0.05)] ring-1 ring-slate-100">
              
              {/* Payment Summary */}
              <div className="border-b border-slate-100 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Due Today</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 ring-1 ring-emerald-200/50">
                    {plan.tenureMonths}m plan
                  </span>
                </div>
                
                <p className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-900">{formatCurrency(computed.downPayment)}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">Pay now to lock in your device</p>
              </div>

              {/* Receipt Breakdown */}
              <div className="space-y-4 py-8 text-sm font-semibold text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Device Price</span>
                  <span className="font-bold text-slate-900">{formatCurrency(price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>EMI Tenure</span>
                  <span className="font-bold text-slate-900">{plan.tenureMonths} months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Interest Rate</span>
                  <span className="font-bold text-emerald-600">
                    {plan.interestRate === 0 ? '0% APR (No Cost)' : `${plan.interestRate}% APR`}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-2">
                  <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-900">Monthly EMI</span>
                  <span className="text-2xl font-black tracking-tight text-emerald-600">{formatCurrency(computed.monthlyAmount)}<span className="text-sm font-bold text-slate-400">/mo</span></span>
                </div>
              </div>

              {/* Email Form & Submit */}
              <form onSubmit={handleSubmit} className="space-y-6 border-t border-slate-100 pt-8">
                <div>
                  <label htmlFor="email" className="mb-3 block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-[1.25rem] border border-slate-200 bg-[#f8f9fa] px-5 py-4 text-base font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <p className="mt-3 text-xs font-medium text-slate-400 ml-1">We&apos;ll send your secure payment link here.</p>
                </div>

                {error ? (
                  <div className="rounded-[1rem] bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 ring-1 ring-rose-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative flex w-full h-16 items-center justify-center gap-3 rounded-[1.25rem] bg-slate-900 px-6 text-lg font-bold text-white transition-all duration-300 hover:bg-emerald-500 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />
                      Processing Securely...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" strokeWidth={2.5} />
                      Confirm & pay {formatCurrency(computed.downPayment)}
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] leading-relaxed text-slate-400 font-medium px-2">
                  By confirming, you agree to the repayment schedule of {formatCurrency(computed.monthlyAmount)}/month for {plan.tenureMonths} months.
                </p>
              </form>

            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}