import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  MoreVertical,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

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

const UserAvatar: React.FC<{ name: string }> = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
    {name[0]?.toUpperCase()}
  </div>
);

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

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 p-6">
        <AlertCircle className="w-5 h-5" /> {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Management</h2>
      </div>

      <div className="flex gap-3 mb-4">
        <SearchBar
          placeholder="Search by User ID, email, or name"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700"></th>
                <th className="px-4 py-3 text-left text-gray-700">UID</th>
                <th className="px-4 py-3 text-left text-gray-700">
                  Display name
                </th>
                <th className="px-4 py-3 text-left text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-gray-700">Provider</th>
                <th className="px-4 py-3 text-left text-gray-700">
                  Created at
                </th>
                <th className="px-4 py-3 text-left text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.map((user) => {
                const provider = user.identities?.[0]?.provider || "email";
                const name =
                  user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "—";

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <UserAvatar name={name} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.email || "—"}
                    </td>
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
                          setConfirmUserId(
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
                          onConfirm={() => deleteUser(user.id)}
                          onCancel={() => setConfirmUserId(null)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}