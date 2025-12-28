import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CatalogItem } from "@/types";

const COLLECTION = "catalogItems";

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
  if (!db) throw new Error("Firestore not initialized");

  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  if (filters?.supplierId) {
    q = query(q, where("supplierId", "==", filters.supplierId));
  }
  if (filters?.shopId) {
    q = query(q, where("shopId", "==", filters.shopId));
  }
  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.isActive !== undefined) {
    q = query(q, where("isActive", "==", filters.isActive));
  }
  if (filters?.isFeatured !== undefined) {
    q = query(q, where("isFeatured", "==", filters.isFeatured));
  }

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  let items = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      catalogId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as CatalogItem;
  });

  // Client-side price filtering (Firestore doesn't support range queries on multiple fields easily)
  if (filters?.minPrice !== undefined) {
    items = items.filter((item) => item.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    items = items.filter((item) => item.price <= filters.maxPrice!);
  }

  return items;
}

export async function getCatalogItemById(
  id: string
): Promise<CatalogItem | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    catalogId: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as CatalogItem;
}

export async function createCatalogItem(
  data: Omit<CatalogItem, "id" | "catalogId" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    views: 0,
    inquiries: 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateCatalogItem(
  id: string,
  data: Partial<Omit<CatalogItem, "id" | "catalogId" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteCatalogItem(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  await deleteDoc(doc(db, COLLECTION, id));
}

export async function incrementCatalogViews(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    views: increment(1),
  });
}

export async function incrementCatalogInquiries(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    inquiries: increment(1),
  });
}

