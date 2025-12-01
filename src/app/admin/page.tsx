"use client";
import AdminHeader from "@/components/admin-header";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Business } from "@/types/business";
import {
  Activity,
  Users,
  Building2,
  FileText,
  Search,
  MoreVertical,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  MessageCircle,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Types
interface User {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: {
    full_name?: string;
  };
  identities?: Array<{
    provider: string;
  }>;
}

interface AdminUser {
  email: string;
  name: string;
}

type TabId = "users" | "business" | "reports";

// Subcomponents
const UserAvatar: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
    {name[0]?.toUpperCase()}
  </div>
);

const StatusBadge: React.FC<{ isOpen: boolean | undefined }> = ({ isOpen }) => {
  if (isOpen === undefined) {
    return (
      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        Unknown
      </span>
    );
  }

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
        isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isOpen ? "Open" : "Closed"}
    </span>
  );
};

const ProviderBadge: React.FC<{ provider: string }> = ({ provider }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 capitalize">
    {provider}
  </span>
);

const DeleteConfirmation: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex gap-2">
    <span className="text-xs text-gray-700">Delete?</span>
    <button onClick={onConfirm} className="text-red-600 hover:text-red-700">
      <CheckCircle className="w-4 h-4" />
    </button>
    <button onClick={onCancel} className="text-gray-600 hover:text-gray-700">
      <XCircle className="w-4 h-4" />
    </button>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center gap-2 text-red-600">
    <AlertCircle className="w-5 h-5" /> {message}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-gray-600 text-center py-8">{message}</p>
);

const SearchBar: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ placeholder, value, onChange }) => (
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
    />
  </div>
);

// Admin Header Component

