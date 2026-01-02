import { Supplier } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export async function getSuppliers(filters?: {
  category?: string;
  verified?: boolean;
  city?: string;
  state?: string;
}): Promise<Supplier[]> {
  const params = new URLSearchParams();
  
  if (filters?.category) params.append("category", filters.category);
  if (filters?.verified !== undefined) params.append("verified", String(filters.verified));
  if (filters?.city) params.append("city", filters.city);
  if (filters?.state) params.append("state", filters.state);

  const queryString = params.toString();
  const endpoint = `/api/suppliers${queryString ? `?${queryString}` : ""}`;
  
  try {
    const items = await apiGet<any[]>(endpoint);
    return items.map((item) => ({
      ...item,
      id: item.id || item._id?.toString(),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })) as Supplier[];
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const item = await apiGet<any>(`/api/suppliers/${id}`);
    return {
      ...item,
      id: item.id || item._id?.toString(),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    } as Supplier;
  } catch (error) {
    return null;
  }
}

export async function createSupplier(
  data: Omit<Supplier, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const result = await apiPost<{ id: string }>("/api/suppliers", data);
  return result.id || result._id?.toString() || "";
}

export async function updateSupplier(
  id: string,
  data: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  await apiPut(`/api/suppliers/${id}`, data);
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiDelete(`/api/suppliers/${id}`);
}
