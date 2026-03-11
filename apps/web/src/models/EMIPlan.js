import mongoose from 'mongoose';

const EMIPlanSchema = new mongoose.Schema({
  name: String, // e.g., "6 months EMI"
  tenureMonths: Number, // e.g., 6
  monthlyAmount: Number, // computed or explicitly stored
  interestRate: Number, // e.g., 0.0 for 0% or 10.5
  cashback: { type: Number, default: 0 }, // optional
  downPayment: { type: Number, default: 0 } // optional fixed downpayment
});

export default mongoose.models.EMIPlan || mongoose.model('EMIPlan', EMIPlanSchema);