// Users Table Component
const UsersTable: React.FC<{
  users: User[];
  loading: boolean;
  error: string | null;
  deletingUserId: string | null;
  confirmUserId: string | null;
  onDeleteUser: (userId: string) => void;
  onSetConfirmUserId: (userId: string | null) => void;
}> = ({
  users,
  loading,
  error,
  deletingUserId,
  confirmUserId,
  onDeleteUser,
  onSetConfirmUserId,
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (users.length === 0) return <EmptyState message="No users found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700"></th>
            <th className="px-4 py-3 text-left text-gray-700">UID</th>
            <th className="px-4 py-3 text-left text-gray-700">Display name</th>
            <th className="px-4 py-3 text-left text-gray-700">Email</th>
            <th className="px-4 py-3 text-left text-gray-700">Provider</th>
            <th className="px-4 py-3 text-left text-gray-700">Created at</th>
            <th className="px-4 py-3 text-left text-gray-700"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => {
            const provider = user.identities?.[0]?.provider || "email";
            const name =
              user.user_metadata?.full_name || user.email?.split("@")[0] || "—";

            return (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <UserAvatar name={name} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {user.id}
                </td>
                <td className="px-4 py-3 text-gray-900">{name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email || "—"}</td>
                <td className="px-4 py-3">
                  <ProviderBadge provider={provider} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(user.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 relative">
                  <button
                    onClick={() =>
                      onSetConfirmUserId(
                        confirmUserId === user.id ? null : user.id
                      )
                    }
                    className="p-1 rounded hover:bg-gray-100 text-gray-600"
                    disabled={deletingUserId === user.id}
                  >
                    {deletingUserId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MoreVertical className="w-4 h-4" />
                    )}
                  </button>

                  {confirmUserId === user.id && (
                    <DeleteConfirmation
                      onConfirm={() => onDeleteUser(user.id)}
                      onCancel={() => onSetConfirmUserId(null)}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Business Table Component
const BusinessTable: React.FC<{
  businesses: Business[];
  loading: boolean;
  deletingBizId: string | null;
  confirmBizId: string | null;
  onDeleteBusiness: (id: string) => void;
  onSetConfirmBizId: (id: string | null) => void;
}> = ({
  businesses,
  loading,
  deletingBizId,
  confirmBizId,
  onDeleteBusiness,
  onSetConfirmBizId,
}) => {
  if (loading) return <LoadingSpinner />;
  if (businesses.length === 0)
    return <EmptyState message="No businesses found." />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700">Image</th>
            <th className="px-4 py-3 text-left text-gray-700">Name</th>
            <th className="px-4 py-3 text-left text-gray-700">Category</th>
            <th className="px-4 py-3 text-left text-gray-700">Rating</th>
            <th className="px-4 py-3 text-left text-gray-700">Reviews</th>
            <th className="px-4 py-3 text-left text-gray-700">Status</th>
            <th className="px-4 py-3 text-left text-gray-700"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {businesses.map((biz) => (
            <tr key={biz.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                  {biz.image ? (
                    <img
                      src={biz.image}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{biz.name}</div>
              </td>
              <td className="px-4 py-3">
                <span className="text-gray-600">{biz.category}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-gray-900 font-medium">
                    {biz.rating}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-gray-600">{biz.reviews}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge isOpen={biz.isopen} />
              </td>
              <td className="px-4 py-3 relative">
                <button
                  onClick={() =>
                    onSetConfirmBizId(confirmBizId === biz.id ? null : biz.id)
                  }
                  className="p-1 rounded hover:bg-gray-100 text-gray-600"
                  disabled={deletingBizId === biz.id}
                >
                  {deletingBizId === biz.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MoreVertical className="w-4 h-4" />
                  )}
                </button>

                {confirmBizId === biz.id && (
                  <DeleteConfirmation
                    onConfirm={() => onDeleteBusiness(biz.id)}
                    onCancel={() => onSetConfirmBizId(null)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Custom Hooks
const useUsers = (activeTab: TabId) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab !== "users") return;

    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/users");
        const { users: data, error } = await response.json();
        if (!response.ok) throw new Error(error || "Failed to load users");
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [activeTab]);

  const deleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const { error } = await response.json();
      if (!response.ok) throw new Error(error || "Delete failed");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmUserId(null);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.id.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.user_metadata?.full_name?.toLowerCase().includes(query)
    );
  });

  return {
    users: filteredUsers,
    loading,
    error,
    deletingUserId,
    confirmUserId,
    searchQuery,
    setSearchQuery,
    setConfirmUserId,
    deleteUser,
  };
};

const useBusinesses = (activeTab: TabId) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBizId, setDeletingBizId] = useState<string | null>(null);
  const [confirmBizId, setConfirmBizId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab !== "business") return;

    const loadBusinesses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .order("name");
        if (error) throw error;
        setBusinesses(data || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [activeTab]);

  const deleteBusiness = async (id: string) => {
    setDeletingBizId(id);
    try {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      setConfirmBizId(null);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeletingBizId(null);
    }
  };

  const filteredBusinesses = businesses.filter((biz) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      biz.name.toLowerCase().includes(query) ||
      biz.category?.toLowerCase().includes(query)
    );
  });

  return {
    businesses: filteredBusinesses,
    loading,
    deletingBizId,
    confirmBizId,
    searchQuery,
    setSearchQuery,
    setConfirmBizId,
    deleteBusiness,
  };
};

// Main Component
export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const usersData = useUsers(activeTab);
  const businessData = useBusinesses(activeTab);

  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalLogins: 0,
    avgPerUser: "0",
  });
  const [whatsappStats, setWhatsappStats] = useState({
    totalClicks: 0,
    todayClicks: 0,
    monthClicks: 0,
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: statsData } = await supabase
          .from("user_login_stats")
          .select("*");

        const totalUsers = statsData?.length || 0;
        const totalLogins =
          statsData?.reduce((sum, user) => sum + user.total_logins, 0) || 0;
        const avgPerUser =
          totalUsers > 0 ? (totalLogins / totalUsers).toFixed(1) : "0";

        setUserStats({ totalUsers, totalLogins, avgPerUser });
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    const fetchWhatsAppStats = async () => {
      try {
        const response = await fetch("/api/admin/whatsapp-clicks");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch clicks");
        }

        const clicks = result.data || [];
        const now = new Date();

        // Calculate stats
        const totalClicks = clicks.length;

        const todayClicks = clicks.filter(
          (c: any) =>
            new Date(c.clicked_at).toDateString() === now.toDateString()
        ).length;

        const monthClicks = clicks.filter(
          (c: any) =>
            new Date(c.clicked_at) >=
            new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        setWhatsappStats({
          totalClicks,
          todayClicks,
          monthClicks,
        });
      } catch (err) {
        console.error("Error fetching WhatsApp stats:", err);
      }
    };

    fetchWhatsAppStats();
  }, []);

  // CRITICAL: Check admin authentication first
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.log("❌ No session found - redirecting to admin login");
          router.push("/admin/login");
          return;
        }

        const userRole = session.user?.user_metadata?.role;
        const userEmail = session.user?.email;

        console.log("🔍 Checking admin access:");
        console.log("   Role:", userRole);
        console.log("   Email:", userEmail);

        // Check if user is actually an admin
        if (userRole !== "admin" && userEmail !== "admin@tookdeal.com") {
          console.log("❌ Access denied - not an admin");
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        console.log("✅ Admin access granted");

        // Load admin user info
        setAdminUser({
          email: session.user.email || "",
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "Admin",
        });

        setAuthChecking(false);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        router.push("/admin/login");
      }
    };

    checkAdminAuth();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/admin/login");
    } catch (err: any) {
      alert("Logout failed: " + err.message);
      setLoggingOut(false);
    }
  };

  const handleAddBusiness = () => {
    router.push("/admin/business/add");
  };

  // Show loading while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "users" as const,
      label: "Users",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="p-6 bg-white text-gray-900 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">User Management</h2>
          </div>

          <div className="flex gap-3 mb-4">
            <SearchBar
              placeholder="Search by User ID, email, or name"
              value={usersData.searchQuery}
              onChange={usersData.setSearchQuery}
            />
          </div>

          <UsersTable
            users={usersData.users}
            loading={usersData.loading}
            error={usersData.error}
            deletingUserId={usersData.deletingUserId}
            confirmUserId={usersData.confirmUserId}
            onDeleteUser={usersData.deleteUser}
            onSetConfirmUserId={usersData.setConfirmUserId}
          />
        </div>
      ),
    },
    {
      id: "business" as const,
      label: "Business",
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <div className="p-6 bg-white text-gray-900 min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Business Management</h2>
            <button
              onClick={handleAddBusiness}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
            >
              <Building2 className="w-4 h-4" /> Add business
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <SearchBar
              placeholder="Search by name or category"
              value={businessData.searchQuery}
              onChange={businessData.setSearchQuery}
            />
          </div>

          <BusinessTable
            businesses={businessData.businesses}
            loading={businessData.loading}
            deletingBizId={businessData.deletingBizId}
            confirmBizId={businessData.confirmBizId}
            onDeleteBusiness={businessData.deleteBusiness}
            onSetConfirmBizId={businessData.setConfirmBizId}
          />
        </div>
      ),
    },
    {
      id: "reports" as const,
      label: "Reports",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Reports & Analytics
              </h2>
            </div>
            <p className="text-gray-600 ml-14">
              Track performance metrics and gain insights into your platform's
              activity
            </p>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Traffic Card */}
            <div
              onClick={() => (window.location.href = "/admin/user-reports")}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Top Gradient Bar */}
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        User Traffic
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Real-time monitoring
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Monitor total visits, returning users, and engagement trends
                  across your platform.
                </p>

                {/* Stats Preview */}
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats.totalLogins.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total Logins</p>
                  </div>
                  <div className="border-l border-gray-200 pl-6">
                    <p className="text-2xl font-bold text-gray-900">
                      {userStats.avgPerUser}
                    </p>
                    <p className="text-xs text-gray-500">Avg per User</p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">
                      Traffic Chart
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Traffic Card */}
            <div
              onClick={() => (window.location.href = "/admin/whatsapptrack")}
              className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600" />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        WhatsApp Traffic
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Lead conversions
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Track clicks, messages sent, and conversions from WhatsApp
                  leads and campaigns.
                </p>

                {/* Stats Preview - Real Data */}
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {whatsappStats.todayClicks}
                    </p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                  <div className="border-l border-gray-200 pl-6">
                    <p className="text-2xl font-bold text-gray-900">
                      {whatsappStats.monthClicks}
                    </p>
                    <p className="text-xs text-gray-500">This Month</p>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="h-32 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-dashed border-green-200 rounded-xl">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-green-600 font-medium">
                      Activity Chart
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader adminUser={adminUser} />

      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto">{currentTab.content}</main>
    </div>
  );
}
