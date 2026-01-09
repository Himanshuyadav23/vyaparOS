"use client";

import { useEffect, useState } from "react";
import { getMarketSignals, getAggregatedSignals } from "@/lib/services/intelligence";
import { MarketSignal } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function IntelligencePage() {
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [aggregated, setAggregated] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [signalsData, aggregatedData] = await Promise.all([
        getMarketSignals({ category: selectedCategory || undefined, limitCount: 50 }),
        getAggregatedSignals(selectedCategory || undefined),
      ]);
      setSignals(signalsData);
      setAggregated(aggregatedData);
    } catch (error) {
      console.error("Error loading market intelligence:", error);
      setSignals([]);
      setAggregated({});
    } finally {
      setLoading(false);
    }
  };

  const chartData = signals.slice(0, 20).map((signal) => ({
    date: formatDate(signal.timestamp),
    value: signal.value,
    change: signal.changePercent,
    type: signal.signalType,
  }));

  const aggregatedChartData = Object.entries(aggregated).map(([type, data]) => ({
    type: type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    avgValue: data.avgValue,
    avgChange: data.avgChange,
    count: data.count,
  }));

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Activity className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Market Intelligence</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aggregated anonymized market signals and trends
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <input
          type="text"
          placeholder="Enter category (optional)"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(aggregated).map(([type, data]) => (
          <div key={type} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </h3>
              {getTrendIcon(data.avgChange)}
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.avgValue.toFixed(2)}</p>
            <p className={`text-sm ${data.avgChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {data.avgChange >= 0 ? "+" : ""}{data.avgChange.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">{data.count} signals</p>
          </div>
        ))}
      </div>

      {aggregatedChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Signal Type Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregatedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgValue" fill="#0ea5e9" name="Average Value" />
              <Bar dataKey="avgChange" fill="#10b981" name="Average Change %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Market Signals</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                name="Signal Value"
              />
              <Line
                type="monotone"
                dataKey="change"
                stroke="#10b981"
                name="Change %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Signals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {signals.slice(0, 20).map((signal) => (
                <tr key={signal.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(signal.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {signal.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {signal.signalType.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {signal.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`${
                        signal.changePercent >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {signal.changePercent >= 0 ? "+" : ""}
                      {signal.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {signal.region}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {signals.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No market signals available</p>
          </div>
        )}
      </div>
    </div>
  );
}



