"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Store, User, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      logout();
      router.push("/marketplace");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/marketplace" className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-primary-600">VyaparOS</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/marketplace"
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Marketplace
            </Link>
            <Link
              href="/discover"
              className="text-gray-700 hover:text-primary-600 font-medium transition"
            >
              Discover Shops
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.businessName || user.email}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

