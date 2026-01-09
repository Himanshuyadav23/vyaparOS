import mongoose, { Schema, Document } from 'mongoose';

export interface ILedgerTransaction extends Document {
  transactionId: string;
  creditorId: string;
  creditorName: string;
  creditorShopId?: string;
  debtorId: string;
  debtorName: string;
  debtorShopId?: string;
  amount: number;
  type: 'credit' | 'debit' | 'payment' | 'adjustment';
  description: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  dueDate?: Date;
  paidDate?: Date;
  paymentMethod?: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  relatedTransactionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerTransactionSchema = new Schema<ILedgerTransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    creditorId: {
      type: String,
      required: true,
      index: true,
    },
    creditorName: {
      type: String,
      required: true,
    },
    creditorShopId: String,
    debtorId: {
      type: String,
      required: true,
      index: true,
    },
    debtorName: {
      type: String,
      required: true,
    },
    debtorShopId: String,
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'payment', 'adjustment'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    invoiceNumber: String,
    invoiceUrl: String,
    dueDate: {
      type: Date,
      index: true,
    },
    paidDate: Date,
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi', 'cheque'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
      index: true,
    },
    relatedTransactionId: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
LedgerTransactionSchema.index({ creditorId: 1, status: 1, createdAt: -1 });
LedgerTransactionSchema.index({ debtorId: 1, status: 1, createdAt: -1 });
LedgerTransactionSchema.index({ status: 1, dueDate: 1 });

const LedgerTransaction = (mongoose.models.LedgerTransaction as mongoose.Model<ILedgerTransaction>) || mongoose.model<ILedgerTransaction>('LedgerTransaction', LedgerTransactionSchema);

export default LedgerTransaction;
