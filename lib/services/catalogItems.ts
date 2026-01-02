import { CatalogItem } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export interface CatalogItemFilters {
  supplierId?: string;
  shopId?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export async function getCatalogItems(
  filters?: CatalogItemFilters,
  limitCount?: number
): Promise<CatalogItem[]> {
  const params = new URLSearchParams();
  
  if (filters?.supplierId) params.append("supplierId", filters.supplierId);
  if (filters?.shopId) params.append("shopId", filters.shopId);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
  if (filters?.isFeatured !== undefined) params.append("isFeatured", String(filters.isFeatured));
  if (filters?.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
  if (limitCount) params.append("limit", String(limitCount));

  const queryString = params.toString();
  const endpoint = `/api/catalog-items${queryString ? `?${queryString}` : ""}`;
  
  return apiGet<CatalogItem[]>(endpoint);
}

export async function getCatalogItemById(
  id: string
): Promise<CatalogItem | null> {
  try {
    return await apiGet<CatalogItem>(`/api/catalog-items/${id}`);
  } catch (error) {
    return null;
  }
}

export async function createCatalogItem(
  data: Omit<CatalogItem, "id" | "catalogId" | "createdAt" | "updatedAt">
): Promise<string> {
  const result = await apiPost<{ id: string }>("/api/catalog-items", data);
  return result.id;
}

export async function updateCatalogItem(
  id: string,
  data: Partial<Omit<CatalogItem, "id" | "catalogId" | "createdAt" | "updatedAt">>
): Promise<void> {
  await apiPut(`/api/catalog-items/${id}`, data);
}

export async function deleteCatalogItem(id: string): Promise<void> {
  await apiDelete(`/api/catalog-items/${id}`);
}

export async function incrementCatalogViews(id: string): Promise<void> {
  // Views are automatically incremented when fetching the item
  await getCatalogItemById(id);
}

export async function incrementCatalogInquiries(id: string): Promise<void> {
  // This would need a separate endpoint or be handled in the update
  const item = await getCatalogItemById(id);
  if (item) {
    await updateCatalogItem(id, {
      inquiries: (item.inquiries || 0) + 1,
    });
  }
}
