import { Supplier } from "@/types";
import { apiGet, apiPost, apiPut } from "./api";

export async function getSuppliers(filters?: {
  category?: string;
  verified?: boolean;
  city?: string;
  state?: string;
}): Promise<Supplier[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.verified !== undefined) params.append("verified", String(filters.verified));
    if (filters?.city) params.append("city", filters.city);
    if (filters?.state) params.append("state", filters.state);

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/api/suppliers?${queryString}` 
      : "/api/suppliers";
    
    const response = await apiGet<Supplier[]>(endpoint);
    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);
    throw new Error(error.message || "Failed to fetch suppliers");
  }
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const response = await apiGet<Supplier>(`/api/suppliers/${id}`);
    return response;
  } catch (error: any) {
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      return null;
    }
    console.error("Error fetching supplier:", error);
    throw error;
  }
}

export async function createSupplier(
  data: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt" | "userId" | "verified" | "rating" | "totalTransactions">> & {
    businessName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }
): Promise<string> {
  try {
    const response = await apiPost<{ id: string } & Supplier>(
      "/api/suppliers",
      data
    );
    return response.id || (response as any)._id;
  } catch (error: any) {
    console.error("Error creating supplier:", error);
    throw new Error(error.message || "Failed to create supplier");
  }
}

export async function updateSupplier(
  id: string,
  data: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    await apiPut(`/api/suppliers/${id}`, data);
  } catch (error: any) {
    console.error("Error updating supplier:", error);
    throw new Error(error.message || "Failed to update supplier");
  }
}
