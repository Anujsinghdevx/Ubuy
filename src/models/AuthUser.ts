import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthUser extends Document {
  email: string;
  name: string;
  provider: string;
  authProvider: string;
  createdAt: Date;
  biddedauction: string[];
  updatedAt: Date;
  image?: string;
}

const AuthUserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'google', // Default to Google for external users
      enum: ['google', 'facebook', 'github'],
    },
    authProvider: {
      type: String,
      default: 'AuthUser',
      enum: ['AuthUser'],
    },
    biddedauction: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AuthUser || mongoose.model<IAuthUser>('AuthUser', AuthUserSchema);
