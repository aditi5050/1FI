import mongoose from 'mongoose';

const PreOrderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productSlug: { type: String, required: true },
  productName: { type: String },
  variantSku: { type: String },
  planTenure: { type: Number, required: true },
  monthlyAmount: { type: Number },
  downPayment: { type: Number },
  totalPrice: { type: Number },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.PreOrder || mongoose.model('PreOrder', PreOrderSchema);
