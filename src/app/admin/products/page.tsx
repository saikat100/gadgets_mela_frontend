"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../AdminSidebar";
import Image from "next/image";
import { Product } from "../../../types/product";
import { api } from "../../../lib/api";
import { Trash2, Edit2, Plus, X, Save } from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [subcatsByCat, setSubcatsByCat] = useState<Record<string, Array<{ _id: string; name: string; slug: string; category: string }>>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    price: "",
    discount: "",
    imageUrl: "",
    stock: "",
  });

  useEffect(() => {
    checkAdminAndLoadProducts();
  }, []);

  async function checkAdminAndLoadProducts() {
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

      const userData = await res.json();
      setIsAdmin(userData.role === "admin");

      if (userData.role !== "admin") {
        router.replace("/");
        return;
      }

      await Promise.all([loadProducts(token), loadCategoriesAndSubcats()]);
    } catch (err) {
      setError("Failed to verify admin access");
      setIsAdmin(false);
    }
  }

  async function loadProducts(token: string) {
    try {
      const res = await fetch(api('/products'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load products");
      setLoading(false);
    }
  }

  async function loadCategoriesAndSubcats() {
    try {
      const [catsRes, subsRes] = await Promise.all([
        fetch(api('/categories')),
        fetch(api('/subcategories')),
      ]);
      const cats = await catsRes.json();
      const subs = await subsRes.json();
      setCategories(cats);
      const grouped: Record<string, Array<{ _id: string; name: string; slug: string; category: string }>> = {};
      for (const s of subs) {
        const catId = typeof s.category === 'string' ? s.category : s.category?._id;
        if (!catId) continue;
        if (!grouped[catId]) grouped[catId] = [];
        grouped[catId].push({ _id: s._id, name: s.name, slug: s.slug, category: catId });
      }
      setSubcatsByCat(grouped);
    } catch {
      // ignore; leave lists empty
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      category: "",
      subCategory: "",
      price: "",
      discount: "",
      imageUrl: "",
      stock: "",
    });
    setShowAddForm(false);
    setEditingId(null);
    setError("");
  }

  function startEdit(product: Product) {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory || "",
      price: product.price.toString(),
      discount: (product.discount || 0).toString(),
      imageUrl: product.imageUrl,
      stock: (product.stock || 0).toString(),
    });
    setEditingId(product._id);
    setShowAddForm(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setError("");

    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      price: parseFloat(formData.price),
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      imageUrl: formData.imageUrl,
      stock: parseInt(formData.stock) || 0,
    };

    try {
      if (editingId) {
        const res = await fetch(api(`/products/${editingId}`), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to update product");
        }

        await loadProducts(token);
        resetForm();
      } else {
        const res = await fetch(api('/products'), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to create product");
        }

        await loadProducts(token);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || "Operation failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(api(`/products/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete product");
      }

      await loadProducts(token);
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  }

  function calculateDiscountedPrice(price: number, discount: number = 0) {
    return price * (1 - discount / 100);
  }

  if (isAdmin === null || loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded p-4">
                <Skeleton className="h-28 w-full mb-3" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div>Not authorized</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Products</h1>
          {!showAddForm && !editingId && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Product
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {(showAddForm || editingId) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: "" })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sub Category (Optional)</label>
                  {(() => {
                    const selectedCat = categories.find((c) => c.name === formData.category);
                    const subcats = selectedCat ? (subcatsByCat[selectedCat._id] || []) : [];
                    return (
                      <select
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        disabled={!selectedCat}
                        className="w-full p-2 border rounded disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        <option value="">{selectedCat ? "Select Subcategory (optional)" : "Select a category first"}</option>
                        {subcats.map((s) => (
                          <option key={s._id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded hover:opacity-90 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {editingId ? "Update" : "Create"} Product
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No products found. Add your first product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{product.category}</div>
                        {product.subCategory && (
                          <div className="text-sm text-gray-500">{product.subCategory}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.discount ? `${product.discount}%` : "0%"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                        ${calculateDiscountedPrice(product.price, product.discount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.stock || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}