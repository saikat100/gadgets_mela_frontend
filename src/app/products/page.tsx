"use client";
import { useEffect, useState } from "react";
import ProductGrid from "../../components/ProductGrid";
import { Product } from "../../types/product";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-primary">Our Products</h2>
        <div className="text-center py-12">Loading products...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-primary">Our Products</h2>
        <div className="text-center py-12 text-red-500">{error}</div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-primary">Our Products</h2>
      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No products available.</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}