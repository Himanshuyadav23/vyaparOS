import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/mongodb/connect';
import MarketStats from '@/lib/mongodb/models/MarketStats';

async function getHandler(req: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const category = searchParams.get('category');
    const metric = searchParams.get('metric');
    const days = searchParams.get('days');

    const query: any = {};

    if (date) {
      const dateObj = new Date(date);
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      };
    } else if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(days));
      query.date = { $gte: daysAgo };
    }

    if (category) query.category = category;
    if (metric) query.signalType = metric; // Using signalType as metric filter

    const stats = await MarketStats.find(query)
      .sort({ date: -1 });

    return NextResponse.json(stats.map((stat) => ({
      id: stat.statId,
      statId: stat.statId,
      ...stat.toObject(),
    })));
  } catch (error: any) {
    console.error('Get market stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get market stats' },
      { status: 500 }
    );
  }
}

export const GET = withOptionalAuth(getHandler);








