import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketSignal extends Document {
  category: string;
  signalType: 'price_trend' | 'demand_surge' | 'supply_shortage' | 'new_product';
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketSignalSchema = new Schema<IMarketSignal>(
  {
    category: {
      type: String,
      required: true,
      index: true,
    },
    signalType: {
      type: String,
      enum: ['price_trend', 'demand_surge', 'supply_shortage', 'new_product'],
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    changePercent: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
MarketSignalSchema.index({ category: 1, signalType: 1, timestamp: -1 });
MarketSignalSchema.index({ region: 1, timestamp: -1 });

const MarketSignal = (mongoose.models.MarketSignal as mongoose.Model<IMarketSignal>) || mongoose.model<IMarketSignal>('MarketSignal', MarketSignalSchema);

export default MarketSignal;
