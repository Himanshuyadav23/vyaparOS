import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Supplier } from "@/types";

const COLLECTION = "suppliers";

export async function getSuppliers(filters?: {
  category?: string;
  verified?: boolean;
  city?: string;
}) {
  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  if (filters?.category) {
    q = query(q, where("categories", "array-contains", filters.category));
  }
  if (filters?.verified !== undefined) {
    q = query(q, where("verified", "==", filters.verified));
  }
  if (filters?.city) {
    q = query(q, where("city", "==", filters.city));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Supplier[];
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as Supplier;
}

export async function createSupplier(
  data: Omit<Supplier, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateSupplier(
  id: string,
  data: Partial<Omit<Supplier, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

