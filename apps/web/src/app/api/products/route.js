import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db/mongoose';
import Product from '../../../lib/db/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({});
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}