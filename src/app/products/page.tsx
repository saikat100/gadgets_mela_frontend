"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import ProductGrid from "../../components/ProductGrid";
import { Product } from "../../types/product";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import { SkeletonCard } from "../../components/Skeleton";

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const selectedSub = searchParams.get("sub") || "";
  const query = searchParams.get("q") || searchParams.get("search") || "";

  const heading = useMemo(() => {
    if (selectedCategory && selectedSub) return `${selectedCategory} / ${selectedSub}`;
    if (selectedCategory) return selectedCategory;
    if (query) return `Search: ${query}`;
    return "Our Products";
  }, [selectedCategory, selectedSub, query]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  useEffect(() => {
    loadProducts();
    setCurrentPage(1);
  }, [selectedCategory, selectedSub, query]);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedSub) params.set("sub", selectedSub);
      if (query) params.set("q", query);
      const url = `${api('/products')}${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(totalPages);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-primary">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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
      <h2 className="text-2xl font-bold mb-6 text-primary">{heading}</h2>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {selectedCategory || selectedSub ? "No products found for this filter." : "No products available."}
        </div>
      ) : (
        <>
          <ProductGrid products={currentProducts} />

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={handleFirstPage}
                disabled={currentPage === 1}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="px-4">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={handleLastPage}
                disabled={currentPage === totalPages}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
