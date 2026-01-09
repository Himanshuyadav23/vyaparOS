"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Search,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Store,
  Shield,
} from "lucide-react";

const navigation: Array<{
  name: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
}> = [
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Dead Stock", href: "/dashboard/dead-stock", icon: Package },
  { name: "Catalog", href: "/dashboard/catalog", icon: ShoppingBag },
  { name: "Credit Ledger", href: "/dashboard/ledger", icon: CreditCard },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Search },
  { name: "Market Intelligence", href: "/dashboard/market", icon: BarChart3 },
  { name: "Admin Panel", href: "/dashboard/admin", icon: Shield, adminOnly: true },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">VyaparOS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navigation.map((item) => {
              // Hide admin-only items if user is not admin
              if (item.adminOnly && user?.role !== 'admin' && user?.uid !== 'dev-user-123') {
                return null;
              }
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-2"
            >
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">VyaparOS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
            {navigation.map((item) => {
              // Hide admin-only items if user is not admin
              if (item.adminOnly && user?.role !== 'admin' && user?.uid !== 'dev-user-123') {
                return null;
              }
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mb-2"
            >
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 hover:text-gray-700"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center px-4 flex-1">
            <h1 className="text-lg font-semibold text-gray-900">VyaparOS</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

