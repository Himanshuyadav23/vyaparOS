import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import MarketSignal from '@/lib/mongodb/models/MarketSignal';

async function getHandler(req: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const signalType = searchParams.get('signalType');
    const region = searchParams.get('region');
    const limit = searchParams.get('limit');

    const query: any = {};

    if (category) query.category = category;
    if (signalType) query.signalType = signalType;
    if (region) query.region = region;

    let signalsQuery = (MarketSignal as any).find(query).sort({ timestamp: -1 });
    
    if (limit) {
      signalsQuery = signalsQuery.limit(Number(limit));
    }

    const signals = await signalsQuery;

    return NextResponse.json(signals.map((signal: any) => ({
      id: signal._id.toString(),
      ...signal.toObject(),
    })));
  } catch (error: any) {
    console.error('Get market signals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get market signals' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);

