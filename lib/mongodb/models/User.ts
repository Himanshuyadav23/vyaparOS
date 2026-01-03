import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  password: string;
  displayName?: string;
  businessName: string;
  businessType: 'wholesaler' | 'retailer' | 'manufacturer';
  role?: 'wholesaler' | 'retailer' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  shopId?: string;
  verified: boolean;
  banned?: boolean;
  banReason?: string;
  bannedAt?: Date;
  bannedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    displayName: String,
    businessName: { type: String, required: true },
    businessType: {
      type: String,
      enum: ['wholesaler', 'retailer', 'manufacturer'],
      required: true,
    },
    role: {
      type: String,
      enum: ['wholesaler', 'retailer', 'admin'],
      default: 'wholesaler',
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    shopId: String,
    verified: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    banReason: String,
    bannedAt: Date,
    bannedBy: String,
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ businessType: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'address.city': 1 });

const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default UserModel as mongoose.Model<IUser>;

