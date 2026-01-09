import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  password: string;
  displayName?: string;
  businessName: string;
  businessType: 'wholesaler' | 'retailer' | 'manufacturer';
  role: 'wholesaler' | 'retailer' | 'manufacturer' | 'admin';
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
  photoURL?: string;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  featuredListingsCount: number; // Remaining featured listings (max 10)
  featuredSellerCount: number; // Remaining featured sellers (max 1)
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      enum: ['wholesaler', 'retailer', 'manufacturer'],
      required: true,
    },
    role: {
      type: String,
      enum: ['wholesaler', 'retailer', 'manufacturer', 'admin'],
      default: 'wholesaler',
    },
    phone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    shopId: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    photoURL: {
      type: String,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiresAt: {
      type: Date,
    },
    featuredListingsCount: {
      type: Number,
      default: 0,
    },
    featuredSellerCount: {
      type: Number,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ uid: 1 });
UserSchema.index({ businessType: 1 });

// Clear the model cache to ensure we get the latest schema with manufacturer role
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
