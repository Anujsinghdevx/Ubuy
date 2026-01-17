import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  isVerified: boolean;
  verificationcode: string;
  authProvider: string;
  verificationCodeExpiry: Date;
  biddedauction: string[];
  image?: string;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please use a valid email address'],
    },

    password: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationcode: {
      type: String,
      default: '',
    },

    verificationCodeExpiry: {
      type: Date,
      default: Date.now,
    },

    authProvider: {
      type: String,
      default: 'User',
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
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
