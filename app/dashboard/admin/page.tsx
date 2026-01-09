"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/services/api";
import Loading from "@/components/ui/Loading";

interface AdminStats {
  totalUsers: number;
  totalWholesalers: number;
  totalRetailers: number;
  totalCatalogItems: number;
  totalDeadStockListings: number;
  totalTransactions: number;
  pendingVerifications: number;
  activeListings: number;
}

export default function AdminPanelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "listings" | "transactions" | "suppliers" | "settings">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [deadStockListings, setDeadStockListings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [banningUser, setBanningUser] = useState<any | null>(null);
  const [banReason, setBanReason] = useState("");
  const [ratingSupplier, setRatingSupplier] = useState<any | null>(null);
  const [adminRating, setAdminRating] = useState<number>(0);
  const [markingBadSupplier, setMarkingBadSupplier] = useState<any | null>(null);
  const [badSupplierReason, setBadSupplierReason] = useState("");

  useEffect(() => {
    // Check if user is admin
    if (user && (user.role === 'admin' || user.uid === 'dev-user-123')) {
      loadAdminData();
    } else {
      router.push("/dashboard");
    }
  }, [user, activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === "overview") {
        await loadStats();
      } else if (activeTab === "users") {
        await loadUsers();
      } else if (activeTab === "listings") {
        await Promise.all([loadCatalogItems(), loadDeadStockListings()]);
      } else if (activeTab === "transactions") {
        await loadTransactions();
      } else if (activeTab === "suppliers") {
        await loadSuppliers();
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
      showError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch all data to calculate stats
      const [usersData, catalogData, deadStockData, transactionsData] = await Promise.all([
        apiGet<any[]>("/api/users/all"),
        apiGet<any[]>("/api/catalog-items"),
        apiGet<any[]>("/api/dead-stock"),
        apiGet<any[]>("/api/ledger/transactions"),
      ]);

      const wholesalers = usersData.filter((u: any) => u.businessType === "wholesaler" || u.role === "wholesaler");
      const retailers = usersData.filter((u: any) => u.businessType === "retailer" || u.role === "retailer");
      const pendingVerifications = usersData.filter((u: any) => !u.verified).length;
      const activeListings = [...catalogData.filter((i: any) => i.isActive), ...deadStockData.filter((l: any) => l.status === "available")];

      setStats({
        totalUsers: usersData.length,
        totalWholesalers: wholesalers.length,
        totalRetailers: retailers.length,
        totalCatalogItems: catalogData.length,
        totalDeadStockListings: deadStockData.length,
        totalTransactions: transactionsData.length,
        pendingVerifications,
        activeListings: activeListings.length,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await apiGet<any[]>("/api/users/all");
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadCatalogItems = async () => {
    try {
      const data = await apiGet<any[]>("/api/catalog-items");
      // Ensure id field is set for admin panel
      setCatalogItems(data.map((item: any) => ({
        ...item,
        id: item.id || item.catalogId,
      })));
    } catch (error) {
      console.error("Error loading catalog items:", error);
    }
  };

  const loadDeadStockListings = async () => {
    try {
      const data = await apiGet<any[]>("/api/dead-stock");
      // Ensure id field is set for admin panel
      setDeadStockListings(data.map((listing: any) => ({
        ...listing,
        id: listing.id || listing.listingId,
      })));
    } catch (error) {
      console.error("Error loading dead stock listings:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await apiGet<any[]>("/api/ledger/transactions/all");
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await apiGet<any[]>("/api/suppliers/admin/all");
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      showError("Failed to load suppliers");
    }
  };

  const handleVerifyUser = async (userId: string, verified: boolean) => {
    try {
      await apiPut(`/api/users/${userId}/verify`, { verified });
      showSuccess(`User ${verified ? "verified" : "unverified"} successfully`);
      await loadUsers();
      await loadStats();
    } catch (error: any) {
      showError(error.message || "Failed to update user verification");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await apiDelete(`/api/users/${userId}`);
      showSuccess("User deleted successfully");
      await loadUsers();
      await loadStats();
    } catch (error: any) {
      showError(error.message || "Failed to delete user");
    }
  };

  const handleBanUser = async (userId: string, banned: boolean, reason?: string) => {
    try {
      await apiPut(`/api/users/${userId}/ban`, { banned, banReason: reason || "" });
      showSuccess(`User ${banned ? "banned" : "unbanned"} successfully`);
      setBanningUser(null);
      setBanReason("");
      await loadUsers();
      await loadStats();
    } catch (error: any) {
      showError(error.message || "Failed to ban/unban user");
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await apiPut(`/api/users/${userId}/update`, updates);
      showSuccess("User updated successfully");
      setEditingUser(null);
      await loadUsers();
      await loadStats();
    } catch (error: any) {
      showError(error.message || "Failed to update user");
    }
  };

  const handleDeleteListing = async (item: any, type: "catalog" | "deadstock") => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      // Use catalogId or listingId from the item
      const id = type === "catalog" ? (item.catalogId || item.id) : (item.listingId || item.id);
      
      if (type === "catalog") {
        await apiDelete(`/api/catalog-items/${id}`);
      } else {
        await apiDelete(`/api/dead-stock/${id}`);
      }
      showSuccess("Listing deleted successfully");
      await loadAdminData();
    } catch (error: any) {
      showError(error.message || "Failed to delete listing");
    }
  };

  const handleRateSupplier = async (supplierId: string) => {
    if (adminRating < 0 || adminRating > 5) {
      showError("Please provide a valid rating (0-5)");
      return;
    }

    try {
      await apiPut(`/api/suppliers/${supplierId}/admin-rating`, { adminRating });
      showSuccess("Supplier rating updated successfully");
      setRatingSupplier(null);
      setAdminRating(0);
      await loadSuppliers();
    } catch (error: any) {
      showError(error.message || "Failed to update supplier rating");
    }
  };

  const handleBanSupplier = async (supplierId: string, reason: string) => {
    if (!reason.trim()) {
      showError("Please provide a reason for banning");
      return;
    }

    try {
      await apiPut(`/api/suppliers/${supplierId}/ban`, { banned: true, banReason: reason });
      showSuccess("Supplier banned successfully");
      setBanningUser(null);
      setBanReason("");
      await loadSuppliers();
    } catch (error: any) {
      showError(error.message || "Failed to ban supplier");
    }
  };

  const handleUnbanSupplier = async (supplierId: string) => {
    try {
      await apiPut(`/api/suppliers/${supplierId}/ban`, { banned: false });
      showSuccess("Supplier unbanned successfully");
      await loadSuppliers();
    } catch (error: any) {
      showError(error.message || "Failed to unban supplier");
    }
  };

  const handleMarkBadSupplier = async (supplierId: string, reason: string) => {
    if (!reason.trim()) {
      showError("Please provide a reason for marking as bad supplier");
      return;
    }

    try {
      await apiPut(`/api/suppliers/${supplierId}/mark-bad`, { badSupplier: true, badSupplierReason: reason });
      showSuccess("Supplier marked as bad successfully");
      setMarkingBadSupplier(null);
      setBadSupplierReason("");
      await loadSuppliers();
    } catch (error: any) {
      showError(error.message || "Failed to mark supplier as bad");
    }
  };

  const handleUnmarkBadSupplier = async (supplierId: string) => {
    try {
      await apiPut(`/api/suppliers/${supplierId}/mark-bad`, { badSupplier: false });
      showSuccess("Supplier unmarked as bad successfully");
      await loadSuppliers();
    } catch (error: any) {
      showError(error.message || "Failed to unmark supplier");
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) {
      return;
    }

    try {
      await apiDelete(`/api/suppliers/${supplierId}`);
      showSuccess("Supplier deleted successfully");
      await loadSuppliers();
    } catch (error: any) {
      showError(error.message || "Failed to delete supplier");
    }
  };

  if (loading && !stats) {
    return <Loading />;
  }

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCatalog = catalogItems.filter((item) =>
    item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeadStock = deadStockListings.filter((listing) =>
    listing.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              Admin Panel
            </h1>
            <p className="text-purple-100 text-lg">
              Manage users, listings, transactions, and system settings
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: "overview", name: "Overview", icon: BarChart3 },
              { id: "users", name: "Users", icon: Users },
              { id: "suppliers", name: "Suppliers", icon: ShoppingBag },
              { id: "listings", name: "Listings", icon: Package },
              { id: "transactions", name: "Transactions", icon: CreditCard },
              { id: "settings", name: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalWholesalers} wholesalers, {stats.totalRetailers} retailers
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeListings}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalCatalogItems} catalog, {stats.totalDeadStockListings} dead stock
                </p>
              </div>
              <Package className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTransactions}</p>
              </div>
              <CreditCard className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingVerifications}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.businessName || user.email}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {user.businessType || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {user.verified ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Pending
                          </span>
                        )}
                        {user.banned && (
                          <span className="flex items-center text-red-600 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.address?.city || "N/A"}, {user.address?.state || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyUser(user.uid, !user.verified)}
                          className={`p-2 rounded ${
                            user.verified
                              ? "text-orange-600 hover:bg-orange-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={user.verified ? "Unverify" : "Verify"}
                        >
                          {user.verified ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setBanningUser(user)}
                          className={`p-2 rounded ${
                            user.banned
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                          title={user.banned ? "Unban" : "Ban"}
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === "listings" && (
        <div className="space-y-6">
          {/* Catalog Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2 text-green-600" />
                Catalog Items ({filteredCatalog.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCatalog.slice(0, 20).map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.supplierName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{item.price}</td>
                      <td className="px-6 py-4">
                        {item.isActive ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => handleDeleteListing(item, "catalog")}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dead Stock Listings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Package className="h-6 w-6 mr-2 text-blue-600" />
                Dead Stock Listings ({filteredDeadStock.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeadStock.slice(0, 20).map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{listing.productName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{listing.sellerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{listing.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{listing.discountPrice}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          listing.status === "available" ? "bg-green-100 text-green-800" :
                          listing.status === "sold" ? "bg-gray-100 text-gray-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => handleDeleteListing(listing, "deadstock")}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === "suppliers" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Supplier Management</h2>
            <div className="flex-1 max-w-md ml-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <Loading />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers
                      .filter((s) =>
                        s.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.city?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((supplier) => (
                        <tr key={supplier.id || supplier._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {supplier.businessName}
                            </div>
                            <div className="text-sm text-gray-500">{supplier.contactPerson}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{supplier.email}</div>
                            <div className="text-sm text-gray-500">{supplier.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {supplier.city}, {supplier.state}
                            </div>
                            <div className="text-sm text-gray-500">{supplier.pincode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">
                                {supplier.adminRating !== undefined && supplier.adminRating !== null
                                  ? `${supplier.adminRating}/5`
                                  : "Not rated"}
                              </span>
                              {supplier.adminRating !== undefined && supplier.adminRating !== null && (
                                <span className="ml-2 text-yellow-500">★</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {supplier.verified ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Unverified
                                </span>
                              )}
                              {supplier.banned && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Banned
                                </span>
                              )}
                              {supplier.badSupplier && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Bad Supplier
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setRatingSupplier(supplier);
                                  setAdminRating(supplier.adminRating || 0);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Rate Supplier"
                              >
                                <TrendingUp className="h-4 w-4" />
                              </button>
                              {supplier.banned ? (
                                <button
                                  onClick={() => handleUnbanSupplier(supplier.id || supplier._id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Unban Supplier"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setBanningUser(supplier);
                                    setBanReason("");
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                  title="Ban Supplier"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                              {supplier.badSupplier ? (
                                <button
                                  onClick={() => handleUnmarkBadSupplier(supplier.id || supplier._id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Unmark as Bad"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setMarkingBadSupplier(supplier);
                                    setBadSupplierReason("");
                                  }}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Mark as Bad Supplier"
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSupplier(supplier.id || supplier._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Supplier"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {suppliers.filter((s) =>
                  s.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.city?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No suppliers found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500">Transaction management coming soon...</p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Marketplace Settings</h3>
              <p className="text-gray-500">Configure marketplace behavior and features</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Content Moderation</h3>
              <p className="text-gray-500">Manage content approval and moderation rules</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">System Configuration</h3>
              <p className="text-gray-500">System-wide settings and configurations</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleUpdateUser(editingUser.uid, {
                  businessName: formData.get("businessName"),
                  displayName: formData.get("displayName"),
                  phone: formData.get("phone"),
                  role: formData.get("role"),
                  businessType: formData.get("businessType"),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  defaultValue={editingUser.businessName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  defaultValue={editingUser.displayName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingUser.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={editingUser.role || "wholesaler"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="wholesaler">Wholesaler</option>
                  <option value="retailer">Retailer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <select
                  name="businessType"
                  defaultValue={editingUser.businessType}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="wholesaler">Wholesaler</option>
                  <option value="retailer">Retailer</option>
                  <option value="manufacturer">Manufacturer</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ban User/Supplier Modal */}
      {banningUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {banningUser.banned ? "Unban" : "Ban"} {banningUser.businessName && !banningUser.uid ? "Supplier" : "User"}
            </h2>
            <p className="text-gray-600 mb-4">
              {banningUser.banned
                ? `Are you sure you want to unban ${banningUser.businessName || banningUser.email}?`
                : `Are you sure you want to ban ${banningUser.businessName || banningUser.email}?`}
            </p>
            {!banningUser.banned && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ban Reason (required)
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for banning..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setBanningUser(null);
                  setBanReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (banningUser.uid) {
                    handleBanUser(banningUser.uid, !banningUser.banned, banReason);
                  } else {
                    handleBanSupplier(banningUser.id || banningUser._id, banReason);
                  }
                }}
                className={`px-4 py-2 rounded-md text-white ${
                  banningUser.banned
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {banningUser.banned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Supplier Modal */}
      {ratingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Rate Supplier</h2>
            <p className="text-gray-600 mb-4">
              Rate {ratingSupplier.businessName} based on platform activity
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Rating (0-5)
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setAdminRating(rating)}
                    className={`px-4 py-2 rounded-md border ${
                      adminRating === rating
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Current rating: {ratingSupplier.adminRating !== undefined && ratingSupplier.adminRating !== null
                  ? `${ratingSupplier.adminRating}/5`
                  : "Not rated"}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRatingSupplier(null);
                  setAdminRating(0);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRateSupplier(ratingSupplier.id || ratingSupplier._id)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Save Rating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Bad Supplier Modal */}
      {markingBadSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {markingBadSupplier.badSupplier ? "Unmark Bad Supplier" : "Mark as Bad Supplier"}
            </h2>
            <p className="text-gray-600 mb-4">
              {markingBadSupplier.badSupplier
                ? `Are you sure you want to unmark ${markingBadSupplier.businessName} as a bad supplier?`
                : `Mark ${markingBadSupplier.businessName} as a bad supplier. This will affect their visibility on the platform.`}
            </p>
            {!markingBadSupplier.badSupplier && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (required)
                </label>
                <textarea
                  value={badSupplierReason}
                  onChange={(e) => setBadSupplierReason(e.target.value)}
                  placeholder="Enter reason for marking as bad supplier..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setMarkingBadSupplier(null);
                  setBadSupplierReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (markingBadSupplier.badSupplier) {
                    handleUnmarkBadSupplier(markingBadSupplier.id || markingBadSupplier._id);
                  } else {
                    handleMarkBadSupplier(markingBadSupplier.id || markingBadSupplier._id, badSupplierReason);
                  }
                }}
                className={`px-4 py-2 rounded-md text-white ${
                  markingBadSupplier.badSupplier
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {markingBadSupplier.badSupplier ? "Unmark" : "Mark as Bad"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

