'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';

const swatchStyles = {
  black: { background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' },
  white: { background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)' },
  orange: { background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' },
  'deep blue': { background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)' },
  blue: { background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)' },
  green: { background: 'linear-gradient(135deg, #14532d 0%, #10b981 100%)' },
  gold: { background: 'linear-gradient(135deg, #d4af37 0%, #f6e27a 100%)' },
  pink: { background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' },
  silver: { background: 'linear-gradient(135deg, #d1d5db 0%, #f8fafc 100%)' },
  natural: { background: 'linear-gradient(135deg, #d7d7d9 0%, #f5f5f7 100%)' },
};

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getSwatchStyle(colorName = '') {
  const normalized = colorName.toLowerCase();

  if (normalized.includes('black') || normalized.includes('obsidian')) return swatchStyles.black;
  if (normalized.includes('white') || normalized.includes('porcelain')) return swatchStyles.white;
  if (normalized.includes('orange')) return swatchStyles.orange;
  if (normalized.includes('deep blue') || normalized.includes('blue') || normalized.includes('bay')) return swatchStyles.blue;
  if (normalized.includes('green') || normalized.includes('emerald') || normalized.includes('mint') || normalized.includes('jade')) return swatchStyles.green;
  if (normalized.includes('gold') || normalized.includes('yellow')) return swatchStyles.gold;
  if (normalized.includes('pink')) return swatchStyles.pink;
  if (normalized.includes('silver') || normalized.includes('gray') || normalized.includes('grey')) return swatchStyles.silver;
  if (normalized.includes('natural') || normalized.includes('titanium')) return swatchStyles.natural;

  return swatchStyles[normalized] || { background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' };
}

function inferFinishLabel(imagePath = '', index = 0) {
  const normalized = imagePath.toLowerCase();

  if (normalized.includes('black')) return 'Black';
  if (normalized.includes('white')) return 'White';
  if (normalized.includes('orange')) return 'Orange';
  if (normalized.includes('blue')) return 'Blue';
  if (normalized.includes('green')) return 'Green';
  if (normalized.includes('pink')) return 'Pink';
  if (normalized.includes('silver')) return 'Silver';
  if (normalized.includes('natural')) return 'Natural';

  return `Finish ${index + 1}`;
}

function getFinishOptions(product, galleryImages) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  if (variants.length > 0) {
    const uniqueOptions = [];

    variants.forEach((variant, index) => {
      const resolvedImageIndex =
        variant.galleryImageIndices?.[0] ??
        (typeof variant.imageIndex === 'number' ? variant.imageIndex : index);
      const resolvedImage = galleryImages[resolvedImageIndex] || galleryImages[index] || galleryImages[0] || '';
      const label = variant.color || inferFinishLabel(resolvedImage, index);

      if (!uniqueOptions.some((option) => option.label === label && option.imageIndex === resolvedImageIndex)) {
        uniqueOptions.push({ image: resolvedImage, imageIndex: resolvedImageIndex, label, variantIndex: index });
      }
    });

    if (uniqueOptions.length > 0) {
      return uniqueOptions;
    }
  }

  return galleryImages.map((image, index) => ({
    image,
    imageIndex: index,
    label: inferFinishLabel(image, index),
  }));
}

export default function ProductClient({ initialProduct, initialEmiPlans, relatedProducts = [] }) {
  const [product] = useState(initialProduct);
  const [emiPlans] = useState(initialEmiPlans);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);

  const selectedVariant = product.variants?.[selectedVariantIdx] || product.variants?.[0] || null;
  const price = selectedVariant?.price || product.price;
  const allProductImages = product.images?.length ? product.images : [];
  const selectedGalleryImageIndices =
    selectedVariant?.galleryImageIndices?.length
      ? selectedVariant.galleryImageIndices
      : typeof selectedVariant?.imageIndex === 'number'
        ? [selectedVariant.imageIndex]
        : allProductImages.map((_, index) => index);
  const galleryImageIndices = [...new Set(selectedGalleryImageIndices)].filter(
    (index) => typeof index === 'number' && allProductImages[index]
  );
  const galleryImages = (galleryImageIndices.length ? galleryImageIndices : allProductImages.map((_, index) => index))
    .map((index) => allProductImages[index])
    .filter(Boolean);

  const calculatedPlans = useMemo(() => {
    return emiPlans.map((plan) => {
      let monthlyAmount = 0;
      const principal = price - (plan.downPayment || 0);

      if (plan.interestRate === 0) {
        monthlyAmount = Math.round(principal / plan.tenureMonths);
      } else {
        const r = plan.interestRate / (12 * 100);
        const n = plan.tenureMonths;
        monthlyAmount = Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      }

      return {
        ...plan,
        monthlyAmount,
        totalAmount: (plan.downPayment || 0) + monthlyAmount * plan.tenureMonths,
      };
    });
  }, [emiPlans, price]);

  const selectedPlan =
    calculatedPlans[selectedPlanIdx] ||
    calculatedPlans[0] || {
      tenureMonths: 12,
      monthlyAmount: Math.round(price / 12),
      downPayment: 0,
      totalAmount: price,
    };

  const currentMainImage = allProductImages[mainImageIdx] || galleryImages[0] || allProductImages[0] || '';
  const savings = product.mrp ? product.mrp - price : 0;
  const startingMonthly = calculatedPlans[0]?.monthlyAmount || Math.round(price / 12);
  const finishOptions = getFinishOptions(product, allProductImages);
  const currentFinish =
    finishOptions.find((option) => option.imageIndex === mainImageIdx)?.label ||
    selectedVariant?.color ||
    finishOptions[0]?.label ||
    'Selected finish';
  const storageOptions = (() => {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const colorFiltered = selectedVariant?.color
      ? variants.filter((variant) => variant.color === selectedVariant.color)
      : variants;
    const seenStorages = new Set();

    return colorFiltered.filter((variant) => {
      if (seenStorages.has(variant.storage)) {
        return false;
      }

      seenStorages.add(variant.storage);
      return true;
    });
  })();
  const selectedConfigLabel = selectedVariant
    ? `${currentFinish} · ${selectedVariant.storage}`
    : 'Premium configuration';

  useEffect(() => {
    if (!galleryImageIndices.includes(mainImageIdx)) {
      setMainImageIdx(galleryImageIndices[0] ?? 0);
    }
  }, [galleryImageIndices, mainImageIdx]);

  const handleFinishSelect = (finishOption) => {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const preferredStorage = selectedVariant?.storage;
    const exactMatchIdx = variants.findIndex(
      (variant) => variant.color === finishOption.label && variant.storage === preferredStorage
    );
    const colorMatchIdx = variants.findIndex((variant) => variant.color === finishOption.label);
    const nextVariantIdx = exactMatchIdx >= 0 ? exactMatchIdx : colorMatchIdx >= 0 ? colorMatchIdx : finishOption.variantIndex;
    const nextVariant = variants[nextVariantIdx] || null;
    const nextImageIndex =
      nextVariant?.galleryImageIndices?.[0] ??
      (typeof nextVariant?.imageIndex === 'number' ? nextVariant.imageIndex : finishOption.imageIndex);

    setSelectedVariantIdx(nextVariantIdx);
    setMainImageIdx(nextImageIndex ?? 0);
  };

  const handleStorageSelect = (variant, variantIndex) => {
    const nextImageIndex =
      variant.galleryImageIndices?.[0] ??
      (typeof variant.imageIndex === 'number' ? variant.imageIndex : 0);

    setSelectedVariantIdx(variantIndex);
    setMainImageIdx(nextImageIndex);
  };

  const handleCheckout = () => {
    window.location.href = `/checkout?product=${product.slug}&plan=${selectedPlan.tenureMonths}`;
  };

  return (
    <div className="relative -mx-4 min-h-screen bg-white md:-mx-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white" />
      
      {/* FIXED: Brought max-width back to 7xl to close the massive center gap */}
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:pt-10">
        <Link href="/#catalog" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to products
        </Link>

        {/* FIXED: Tighter grid layout */}
        <section className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr] xl:gap-16">
          
          <div className="flex flex-col items-center justify-start gap-12 sm:gap-14">
            
            {/* FIXED: Tighter gap between thumbnails and main image */}
            <div className="flex w-full flex-row items-center justify-center gap-6 sm:gap-8">
              
              <div className="flex w-20 flex-col justify-start gap-4 sm:w-24">
                {galleryImages.map((img, idx) => {
                  const sourceImageIndex = galleryImageIndices[idx] ?? idx;
                  const isActive = mainImageIdx === sourceImageIndex;
                  return (
                    <button
                      key={`${img}-${sourceImageIndex}`}
                      type="button"
                      onClick={() => setMainImageIdx(sourceImageIndex)}
                      className={`relative aspect-square w-full overflow-hidden rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-white ring-2 ring-blue-500 ring-offset-4 shadow-[0_4px_12px_rgb(0,0,0,0.08)] scale-[1.02]'
                          : 'bg-slate-50 opacity-70 hover:opacity-100 hover:bg-slate-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        sizes="96px"
                        className="object-contain p-2 mix-blend-multiply"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="relative flex w-full max-w-[32rem] items-center justify-center">
                <div className="absolute inset-x-10 top-1/4 aspect-square rounded-full bg-blue-50/50 blur-[80px]" />
                <div className="relative flex aspect-square w-full items-center justify-center">
                  <Image
                    key={currentMainImage}
                    src={currentMainImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out"
                  />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col items-center gap-8 text-center">
              <section className="space-y-4">
                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-400">Finish</h2>
                  <p className="text-base font-semibold text-slate-900">{currentFinish}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {finishOptions.map((finish, idx) => {
                    const isActive = mainImageIdx === finish.imageIndex;
                    return (
                      <button
                        key={`${finish.label}-${finish.imageIndex}-${idx}`}
                        type="button"
                        onClick={() => handleFinishSelect(finish)}
                        className="group flex flex-col items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <span
                          className={`flex h-[52px] w-[52px] items-center justify-center rounded-full transition-all duration-300 ${
                            isActive ? 'ring-2 ring-slate-900 ring-offset-4 shadow-sm' : 'opacity-80 group-hover:opacity-100'
                          }`}
                        >
                          <span className="h-10 w-10 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]" style={getSwatchStyle(finish.label)} />
                        </span>
                        <p className={`text-[13px] font-semibold transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`}>
                          {finish.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-400">Storage</h2>
                </div>
                <div className="inline-flex items-center justify-center rounded-2xl bg-slate-100/80 p-1.5 backdrop-blur-sm shadow-inner">
                  {storageOptions.map((variant) => {
                    const variantIndex = product.variants.findIndex((productVariant) => productVariant.sku === variant.sku);
                    const isActive = selectedVariantIdx === variantIndex;
                    return (
                      <button
                        key={`${variant.sku}-${variant.storage}`}
                        type="button"
                        onClick={() => handleStorageSelect(variant, variantIndex)}
                        className={`min-w-[5.5rem] rounded-[14px] px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                          isActive 
                            ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgb(0,0,0,0.08)]' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {variant.storage}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>

          <div className="max-w-xl lg:sticky lg:top-12 lg:self-start">
            <p className="text-sm font-semibold text-blue-600">{selectedConfigLabel}</p>
            
            {/* FIXED: Restored clean typography (font-bold instead of extrabold) */}
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {product.name}
            </h1>

            <div className="mt-6 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {formatCurrency(price)}
                </span>
                {product.mrp ? <span className="text-lg font-medium text-slate-400 line-through">{formatCurrency(product.mrp)}</span> : null}
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                {formatCurrency(startingMonthly)}/month on 1Fi EMI
                {savings > 0 ? <span className="text-emerald-600">· Save {formatCurrency(savings)}</span> : ''}
              </p>
            </div>

            <div className="mt-8 space-y-8">
              <section id="payment-plans">
                <div className="flex items-end justify-between gap-4 mb-4">
                  <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-400">Payment Plan</h2>
                  <p className="text-[13px] font-semibold text-slate-500">{selectedPlan.tenureMonths} months selected</p>
                </div>

                <div className="grid gap-3">
                  {calculatedPlans.map((plan, idx) => {
                    const isSelected = selectedPlanIdx === idx;
                    return (
                      <button
                        key={`${plan._id || plan.tenureMonths}-${idx}`}
                        type="button"
                        onClick={() => setSelectedPlanIdx(idx)}
                        className={`group relative grid grid-cols-[1fr_auto] items-center gap-4 rounded-[1.25rem] p-5 text-left transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? 'bg-blue-50/50 ring-2 ring-blue-500 shadow-sm scale-[1.01]'
                            : 'bg-white ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />}
                        <div className="relative">
                          <p className={`text-lg font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{plan.tenureMonths} months</p>
                          <p className={`mt-1 text-sm font-medium ${isSelected ? 'text-blue-600/90' : 'text-slate-500'}`}>
                            {formatCurrency(plan.monthlyAmount)}/mo · total {formatCurrency(plan.totalAmount)}
                          </p>
                        </div>
                        <div className="relative flex items-center gap-3">
                          <span className={`text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                            {plan.interestRate === 0 ? '0% APR' : `${plan.interestRate}% APR`}
                          </span>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${isSelected ? 'bg-blue-500' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* FIXED: Scaled down the dark box so it's punchy but not overwhelming */}
              <section className="relative overflow-hidden rounded-[1.5rem] bg-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-900/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
                <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-400">Total due today</p>
                    <p className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-white leading-none">
                      {formatCurrency(selectedPlan.monthlyAmount)}<span className="text-xl font-semibold text-slate-400">/mo</span>
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-400">
                      Down payment: <span className="text-white font-semibold">{formatCurrency(selectedPlan.downPayment || 0)}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 text-base font-bold text-slate-900 shadow-md transition-all duration-300 hover:bg-slate-50 hover:shadow-lg hover:-translate-y-0.5 sm:w-auto"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Buy now
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </span>
                  </button>
                </div>
              </section>

            </div>
          </div>
        </section>

        {relatedProducts.length > 0 ? (
          <section className="mt-24 pt-12 border-t border-slate-100">
            <div className="mb-10 flex w-full flex-col items-center text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">You Might Also Like</h2>
              <p className="mt-3 text-base font-medium text-slate-500">Perfect companions for your new device.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct, index) => (
                <Link
                  key={relatedProduct._id?.toString?.() || relatedProduct.slug || index}
                  href={`/products/${relatedProduct.slug}`}
                  className="group flex h-full flex-col rounded-[2rem] bg-white p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] ring-1 ring-slate-100 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] hover:ring-slate-200"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-slate-50 to-slate-100/50 p-6">
                    <div className="relative h-full w-full">
                      <Image
                        src={relatedProduct.images?.[0] || '/placeholder.png'}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain drop-shadow-md transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col flex-1 text-center px-4 pb-4">
                    <h3 className="text-xl font-bold text-slate-900">{relatedProduct.name}</h3>
                    <p className="mt-1 text-lg font-semibold text-slate-500">{formatCurrency(relatedProduct.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}