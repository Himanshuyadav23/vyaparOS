"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Package,
  ShoppingBag,
  CreditCard,
  Search,
  BarChart3,
  CheckCircle,
  Loader2,
  Info,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Demo credentials - these should be created in MongoDB
      await login("demo@vyaparos.com", "demo123456");
      showSuccess("Logged in to demo mode!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Demo login error:", err);
      showError(err.message || "Demo login failed. Please make sure the demo account exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const response = await fetch("/api/demo/seed", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to seed data");
      }

      const data = await response.json();
      showSuccess(data.message || "Demo data loaded successfully!");
    } catch (error: any) {
      console.error("Seed error:", error);
      showError(error.message || "Failed to load demo data. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

  const handleSeedMockUsers = async () => {
    setSeeding(true);
    try {
      const response = await fetch("/api/seed/mock-users", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to seed mock users");
      }

      const data = await response.json();
      showSuccess(
        `Mock users created! ${data.counts.wholesalers} wholesalers, ${data.counts.retailers} retailers, ${data.counts.catalogItems} catalog items, ${data.counts.deadStockListings} dead stock listings`
      );
    } catch (error: any) {
      console.error("Seed mock users error:", error);
      showError(error.message || "Failed to create mock users. Please try again.");
    } finally {
      setSeeding(false);
    }
  };

  const features = [
    {
      name: "Dead Stock Exchange",
      description: "Browse and manage excess inventory listings",
      icon: Package,
      count: "10+ Listings",
    },
    {
      name: "Digital Catalog",
      description: "View product catalogs with smart sharing",
      icon: ShoppingBag,
      count: "25+ Products",
    },
    {
      name: "Credit Ledger",
      description: "Track transactions and payments",
      icon: CreditCard,
      count: "15+ Transactions",
    },
    {
      name: "Supplier Discovery",
      description: "Explore verified wholesalers",
      icon: Search,
      count: "5+ Suppliers",
    },
    {
      name: "Market Intelligence",
      description: "View market trends and analytics",
      icon: BarChart3,
      count: "Real-time Stats",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-base font-medium">Back to Home</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-4">
            <Info className="h-5 w-5" />
            <span className="text-base font-medium">Demo Mode</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Experience VyaparOS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore all features with pre-loaded sample data. Perfect for
            understanding the platform capabilities.
          </p>
        </div>

        {/* Demo Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Demo Account Credentials
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </label>
                <div className="mt-1 text-lg font-mono text-gray-900">
                  demo@vyaparos.com
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Password
                </label>
                <div className="mt-1 text-lg font-mono text-gray-900">
                  demo123456
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDemoLogin}
              disabled={loading || seeding}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Login to Demo
                </>
              )}
            </button>
            <button
              onClick={handleSeedData}
              disabled={loading || seeding}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading Data...
                </>
              ) : (
                <>
                  <Package className="h-5 w-5" />
                  Load Sample Data
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleSeedMockUsers}
              disabled={loading || seeding}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Mock Users...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Create 10 Wholesalers & 7 Retailers (Central India)
                </>
              )}
            </button>
            <p className="mt-2 text-sm text-gray-500 text-center">
              This will create realistic mock users from Central India with shops, catalog items, and dead stock listings
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            What&apos;s Included in Demo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.name}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {feature.name}
                      </h3>
                      <p className="text-base text-gray-600 mb-2">
                        {feature.description}
                      </p>
                      <p className="text-sm font-medium text-primary-600">
                        {feature.count}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            How to Use Demo Mode
          </h3>
          <ol className="space-y-2 text-base text-blue-800 list-decimal list-inside">
            <li>Click &quot;Load Sample Data&quot; to populate the database with demo content</li>
            <li>Click &quot;Login to Demo&quot; to access the platform with demo credentials</li>
            <li>Explore all modules: Dead Stock, Catalog, Ledger, Suppliers, and Market Intelligence</li>
            <li>All data is read-only in demo mode for safety</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

