// scripts/seed.js
// Fix for Windows DNS issues with SRV records — MUST be first
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Disable buffering so operations fail fast if not connected
mongoose.set('bufferCommands', false);

const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf-8'));

const uri = process.env.MONGODB_URI || 'mongodb+srv://Armaanahuja2707:Armaanahuja2707@cluster0.jb9jy3v.mongodb.net/1fi-store?retryWrites=true&w=majority&appName=Cluster0';

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
    imageIndex: Number
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

  await Product.insertMany(seedData.products);
  await EMIPlan.insertMany(seedData.emiplans);
  console.log('Inserted seed data successfully');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
