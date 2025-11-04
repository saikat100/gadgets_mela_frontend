"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const categories = ["Gadgets", "Device"];
const activeCategory = "Device";

const products = [
  {
    id: 1,
    name: "Nothing Phone (3) 5G",
    price: 72000,
    oldPrice: 90000,
    discount: "20% OFF",
    image: "/images/nothing-phone-3.png",
  },
  {
    id: 2,
    name: "Nothing Phone (3a) Pro 5G",
    price: 36000,
    oldPrice: 45000,
    discount: "20% OFF",
    image: "/images/nothing-phone-3a.png",
  },
  {
    id: 3,
    name: "Motorola Edge 60 Pro 5G",
    price: 37000,
    oldPrice: 42000,
    discount: "12% OFF",
    image: "/images/motorola-edge-60-pro.png",
  },
  {
    id: 4,
    name: "Motorola Edge 60 Fusion 5G",
    price: 28700,
    oldPrice: 38000,
    discount: "24% OFF",
    image: "/images/motorola-edge-60-fusion.png",
  },
  {
    id: 5,
    name: "Pixel 10",
    price: 81000,
    oldPrice: null,
    discount: null,
    image: "/images/pixel-10.png",
  },
  {
    id: 6,
    name: "Pixel 10",
    price: 81000,
    oldPrice: null,
    discount: null,
    image: "/images/pixel-10.png",
  },
  {
    id: 7,
    name: "Pixel 10",
    price: 81000,
    oldPrice: null,
    discount: null,
    image: "/images/pixel-10.png",
  },
];

export default function TopSale() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">
          Top{" "}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Sale
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
              className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
                cat === activeCategory
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
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4"
            >
              <div className="w-full aspect-[3/4] relative mb-4">
                <Image
                  src={product.image}
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
                  ৳ {product.price}
                </span>
                {product.oldPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    ৳ {product.oldPrice}
                  </span>
                )}
              </div>

              {product.discount && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                  {product.discount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
