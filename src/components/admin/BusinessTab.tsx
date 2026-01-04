import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Business } from "@/types/business";
import {
  Building2,
  Search,
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";

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

const ActionMenu: React.FC<{
  businessId: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ businessId, onEdit, onDelete, onClose }) => (
  <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
    <button
      onClick={onEdit}
      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
    >
      <Pencil className="w-4 h-4" />
      Edit
    </button>
    <button
      onClick={onDelete}
      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  </div>
);

const DeleteConfirmation: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-3">
    <p className="text-sm text-gray-700 mb-3">Delete this business?</p>
    <div className="flex gap-2 justify-end">
      <button
        onClick={onCancel}
        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Delete
      </button>
    </div>
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

export default function BusinessTab() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBizId, setDeletingBizId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBusinesses();
  }, []);

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

  const handleEdit = (id: string) => {
    router.push(`/admin/business/edit/${id}`);
  };

  const deleteBusiness = async (id: string) => {
    setDeletingBizId(id);
    try {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (error) throw error;
      setBusinesses((prev) => prev.filter((b) => b.id !== id));
      setConfirmDeleteId(null);
      setActiveMenuId(null);
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

  const handleAddBusiness = () => {
    router.push("/admin/business/add");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
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
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {filteredBusinesses.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No businesses found.</p>
      ) : (
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
              {filteredBusinesses.map((biz) => (
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
                        setActiveMenuId(activeMenuId === biz.id ? null : biz.id)
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

                    {activeMenuId === biz.id && confirmDeleteId !== biz.id && (
                      <ActionMenu
                        businessId={biz.id}
                        onEdit={() => handleEdit(biz.id)}
                        onDelete={() => {
                          setConfirmDeleteId(biz.id);
                          setActiveMenuId(null);
                        }}
                        onClose={() => setActiveMenuId(null)}
                      />
                    )}

                    {confirmDeleteId === biz.id && (
                      <DeleteConfirmation
                        onConfirm={() => deleteBusiness(biz.id)}
                        onCancel={() => setConfirmDeleteId(null)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}