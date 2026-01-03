import { CreditTransaction } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export interface LedgerTransactionFilters {
  creditorId?: string;
  debtorId?: string;
  status?: CreditTransaction["status"];
  type?: CreditTransaction["type"];
}

export async function getLedgerTransactions(
  filters?: LedgerTransactionFilters
): Promise<CreditTransaction[]> {
  const params = new URLSearchParams();
  
  if (filters?.creditorId) params.append("creditorId", filters.creditorId);
  if (filters?.debtorId) params.append("debtorId", filters.debtorId);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.type) params.append("type", filters.type);

  const queryString = params.toString();
  const endpoint = `/api/ledger/transactions${queryString ? `?${queryString}` : ""}`;
  
  const transactions = await apiGet<any[]>(endpoint);
  return transactions.map((tx) => ({
    ...tx,
    createdAt: new Date(tx.createdAt),
    updatedAt: new Date(tx.updatedAt),
    dueDate: tx.dueDate ? new Date(tx.dueDate) : undefined,
    paidDate: tx.paidDate ? new Date(tx.paidDate) : undefined,
  })) as CreditTransaction[];
}

export async function getLedgerTransactionById(
  id: string
): Promise<CreditTransaction | null> {
  try {
    const tx = await apiGet<any>(`/api/ledger/transactions/${id}`);
    return {
      ...tx,
      createdAt: new Date(tx.createdAt),
      updatedAt: new Date(tx.updatedAt),
      dueDate: tx.dueDate ? new Date(tx.dueDate) : undefined,
      paidDate: tx.paidDate ? new Date(tx.paidDate) : undefined,
    } as CreditTransaction;
  } catch (error) {
    return null;
  }
}

export async function createLedgerTransaction(
  data: Omit<CreditTransaction, "id" | "transactionId" | "createdAt" | "updatedAt">
): Promise<string> {
  const result = await apiPost<{ id: string }>("/api/ledger/transactions", data);
  return result.id;
}

export async function updateLedgerTransaction(
  id: string,
  data: Partial<Omit<CreditTransaction, "id" | "transactionId" | "createdAt" | "updatedAt">>
): Promise<void> {
  await apiPut(`/api/ledger/transactions/${id}`, data);
}

export async function deleteLedgerTransaction(id: string): Promise<void> {
  await apiDelete(`/api/ledger/transactions/${id}`);
}

export async function markAsPaid(id: string, paidDate?: Date): Promise<void> {
  await updateLedgerTransaction(id, {
    status: "paid",
    paidDate: paidDate || new Date(),
  });
}
