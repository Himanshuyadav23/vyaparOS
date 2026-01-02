import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import MarketSignal from '@/lib/mongodb/models/MarketSignal';

async function getHandler(req: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const query: any = {};
    if (category) query.category = category;

    // Get all signals matching the query
    const signals = await (MarketSignal as any).find(query);

    // Aggregate by signal type
    const aggregated: Record<string, any> = {};

    signals.forEach((signal: any) => {
      const type = signal.signalType;
      if (!aggregated[type]) {
        aggregated[type] = {
          count: 0,
          totalValue: 0,
          totalChange: 0,
          avgValue: 0,
          avgChange: 0,
        };
      }

      aggregated[type].count++;
      aggregated[type].totalValue += signal.value;
      aggregated[type].totalChange += signal.changePercent;
    });

    // Calculate averages
    Object.keys(aggregated).forEach((type) => {
      const data = aggregated[type];
      data.avgValue = data.count > 0 ? data.totalValue / data.count : 0;
      data.avgChange = data.count > 0 ? data.totalChange / data.count : 0;
    });

    return NextResponse.json(aggregated);
  } catch (error: any) {
    console.error('Get aggregated signals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get aggregated signals' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);

