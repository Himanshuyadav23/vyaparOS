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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Shop } from "@/types";

const COLLECTION = "shops";

export interface ShopFilters {
  ownerId?: string;
  shopType?: Shop["shopType"];
  city?: string;
  state?: string;
  category?: string;
  verified?: boolean;
  isActive?: boolean;
}

export async function getShops(
  filters?: ShopFilters,
  limitCount?: number
): Promise<Shop[]> {
  if (!db) throw new Error("Firestore not initialized");

  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  if (filters?.ownerId) {
    q = query(q, where("ownerId", "==", filters.ownerId));
  }
  if (filters?.shopType) {
    q = query(q, where("shopType", "==", filters.shopType));
  }
  if (filters?.city) {
    q = query(q, where("address.city", "==", filters.city));
  }
  if (filters?.state) {
    q = query(q, where("address.state", "==", filters.state));
  }
  if (filters?.verified !== undefined) {
    q = query(q, where("verified", "==", filters.verified));
  }
  if (filters?.isActive !== undefined) {
    q = query(q, where("isActive", "==", filters.isActive));
  }

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  let shops = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      shopId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Shop;
  });

  // Client-side category filtering (Firestore array-contains only works for exact matches)
  if (filters?.category) {
    shops = shops.filter((shop) => shop.categories.includes(filters.category!));
  }

  return shops;
}

export async function getShopById(shopId: string): Promise<Shop | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, shopId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    shopId: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Shop;
}

export async function getShopByOwnerId(ownerId: string): Promise<Shop | null> {
  if (!db) throw new Error("Firestore not initialized");

  const shops = await getShops({ ownerId }, 1);
  return shops.length > 0 ? shops[0] : null;
}

export async function createShop(
  data: Omit<Shop, "shopId" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    rating: 0,
    totalRatings: 0,
    verified: false,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateShop(
  shopId: string,
  data: Partial<Omit<Shop, "shopId" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, shopId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteShop(shopId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  await deleteDoc(doc(db, COLLECTION, shopId));
}

