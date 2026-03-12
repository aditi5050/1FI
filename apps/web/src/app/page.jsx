import dbConnect from '../lib/db/mongoose';
import Product from '../lib/db/models/Product';
import HomeClient from './components/HomeClient';

export default async function HomePage() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1, _id: -1 }).lean();
  const featuredImage = products[0]?.images?.[0] || null;

  return <HomeClient products={products} featuredImage={featuredImage} />;
}
