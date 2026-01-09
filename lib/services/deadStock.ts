import { DeadStock } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export async function getDeadStockList(filters?: {
  category?: string;
  status?: DeadStock["status"];
  sellerId?: string;
}): Promise<DeadStock[]> {
  const params = new URLSearchParams();
  
  if (filters?.category) params.append("category", filters.category);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.sellerId) params.append("sellerId", filters.sellerId);

  const queryString = params.toString();
  const endpoint = `/api/dead-stock${queryString ? `?${queryString}` : ""}`;
  
  const items = await apiGet<any[]>(endpoint);
  return items.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
    soldAt: item.soldAt ? new Date(item.soldAt) : undefined,
  })) as DeadStock[];
}

export async function getDeadStockById(id: string): Promise<DeadStock | null> {
  try {
    const item = await apiGet<any>(`/api/dead-stock/${id}`);
    return {
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
      soldAt: item.soldAt ? new Date(item.soldAt) : undefined,
    } as DeadStock;
  } catch (error) {
    return null;
  }
}

export async function createDeadStock(
  data: Omit<DeadStock, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const result = await apiPost<{ id: string }>("/api/dead-stock", data);
  return result.id;
}

export async function updateDeadStock(
  id: string,
  data: Partial<Omit<DeadStock, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  await apiPut(`/api/dead-stock/${id}`, data);
}

export async function deleteDeadStock(id: string): Promise<void> {
  await apiDelete(`/api/dead-stock/${id}`);
}
