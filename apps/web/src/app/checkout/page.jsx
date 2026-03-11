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
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <a href={`/products/${slug}`} className="text-teal-700 hover:underline text-sm font-medium mb-6 inline-block">
          ← Back to {product.name}
        </a>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <CheckoutClient product={productData} plan={planData} />
        </Suspense>
      </div>
    </main>
  );
}
