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
import { DeadStock } from "@/types";

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
  if (!db) throw new Error("Firestore not initialized");

  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }
  if (filters?.sellerId) {
    q = query(q, where("sellerId", "==", filters.sellerId));
  }
  if (filters?.city) {
    q = query(q, where("location.city", "==", filters.city));
  }
  if (filters?.state) {
    q = query(q, where("location.state", "==", filters.state));
  }

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      listingId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate(),
      soldAt: data.soldAt?.toDate(),
    } as DeadStock;
  });
}

export async function getDeadStockListingById(
  id: string
): Promise<DeadStock | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    listingId: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    expiresAt: data.expiresAt?.toDate(),
    soldAt: data.soldAt?.toDate(),
  } as DeadStock;
}

export async function createDeadStockListing(
  data: Omit<DeadStock, "id" | "listingId" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  // Calculate discount percent
  const discountPercent =
    data.originalPrice > 0
      ? ((data.originalPrice - data.discountPrice) / data.originalPrice) * 100
      : 0;

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    discountPercent: Math.round(discountPercent * 100) / 100,
    views: 0,
    inquiries: 0,
    status: data.status || "available",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateDeadStockListing(
  id: string,
  data: Partial<Omit<DeadStock, "id" | "listingId" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };

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
      updateData.discountPercent = Math.round(discountPercent * 100) / 100;
    }
  }

  await updateDoc(docRef, updateData);
}

export async function deleteDeadStockListing(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  await deleteDoc(doc(db, COLLECTION, id));
}

export async function incrementViews(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    views: increment(1),
  });
}

export async function incrementInquiries(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    inquiries: increment(1),
  });
}



