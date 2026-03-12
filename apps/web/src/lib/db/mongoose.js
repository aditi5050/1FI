import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows DNS issue with MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Strip out accidental spaces or surrounding quotes from the .env variable
const MONGODB_URI = process.env.MONGODB_URI?.trim().replace(/^["']|["']$/g, '');

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB');
      return mongoose;
    }).catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      throw err;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;