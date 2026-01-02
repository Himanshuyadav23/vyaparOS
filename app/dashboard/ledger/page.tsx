"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  getLedgerTransactions,
  createLedgerTransaction,
  markAsPaid,
  updateLedgerTransaction,
} from "@/lib/services/ledgerTransactions";
import { CreditTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SkeletonTable } from "@/components/ui/Skeleton";
import {
  Plus,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Filter,
} from "lucide-react";

export default function LedgerPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CreditTransaction["status"] | "all">("all");
  const [formData, setFormData] = useState({
    debtorName: "",
    amount: "",
    type: "credit" as CreditTransaction["type"],
    description: "",
    invoiceNumber: "",
    dueDate: "",
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user, statusFilter]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const filters: any = { creditorId: user.uid };
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      const data = await getLedgerTransactions(filters);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userDoc = await fetch(`/api/user/${user.uid}`)
        .then((r) => r.json())
        .catch(() => null);
      const creditorName = userDoc?.businessName || user.email || "";

      // Generate a debtorId from debtorName (or use a placeholder if needed)
      // In a real app, you'd look up or create the debtor, but for now we'll generate an ID
      const debtorId = `debtor_${formData.debtorName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${Date.now()}`;

      await createLedgerTransaction({
        creditorId: user.uid,
        creditorName,
        debtorId: debtorId,
        debtorName: formData.debtorName,
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description,
        invoiceNumber: formData.invoiceNumber || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        status: "pending",
      });

      setShowForm(false);
      setFormData({
        debtorName: "",
        amount: "",
        type: "credit",
        description: "",
        invoiceNumber: "",
        dueDate: "",
      });
      showSuccess("Transaction added successfully!");
      loadTransactions();
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      showError(error.message || "Failed to create transaction. Please try again.");
    }
  };

  const handleMarkPaid = async (transaction: CreditTransaction) => {
    if (!confirm(`Mark transaction of ₹${transaction.amount} as paid?`)) return;

    try {
      await markAsPaid(transaction.id);
      showSuccess("Transaction marked as paid!");
      loadTransactions();
    } catch (error) {
      console.error("Error marking as paid:", error);
      showError("Failed to update transaction. Please try again.");
    }
  };

  // Calculate totals
  const totals = {
    receivable: transactions
      .filter((t) => t.status === "pending" || t.status === "overdue")
      .reduce((sum, t) => sum + t.amount, 0),
    overdue: transactions
      .filter((t) => t.status === "overdue")
      .reduce((sum, t) => sum + t.amount, 0),
    paid: transactions
      .filter((t) => t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0),
    total: transactions.reduce((sum, t) => sum + t.amount, 0),
  };

  const getStatusColor = (status: CreditTransaction["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: CreditTransaction["type"]) => {
    switch (type) {
      case "credit":
        return "Credit Given";
      case "debit":
        return "Debit";
      case "payment":
        return "Payment";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Credit Ledger</h1>
          <p className="mt-2 text-base text-gray-600">
            Track credits and payments
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-5 py-3 text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Receivable</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totals.receivable)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totals.overdue)}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totals.paid)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {transactions.length}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Add Credit Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Party Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.debtorName}
                  onChange={(e) =>
                    setFormData({ ...formData, debtorName: e.target.value })
                  }
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter party/business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as CreditTransaction["type"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="credit">Credit Given</option>
                  <option value="debit">Debit</option>
                  <option value="payment">Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Transaction description or notes"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    debtorName: "",
                    amount: "",
                    type: "credit",
                    description: "",
                    invoiceNumber: "",
                    dueDate: "",
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Create Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as CreditTransaction["status"] | "all"
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.debtorName}
                      </div>
                      {transaction.invoiceNumber && (
                        <div className="text-xs text-gray-500">
                          Invoice: {transaction.invoiceNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTypeLabel(transaction.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.dueDate ? (
                        <div>
                          {formatDate(transaction.dueDate)}
                          {transaction.dueDate < new Date() &&
                            transaction.status !== "paid" && (
                              <span className="ml-2 text-xs text-red-600">
                                (Overdue)
                              </span>
                            )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status.toUpperCase()}
                      </span>
                      {transaction.paidDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Paid: {formatDate(transaction.paidDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.status !== "paid" && (
                        <button
                          onClick={() => handleMarkPaid(transaction)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Mark Paid
                        </button>
                      )}
                      {transaction.status === "paid" && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                    {statusFilter !== "all" && (
                      <button
                        onClick={() => setStatusFilter("all")}
                        className="mt-2 text-primary-600 hover:text-primary-700"
                      >
                        Clear filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
