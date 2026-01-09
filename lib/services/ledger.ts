import { CreditTransaction } from "@/types";
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

// Re-export from ledgerTransactions for convenience
export {
  getLedgerTransactions,
  getLedgerTransactionById,
  createLedgerTransaction,
  updateLedgerTransaction,
  deleteLedgerTransaction,
  markAsPaid,
} from "./ledgerTransactions";

export type LedgerTransactionFilters = {
  creditorId?: string;
  debtorId?: string;
  status?: CreditTransaction["status"];
  type?: CreditTransaction["type"];
};
