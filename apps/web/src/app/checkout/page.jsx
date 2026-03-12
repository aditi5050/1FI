import { Suspense } from 'react';
import dbConnect from '../../lib/mongoose';
import Product from '../../models/Product';
import EMIPlan from '../../models/EMIPlan';
import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Checkout | 1Fi Phone Store',
};

export default async function CheckoutPage({ searchParams }) {
  const slug = searchParams?.product;
  const tenure = parseInt(searchParams?.plan);

  if (!slug || !tenure) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">Invalid Checkout</h1>
          <p className="text-slate-600">Missing product or EMI plan information.</p>
          <a href="/" className="mt-4 inline-block font-medium text-emerald-700 underline">← Back to products</a>
        </div>
      </main>
    );
  }

  await dbConnect();
  const product = await Product.findOne({ slug }).lean();
  const plan = await EMIPlan.findOne({ tenureMonths: tenure }).lean();

  if (!product || !plan) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">Not Found</h1>
          <p className="text-slate-600">Could not find the selected product or EMI plan.</p>
          <a href="/" className="mt-4 inline-block font-medium text-emerald-700 underline">← Back to products</a>
        </div>
      </main>
    );
  }

  // Serialize for client component
  const productData = JSON.parse(JSON.stringify(product));
  const planData = JSON.parse(JSON.stringify(plan));

  return (
    <main className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <div className="mb-8 flex items-center justify-between">
          <a
            href={`/products/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
          >
            <span className="text-lg">←</span>
            Back to {product.name}
          </a>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Secure checkout
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-900 sm:text-5xl">
          Confirm your 1Fi order
        </h1>
        <p className="mt-3 text-slate-600">Transparent pricing, modern UI, and instant EMI confirmation.</p>
        <div className="mt-8">
          <Suspense fallback={<div className="text-slate-300">Loading checkout…</div>}>
            <CheckoutClient product={productData} plan={planData} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
