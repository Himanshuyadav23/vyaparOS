"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getMarketStats, getLatestMarketStats } from "@/lib/services/marketStats";
import { MarketStats } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface CategoryData {
  category: string;
  count: number;
  totalValue: number;
}

export default function MarketIntelligencePage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [topDeadStock, setTopDeadStock] = useState<CategoryData[]>([]);
  const [topDemanded, setTopDemanded] = useState<any[]>([]);
  const [avgPaymentDelay, setAvgPaymentDelay] = useState<number>(0);
  const [paymentDelayHistory, setPaymentDelayHistory] = useState<any[]>([]);
  const [deadStockHistory, setDeadStockHistory] = useState<any[]>([]);
  const [demandHistory, setDemandHistory] = useState<any[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [totalCatalogItems, setTotalCatalogItems] = useState(0);
  const [totalTransactionValue, setTotalTransactionValue] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (user) {
      loadMarketStats();
    }
  }, [user]);

  const loadMarketStats = async () => {
    try {
      setLoading(true);

      // First, try to get existing stats
      const [deadStockStat, demandedStat, delayStat] = await Promise.all([
        getLatestMarketStats("top_dead_stock_categories"),
        getLatestMarketStats("top_demanded_categories"),
        getLatestMarketStats("avg_payment_delay"),
      ]);

      // If no stats exist, compute them automatically
      if (!deadStockStat || !demandedStat) {
        try {
          const computeResponse = await fetch("/api/market-stats/compute", {
            method: "POST",
          });
          if (computeResponse.ok) {
            // Reload stats after computing
            const [newDeadStockStat, newDemandedStat, newDelayStat] = await Promise.all([
              getLatestMarketStats("top_dead_stock_categories"),
              getLatestMarketStats("top_demanded_categories"),
              getLatestMarketStats("avg_payment_delay"),
            ]);

            if (newDeadStockStat?.metadata?.topCategories) {
              setTopDeadStock(newDeadStockStat.metadata.topCategories);
            }
            if (newDemandedStat?.metadata?.topCategories) {
              const categories = newDemandedStat.metadata.topCategories.map((c: any) => ({
                category: c.category,
                totalValue: c.totalValue || c.demandScore || 0,
                views: c.views || 0,
                inquiries: c.inquiries || 0,
                items: c.items || c.count || 0,
              }));
              setTopDemanded(categories);
            }
            if (newDelayStat?.metadata?.avgDelayDays !== undefined) {
              setAvgPaymentDelay(newDelayStat.metadata.avgDelayDays);
            }
          }
        } catch (error) {
          console.error("Error auto-computing stats:", error);
        }
      } else {
        // Use existing stats
        if (deadStockStat?.metadata?.topCategories) {
          setTopDeadStock(deadStockStat.metadata.topCategories);
        }
        if (demandedStat?.metadata?.topCategories) {
          const categories = demandedStat.metadata.topCategories.map((c: any) => ({
            category: c.category,
            totalValue: c.totalValue || c.demandScore || 0,
            views: c.views || 0,
            inquiries: c.inquiries || 0,
            items: c.items || c.count || 0,
          }));
          setTopDemanded(categories);
        }
        if (delayStat?.metadata?.avgDelayDays !== undefined) {
          setAvgPaymentDelay(delayStat.metadata.avgDelayDays);
        }
      }

      // Get historical data for charts (last 30 days)
      const [deadStockHistoryData, demandedHistoryData, delayHistoryData] =
        await Promise.all([
          getMarketStats({ metric: "top_dead_stock_categories", days: 30 }),
          getMarketStats({ metric: "top_demanded_categories", days: 30 }),
          getMarketStats({ metric: "avg_payment_delay", days: 30 }),
        ]);

      // Process history data for charts
      const delayChartData = delayHistoryData
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((stat) => ({
          date: formatDate(stat.date),
          delay: stat.metadata?.avgDelayDays || 0,
        }));

      setPaymentDelayHistory(delayChartData);

      // Aggregate dead stock by date
      const deadStockChartData = deadStockHistoryData
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((stat) => ({
          date: formatDate(stat.date),
          listings: stat.metadata?.sampleSize || 0,
        }));

      setDeadStockHistory(deadStockChartData);

      // Aggregate demand by date
      const demandChartData = demandedHistoryData
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((stat) => ({
          date: formatDate(stat.date),
          demand: stat.value || 0,
        }));

      setDemandHistory(demandChartData);

      // Always load real-time data to ensure we have the latest information
      await loadRealTimeData();
    } catch (error) {
      console.error("Error loading market stats:", error);
      // Fallback to real-time data
      await loadRealTimeData();
    } finally {
      setLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    if (!user) return;
    
    try {
      // Fetch user-specific data from the database
      const [deadStockResponse, catalogResponse, transactionsResponse] = await Promise.all([
        fetch(`/api/dead-stock?sellerId=${user.uid}`),
        fetch(`/api/catalog-items?supplierId=${user.uid}`),
        fetch("/api/ledger/transactions"), // This already filters by user in the API
      ]);

      let deadStockListings: any[] = [];
      let catalogItems: any[] = [];
      
      if (deadStockResponse.ok) {
        deadStockListings = await deadStockResponse.json();
        setTotalListings(deadStockListings.length);
        
        const categoryCount: Record<string, { count: number; totalValue: number }> = {};
        const listingsByDate: Record<string, number> = {};
        
        deadStockListings.forEach((listing: any) => {
          const category = listing.category || "Other";
          if (!categoryCount[category]) {
            categoryCount[category] = { count: 0, totalValue: 0 };
          }
          categoryCount[category].count++;
          categoryCount[category].totalValue += listing.discountPrice || 0;

          // Group by date for historical trend
          if (listing.createdAt) {
            const date = new Date(listing.createdAt);
            const dateKey = formatDate(date);
            listingsByDate[dateKey] = (listingsByDate[dateKey] || 0) + 1;
          }
        });

        const topCategories = Object.entries(categoryCount)
          .map(([category, stats]) => ({
            category,
            count: stats.count,
            totalValue: stats.totalValue,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopDeadStock(topCategories);

        // Generate historical trend from actual data
        const historicalData = Object.entries(listingsByDate)
          .map(([date, count]) => ({ date, listings: count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (historicalData.length > 0) {
          setDeadStockHistory(historicalData);
        }
      }

      if (catalogResponse.ok) {
        const catalogItems = await catalogResponse.json();
        setTotalCatalogItems(catalogItems.length);
        
        const demandByCategory: Record<string, { views: number; inquiries: number; items: number }> = {};
        const demandByDate: Record<string, number> = {};
        
        catalogItems.forEach((item: any) => {
          const category = item.category || "Other";
          if (!demandByCategory[category]) {
            demandByCategory[category] = { views: 0, inquiries: 0, items: 0 };
          }
          demandByCategory[category].views += item.views || 0;
          demandByCategory[category].inquiries += item.inquiries || 0;
          demandByCategory[category].items++;

          // Calculate demand score for historical trend
          if (item.createdAt) {
            const date = new Date(item.createdAt);
            const dateKey = formatDate(date);
            const demandScore = (item.views || 0) * 0.5 + (item.inquiries || 0) * 2 + 1;
            demandByDate[dateKey] = (demandByDate[dateKey] || 0) + demandScore;
          }
        });

        const topDemanded = Object.entries(demandByCategory)
          .map(([category, stats]) => ({
            category,
            totalValue: stats.views * 0.5 + stats.inquiries * 2 + stats.items,
            views: stats.views,
            inquiries: stats.inquiries,
            items: stats.items,
          }))
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 10);

        setTopDemanded(topDemanded);

        // Generate demand trend from actual data
        const demandTrendData = Object.entries(demandByDate)
          .map(([date, demand]) => ({ date, demand }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (demandTrendData.length > 0) {
          setDemandHistory(demandTrendData);
        }
      }

      if (transactionsResponse.ok) {
        const allTransactions = await transactionsResponse.json();
        
        // Filter transactions where user is creditor (money owed to them) or debtor (money they owe)
        const userTransactions = allTransactions.filter((tx: any) => 
          tx.creditorId === user.uid || tx.debtorId === user.uid
        );
        
        // Calculate total transaction value (only for transactions where user is creditor - money they're owed)
        const totalValue = userTransactions
          .filter((tx: any) => tx.creditorId === user.uid)
          .reduce((sum: number, tx: any) => {
            return sum + (tx.amount || 0);
          }, 0);
        setTotalTransactionValue(totalValue);

        // Calculate payment delays from transactions where user is creditor (waiting for payment)
        const paidTransactions = userTransactions.filter((tx: any) => 
          tx.status === 'paid' && 
          tx.paidDate && 
          tx.dueDate && 
          tx.creditorId === user.uid // Only transactions where user is waiting for payment
        );
        
        const delaysByDate: Record<string, { totalDelay: number; count: number }> = {};
        
        paidTransactions.forEach((tx: any) => {
          const dueDate = new Date(tx.dueDate);
          const paidDate = new Date(tx.paidDate);
          const delayDays = Math.max(0, Math.ceil((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          
          const dateKey = formatDate(paidDate);
          if (!delaysByDate[dateKey]) {
            delaysByDate[dateKey] = { totalDelay: 0, count: 0 };
          }
          delaysByDate[dateKey].totalDelay += delayDays;
          delaysByDate[dateKey].count++;
        });

        // Calculate average delay
        if (paidTransactions.length > 0) {
          const totalDelay = paidTransactions.reduce((sum: number, tx: any) => {
            const dueDate = new Date(tx.dueDate);
            const paidDate = new Date(tx.paidDate);
            return sum + Math.max(0, Math.ceil((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
          }, 0);
          setAvgPaymentDelay(totalDelay / paidTransactions.length);
        }

        // Generate payment delay trend
        const delayTrendData = Object.entries(delaysByDate)
          .map(([date, data]) => ({
            date,
            delay: data.count > 0 ? data.totalDelay / data.count : 0,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (delayTrendData.length > 0) {
          setPaymentDelayHistory(delayTrendData);
        }
      }

      // Count unique customers/buyers who interacted with user's listings/items
      const customerIds = new Set<string>();
      deadStockListings.forEach((l: any) => {
        // If we had inquiry data, we could track customers here
        // For now, we'll show total inquiries as a metric
      });
      catalogItems.forEach((i: any) => {
        // Track customers who inquired about catalog items
        // For now, we'll use inquiries count
      });
      // Show total inquiries instead of user count
      const totalInquiries = catalogItems.reduce((sum: number, item: any) => sum + (item.inquiries || 0), 0) +
                            deadStockListings.reduce((sum: number, listing: any) => sum + (listing.inquiries || 0), 0);
      setActiveUsers(totalInquiries); // Using inquiries as engagement metric
    } catch (error) {
      console.error("Error loading real-time data:", error);
    }
  };

  const handleComputeStats = async () => {
    if (!user) {
      showError("Please log in to refresh data");
      return;
    }

    setComputing(true);
    try {
      // Since we're showing user-centric real-time data, just refresh the data
      // Optionally compute global stats for historical tracking
      const token = localStorage.getItem("token");
      
      // Try to compute stats (for historical tracking)
      try {
        const computeResponse = await fetch("/api/market-stats/compute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        
        if (!computeResponse.ok) {
          console.warn("Stats computation failed, but continuing with data refresh");
        }
      } catch (computeError) {
        console.warn("Stats computation error (non-critical):", computeError);
      }
      
      // Always reload real-time data
      await loadMarketStats();
      
      showSuccess("Data refreshed successfully!");
    } catch (error: any) {
      console.error("Error refreshing data:", error);
      showError(error.message || "Failed to refresh data. Please try again.");
    } finally {
      setComputing(false);
    }
  };

  const COLORS = [
    "#0ea5e9",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your market intelligence</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Market Intelligence</h1>
          <p className="mt-2 text-base text-gray-600">
            Your business insights and performance trends
          </p>
        </div>
        <button
          onClick={handleComputeStats}
          disabled={computing || loading}
          className="flex items-center px-5 py-3 text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          <RefreshCw
            className={`h-5 w-5 mr-2 ${computing || loading ? "animate-spin" : ""}`}
          />
          {computing ? "Refreshing..." : loading ? "Loading..." : "Refresh Data"}
        </button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalListings}
              </p>
              <p className="text-xs text-gray-500 mt-1">Dead Stock</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Catalog Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalCatalogItems}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active Products</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {totalTransactionValue > 0 && (
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transaction Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{(totalTransactionValue / 100000).toFixed(1)}L
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Volume</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        )}

        {activeUsers > 0 && (
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeUsers}
                </p>
                <p className="text-xs text-gray-500 mt-1">Customer Interest</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics - Only show if data exists */}
      {(topDeadStock.length > 0 || topDemanded.length > 0 || avgPaymentDelay > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topDeadStock.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Your Top Dead Stock Category</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {topDeadStock[0].category}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {topDeadStock[0].count} of your listings
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          )}

          {topDemanded.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Your Top Catalog Category</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {topDemanded[0].category}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Demand Score: {Math.round(topDemanded[0].totalValue)}
                  </p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-500" />
              </div>
            </div>
          )}

          {avgPaymentDelay > 0 && (
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Payment Delay</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {avgPaymentDelay.toFixed(1)} days
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {avgPaymentDelay > 7 ? (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        High delay
                      </span>
                    ) : (
                      "Normal"
                    )}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Dead Stock Categories */}
      {topDeadStock.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Dead Stock Categories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDeadStock.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" name="Listings" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topDeadStock.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) =>
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {topDeadStock.slice(0, 5).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Demanded Categories */}
      {topDemanded.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Catalog Categories Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDemanded.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalValue" fill="#10b981" name="Demand Score" />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {topDemanded.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.category}</p>
                    <p className="text-xs text-gray-500">
                      {item.items} items • {item.views} views • {item.inquiries}{" "}
                      inquiries
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">
                      {Math.round(item.totalValue)}
                    </p>
                    <p className="text-xs text-gray-500">Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Delay Trend */}
      {paymentDelayHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Payment Delay Trend</h2>
          <p className="text-sm text-gray-500 mb-4">Average delay in receiving payments from your customers</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentDelayHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="delay"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Avg Delay (days)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Dead Stock Listings Trend */}
      {deadStockHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Dead Stock Listings Trend</h2>
          <p className="text-sm text-gray-500 mb-4">Number of listings you've created over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deadStockHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="listings"
                stroke="#0ea5e9"
                strokeWidth={2}
                name="Active Listings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Demand Trend */}
      {demandHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Catalog Demand Trend</h2>
          <p className="text-sm text-gray-500 mb-4">Customer interest in your catalog items over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="demand"
                stroke="#10b981"
                strokeWidth={2}
                name="Demand Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

