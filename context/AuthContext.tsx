"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiGet } from "@/lib/services/api";

interface User {
  uid: string;
  email: string;
  displayName?: string;
  businessName: string;
  businessType: "wholesaler" | "retailer" | "manufacturer";
  role?: "wholesaler" | "retailer" | "admin";
  phone?: string;
  shopId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  businessName: string;
  businessType: "wholesaler" | "retailer" | "manufacturer";
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // If there's a token, always use real authentication (ignore SKIP_AUTH)
      if (token) {
        // Verify token is valid by calling /api/auth/me
        const data = await apiGet<{ user: User }>("/api/auth/me");
        // Ensure we have valid user data
        if (data && data.user && data.user.uid) {
          setUser(data.user);
        } else {
          // Invalid response, clear token
          localStorage.removeItem("token");
          setUser(null);
        }
        setLoading(false);
        return;
      }

      // Only use dev mode if no token exists AND SKIP_AUTH is enabled
      const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";
      if (skipAuth) {
        // Create a mock user for development (only when no real token exists)
        const mockUser: User = {
          uid: "dev-user-123",
          email: "dev@vyaparos.com",
          displayName: "Developer",
          businessName: "Dev Business",
          businessType: "wholesaler",
          role: "admin",
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
        setLoading(false);
        return;
      }

      // No token and no skip auth - user is not logged in
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Clear any existing token first
    localStorage.removeItem("token");
    setUser(null);
    
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    // Set new token and user
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (registerData: RegisterData) => {
    // Clear any existing token first
    localStorage.removeItem("token");
    setUser(null);
    
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    // Set new token and user
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
