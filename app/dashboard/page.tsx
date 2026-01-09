"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Search,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Store,
} from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/services/api";

const quickLinks = [
  {
    name: "Marketplace",
    description: "Browse and trade with other users",
    href: "/marketplace",
    icon: Store,
    color: "bg-primary-500",
  },
  {
    name: "Dead Stock",
    description: "Manage excess inventory listings",
    href: "/dashboard/dead-stock",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    name: "Catalog",
    description: "Manage your product catalog",
    href: "/dashboard/catalog",
    icon: ShoppingBag,
    color: "bg-green-500",
  },
  {
    name: "Credit Ledger",
    description: "Track transactions and payments",
    href: "/dashboard/ledger",
    icon: CreditCard,
    color: "bg-purple-500",
  },
  {
    name: "Suppliers",
    description: "Discover and manage suppliers",
    href: "/dashboard/suppliers",
    icon: Search,
    color: "bg-orange-500",
  },
  {
    name: "Market Intelligence",
    description: "View market trends and analytics",
    href: "/dashboard/market",
    icon: BarChart3,
    color: "bg-indigo-500",
  },
];

interface DashboardStats {
  totalProducts: number;
  activeListings: number;
  pendingPayments: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeListings: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const userId = user?.uid;

        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch user-specific data in parallel
        const [catalogItems, deadStockListings, transactions] = await Promise.all([
          // Get catalog items for this user (as supplier)
          apiGet<any[]>(`/api/catalog-items?supplierId=${userId}`).catch(() => []),
          // Get active dead stock listings for this user (as seller)
          apiGet<any[]>(`/api/dead-stock?sellerId=${userId}&status=available`).catch(() => []),
          // Get all transactions for this user (already filtered by auth)
          apiGet<any[]>(`/api/ledger/transactions`).catch(() => []),
        ]);

        // Calculate statistics
        const totalProducts = catalogItems.length;
        const activeListings = deadStockListings.length;
        const pendingPayments = transactions.filter(
          (tx: any) => tx.status === 'pending' || tx.status === 'overdue'
        ).length;

        setStats({
          totalProducts,
          activeListings,
          pendingPayments,
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadDashboardStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back{user?.displayName ? `, ${user.displayName}` : ""}!
            </h1>
            <p className="text-primary-100 text-lg">
              Manage your business operations from one place
            </p>
          </div>
          <div className="hidden md:block">
            <LayoutDashboard className="h-24 w-24 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  stats.totalProducts
                )}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  stats.activeListings
                )}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  stats.pendingPayments
                )}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-primary-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${link.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {link.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{link.description}</p>
                    <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700">
                      <span className="text-sm">Go to {link.name}</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
}

