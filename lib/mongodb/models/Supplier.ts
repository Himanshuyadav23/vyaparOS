import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  userId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  categories: string[];
  specialties: string[];
  rating: number;
  adminRating?: number; // Admin-assigned rating (0-5)
  totalTransactions: number;
  verified: boolean;
  banned: boolean;
  bannedAt?: Date;
  bannedBy?: string;
  banReason?: string;
  badSupplier: boolean; // Marked as bad supplier by admin
  badSupplierReason?: string;
  markedBadAt?: Date;
  markedBadBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    categories: [String],
    specialties: [String],
    rating: {
      type: Number,
      default: 0,
    },
    adminRating: {
      type: Number,
      min: 0,
      max: 5,
    },
    totalTransactions: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    bannedAt: {
      type: Date,
    },
    bannedBy: {
      type: String,
    },
    banReason: {
      type: String,
    },
    badSupplier: {
      type: Boolean,
      default: false,
    },
    badSupplierReason: {
      type: String,
    },
    markedBadAt: {
      type: Date,
    },
    markedBadBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SupplierSchema.index({ userId: 1 });
SupplierSchema.index({ city: 1 });
SupplierSchema.index({ state: 1 });
SupplierSchema.index({ rating: -1, createdAt: -1 });

const Supplier = (mongoose.models.Supplier as mongoose.Model<ISupplier>) || mongoose.model<ISupplier>('Supplier', SupplierSchema);

export default Supplier;
