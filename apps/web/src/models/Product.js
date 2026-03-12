import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },           // e.g., "Apple iPhone 17 Pro"
  slug: { type: String, required: true, unique: true }, // e.g., "iphone-17-pro"
  description: String,
  mrp: Number,    // MRP
  price: Number,  // Selling price
  images: [String], // array of full-size image URLs (first image is main)
  thumbnails: [String], // optional small images
  variants: [
    {
      sku: String,
      color: String,
      storage: String,
      price: Number,
      imageIndex: Number, // index into images[]
      galleryImageIndices: [Number]
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
