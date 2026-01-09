import { NextResponse } from "next/server";
import { withOptionalAuth } from "@/lib/middleware/auth";
import connectDB from "@/lib/mongodb/connect";
import DeadStockListing from "@/lib/mongodb/models/DeadStockListing";
import CatalogItem from "@/lib/mongodb/models/CatalogItem";
import LedgerTransaction from "@/lib/mongodb/models/LedgerTransaction";
import MarketStats from "@/lib/mongodb/models/MarketStats";
import { v4 as uuidv4 } from 'uuid';

// Helper to get start of day
function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

// Helper to format date for statId
function formatDateForId(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

async function postHandler(req: any) {
  try {
    await connectDB();

    const today = getStartOfDay(new Date());
    const todayStr = formatDateForId(today);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Compute Top Dead Stock Categories
    const deadStockListings = await DeadStockListing.find({
      status: "available",
      createdAt: { $gte: thirtyDaysAgo },
    });

    const deadStockByCategory: Record<
      string,
      { count: number; totalValue: number }
    > = {};
    deadStockListings.forEach((listing) => {
      const category = listing.category || "Other";
      if (!deadStockByCategory[category]) {
        deadStockByCategory[category] = { count: 0, totalValue: 0 };
      }
      deadStockByCategory[category].count++;
      deadStockByCategory[category].totalValue += listing.discountPrice || 0;
    });

    const topDeadStockCategories = Object.entries(deadStockByCategory)
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        totalValue: stats.totalValue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 2. Compute Top Demanded Categories (from catalog views/inquiries)
    const catalogItems = await CatalogItem.find({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const demandByCategory: Record<
      string,
      { views: number; inquiries: number; items: number }
    > = {};
    catalogItems.forEach((item) => {
      const category = item.category || "Other";
      if (!demandByCategory[category]) {
        demandByCategory[category] = { views: 0, inquiries: 0, items: 0 };
      }
      demandByCategory[category].views += item.views || 0;
      demandByCategory[category].inquiries += item.inquiries || 0;
      demandByCategory[category].items++;
    });

    const topDemandedCategories = Object.entries(demandByCategory)
      .map(([category, stats]) => ({
        category,
        demandScore: stats.views * 0.5 + stats.inquiries * 2 + stats.items,
        views: stats.views,
        inquiries: stats.inquiries,
        items: stats.items,
      }))
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 10);

    // 3. Compute Average Payment Delay
    const paidTransactions = await LedgerTransaction.find({
      status: "paid",
      paidDate: { $gte: thirtyDaysAgo },
    });

    let totalDelayDays = 0;
    let transactionCount = 0;

    paidTransactions.forEach((tx) => {
      if (tx.dueDate && tx.paidDate) {
        const delayDays = Math.max(
          0,
          Math.ceil(
            (tx.paidDate.getTime() - tx.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        );
        totalDelayDays += delayDays;
        transactionCount++;
      }
    });

    const avgPaymentDelay = transactionCount > 0 ? totalDelayDays / transactionCount : 0;

    // Store or update stats
    const statsToCreate = [
      {
        statId: `${todayStr}-top_dead_stock_categories`,
        date: today,
        category: "all",
        signalType: "price_trend" as const,
        region: "all",
        value: topDeadStockCategories.length > 0 ? topDeadStockCategories[0].count : 0,
        change: 0,
        changePercent: 0,
        sampleSize: deadStockListings.length,
        metadata: {
          topCategories: topDeadStockCategories,
        },
      },
      {
        statId: `${todayStr}-top_demanded_categories`,
        date: today,
        category: "all",
        signalType: "demand_surge" as const,
        region: "all",
        value: topDemandedCategories.length > 0 ? topDemandedCategories[0].demandScore : 0,
        change: 0,
        changePercent: 0,
        sampleSize: catalogItems.length,
        metadata: {
          topCategories: topDemandedCategories.map((c) => ({
            category: c.category,
            count: c.items,
            totalValue: c.demandScore,
          })),
        },
      },
      {
        statId: `${todayStr}-avg_payment_delay`,
        date: today,
        category: "all",
        signalType: "price_trend" as const,
        region: "all",
        value: avgPaymentDelay,
        change: 0,
        changePercent: 0,
        sampleSize: transactionCount,
        metadata: {
          avgDelayDays: avgPaymentDelay,
          totalTransactions: transactionCount,
        },
      },
    ];

    // Check if stats already exist for today and update/create
    for (const stat of statsToCreate) {
      const existing = await MarketStats.findOne({ statId: stat.statId });

      if (existing) {
        // Update existing
        Object.assign(existing, stat);
        await existing.save();
      } else {
        // Create new
        const newStat = new MarketStats(stat);
        await newStat.save();
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        topDeadStockCategories,
        topDemandedCategories,
        avgPaymentDelay: Math.round(avgPaymentDelay * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error("Error computing market stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compute market stats" },
      { status: 500 }
    );
  }
}

export const POST = withOptionalAuth(postHandler);
