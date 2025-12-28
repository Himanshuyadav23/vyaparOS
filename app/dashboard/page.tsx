"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "@/types";
import Link from "next/link";
import { Package, ShoppingBag, CreditCard, Search, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        if (!db) return;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData({ uid: user.uid, ...userDoc.data() } as User);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const features = [
    {
      name: "Dead Stock Exchange",
      description: "Buy and sell excess inventory",
      href: "/dashboard/dead-stock",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      name: "Digital Catalog",
      description: "Manage and share your product catalog",
      href: "/dashboard/catalog",
      icon: ShoppingBag,
      color: "bg-green-500",
    },
    {
      name: "Credit Ledger",
      description: "Track credits and payments",
      href: "/dashboard/ledger",
      icon: CreditCard,
      color: "bg-purple-500",
    },
    {
      name: "Supplier Discovery",
      description: "Find verified suppliers",
      href: "/dashboard/suppliers",
      icon: Search,
      color: "bg-orange-500",
    },
    {
      name: "Market Intelligence",
      description: "Analytics and market trends",
      href: "/dashboard/market",
      icon: BarChart3,
      color: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome, {userData?.businessName || "User"}
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Manage your textile business operations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.name}
            href={feature.href}
            className="relative rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

