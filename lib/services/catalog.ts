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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CatalogItem } from "@/types";

const COLLECTION = "catalog";

export async function getCatalogItems(filters?: {
  supplierId?: string;
  category?: string;
  isActive?: boolean;
}) {
  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  if (filters?.supplierId) {
    q = query(q, where("supplierId", "==", filters.supplierId));
  }
  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  if (filters?.isActive !== undefined) {
    q = query(q, where("isActive", "==", filters.isActive));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as CatalogItem[];
}

export async function getCatalogItemById(id: string): Promise<CatalogItem | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as CatalogItem;
}

export async function createCatalogItem(
  data: Omit<CatalogItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateCatalogItem(
  id: string,
  data: Partial<Omit<CatalogItem, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteCatalogItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

