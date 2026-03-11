import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import Product from '../../../../models/Product';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { slug } = params;
    const product = await Product.findOne({ slug });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}