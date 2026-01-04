import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  FileText,
  Users,
  MessageCircle,
  ArrowUpRight,
  BarChart3,
  Activity,
} from "lucide-react";

interface UserStats {
  totalUsers: number;
  totalLogins: number;
  avgPerUser: string;
}

interface WhatsAppStats {
  totalClicks: number;
  todayClicks: number;
  monthClicks: number;
}

export default function ReportsTab() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    totalLogins: 0,
    avgPerUser: "0",
  });

  const [whatsappStats, setWhatsappStats] = useState<WhatsAppStats>({
    totalClicks: 0,
    todayClicks: 0,
    monthClicks: 0,
  });

  useEffect(() => {
    fetchUserStats();
    fetchWhatsAppStats();
  }, []);

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

  const fetchWhatsAppStats = async () => {
    try {
      const response = await fetch("/api/admin/whatsapp-clicks");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch clicks");
      }

      const clicks = result.data || [];
      const now = new Date();

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

  return (
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
              Track clicks, messages sent, and conversions from WhatsApp leads
              and campaigns.
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
  );
}