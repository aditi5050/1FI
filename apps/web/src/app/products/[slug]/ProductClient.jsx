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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left: Thumbnails */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:w-24">
        {product.images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${product.name} shadow`}
            className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
              mainImageIdx === idx ? 'border-teal-500' : 'border-transparent shadow-sm'
            }`}
            onClick={() => setMainImageIdx(idx)}
          />
        ))}
      </div>

      {/* Center: Main Image & Variants */}
      <div className="flex-1">
        <div className="bg-gray-50 p-4 rounded-xl flex justify-center items-center h-[400px]">
          <img src={currentMainImage} alt={product.name} className="max-h-full rounded-md" />
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Variant</label>
            <select
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2 border"
              value={selectedVariantIdx}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                setSelectedVariantIdx(idx);
                if (product.variants[idx].imageIndex !== undefined) {
                  setMainImageIdx(product.variants[idx].imageIndex);
                }
              }}
            >
              {product.variants.map((v, i) => (
                <option key={i} value={i}>
                  {v.storage} - {v.color}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right: EMI Panel */}
      <div className="lg:w-1/3 bg-[#e8f7f9] p-6 rounded-xl shadow-sm border border-teal-50">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-gray-600 mt-1">{selectedVariant?.storage} | {selectedVariant?.color}</p>
        
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
          {product.mrp && (
            <span className="text-lg text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg flex items-center gap-3 px-4 py-3 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100">
            <span className="text-amber-600 text-lg">⚡</span>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Higher Credit Instantly</p>
            <p className="text-xs text-amber-700">Get approved for a higher limit with 1Fi</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-bold text-gray-700 mb-3">
            Pay Now: ₹{selectedPlan?.downPayment || 0} Downpayment
          </div>
          
          <h3 className="font-semibold text-gray-900 mt-4 mb-2">Choose EMI Tenure</h3>
          <div className="space-y-3">
            {calculatedPlans.map((plan, idx) => (
              <label
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer bg-white ${
                  selectedPlanIdx === idx ? 'border-teal-500 ring-1 ring-teal-500' : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="emiplan"
                    checked={selectedPlanIdx === idx}
                    onChange={() => setSelectedPlanIdx(idx)}
                    className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{plan.tenureMonths} months</div>
                    <div className="text-xs text-gray-500 mt-0.5">₹{plan.monthlyAmount.toLocaleString('en-IN')}/mo</div>
                  </div>
                </div>
                {plan.interestRate === 0 && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                    0% EMI
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-8 w-full bg-[#004f4a] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#003d39] transition-colors shadow-sm"
        >
          Buy on {selectedPlan?.tenureMonths} months EMI
        </button>
      </div>
    </div>
  );
}