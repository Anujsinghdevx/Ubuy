import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBid extends Document {
  auction: Types.ObjectId;
  bidder: Types.ObjectId;
  bidderModel: 'User' | 'AuthUser';
  amount: number;
  bidTime: Date;
}

const BidSchema: Schema = new Schema(
  {
    auction: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
    bidder: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'bidderModel',
    },
    bidderModel: {
      type: String,
      required: true,
      enum: ['User', 'AuthUser'],
    },
    amount: { type: Number, required: true },
    bidTime: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema);
