"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { api } from "../lib/api";

const categories = ["Gadgets", "Device"];
const activeCategory = "Device";

interface Product {
    _id: string;
    name: string;
    price: number;
    discount?: number;
    imageUrl: string;
    createdAt: string;
}

export default function BestDeal() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBestDeals() {
            try {
                const res = await fetch(api("/products/"));
                if (res.ok) {
                    const data = await res.json();
                    // Filter only products with discount and sort by discount descending
                    const sorted = data
                        .filter((p: Product) => p.discount && p.discount > 0)
                        .sort((a: Product, b: Product) => (b.discount || 0) - (a.discount || 0))
                        .slice(0, 7);
                    setProducts(sorted);
                }
            } catch (err) {
                console.error("Failed to fetch best deals", err);
            } finally {
                setLoading(false);
            }
        }
        fetchBestDeals();
    }, []);

    if (loading) {
        return (
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold">
                        Best{" "}
                        <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                            Deal
                        </span>
                    </h2>

                    <div className="flex gap-2">
                        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <ChevronLeft size={18} />
                        </button>
                        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-3 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`px-4 py-1 rounded-full text-sm font-medium border transition ${cat === activeCategory
                                    ? "bg-black text-white border-black"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    {products.map((product) => {
                        const discountedPrice = product.discount
                            ? product.price * (1 - product.discount / 100)
                            : product.price;

                        return (
                            <Link
                                key={product._id}
                                href={`/products/${product._id}`}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 block"
                            >
                                <div className="w-full aspect-[3/4] relative mb-4">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-contain rounded-xl"
                                    />
                                </div>

                                <h3 className="text-sm font-medium text-gray-800 mb-1">
                                    {product.name}
                                </h3>

                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold text-black">
                                        ৳ {discountedPrice.toFixed(2)}
                                    </span>
                                    {product.discount && product.discount > 0 && (
                                        <span className="text-gray-400 line-through text-sm">
                                            ৳ {product.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                {product.discount && product.discount > 0 && (
                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                        {product.discount}% OFF
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {products.length === 0 && !loading && (
                    <p className="text-gray-500 py-8">No deals available yet</p>
                )}
            </div>
        </section>
    );
}
