import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketStats extends Document {
  statId: string;
  date: Date;
  metric: 'top_dead_stock_categories' | 'top_demanded_categories' | 'avg_payment_delay';
  category?: string;
  region?: string;
  value: number;
  change?: number;
  changePercent?: number;
  metadata: {
    topCategories?: Array<{ category: string; count: number; totalValue: number }>;
    avgDelayDays?: number;
    totalTransactions?: number;
    sampleSize?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MarketStatsSchema = new Schema<IMarketStats>(
  {
    statId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    metric: {
      type: String,
      enum: ['top_dead_stock_categories', 'top_demanded_categories', 'avg_payment_delay'],
      required: true,
      index: true,
    },
    category: String,
    region: String,
    value: {
      type: Number,
      required: true,
    },
    change: Number,
    changePercent: Number,
    metadata: {
      topCategories: [
        {
          category: String,
          count: Number,
          totalValue: Number,
        },
      ],
      avgDelayDays: Number,
      totalTransactions: Number,
      sampleSize: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MarketStatsSchema.index({ date: -1, metric: 1 });
MarketStatsSchema.index({ category: 1, date: -1 });
MarketStatsSchema.index({ region: 1, date: -1 });

const MarketStats = (mongoose.models.MarketStats as mongoose.Model<IMarketStats>) || mongoose.model<IMarketStats>('MarketStats', MarketStatsSchema);

export default MarketStats;
