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
import { DeadStock } from "@/types";

const COLLECTION = "deadStock";

export async function getDeadStockList(filters?: {
  category?: string;
  status?: DeadStock["status"];
  sellerId?: string;
}) {
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

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as DeadStock[];
}

export async function getDeadStockById(id: string): Promise<DeadStock | null> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as DeadStock;
}

export async function createDeadStock(
  data: Omit<DeadStock, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateDeadStock(
  id: string,
  data: Partial<Omit<DeadStock, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDeadStock(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, COLLECTION, id));
}

