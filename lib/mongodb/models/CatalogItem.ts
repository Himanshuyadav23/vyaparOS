import mongoose, { Schema, Document } from 'mongoose';

export interface ICatalogItem extends Document {
  catalogId: string;
  supplierId: string;
  supplierName: string;
  shopId?: string;
  productId?: string;
  productName: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  stockAvailable?: number;
  unit?: string;
  images: string[];
  specifications: Record<string, string>;
  tags: string[];
  isActive: boolean;
  isFeatured?: boolean;
  views?: number;
  inquiries?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogItemSchema = new Schema<ICatalogItem>(
  {
    catalogId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplierId: {
      type: String,
      required: true,
      index: true,
    },
    supplierName: {
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
    subcategory: String,
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    minOrderQuantity: {
      type: Number,
      required: true,
    },
    maxOrderQuantity: Number,
    stockAvailable: Number,
    unit: String,
    images: [String],
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
CatalogItemSchema.index({ supplierId: 1, isActive: 1 });
CatalogItemSchema.index({ category: 1, isActive: 1, price: 1 });
CatalogItemSchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });

const CatalogItem = (mongoose.models.CatalogItem as mongoose.Model<ICatalogItem>) || mongoose.model<ICatalogItem>('CatalogItem', CatalogItemSchema);

export default CatalogItem;
