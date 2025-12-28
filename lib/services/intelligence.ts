import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MarketSignal } from "@/types";

const COLLECTION = "marketSignals";

export async function getMarketSignals(filters?: {
  category?: string;
  signalType?: MarketSignal["signalType"];
  region?: string;
  limitCount?: number;
}) {
  if (!db) throw new Error("Firestore not initialized");
  let q = query(collection(db, COLLECTION), orderBy("timestamp", "desc"));

  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.signalType) {
    q = query(q, where("signalType", "==", filters.signalType));
  }
  if (filters?.region) {
    q = query(q, where("region", "==", filters.region));
  }
  if (filters?.limitCount) {
    q = query(q, limit(filters.limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate(),
  })) as MarketSignal[];
}

export async function getAggregatedSignals(category?: string) {
  const signals = await getMarketSignals({ category, limitCount: 100 });
  
  // Aggregate by signal type
  const aggregated: Record<string, {
    count: number;
    avgValue: number;
    avgChange: number;
    latest: MarketSignal;
  }> = {};

  signals.forEach((signal) => {
    if (!aggregated[signal.signalType]) {
      aggregated[signal.signalType] = {
        count: 0,
        avgValue: 0,
        avgChange: 0,
        latest: signal,
      };
    }
    const agg = aggregated[signal.signalType];
    agg.count++;
    agg.avgValue += signal.value;
    agg.avgChange += signal.change;
    if (signal.timestamp > agg.latest.timestamp) {
      agg.latest = signal;
    }
  });

  Object.keys(aggregated).forEach((key) => {
    const agg = aggregated[key];
    agg.avgValue = agg.avgValue / agg.count;
    agg.avgChange = agg.avgChange / agg.count;
  });

  return aggregated;
}

