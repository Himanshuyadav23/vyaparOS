"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  CreditCard,
  Search,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-primary-600 mx-auto mb-4"></div>
          <p className="text-base text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      name: "Dead Stock Exchange",
      description: "Buy and sell excess inventory at discounted prices",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      name: "Digital Catalog",
      description: "Create and share your product catalog with smart links",
      icon: ShoppingBag,
      color: "bg-green-500",
    },
    {
      name: "Credit Ledger",
      description: "Track credits, payments, and manage receivables",
      icon: CreditCard,
      color: "bg-purple-500",
    },
    {
      name: "Supplier Discovery",
      description: "Find verified wholesalers and suppliers by category",
      icon: Search,
      color: "bg-orange-500",
    },
    {
      name: "Market Intelligence",
      description: "Get insights on market trends and analytics",
      icon: BarChart3,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                VyaparOS
              </h1>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-base font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 text-base font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Operating System for
            <span className="text-primary-600"> Textile Markets</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your wholesale business with digital tools for inventory,
            catalog, credit management, and market intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/demo"
              className="px-8 py-4 text-lg font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <CheckCircle className="h-6 w-6" />
              Enter Demo Mode
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-4 text-lg font-semibold bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete Business Solution
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage and grow your wholesale textile business
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-base text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Try VyaparOS Demo
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Experience all features with pre-loaded sample data. Perfect for
            exploring the platform before signing up.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Enter Demo Mode
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">
              5+
            </div>
            <div className="text-xl text-gray-600">Core Modules</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">
              100%
            </div>
            <div className="text-xl text-gray-600">Mobile Responsive</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">
              24/7
            </div>
            <div className="text-xl text-gray-600">Cloud Access</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold">VyaparOS</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Operating System for Traditional Wholesale Textile Markets
            </p>
            <p className="text-sm text-gray-500">
              © 2024 VyaparOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
