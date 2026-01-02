"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/ui/Loading";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Always redirect to marketplace - it's the main feature
    // Marketplace is public, users can browse without login
    if (!loading) {
      router.push("/marketplace");
    }
  }, [loading, router]);

  return <Loading />;
}

