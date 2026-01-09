import { MarketSignal } from "@/types";
import { apiGet } from "./api";

export async function getMarketSignals(filters?: {
  category?: string;
  signalType?: MarketSignal["signalType"];
  region?: string;
  limitCount?: number;
}): Promise<MarketSignal[]> {
  const params = new URLSearchParams();
  
  if (filters?.category) params.append("category", filters.category);
  if (filters?.signalType) params.append("signalType", filters.signalType);
  if (filters?.region) params.append("region", filters.region);
  if (filters?.limitCount) params.append("limit", String(filters.limitCount));

  const queryString = params.toString();
  const endpoint = `/api/market-signals${queryString ? `?${queryString}` : ""}`;
  
  try {
    const items = await apiGet<any[]>(endpoint);
    return items.map((item) => ({
      ...item,
      id: item.id || item._id?.toString(),
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
    })) as MarketSignal[];
  } catch (error) {
    console.error("Error fetching market signals:", error);
    return [];
  }
}

export async function getAggregatedSignals(
  category?: string
): Promise<Record<string, any>> {
  try {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    
    const queryString = params.toString();
    const endpoint = `/api/market-signals/aggregated${queryString ? `?${queryString}` : ""}`;
    
    return await apiGet<Record<string, any>>(endpoint);
  } catch (error) {
    console.error("Error fetching aggregated signals:", error);
    return {};
  }
}
