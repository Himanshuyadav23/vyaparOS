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
import { CreditTransaction } from "@/types";

const COLLECTION = "ledgerTransactions";

export interface LedgerTransactionFilters {
  creditorId?: string;
  debtorId?: string;
  status?: CreditTransaction["status"];
  type?: CreditTransaction["type"];
}

export async function getLedgerTransactions(
  filters?: LedgerTransactionFilters
): Promise<CreditTransaction[]> {
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
  if (filters?.type) {
    q = query(q, where("type", "==", filters.type));
  }

  const snapshot = await getDocs(q);
  const transactions = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      transactionId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      dueDate: data.dueDate?.toDate(),
      paidDate: data.paidDate?.toDate(),
    } as CreditTransaction;
  });

  // Update overdue status for pending transactions
  const now = new Date();
  return transactions.map((tx) => {
    if (
      tx.status === "pending" &&
      tx.dueDate &&
      tx.dueDate < now
    ) {
      return { ...tx, status: "overdue" as const };
    }
    return tx;
  });
}

export async function getLedgerTransactionById(
  id: string
): Promise<CreditTransaction | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    transactionId: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    dueDate: data.dueDate?.toDate(),
    paidDate: data.paidDate?.toDate(),
  } as CreditTransaction;
}

export async function createLedgerTransaction(
  data: Omit<CreditTransaction, "id" | "transactionId" | "createdAt" | "updatedAt">
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  // Determine status based on due date
  let status: CreditTransaction["status"] = "pending";
  if (data.dueDate && data.dueDate < new Date()) {
    status = "overdue";
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: data.status || status,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
    paidDate: data.paidDate ? Timestamp.fromDate(data.paidDate) : null,
  });
  return docRef.id;
}

export async function updateLedgerTransaction(
  id: string,
  data: Partial<Omit<CreditTransaction, "id" | "transactionId" | "createdAt" | "updatedAt">>
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

  // Auto-update status if marking as paid
  if (data.status === "paid" && !data.paidDate) {
    updateData.paidDate = Timestamp.now();
  }

  await updateDoc(docRef, updateData);
}

export async function deleteLedgerTransaction(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  await deleteDoc(doc(db, COLLECTION, id));
}

export async function markAsPaid(id: string, paidDate?: Date): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: "paid",
    paidDate: paidDate ? Timestamp.fromDate(paidDate) : Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

