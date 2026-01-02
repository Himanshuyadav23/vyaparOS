import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketStats extends Document {
  statId: string;
  date: Date;
  category: string;
  signalType: 'price_trend' | 'demand_surge' | 'supply_shortage' | 'new_product';
  region: string;
  value: number;
  change: number;
  changePercent: number;
  sampleSize: number;
  metadata: {
    minPrice?: number;
    maxPrice?: number;
    avgPrice?: number;
    totalListings?: number;
    totalInquiries?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MarketStatsSchema = new Schema<IMarketStats>(
  {
    statId: { type: String, required: true, unique: true },
    date: { type: Date, required: true, index: -1 },
    category: { type: String, required: true, index: true },
    signalType: {
      type: String,
      enum: ['price_trend', 'demand_surge', 'supply_shortage', 'new_product'],
      required: true,
      index: true,
    },
    region: { type: String, required: true, index: true },
    value: { type: Number, required: true },
    change: { type: Number, default: 0 },
    changePercent: { type: Number, default: 0 },
    sampleSize: { type: Number, default: 0 },
    metadata: {
      minPrice: Number,
      maxPrice: Number,
      avgPrice: Number,
      totalListings: Number,
      totalInquiries: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MarketStatsSchema.index({ date: -1, category: 1, signalType: 1 });
MarketStatsSchema.index({ date: -1, region: 1, signalType: 1 });

export default mongoose.models.MarketStats || mongoose.model<IMarketStats>('MarketStats', MarketStatsSchema);

