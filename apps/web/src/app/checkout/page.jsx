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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbfd_0%,#ffffff_26%,#ffffff_100%)] pt-24 md:pt-28">
      <Suspense fallback={<div className="px-4 py-12 text-slate-300">Loading checkout…</div>}>
        <CheckoutClient product={productData} plan={planData} />
      </Suspense>
    </main>
  );
}
