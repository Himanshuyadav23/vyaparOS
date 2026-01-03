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
    category: { type: String, required: true, index: true },
    signalType: {
      type: String,
      enum: ['price_trend', 'demand_surge', 'supply_shortage', 'new_product'],
      required: true,
      index: true,
    },
    value: { type: Number, required: true },
    change: { type: Number, default: 0 },
    changePercent: { type: Number, default: 0 },
    timestamp: { type: Date, required: true, index: -1 },
    region: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
MarketSignalSchema.index({ category: 1, signalType: 1, timestamp: -1 });
MarketSignalSchema.index({ region: 1, timestamp: -1 });

const MarketSignalModel = mongoose.models.MarketSignal || mongoose.model<IMarketSignal>('MarketSignal', MarketSignalSchema);
export default MarketSignalModel as mongoose.Model<IMarketSignal>;



