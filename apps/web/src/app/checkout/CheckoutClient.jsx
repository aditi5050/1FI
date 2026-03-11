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
      <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Pre-Order Confirmed!</h2>
        <p className="text-gray-600 mb-1">Thank you for your order.</p>
        <p className="text-gray-500 text-sm mb-6">We&apos;ve sent a confirmation to <strong>{email}</strong></p>

        <div className="bg-gray-50 rounded-lg p-4 inline-block text-left mb-6">
          <p className="font-semibold text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-600">{selectedVariant?.storage} · {selectedVariant?.color}</p>
          <p className="text-sm text-gray-600 mt-1">
            {plan.tenureMonths} months × ₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo
          </p>
        </div>

        <div>
          <a href="/" className="text-teal-700 hover:underline font-medium">← Continue Shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left: Order Summary */}
      <div className="flex-1">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

          <div className="flex gap-4 mb-6">
            <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
              <img
                src={product.images[selectedVariant?.imageIndex || 0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedVariant?.storage} · {selectedVariant?.color}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                {product.mrp && product.mrp !== price && (
                  <span className="text-sm text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Variant selector */}
          {product.variants.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Variant</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 focus:border-teal-500 focus:ring-teal-500"
                value={selectedVariantIdx}
                onChange={(e) => setSelectedVariantIdx(parseInt(e.target.value))}
              >
                {product.variants.map((v, i) => (
                  <option key={i} value={i}>{v.storage} - {v.color} (₹{v.price.toLocaleString('en-IN')})</option>
                ))}
              </select>
            </div>
          )}

          {/* EMI Breakdown */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">EMI Plan Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product Price</span>
                <span className="font-medium">₹{price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Down Payment</span>
                <span className="font-medium">₹{computed.downPayment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EMI Tenure</span>
                <span className="font-medium">{plan.tenureMonths} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-medium">
                  {plan.interestRate === 0 ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold">0% EMI</span>
                  ) : (
                    `${plan.interestRate}%`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-900 font-semibold">Monthly EMI</span>
                <span className="text-lg font-bold text-[#004f4a]">₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Email & Confirm */}
      <div className="lg:w-96">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Pre-Order</h2>

          <div className="bg-[#e8f7f9] rounded-lg p-4 mb-6 border border-teal-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Pay Now</p>
                <p className="text-2xl font-bold text-[#004f4a]">₹{computed.downPayment}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium">Then</p>
                <p className="text-lg font-bold text-gray-900">₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo</p>
                <p className="text-xs text-gray-500">× {plan.tenureMonths} months</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">We&apos;ll send order confirmation to this email.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#004f4a] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#003d39] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : `Confirm & Pay ₹${computed.downPayment}`}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            By confirming, you agree to the EMI terms for {plan.tenureMonths} months at ₹{computed.monthlyAmount.toLocaleString('en-IN')}/mo.
          </p>
        </form>
      </div>
    </div>
  );
}
