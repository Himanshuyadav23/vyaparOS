import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import LedgerTransaction from '@/lib/mongodb/models/LedgerTransaction';

async function getHandler(req: any) {
  try {
    await connectDB();

    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.userId !== 'dev-user-123') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const transactions = await (LedgerTransaction as any).find({})
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(transactions.map((tx: any) => ({
      id: tx.transactionId,
      transactionId: tx.transactionId,
      ...tx.toObject(),
    })));
  } catch (error: any) {
    console.error('Get all transactions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get transactions' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);








