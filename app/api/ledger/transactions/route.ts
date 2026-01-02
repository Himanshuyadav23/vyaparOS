import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import LedgerTransaction from '@/lib/mongodb/models/LedgerTransaction';
import { v4 as uuidv4 } from 'uuid';

async function getHandler(req: any) {
  try {
    await connectDB();

    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const creditorId = searchParams.get('creditorId');
    const debtorId = searchParams.get('debtorId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const query: any = {
      $or: [
        { creditorId: req.user.userId },
        { debtorId: req.user.userId },
      ],
    };

    if (creditorId) query.creditorId = creditorId;
    if (debtorId) query.debtorId = debtorId;
    if (status) query.status = status;
    if (type) query.type = type;

    const transactions = await LedgerTransaction.find(query)
      .sort({ createdAt: -1 });

    // Update overdue status
    const now = new Date();
    const updatedTransactions = transactions.map((tx) => {
      if (tx.status === 'pending' && tx.dueDate && tx.dueDate < now) {
        tx.status = 'overdue';
        tx.save();
      }
      return tx;
    });

    return NextResponse.json(updatedTransactions.map((tx) => ({
      id: tx.transactionId,
      transactionId: tx.transactionId,
      ...tx.toObject(),
    })));
  } catch (error: any) {
    console.error('Get ledger transactions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get ledger transactions' },
      { status: 500 }
    );
  }
}

async function postHandler(req: any) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      debtorId,
      debtorName,
      amount,
      type,
      description,
      invoiceNumber,
      invoiceUrl,
      dueDate,
      paymentMethod,
      notes,
      creditorShopId,
      debtorShopId,
    } = body;

    // Validate required fields
    if (!debtorId || !debtorName) {
      return NextResponse.json(
        { error: 'debtorId and debtorName are required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Get creditor (current user) info
    const User = (await import('@/lib/mongodb/models/User')).default;
    let creditor = await (User as any).findOne({ uid: req.user.userId });

    // In dev mode, create user if it doesn't exist
    if (!creditor && req.user.userId === 'dev-user-123') {
      creditor = new User({
        uid: 'dev-user-123',
        email: 'dev@vyaparos.com',
        password: 'dev-password-hash', // Not used in dev mode
        businessName: 'Dev Business',
        businessType: 'wholesaler',
        role: 'admin',
        verified: true,
      });
      await creditor.save();
    }

    if (!creditor) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Determine status
    let status: 'pending' | 'paid' | 'overdue' | 'cancelled' = 'pending';
    if (dueDate && new Date(dueDate) < new Date()) {
      status = 'overdue';
    }

    const transactionId = uuidv4();
    const transaction = new LedgerTransaction({
      transactionId,
      creditorId: creditor.uid,
      creditorName: creditor.businessName,
      creditorShopId,
      debtorId,
      debtorName,
      debtorShopId,
      amount,
      type: type || 'credit',
      description,
      invoiceNumber,
      invoiceUrl,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      paymentMethod,
      status,
      notes,
    });

    await transaction.save();

    return NextResponse.json(
      { id: transaction.transactionId, transactionId: transaction.transactionId, ...transaction.toObject() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create ledger transaction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ledger transaction' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);

