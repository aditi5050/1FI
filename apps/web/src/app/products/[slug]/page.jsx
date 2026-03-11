// apps/web/src/app/products/[slug]/page.jsx
import dbConnect from '../../../lib/mongoose';
import Product from '../../../models/Product';
import EMIPlan from '../../../models/EMIPlan';
import ProductClient from './ProductClient';

// Dynamic SEO metadata per product
export async function generateMetadata({ params }) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  if (!product) return { title: 'Product Not Found | 1Fi Phone Store' };
  return {
    title: `${product.name} — EMI from ₹${Math.round(product.price / 12).toLocaleString('en-IN')}/mo | 1Fi`,
    description: product.description || `Buy ${product.name} on easy EMI plans with 0% interest at 1Fi.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  const emiPlans = await EMIPlan.find({}).lean();

  if (!product) {
    return <div className="p-8 text-center text-red-500">Product not found</div>;
  }

  // Serialize MongoDB documents for client component
  const productData = JSON.parse(JSON.stringify(product));
  const emiData = JSON.parse(JSON.stringify(emiPlans));

  return (
    <main className="container mx-auto p-4 md:p-8">
      <ProductClient initialProduct={productData} initialEmiPlans={emiData} />
    </main>
  );
}
