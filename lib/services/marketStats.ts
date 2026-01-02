import { MarketStats } from "@/types";
import { apiGet } from "./api";

export interface MarketStatsFilters {
  date?: Date;
  category?: string;
  metric?: string;
  days?: number;
}

export async function getMarketStats(
  filters?: MarketStatsFilters
): Promise<MarketStats[]> {
  const params = new URLSearchParams();
  
  if (filters?.date) params.append("date", filters.date.toISOString());
  if (filters?.category) params.append("category", filters.category);
  if (filters?.metric) params.append("metric", filters.metric);
  if (filters?.days) params.append("days", String(filters.days));

  const queryString = params.toString();
  const endpoint = `/api/market-stats${queryString ? `?${queryString}` : ""}`;
  
  try {
    const items = await apiGet<any[]>(endpoint);
    return items.map((item) => ({
      ...item,
      date: new Date(item.date),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })) as MarketStats[];
  } catch (error) {
    console.error("Error fetching market stats:", error);
    return [];
  }
}

export async function getLatestMarketStats(
  metric: string
): Promise<MarketStats | null> {
  try {
    const stats = await getMarketStats({ metric, days: 1 });
    return stats.length > 0 ? stats[0] : null;
  } catch (error) {
    return null;
  }
}
