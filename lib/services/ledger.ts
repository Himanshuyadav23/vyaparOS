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
import { CreditTransaction } from "@/types";

const COLLECTION = "creditTransactions";

export async function getCreditTransactions(filters?: {
  creditorId?: string;
  debtorId?: string;
  status?: CreditTransaction["status"];
}) {
  if (!db) throw new Error("Firestore not initialized");
  let q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  if (filters?.creditorId) {
    q = query(q, where("creditorId", "==", filters.creditorId));
  }
  if (filters?.debtorId) {
    q = query(q, where("debtorId", "==", filters.debtorId));
  }
  if (filters?.status) {
    q = query(q, where("status", "==", filters.status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    dueDate: doc.data().dueDate?.toDate(),
    paidDate: doc.data().paidDate?.toDate(),
  })) as CreditTransaction[];
}

export async function createCreditTransaction(
  data: Omit<CreditTransaction, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
    paidDate: data.paidDate ? Timestamp.fromDate(data.paidDate) : null,
  });
  return docRef.id;
}

export async function updateCreditTransaction(
  id: string,
  data: Partial<Omit<CreditTransaction, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, COLLECTION, id);
  const updateData: any = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  if (data.dueDate) {
    updateData.dueDate = Timestamp.fromDate(data.dueDate);
  }
  if (data.paidDate) {
    updateData.paidDate = Timestamp.fromDate(data.paidDate);
  }
  await updateDoc(docRef, updateData);
}

