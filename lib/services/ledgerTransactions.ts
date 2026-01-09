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
  try {
    const params = new URLSearchParams();
    if (filters?.creditorId) params.append("creditorId", filters.creditorId);
    if (filters?.debtorId) params.append("debtorId", filters.debtorId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/api/ledger/transactions?${queryString}` 
      : "/api/ledger/transactions";
    
    const response = await apiGet<{ transactions: CreditTransaction[] }>(endpoint);
    const transactions = response.transactions || (Array.isArray(response) ? response : []);

    // Update overdue status for pending transactions
    const now = new Date();
    return transactions.map((tx) => {
      if (
        tx.status === "pending" &&
        tx.dueDate &&
        new Date(tx.dueDate) < now
      ) {
        return { ...tx, status: "overdue" as const };
      }
      return tx;
    });
  } catch (error: any) {
    console.error("Error fetching ledger transactions:", error);
    throw new Error(error.message || "Failed to fetch ledger transactions");
  }
}

export async function getLedgerTransactionById(
  id: string
): Promise<CreditTransaction | null> {
  try {
    const response = await apiGet<{ transaction: CreditTransaction }>(`/api/ledger/transactions/${id}`);
    return response.transaction || (response as any);
  } catch (error: any) {
    if (error.message?.includes("404") || error.message?.includes("not found")) {
      return null;
    }
    console.error("Error fetching ledger transaction:", error);
    throw error;
  }
}

export async function createLedgerTransaction(
  data: Omit<CreditTransaction, "id" | "transactionId" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    // Determine status based on due date
    let status: CreditTransaction["status"] = "pending";
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      status = "overdue";
    }

    const payload = {
      ...data,
      status: data.status || status,
    };

    const response = await apiPost<{ transaction: CreditTransaction; transactionId: string }>(
      "/api/ledger/transactions",
      payload
    );
    
    return response.transactionId || (response.transaction?.id || (response as any).id);
  } catch (error: any) {
    console.error("Error creating ledger transaction:", error);
    throw new Error(error.message || "Failed to create ledger transaction");
  }
}

export async function updateLedgerTransaction(
  id: string,
  data: Partial<Omit<CreditTransaction, "id" | "transactionId" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    const updateData: any = { ...data };

    // Auto-update status if marking as paid
    if (data.status === "paid" && !data.paidDate) {
      updateData.paidDate = new Date().toISOString();
    }

    await apiPut(`/api/ledger/transactions/${id}`, updateData);
  } catch (error: any) {
    console.error("Error updating ledger transaction:", error);
    throw new Error(error.message || "Failed to update ledger transaction");
  }
}

export async function deleteLedgerTransaction(id: string): Promise<void> {
  try {
    await apiDelete(`/api/ledger/transactions/${id}`);
  } catch (error: any) {
    console.error("Error deleting ledger transaction:", error);
    throw new Error(error.message || "Failed to delete ledger transaction");
  }
}

export async function markAsPaid(id: string, paidDate?: Date): Promise<void> {
  try {
    await apiPut(`/api/ledger/transactions/${id}`, {
      status: "paid",
      paidDate: paidDate ? paidDate.toISOString() : new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error marking transaction as paid:", error);
    throw new Error(error.message || "Failed to mark transaction as paid");
  }
}
