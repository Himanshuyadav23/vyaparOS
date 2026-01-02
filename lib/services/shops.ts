import { Shop } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export interface ShopFilters {
  ownerId?: string;
  city?: string;
  state?: string;
  shopType?: Shop["shopType"];
  verified?: boolean;
  isActive?: boolean;
}

export async function getShops(filters?: ShopFilters): Promise<Shop[]> {
  const params = new URLSearchParams();
  
  if (filters?.ownerId) params.append("ownerId", filters.ownerId);
  if (filters?.city) params.append("city", filters.city);
  if (filters?.state) params.append("state", filters.state);
  if (filters?.shopType) params.append("shopType", filters.shopType);
  if (filters?.verified !== undefined) params.append("verified", String(filters.verified));
  if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));

  const queryString = params.toString();
  const endpoint = `/api/shops${queryString ? `?${queryString}` : ""}`;
  
  try {
    const items = await apiGet<any[]>(endpoint);
    return items.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })) as Shop[];
  } catch (error) {
    console.error("Error fetching shops:", error);
    return [];
  }
}

export async function getShopById(id: string): Promise<Shop | null> {
  try {
    const item = await apiGet<any>(`/api/shops/${id}`);
    return {
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    } as Shop;
  } catch (error) {
    return null;
  }
}

export async function createShop(
  data: Omit<Shop, "shopId" | "createdAt" | "updatedAt">
): Promise<string> {
  const result = await apiPost<{ shopId: string }>("/api/shops", data);
  return result.shopId;
}

export async function updateShop(
  id: string,
  data: Partial<Omit<Shop, "shopId" | "createdAt" | "updatedAt">>
): Promise<void> {
  await apiPut(`/api/shops/${id}`, data);
}

export async function deleteShop(id: string): Promise<void> {
  await apiDelete(`/api/shops/${id}`);
}
