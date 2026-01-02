import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import LedgerTransaction from '@/lib/mongodb/models/LedgerTransaction';

async function getHandler(req: any, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await connectDB();

    const transaction = await LedgerTransaction.findOne({ transactionId: params.id });
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check access
    if (transaction.creditorId !== req.user.userId && transaction.debtorId !== req.user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: transaction.transactionId,
      transactionId: transaction.transactionId,
      ...transaction.toObject(),
    });
  } catch (error: any) {
    console.error('Get transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get transaction' },
      { status: 500 }
    );
  }
}

async function putHandler(req: any, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    await connectDB();

    const transaction = await LedgerTransaction.findOne({ transactionId: params.id });
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check access
    if (transaction.creditorId !== req.user.userId && transaction.debtorId !== req.user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = { ...body };
    delete updateData.transactionId;
    delete updateData.creditorId;
    delete updateData.debtorId;

    // Auto-update status if marking as paid
    if (updateData.status === 'paid' && !updateData.paidDate) {
      updateData.paidDate = new Date();
    }

    Object.assign(transaction, updateData);
    await transaction.save();

    return NextResponse.json({
      id: transaction.transactionId,
      transactionId: transaction.transactionId,
      ...transaction.toObject(),
    });
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export const GET = getHandler;
export const PUT = putHandler;

