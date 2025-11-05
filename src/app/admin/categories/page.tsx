"use client";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../AdminSidebar";
import { Skeleton } from "../../../components/Skeleton";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../../lib/api";

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug: string;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string | { _id: string; name: string; slug: string };
  description?: string;
}

export default function AdminCategoriesPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcatsByCat, setSubcatsByCat] = useState<Record<string, SubCategory[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newSubcatName, setNewSubcatName] = useState<Record<string, string>>({});
  const [newSubcatDesc, setNewSubcatDesc] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const res = await fetch(api('/users/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        router.replace("/login");
        return;
      }
      const me = await res.json();
      const admin = me.role === "admin";
      setIsAdmin(admin);
      if (!admin) {
        router.replace("/");
        return;
      }
      await Promise.all([loadCategories(), loadAllSubCategories()]);
    } catch (e) {
      setError("Failed to verify admin access");
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch(api('/categories'));
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      setError("Failed to load categories");
    }
  }

  async function loadAllSubCategories() {
    try {
      const res = await fetch("http://localhost:5000/api/subcategories");
      const data: SubCategory[] = await res.json();
      const grouped: Record<string, SubCategory[]> = {};
      for (const s of data) {
        const catId = typeof s.category === 'string' ? s.category : s.category?._id;
        if (!catId) continue;
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push(s);
      }
      setSubcatsByCat(grouped);
    } catch (e) {
      setError("Failed to load subcategories");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(api('/categories'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({ message: "Failed to add" }));
        throw new Error(msg.message || "Failed to add category");
      }
      setName("");
      setDescription("");
      setShowAddForm(false);
      await Promise.all([loadCategories(), loadAllSubCategories()]);
    } catch (e: any) {
      setError(e.message || "Failed to add category");
    }
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(api(`/categories/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await Promise.all([loadCategories(), loadAllSubCategories()]);
    } catch (e: any) {
      setError(e.message || "Failed to delete category");
    }
  }

  async function handleAddSubcategory(categoryId: string) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(api('/subcategories'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSubcatName[categoryId] || "",
          description: newSubcatDesc[categoryId] || "",
          categoryId,
        }),
      });
      if (!res.ok) throw new Error("Failed to add subcategory");
      setNewSubcatName({ ...newSubcatName, [categoryId]: "" });
      setNewSubcatDesc({ ...newSubcatDesc, [categoryId]: "" });
      await loadAllSubCategories();
    } catch (e: any) {
      setError(e.message || "Failed to add subcategory");
    }
  }

  async function handleDeleteSubcategory(id: string) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(api(`/subcategories/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete subcategory");
      await loadAllSubCategories();
    } catch (e: any) {
      setError(e.message || "Failed to delete subcategory");
    }
  }

  if (loading || isAdmin === null) return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-3 border-t first:border-t-0 flex justify-between items-center">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
  if (!isAdmin) return <div className="p-8">Not authorized</div>;

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Categories</h1>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Category
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAdd} className="bg-white rounded shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Mobile"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Short description"
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex gap-3">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        )}

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <Fragment key={c._id}>
                  <tr className="border-t">
                    <td className="px-4 py-3">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.slug}</td>
                    <td className="px-4 py-3 text-gray-600">{c.description}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="bg-gray-50 px-4 py-3">
                      <div className="flex flex-col gap-3">
                        <div className="font-medium">Subcategories</div>
                        <div className="flex flex-wrap gap-2">
                          {(subcatsByCat[c._id] || []).map((s) => (
                            <span key={s._id} className="inline-flex items-center gap-2 bg-white border rounded px-2 py-1">
                              <span>{s.name}</span>
                              <button onClick={() => handleDeleteSubcategory(s._id)} className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                          {(!subcatsByCat[c._id] || subcatsByCat[c._id].length === 0) && (
                            <span className="text-gray-500">No subcategories</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            value={newSubcatName[c._id] || ''}
                            onChange={(e) => setNewSubcatName({ ...newSubcatName, [c._id]: e.target.value })}
                            className="border rounded px-3 py-2"
                            placeholder="Subcategory name"
                          />
                          <input
                            value={newSubcatDesc[c._id] || ''}
                            onChange={(e) => setNewSubcatDesc({ ...newSubcatDesc, [c._id]: e.target.value })}
                            className="border rounded px-3 py-2"
                            placeholder="Description (optional)"
                          />
                          <button
                            onClick={() => handleAddSubcategory(c._id)}
                            className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Add Subcategory
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>No categories yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}


