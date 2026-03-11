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
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Checkout</h1>
          <p className="text-gray-600">Missing product or EMI plan information.</p>
          <a href="/" className="mt-4 inline-block text-teal-700 underline font-medium">← Back to products</a>
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
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Not Found</h1>
          <p className="text-gray-600">Could not find the selected product or EMI plan.</p>
          <a href="/" className="mt-4 inline-block text-teal-700 underline font-medium">← Back to products</a>
        </div>
      </main>
    );
  }

  // Serialize for client component
  const productData = JSON.parse(JSON.stringify(product));
  const planData = JSON.parse(JSON.stringify(plan));

  return (
    <main className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-12 md:px-6 md:pt-14">
        <div className="mb-8 flex items-center justify-between">
          <a
            href={`/products/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition hover:text-white"
          >
            <span className="text-lg">←</span>
            Back to {product.name}
          </a>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-200">
            Secure checkout
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
          Confirm your 1Fi order
        </h1>
        <p className="mt-3 text-slate-300">Transparent pricing, modern UI, and instant EMI confirmation.</p>
        <div className="mt-8">
          <Suspense fallback={<div className="text-slate-300">Loading checkout…</div>}>
            <CheckoutClient product={productData} plan={planData} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
