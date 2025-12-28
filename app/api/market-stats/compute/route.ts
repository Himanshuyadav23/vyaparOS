import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { MarketStats } from "@/types";

const COLLECTION = "marketStats";

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

export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const today = getStartOfDay(new Date());
    const todayStr = formatDateForId(today);

    // 1. Compute Top Dead Stock Categories
    const deadStockQuery = query(
      collection(db, "deadStockListings"),
      where("status", "==", "available"),
      where("createdAt", ">=", Timestamp.fromDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))) // Last 30 days
    );
    const deadStockSnapshot = await getDocs(deadStockQuery);

    const deadStockByCategory: Record<
      string,
      { count: number; totalValue: number }
    > = {};
    deadStockSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const category = data.category || "Other";
      if (!deadStockByCategory[category]) {
        deadStockByCategory[category] = { count: 0, totalValue: 0 };
      }
      deadStockByCategory[category].count++;
      deadStockByCategory[category].totalValue += data.discountPrice || 0;
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
    const catalogQuery = query(
      collection(db, "catalogItems"),
      where("isActive", "==", true),
      where("createdAt", ">=", Timestamp.fromDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)))
    );
    const catalogSnapshot = await getDocs(catalogQuery);

    const demandByCategory: Record<
      string,
      { views: number; inquiries: number; items: number }
    > = {};
    catalogSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const category = data.category || "Other";
      if (!demandByCategory[category]) {
        demandByCategory[category] = { views: 0, inquiries: 0, items: 0 };
      }
      demandByCategory[category].views += data.views || 0;
      demandByCategory[category].inquiries += data.inquiries || 0;
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
    // Get all paid transactions from last 30 days
    const ledgerQuery = query(
      collection(db, "ledgerTransactions"),
      where("status", "==", "paid"),
      where("paidDate", ">=", Timestamp.fromDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)))
    );
    const ledgerSnapshot = await getDocs(ledgerQuery);

    let totalDelayDays = 0;
    let transactionCount = 0;

    ledgerSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Filter client-side for transactions with both dueDate and paidDate
      if (data.dueDate && data.paidDate) {
        const dueDate = data.dueDate.toDate();
        const paidDate = data.paidDate.toDate();
        const delayDays = Math.max(0, Math.ceil((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        totalDelayDays += delayDays;
        transactionCount++;
      }
    });

    const avgPaymentDelay = transactionCount > 0 ? totalDelayDays / transactionCount : 0;

    // Get previous day's stats for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateForId(yesterday);

    // Store or update stats
    const statsToCreate: MarketStats[] = [
      {
        statId: `${todayStr}-top_dead_stock_categories`,
        date: today,
        metric: "top_dead_stock_categories",
        value: topDeadStockCategories.length > 0 ? topDeadStockCategories[0].count : 0,
        metadata: {
          topCategories: topDeadStockCategories,
          sampleSize: deadStockSnapshot.size,
        },
      } as MarketStats,
      {
        statId: `${todayStr}-top_demanded_categories`,
        date: today,
        metric: "top_demanded_categories",
        value: topDemandedCategories.length > 0 ? topDemandedCategories[0].demandScore : 0,
        metadata: {
          topCategories: topDemandedCategories.map((c) => ({
            category: c.category,
            count: c.items,
            totalValue: c.demandScore,
          })),
          sampleSize: catalogSnapshot.size,
        },
      } as MarketStats,
      {
        statId: `${todayStr}-avg_payment_delay`,
        date: today,
        metric: "avg_payment_delay",
        value: avgPaymentDelay,
        metadata: {
          avgDelayDays: avgPaymentDelay,
          totalTransactions: transactionCount,
        },
      } as MarketStats,
    ];

    // Check if stats already exist for today
    for (const stat of statsToCreate) {
      const existingQuery = query(
        collection(db, COLLECTION),
        where("statId", "==", stat.statId),
        limit(1)
      );
      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        // Update existing
        const docRef = doc(db!, COLLECTION, existing.docs[0].id);
        await updateDoc(docRef, {
          ...stat,
          updatedAt: Timestamp.now(),
        });
      } else {
        // Create new
        await addDoc(collection(db, COLLECTION), {
          ...stat,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          date: Timestamp.fromDate(stat.date),
        });
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

