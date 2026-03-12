'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.6, bounce: 0.4 } },
};

export default function CheckoutClient({ product, plan }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedVariant = product.variants[selectedVariantIdx] || product.variants[0];
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
        // Add an artificial slight delay to show off the beautiful loading state
        setTimeout(() => setSuccess(true), 800); 
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      if (!res?.ok) setSubmitting(false);
    }
  };

  // --- ANIMATED SUCCESS STATE ---
  if (success) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6 bg-[#fafafa]">
        <motion.div 
          variants={successVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-lg rounded-[2.5rem] border border-slate-100 bg-white p-10 sm:p-14 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-500 mb-8 ring-1 ring-emerald-100/50"
          >
            <CheckCircle2 className="h-12 w-12" strokeWidth={2.5} />
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">Order Confirmed</h2>
          <p className="mt-4 text-base font-medium text-slate-500">
            We sent your receipt and next steps to <span className="font-bold text-slate-900">{email}</span>. 
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col gap-2 rounded-[1.5rem] border border-slate-100 bg-[#f8f9fa] px-8 py-6 text-left"
          >
            <p className="font-extrabold text-slate-900 text-lg">{product.name}</p>
            <p className="text-sm font-semibold text-slate-500">{selectedVariant?.storage} · {selectedVariant?.color}</p>
            <div className="h-px w-full bg-slate-200/60 my-3" />
            <p className="text-sm font-bold text-slate-900 flex justify-between">
              <span>{plan.tenureMonths} monthly payments</span>
              <span className="text-emerald-600">₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10"
          >
            <Link href="/" className="inline-flex h-14 items-center justify-center rounded-full bg-slate-900 px-10 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:-translate-y-0.5">
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // --- ANIMATED PREMIUM CHECKOUT ---
  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-4 sm:px-6 lg:px-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-[70rem]"
      >
        
        {/* HEADER SECTION */}
        <motion.div variants={itemVariants} className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link href={`/products/${product.slug}`} className="group inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-500 mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to {product.name}
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900">
              Confirm your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">1Fi order</span>
            </h1>
            <p className="mt-3 text-base font-medium text-slate-500">
              Transparent pricing, beautiful UI, and instant EMI confirmation.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 ring-1 ring-emerald-100/50">
            <ShieldCheck className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600">Secure Checkout</span>
          </div>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          
          {/* LEFT: ORDER SUMMARY */}
          <motion.div variants={itemVariants} className="space-y-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
            
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Order summary</h2>
              <span className="rounded-full bg-[#f8f9fa] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 border border-slate-100">
                {plan.tenureMonths}m plan
              </span>
            </div>

            {/* Product Card */}
            <div className="flex gap-6 rounded-[1.5rem] border border-slate-100 bg-[#f8f9fa] p-5 transition-colors hover:bg-slate-50">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1rem] bg-white p-2 shadow-sm border border-slate-100/50">
                <img
                  src={product.images[selectedVariant?.imageIndex || 0] || product.images[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{product.name}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{selectedVariant?.storage} · {selectedVariant?.color}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black tracking-tighter text-slate-900">₹{price.toLocaleString('en-IN')}</span>
                  {product.mrp && product.mrp !== price && (
                    <span className="text-sm font-bold text-slate-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SLEEK VARIANT SELECTOR */}
            {product.variants.length > 1 && (
              <div>
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Select variant
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.variants.map((v, i) => {
                    const isActive = selectedVariantIdx === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedVariantIdx(i)}
                        className={`relative flex flex-col items-start p-4 rounded-[1.25rem] text-left transition-all duration-300 border-2 overflow-hidden ${
                          isActive 
                            ? 'border-emerald-500 bg-emerald-50/30 shadow-sm' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />}
                        <span className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                          {v.storage} · {v.color}
                        </span>
                        <span className={`text-xs font-semibold mt-1.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          ₹{v.price.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Receipt Breakdown */}
            <div className="rounded-[1.5rem] p-2 text-sm font-semibold text-slate-500 space-y-4">
              <div className="flex justify-between items-center">
                <span>Product price</span>
                <span className="font-bold text-slate-900">₹{price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Down payment</span>
                <span className="font-bold text-slate-900">₹{computed.downPayment.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>EMI tenure</span>
                <span className="font-bold text-slate-900">{plan.tenureMonths} months</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Interest rate</span>
                <span className="font-bold text-emerald-600">
                  {plan.interestRate === 0 ? '0% (No-cost)' : `${plan.interestRate}% p.a.`}
                </span>
              </div>
              <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-6 text-base font-bold text-slate-900">
                <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-900">Monthly EMI</span>
                <span className="text-2xl font-black tracking-tighter text-emerald-600">₹{computed.monthlyAmount.toLocaleString('en-IN')}<span className="text-sm font-bold text-slate-400">/mo</span></span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: CONFIRM & PAY */}
          <motion.div variants={itemVariants} className="space-y-8 rounded-[2.5rem] border border-slate-100 bg-white p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 pb-2">Confirm & pay</h2>
            
            {/* The "Glass Ticket" */}
            <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-[#f8f9fa] border border-emerald-100/50 p-6 shadow-inner">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Pay Now</p>
                  <p className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 mt-1">₹{computed.downPayment.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Then</p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">₹{computed.monthlyAmount.toLocaleString('en-IN')}<span className="text-sm font-semibold text-slate-400">/mo</span></p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">× {plan.tenureMonths} months</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pt-2">
              <div>
                <label htmlFor="email" className="mb-3 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[1.25rem] border border-slate-200 bg-[#f8f9fa] px-5 py-4 text-base font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="mt-3 text-xs font-medium text-slate-400 ml-1">We’ll send your secure payment link here.</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-[1rem] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting}
                className="group relative flex w-full h-16 items-center justify-center gap-3 rounded-[1.25rem] bg-emerald-500 px-6 text-lg font-bold text-white transition-all duration-300 hover:bg-emerald-600 hover:shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none overflow-hidden"
              >
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />
                    Processing Securely...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" strokeWidth={2.5} />
                    Confirm & pay ₹{computed.downPayment.toLocaleString('en-IN')}
                  </>
                )}
              </button>

              <p className="text-center text-[11px] font-semibold leading-relaxed text-slate-400 px-2">
                By confirming, you accept the EMI schedule of ₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo for {plan.tenureMonths} months.
              </p>
            </form>
          </motion.div>
          
        </div>
      </motion.div>
    </div>
  );
}