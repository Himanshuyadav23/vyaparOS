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
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  images: string[];
  location: {
    city: string;
    state: string;
  };
  status: 'available' | 'reserved' | 'sold' | 'expired';
  views: number;
  inquiries: number;
  expiresAt?: Date;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeadStockListingSchema = new Schema<IDeadStockListing>(
  {
    listingId: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true },
    sellerName: { type: String, required: true },
    shopId: String,
    productId: String,
    productName: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true, index: -1 },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      required: true,
    },
    images: [{ type: String }],
    location: {
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'expired'],
      default: 'available',
      index: true,
    },
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    expiresAt: Date,
    soldAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
DeadStockListingSchema.index({ sellerId: 1 });
DeadStockListingSchema.index({ status: 1, category: 1, createdAt: -1 });
DeadStockListingSchema.index({ status: 1, 'location.city': 1, createdAt: -1 });
DeadStockListingSchema.index({ status: 1, discountPercent: -1 });
DeadStockListingSchema.index({ createdAt: -1 });

const DeadStockListingModel = mongoose.models.DeadStockListing || mongoose.model<IDeadStockListing>('DeadStockListing', DeadStockListingSchema);
export default DeadStockListingModel as mongoose.Model<IDeadStockListing>;

