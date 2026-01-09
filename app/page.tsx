"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import { 
  ShoppingBag, 
  TrendingUp, 
  CreditCard, 
  BarChart3, 
  Zap, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  Package,
  DollarSign
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Package,
      title: "Catalog Management",
      description: "Manage your product catalog with ease. Add, update, and organize your inventory seamlessly.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: ShoppingBag,
      title: "Dead Stock Marketplace",
      description: "Buy and sell dead stock items. Connect with buyers and sellers in your network.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: CreditCard,
      title: "Credit Ledger",
      description: "Track your credit and debit transactions. Manage accounts receivable and payable.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Get real-time insights and market trends to make informed business decisions.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      title: "Supplier Network",
      description: "Build and manage your supplier relationships. Discover new partners.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with reliable infrastructure for your business.",
      color: "from-teal-500 to-blue-500",
    },
  ];

  const stats = [
    { icon: Users, value: "100+", label: "Active Users" },
    { icon: Package, value: "1k+", label: "Products Listed" },
    { icon: DollarSign, value: "₹50L+", label: "Transaction Value" },
    { icon: TrendingUp, value: "99.5%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-primary-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-6 animate-fade-in">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Powering Wholesale Business Operations</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Operating System for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                Wholesale Markets
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your wholesale business with our all-in-one platform. Manage catalogs, trade dead stock, 
              track credits, and gain market intelligence—all in one place.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg hover:border-primary-500 hover:text-primary-600 transition-all duration-300"
              >
                Try Demo
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 text-gray-700 font-semibold text-lg hover:text-primary-600 transition-colors"
              >
                Sign In →
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-xl mb-3 text-white">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                Run Your Business
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for wholesale and retail businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 text-white transform group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                VyaparOS?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Built for Indian wholesale markets with features that matter most to your business
            </p>
            
            <div className="space-y-4">
              {[
                "Real-time inventory and catalog management",
                "Secure credit ledger and transaction tracking",
                "Dead stock marketplace for better liquidity",
                "Market intelligence and analytics",
                "Mobile-friendly and easy to use",
                "24/7 customer support",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of businesses already using VyaparOS to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Get Started for Free
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Explore Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">VyaparOS</div>
            <p className="mb-4">Operating System for Wholesale Markets</p>
            <div className="flex justify-center gap-6 text-sm">
              <Link href="/auth/login" className="hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">
                Register
              </Link>
              <Link href="/demo" className="hover:text-white transition-colors">
                Demo
              </Link>
            </div>
            <p className="mt-8 text-sm">© {new Date().getFullYear()} VyaparOS. All rights reserved.</p>
            <p className="mt-2 text-xs text-gray-500">
              Built by{" "}
              <a
                href="https://hyadav.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
              >
                Himanshu Yadav
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
