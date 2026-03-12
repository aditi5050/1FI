import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db/mongoose';
import PreOrder from '../../../lib/db/models/PreOrder';
import Product from '../../../lib/db/models/Product';
import EMIPlan from '../../../lib/db/models/EMIPlan';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { productSlug, planTenure, email, variantSku } = body;

    // Validate required fields
    if (!productSlug || !planTenure || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: productSlug, planTenure, email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Fetch product
    const product = await Product.findOne({ slug: productSlug });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Fetch EMI plan
    const plan = await EMIPlan.findOne({ tenureMonths: planTenure });
    if (!plan) {
      return NextResponse.json({ error: 'EMI plan not found' }, { status: 404 });
    }

    // Determine price from variant or product base price
    let price = product.price;
    if (variantSku) {
      const variant = product.variants.find(v => v.sku === variantSku);
      if (variant) price = variant.price;
    }

    // Compute monthly amount
    const downPayment = plan.downPayment || 0;
    const principal = price - downPayment;
    let monthlyAmount;
    if (plan.interestRate === 0) {
      monthlyAmount = Math.round(principal / plan.tenureMonths);
    } else {
      const r = plan.interestRate / (12 * 100);
      const n = plan.tenureMonths;
      monthlyAmount = Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }

    // Create pre-order
    const preOrder = await PreOrder.create({
      productId: product._id,
      productSlug: product.slug,
      productName: product.name,
      variantSku: variantSku || product.variants[0]?.sku || '',
      planTenure: plan.tenureMonths,
      monthlyAmount,
      downPayment,
      totalPrice: price,
      email,
    });

    return NextResponse.json({ success: true, preOrder }, { status: 201 });
  } catch (error) {
    console.error('PreOrder creation error:', error);
    return NextResponse.json({ error: 'Failed to create pre-order' }, { status: 500 });
  }
}
