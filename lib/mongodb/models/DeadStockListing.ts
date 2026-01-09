import mongoose, { Schema, Document } from 'mongoose';

export interface IDeadStockListing extends Document {
  listingId: string;
  sellerId: string;
  sellerName: string;
  shopId?: string;
  productId?: string;
  productName: string;
  category: string;
  description: string;
  quantity: number;
  minQty?: number;
  originalPrice: number;
  discountPrice: number;
  discountPercent?: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  images: string[];
  location?: {
    city: string;
    state: string;
  };
  status: 'available' | 'reserved' | 'sold' | 'expired';
  isFeatured?: boolean;
  views?: number;
  inquiries?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  soldAt?: Date;
}

const DeadStockListingSchema = new Schema<IDeadStockListing>(
  {
    listingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sellerId: {
      type: String,
      required: true,
      index: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    shopId: String,
    productId: String,
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    minQty: Number,
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      index: true,
    },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      required: true,
    },
    images: [String],
    location: {
      city: {
        type: String,
        index: true,
      },
      state: {
        type: String,
        index: true,
      },
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'expired'],
      default: 'available',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
    },
    expiresAt: Date,
    soldAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
DeadStockListingSchema.index({ status: 1, category: 1, createdAt: -1 });
DeadStockListingSchema.index({ status: 1, 'location.city': 1, createdAt: -1 });
DeadStockListingSchema.index({ status: 1, discountPercent: -1 });
DeadStockListingSchema.index({ isFeatured: 1, status: 1, createdAt: -1 });

const DeadStockListing = (mongoose.models.DeadStockListing as mongoose.Model<IDeadStockListing>) || mongoose.model<IDeadStockListing>('DeadStockListing', DeadStockListingSchema);

export default DeadStockListing;
