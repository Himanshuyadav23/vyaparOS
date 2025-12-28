import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MarketStats } from "@/types";

const COLLECTION = "marketStats";

export interface MarketStatsFilters {
  date?: Date;
  metric?: MarketStats["metric"];
  category?: string;
  region?: string;
  days?: number; // Get stats for last N days
}

export async function getMarketStats(
  filters?: MarketStatsFilters
): Promise<MarketStats[]> {
  if (!db) throw new Error("Firestore not initialized");

  let q = query(collection(db, COLLECTION), orderBy("date", "desc"));

  if (filters?.metric) {
    q = query(q, where("metric", "==", filters.metric));
  }
  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.region) {
    q = query(q, where("region", "==", filters.region));
  }

  if (filters?.days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.days);
    q = query(q, where("date", ">=", Timestamp.fromDate(cutoffDate)));
  }

  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      statId: data.statId || doc.id,
      ...data,
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as MarketStats;
  });
}

export async function getLatestMarketStats(
  metric: MarketStats["metric"]
): Promise<MarketStats | null> {
  if (!db) throw new Error("Firestore not initialized");

  const q = query(
    collection(db, COLLECTION),
    where("metric", "==", metric),
    orderBy("date", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return {
    id: snapshot.docs[0].id,
    statId: data.statId || snapshot.docs[0].id,
    ...data,
    date: data.date?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as MarketStats;
}

