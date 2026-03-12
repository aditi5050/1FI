// apps/web/scripts/seed.js
// Fix for Windows DNS issues with SRV records — MUST be first
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Disable buffering so operations fail fast if not connected
mongoose.set('bufferCommands', false);

function loadEnvFile(filePath, overrideExisting = false) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['\"]|['\"]$/g, '');

    if (overrideExisting || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const appRoot = path.resolve(__dirname, '..');
loadEnvFile(path.join(appRoot, '.env'));
loadEnvFile(path.join(appRoot, '.env.local'), true);

const seedConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'seed.json'), 'utf-8'));

const uri = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, '');

if (!uri) {
  throw new Error('Missing MONGODB_URI. Add it to apps/web/.env or export it before running npm run seed.');
}

// Define schemas inline to avoid import issues
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  mrp: Number,
  price: Number,
  images: [String],
  thumbnails: [String],
  variants: [{
    sku: String,
    color: String,
    storage: String,
    price: Number,
    imageIndex: Number,
    galleryImageIndices: [Number]
  }],
  createdAt: { type: Date, default: Date.now }
});

const EMIPlanSchema = new mongoose.Schema({
  name: String,
  tenureMonths: Number,
  monthlyAmount: Number,
  interestRate: Number,
  cashback: { type: Number, default: 0 },
  downPayment: { type: Number, default: 0 }
});

function buildSku(slug, storage = '', color = '', index = 0) {
  const slugCode = slug.replace(/-/g, '').toUpperCase().slice(0, 8) || 'PRODUCT';
  const storageCode = storage.replace(/\s+/g, '').toUpperCase() || 'STD';
  const colorCode = color.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4) || `C${index + 1}`;
  return `${slugCode}-${storageCode}-${colorCode}-${index + 1}`;
}

function normalizeProduct(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const discoveredVariantImages = variants.flatMap((variant) => {
    const variantImages = Array.isArray(variant.images) ? variant.images.filter(Boolean) : [];
    const declaredImage = typeof variant.image === 'string' ? [variant.image] : [];
    return [...declaredImage, ...variantImages];
  });
  const baseImages = [...new Set([...(Array.isArray(product.images) ? product.images : []), ...discoveredVariantImages])];

  if (variants.length === 0) {
    return product;
  }

  const normalizedVariants = variants.map((variant, index) => {
    const variantImages = Array.isArray(variant.images) ? variant.images.filter(Boolean) : [];
    const declaredImage = typeof variant.image === 'string' ? variant.image : '';
    const fallbackImage = baseImages[variant.imageIndex ?? index] || baseImages[index] || baseImages[0] || '';
    const galleryImages = [...new Set([declaredImage, ...variantImages, fallbackImage].filter(Boolean))];

    const imageIndex = galleryImages[0] ? baseImages.indexOf(galleryImages[0]) : Number(variant.imageIndex || 0);
    const explicitGalleryIndices = Array.isArray(variant.galleryImageIndices)
      ? variant.galleryImageIndices.filter((imageIdx) => Number.isInteger(imageIdx) && baseImages[imageIdx])
      : [];
    const derivedGalleryIndices = galleryImages
      .map((image) => baseImages.indexOf(image))
      .filter((imageIdx) => imageIdx >= 0);
    const fallbackGalleryIndices = imageIndex >= 0
      ? [imageIndex, ...baseImages.map((_, imageIdx) => imageIdx).filter((imageIdx) => imageIdx !== imageIndex)]
      : baseImages.map((_, imageIdx) => imageIdx);
    const galleryImageIndices = explicitGalleryIndices.length
      ? [...new Set(explicitGalleryIndices)]
      : variantImages.length > 0
        ? [...new Set(derivedGalleryIndices)]
        : fallbackGalleryIndices;

    return {
      sku: variant.sku || buildSku(product.slug || product.name || 'product', variant.storage || 'STD', variant.color || 'COLOR', index),
      color: variant.color,
      storage: variant.storage,
      mrp: variant.mrp,
      price: variant.price,
      imageIndex,
      galleryImageIndices,
    };
  });

  const priceValues = normalizedVariants
    .map((variant) => Number(variant.price))
    .filter((value) => Number.isFinite(value) && value > 0);

  return {
    ...product,
    description:
      product.description ||
      `${product.name} (${normalizedVariants[0]?.color || 'Standard'}, ${normalizedVariants[0]?.storage || 'Standard'})`,
    mrp: Number(product.mrp || normalizedVariants[0]?.price || 0),
    price: Number(product.price || Math.min(...priceValues, Number(product.price || 0))),
    images: baseImages,
    variants: normalizedVariants,
  };
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  console.log('Connected to MongoDB (readyState:', mongoose.connection.readyState + ')');

  const Product = mongoose.model('Product', ProductSchema);
  const EMIPlan = mongoose.model('EMIPlan', EMIPlanSchema);

  await Product.deleteMany({});
  await EMIPlan.deleteMany({});
  console.log('Cleared existing data');

  await Product.insertMany(seedConfig.products.map(normalizeProduct));
  await EMIPlan.insertMany(seedConfig.emiplans);
  console.log('Inserted seed data successfully');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
