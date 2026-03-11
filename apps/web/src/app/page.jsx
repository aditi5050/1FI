import Link from 'next/link';
import dbConnect from '../lib/mongoose';
import Product from '../models/Product';

export default async function HomePage() {
  await dbConnect();
  // Fetch directly from DB for the server component to avoid self-fetch issues during build
  const products = await Product.find({}).lean();

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-[#004f4a]">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product._id.toString()} className="border rounded-xl p-4 shadow-sm hover:shadow-lg transition">
            <div className="h-48 flex justify-center items-center bg-gray-50 rounded-lg mb-4">
              <img src={product.images[0]} alt={product.name} className="max-h-full object-contain" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4 h-12 text-sm line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center mt-auto">
              <div>
                <span className="text-xl font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                {product.mrp && (
                  <span className="text-sm text-gray-500 line-through ml-2">₹{product.mrp.toLocaleString('en-IN')}</span>
                )}
              </div>
              <Link href={`/products/${product.slug}`}>
                <button className="bg-[#004f4a] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#003d39]">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}