import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
  shopId: string;
  ownerId: string;
  shopName: string;
  shopType: 'wholesale' | 'retail' | 'both';
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email?: string;
    alternatePhone?: string;
  };
  businessHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  categories: string[];
  specialties: string[];
  rating: number;
  totalRatings: number;
  verified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    shopId: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true, index: true },
    shopName: { type: String, required: true },
    shopType: {
      type: String,
      enum: ['wholesale', 'retail', 'both'],
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true, index: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    contact: {
      phone: { type: String, required: true },
      email: String,
      alternatePhone: String,
    },
    businessHours: {
      type: Map,
      of: {
        open: String,
        close: String,
        closed: Boolean,
      },
    },
    categories: [{ type: String }],
    specialties: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
ShopSchema.index({ ownerId: 1, createdAt: -1 });
ShopSchema.index({ 'address.city': 1, shopType: 1, isActive: 1 });
ShopSchema.index({ 'address.state': 1, categories: 1 });
ShopSchema.index({ rating: -1 });

const ShopModel = mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);
export default ShopModel as mongoose.Model<IShop>;



