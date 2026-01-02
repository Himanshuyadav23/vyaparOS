import { CatalogItem } from "@/types";
import { apiGet } from "./api";

// This file is for catalog-related utilities
// Main catalog operations are in catalogItems.ts

export async function getCatalogByShop(shopId: string): Promise<CatalogItem[]> {
  try {
    return await apiGet<CatalogItem[]>(`/api/catalog-items?shopId=${shopId}`);
  } catch (error) {
    console.error("Error fetching catalog by shop:", error);
    return [];
  }
}
