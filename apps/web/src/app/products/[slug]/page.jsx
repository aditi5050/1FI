// apps/web/src/app/products/[slug]/page.jsx
import dbConnect from '../../../lib/db/mongoose';
import Product from '../../../lib/db/models/Product';
import EMIPlan from '../../../lib/db/models/EMIPlan';
import ProductClient from './ProductClient';

const productImageOverrides = {
  'iphone-17-pro': [
    '/assets/iphone17proall.png',
    '/assets/iphone17problack.png',
    '/assets/iphone17prowhite.png',
    '/assets/iphone17proorange.png',
  ],
};

function resolveProductImages(product) {
  return productImageOverrides[product?.slug] || product?.images || [];
}

// Dynamic SEO metadata per product
export async function generateMetadata({ params }) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  const productImages = resolveProductImages(product);
  if (!product) return { title: 'Product Not Found | 1Fi Phone Store' };
  return {
    title: `${product.name} — EMI from ₹${Math.round(product.price / 12).toLocaleString('en-IN')}/mo | 1Fi`,
    description: product.description || `Buy ${product.name} on easy EMI plans with 0% interest at 1Fi.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: productImages[0] ? [productImages[0]] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean();
  const emiPlans = await EMIPlan.find({}).lean();

  // Related products for "You May Also Like" (exclude current, limit 3)
  const relatedProducts = product
    ? await Product.find({ _id: { $ne: product._id } }).limit(3).lean()
    : [];

  if (!product) {
    return <div className="p-8 text-center text-red-500">Product not found</div>;
  }

  // Serialize MongoDB documents for client component
  const productData = JSON.parse(JSON.stringify(product));
  productData.images = resolveProductImages(productData);
  const emiData = JSON.parse(JSON.stringify(emiPlans));
  const relatedData = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <main className="overflow-hidden bg-slate-50 pb-20 pt-0">
      <ProductClient initialProduct={productData} initialEmiPlans={emiData} relatedProducts={relatedData} />
    </main>
  );
}
