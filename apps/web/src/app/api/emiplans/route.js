import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db/mongoose';
import EMIPlan from '../../../lib/db/models/EMIPlan';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Extract price and downpayment from query parameters, if available
    const { searchParams } = new URL(request.url);
    const priceParam = searchParams.get('price');
    const price = priceParam ? parseFloat(priceParam) : 0;
    
    const emiplansRaw = await EMIPlan.find({}).lean();
    
    // Compute monthlyAmount dynamically on the backend
    const emiplans = emiplansRaw.map(plan => {
      let monthlyAmount = null;
      if (price > 0) {
        let downPayment = plan.downPayment || 0;
        let principal = price - downPayment;
        
        if (plan.interestRate === 0) {
          monthlyAmount = Math.round(principal / plan.tenureMonths);
        } else {
          const r = plan.interestRate / (12 * 100);
          const n = plan.tenureMonths;
          monthlyAmount = Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
        }
      }
      return { ...plan, monthlyAmount };
    });
    
    return NextResponse.json({ emiplans });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch emi plans' }, { status: 500 });
  }
}