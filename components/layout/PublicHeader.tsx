"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            VyaparOS
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
