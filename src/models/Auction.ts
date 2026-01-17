import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuction extends Document {
  title: string;
  description: string;
  images: string[];
  startingPrice: number;
  currentPrice: number;
  bidders: {
    bidder: Types.ObjectId;
    bidderModel: 'User' | 'AuthUser';
    bidderName?: string;
    amount: number;
    bidTime: Date;
  }[];
  category: 'Collectibles' | 'Art' | 'Electronics' | 'Fashion' | 'Other';
  startTime: Date;
  endTime: Date;
  status: 'active' | 'closed';
  createdBy: Types.ObjectId;
  createdByModel: 'User' | 'AuthUser';
  notified?: boolean;
  winner?: Types.ObjectId;
  paymentStatus?: 'PAID' | 'ACTIVE';
}

const AuctionSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 },
    bidders: [
      {
        bidder: {
          type: Schema.Types.ObjectId,
          required: true,
          refPath: 'bidders.bidderModel',
        },
        bidderModel: {
          type: String,
          required: true,
          enum: ['User', 'AuthUser'],
        },
        bidderName: { type: String },
        amount: { type: Number, required: true },
        bidTime: { type: Date, default: Date.now },
      },
    ],
    category: {
      type: String,
      enum: ['Collectibles', 'Art', 'Electronics', 'Fashion', 'Other'],
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'createdByModel',
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ['User', 'AuthUser'],
    },
    notified: { type: Boolean, default: false },
    winner: { type: Schema.Types.ObjectId, refPath: 'bidders.bidderModel' },
    paymentStatus: { type: String, enum: ['PAID', 'ACTIVE'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Auction || mongoose.model<IAuction>('Auction', AuctionSchema);
