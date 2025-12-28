"use client";

import { useEffect, useState } from "react";
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
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [topDeadStock, setTopDeadStock] = useState<CategoryData[]>([]);
  const [topDemanded, setTopDemanded] = useState<any[]>([]);
  const [avgPaymentDelay, setAvgPaymentDelay] = useState<number>(0);
  const [paymentDelayHistory, setPaymentDelayHistory] = useState<any[]>([]);
  const [deadStockHistory, setDeadStockHistory] = useState<any[]>([]);
  const [demandHistory, setDemandHistory] = useState<any[]>([]);

  useEffect(() => {
    loadMarketStats();
  }, []);

  const loadMarketStats = async () => {
    try {
      setLoading(true);

      // Get latest stats
      const [deadStockStat, demandedStat, delayStat] = await Promise.all([
        getLatestMarketStats("top_dead_stock_categories"),
        getLatestMarketStats("top_demanded_categories"),
        getLatestMarketStats("avg_payment_delay"),
      ]);

      if (deadStockStat?.metadata?.topCategories) {
        setTopDeadStock(deadStockStat.metadata.topCategories);
      }

      if (demandedStat?.metadata?.topCategories) {
        setTopDemanded(demandedStat.metadata.topCategories);
      }

      if (delayStat?.metadata?.avgDelayDays !== undefined) {
        setAvgPaymentDelay(delayStat.metadata.avgDelayDays);
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
    } catch (error) {
      console.error("Error loading market stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeStats = async () => {
    setComputing(true);
    try {
      const response = await fetch("/api/market-stats/compute", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to compute stats");
      }

      const data = await response.json();
      
      // Reload stats
      await loadMarketStats();
      
      showSuccess("Market stats computed successfully!");
    } catch (error: any) {
      console.error("Error computing stats:", error);
      showError(error.message || "Failed to compute market stats. Please try again.");
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Market Intelligence</h1>
          <p className="mt-2 text-base text-gray-600">
            Market insights and trends
          </p>
        </div>
        <button
          onClick={handleComputeStats}
          disabled={computing}
          className="flex items-center px-5 py-3 text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          <RefreshCw
            className={`h-5 w-5 mr-2 ${computing ? "animate-spin" : ""}`}
          />
          {computing ? "Computing..." : "Compute Stats"}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Dead Stock Category</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {topDeadStock.length > 0 ? topDeadStock[0].category : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {topDeadStock.length > 0
                  ? `${topDeadStock[0].count} listings`
                  : "No data"}
              </p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Demanded Category</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {topDemanded.length > 0 ? topDemanded[0].category : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {topDemanded.length > 0
                  ? `Demand Score: ${Math.round(topDemanded[0].totalValue)}`
                  : "No data"}
              </p>
            </div>
            <ShoppingBag className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Payment Delay</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {avgPaymentDelay > 0
                  ? `${avgPaymentDelay.toFixed(1)} days`
                  : "N/A"}
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
      </div>

      {/* Top Dead Stock Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Top Dead Stock Categories</h2>
        {topDeadStock.length > 0 ? (
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
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Top Demanded Categories */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Top Demanded Categories</h2>
        {topDemanded.length > 0 ? (
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
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Payment Delay Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Average Payment Delay Trend</h2>
        {paymentDelayHistory.length > 0 ? (
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
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Dead Stock Listings Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Dead Stock Listings Trend</h2>
        {deadStockHistory.length > 0 ? (
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
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      {/* Demand Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Demand Trend</h2>
        {demandHistory.length > 0 ? (
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
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>
    </div>
  );
}

