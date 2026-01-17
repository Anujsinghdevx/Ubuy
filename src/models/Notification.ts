import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  recipientModel: 'User' | 'AuthUser';
  type: 'bid' | 'win' | 'close' | 'admin' | 'general' | 'payment' | 'create';
  message: string;
  isRead: boolean;
  relatedAuction?: Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientModel',
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ['User', 'AuthUser'],
    },
    type: {
      type: String,
      enum: ['bid', 'win', 'close', 'admin', 'general', 'payment', 'create'],
      default: 'general',
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedAuction: {
      type: Schema.Types.ObjectId,
      ref: 'Auction',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3_888_000 });

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
