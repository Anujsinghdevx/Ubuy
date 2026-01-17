import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWishlist extends Document {
  user: Types.ObjectId;
  userModel: 'User' | 'AuthUser';
  auction: Types.ObjectId;
  addedAt: Date;
}

const WishlistSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel',
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'AuthUser'],
    },
    auction: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Auction',
    },
  },
  {
    timestamps: { createdAt: 'addedAt', updatedAt: false },
  }
);

// Ensures a user cannot add the same auction to wishlist multiple times
WishlistSchema.index({ user: 1, auction: 1 }, { unique: true });

export default mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
