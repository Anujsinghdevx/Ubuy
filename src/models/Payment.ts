import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  auction: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  auction: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
