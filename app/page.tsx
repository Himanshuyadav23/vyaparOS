"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import {
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  Search,
  BarChart3,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
} from "lucide-react";
import Loading from "@/components/ui/Loading";
import { loadGoogleScript, initializeGoogleSignIn } from "@/lib/auth/google";

const features = [
  {
    name: "Dead Stock Exchange",
    description: "Buy and sell excess inventory with ease. Connect with buyers and sellers in your market.",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    name: "Digital Catalog",
    description: "Manage and share your product catalogs digitally. Smart links for easy sharing.",
    icon: ShoppingBag,
    color: "bg-green-500",
  },
  {
    name: "Credit Ledger",
    description: "Track credits and payments between businesses. Never lose track of transactions.",
    icon: CreditCard,
    color: "bg-purple-500",
  },
  {
    name: "Supplier Discovery",
    description: "Find and connect with verified suppliers. Expand your business network.",
    icon: Search,
    color: "bg-orange-500",
  },
  {
    name: "Market Intelligence",
    description: "Get insights from aggregated market signals and trends. Make data-driven decisions.",
    icon: BarChart3,
    color: "bg-indigo-500",
  },
  {
    name: "Marketplace",
    description: "Browse, communicate, and trade with other businesses. One platform for all your needs.",
    icon: Store,
    color: "bg-primary-500",
  },
];

const benefits = [
  "Multi-tenant data isolation for security",
  "Real-time market insights and analytics",
  "Easy supplier and buyer discovery",
  "Digital transformation for traditional markets",
  "Credit tracking and payment management",
  "Verified business network",
];

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showError, showSuccess } = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleSignInRef = useRef<HTMLDivElement>(null);
  const googleSignUpRef = useRef<HTMLDivElement>(null);
  const googleSignUpCtaRef = useRef<HTMLDivElement>(null);

  // Removed auto-redirect - landing page should always be accessible
  // Users can navigate to login/dashboard via buttons

  useEffect(() => {
    // Initialize Google Sign-In (only if user is not logged in)
    const initGoogle = async () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("Google Client ID not configured - Google login will not be available");
        return;
      }

      try {
        await loadGoogleScript();
        
        // Initialize Google OAuth once
        await initializeGoogleSignIn(clientId, handleGoogleAuth);
        
        // Small delay to ensure Google script is fully loaded
        setTimeout(() => {
          // Render sign-in button
          if (googleSignInRef.current && window.google?.accounts && !user) {
            window.google.accounts.id.renderButton(googleSignInRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
            });
          }

          // Render sign-up button
          if (googleSignUpRef.current && window.google?.accounts && !user) {
            window.google.accounts.id.renderButton(googleSignUpRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signup_with',
            });
          }

          // Render CTA sign-up button
          if (googleSignUpCtaRef.current && window.google?.accounts && !user) {
            window.google.accounts.id.renderButton(googleSignUpCtaRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signup_with',
            });
          }
        }, 100);
      } catch (error) {
        console.error("Failed to initialize Google Sign-In:", error);
      }
    };

    if (!loading && !user) {
      initGoogle();
    }
  }, [loading, user]);

  const handleGoogleAuth = async (response: any) => {
    if (!response.credential) {
      showError("Google authentication failed");
      return;
    }

    setGoogleLoading(true);
    try {
      // Clear any existing token first
      localStorage.removeItem("token");
      
      // Try sign-in first, if fails, try sign-up
      let res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential, isSignUp: false }),
      });

      // If user doesn't exist, try sign-up
      if (!res.ok && res.status === 404) {
        res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential, isSignUp: true }),
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Google authentication failed");
      }

      const data = await res.json();
      // Set new token
      localStorage.setItem("token", data.token);
      
      showSuccess("Authentication successful!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      showError(err.message || "Google authentication failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show loading only while checking initial auth state
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Store className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              VyaparOS
            </h1>
            <p className="text-xl sm:text-2xl text-primary-100 mb-4 max-w-3xl mx-auto">
              Operating System for Traditional Wholesale Markets
            </p>
            <p className="text-lg text-primary-200 mb-10 max-w-2xl mx-auto">
              Transform your wholesale business with digital tools for inventory management, 
              supplier discovery, credit tracking, and market intelligence.
            </p>
            <div className="space-y-4">
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-400 border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-400 border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </div>
              )}
              
              {!user && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-primary-600 text-primary-100">Or continue with</span>
                    </div>
                  </div>
                  
                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <div className="flex-1">
                          <div id="google-signup-button" ref={googleSignUpRef}></div>
                        </div>
                        <div className="flex-1">
                          <div id="google-signin-button" ref={googleSignInRef}></div>
                        </div>
                      </div>
                      {googleLoading && (
                        <div className="text-center text-primary-100 text-sm">
                          Signing in with Google...
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-primary-200 text-sm max-w-md mx-auto">
                      Google login is not configured. Please contact support or use email registration.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for wholesalers, retailers, and manufacturers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.name}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose VyaparOS?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for traditional wholesale markets, VyaparOS brings 
                modern technology to age-old business practices.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 lg:p-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-600 rounded-lg p-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Market Insights</h3>
                    <p className="text-gray-600">Real-time analytics and trends</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-600 rounded-lg p-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Business Network</h3>
                    <p className="text-gray-600">Connect with verified suppliers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-600 rounded-lg p-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Secure & Private</h3>
                    <p className="text-gray-600">Your data is protected and isolated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join VyaparOS today and start managing your wholesale operations digitally.
          </p>
          <div className="space-y-4">
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-400 border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-400 border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Browse Marketplace
                  </Link>
                </div>
                
                <div className="relative max-w-md mx-auto">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-primary-600 text-primary-100">Or continue with Google</span>
                  </div>
                </div>
                
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <div className="flex justify-center max-w-xs mx-auto">
                    <div id="google-signup-cta" ref={googleSignUpCtaRef}></div>
                  </div>
                ) : (
                  <div className="text-center text-primary-200 text-sm max-w-xs mx-auto">
                    Google login is not configured. Please use email registration.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Store className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold text-white">VyaparOS</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} VyaparOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
