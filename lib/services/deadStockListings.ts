import { DeadStock } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

const COLLECTION = "deadStockListings";

export interface DeadStockListingFilters {
  category?: string;
  status?: DeadStock["status"];
  sellerId?: string;
  city?: string;
  state?: string;
  minDiscount?: number;
}

export async function getDeadStockListings(
  filters?: DeadStockListingFilters,
  limitCount?: number
): Promise<DeadStock[]> {
  const params = new URLSearchParams();
  
  if (filters?.category) params.append("category", filters.category);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.sellerId) params.append("sellerId", filters.sellerId);
  if (filters?.city) params.append("city", filters.city);
  if (filters?.state) params.append("state", filters.state);
  if (limitCount) params.append("limit", String(limitCount));

  const queryString = params.toString();
  const endpoint = `/api/dead-stock${queryString ? `?${queryString}` : ""}`;
  
  const items = await apiGet<any[]>(endpoint);
  return items.map((item) => ({
    ...item,
    id: item.listingId || item.id,
    listingId: item.listingId || item.id,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
    soldAt: item.soldAt ? new Date(item.soldAt) : undefined,
  })) as DeadStock[];
}

export async function getDeadStockListingById(
  id: string
): Promise<DeadStock | null> {
  try {
    const item = await apiGet<any>(`/api/dead-stock/${id}`);
    return {
      ...item,
      id: item.listingId || item.id,
      listingId: item.listingId || item.id,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
      soldAt: item.soldAt ? new Date(item.soldAt) : undefined,
    } as DeadStock;
  } catch (error) {
    return null;
  }
}

export async function createDeadStockListing(
  data: Omit<DeadStock, "id" | "listingId" | "createdAt" | "updatedAt">
): Promise<string> {
  // Calculate discount percent
  const discountPercent =
    data.originalPrice > 0
      ? ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
      : 0;

  const result = await apiPost<{ id: string; listingId: string }>("/api/dead-stock", {
    ...data,
    discountPercent: Math.round(discountPercent * 100) / 100,
    status: data.status || "available",
  });
  
  return result.id || result.listingId;
}

export async function updateDeadStockListing(
  id: string,
  data: Partial<Omit<DeadStock, "id" | "listingId" | "createdAt" | "updatedAt">>
): Promise<void> {
  // Recalculate discount percent if prices changed
  if (data.originalPrice !== undefined || data.discountPrice !== undefined) {
    const current = await getDeadStockListingById(id);
    if (current) {
      const originalPrice = data.originalPrice ?? current.originalPrice;
      const discountPrice = data.discountPrice ?? current.discountPrice;
      const discountPercent =
        originalPrice > 0
          ? ((originalPrice - discountPrice) / originalPrice) * 100
          : 0;
      data.discountPercent = Math.round(discountPercent * 100) / 100;
    }
  }

  await apiPut(`/api/dead-stock/${id}`, data);
}

export async function deleteDeadStockListing(id: string): Promise<void> {
  await apiDelete(`/api/dead-stock/${id}`);
}

export async function incrementViews(id: string): Promise<void> {
  // Views are automatically incremented when fetching the item
  await getDeadStockListingById(id);
}

export async function incrementInquiries(id: string): Promise<void> {
  // This would need a separate endpoint or be handled in the update
  const item = await getDeadStockListingById(id);
  if (item) {
    await updateDeadStockListing(id, {
      inquiries: (item.inquiries || 0) + 1,
    });
  }
}
