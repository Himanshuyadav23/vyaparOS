"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/ui/Loading";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Skip auth check in development mode
  const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

  useEffect(() => {
    if (!skipAuth && !loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router, skipAuth]);

  if (loading && !skipAuth) {
    return <Loading />;
  }

  if (!user && !skipAuth) {
    return null;
  }

  return <>{children}</>;
}



