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
  totalTransactions: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    userId: { type: String, required: true, index: true },
    businessName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    pincode: { type: String, required: true },
    categories: [{ type: String }],
    specialties: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTransactions: { type: Number, default: 0 },
    verified: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
SupplierSchema.index({ city: 1, verified: 1 });
SupplierSchema.index({ state: 1, categories: 1 });
SupplierSchema.index({ rating: -1 });

const SupplierModel = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default SupplierModel as mongoose.Model<ISupplier>;



