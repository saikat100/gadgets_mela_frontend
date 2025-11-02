"use client";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../types/product";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  function calculateDiscountedPrice(price: number, discount: number = 0) {
    return price * (1 - discount / 100);
  }

  function addToCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      const existingItem = cart.find((item: any) => item._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }
      
      localStorage.setItem("cart", JSON.stringify(cart));
      setAdding(true);
      setMessage("Added to cart!");
      
      setTimeout(() => {
        setAdding(false);
        setMessage("");
      }, 2000);
    } catch (err) {
      setMessage("Failed to add to cart");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  const finalPrice = calculateDiscountedPrice(product.price, product.discount || 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition flex flex-col">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={300}
        height={200}
        className="rounded-lg object-cover w-full"
      />
      <h3 className="mt-3 text-lg font-semibold">{product.name}</h3>
      <div className="mt-2 flex items-center gap-2">
        {product.discount && product.discount > 0 ? (
          <>
            <span className="text-gray-500 line-through">${product.price.toFixed(2)}</span>
            <span className="text-primary font-semibold">${finalPrice.toFixed(2)}</span>
            <span className="text-red-600 text-sm font-medium">-{product.discount}%</span>
          </>
        ) : (
          <span className="text-primary font-semibold">${product.price.toFixed(2)}</span>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/products/${product._id}`}
          className="flex-1 text-center bg-primary text-white px-4 py-2 rounded hover:opacity-90 inline-flex items-center justify-center gap-1"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={addToCart}
          disabled={adding || (product.stock !== undefined && product.stock <= 0)}
          className={`flex-1 px-4 py-2 rounded inline-flex items-center justify-center gap-1 ${
            adding || (product.stock !== undefined && product.stock <= 0)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{adding ? "Adding..." : message || "Add to Cart"}</span>
        </button>
      </div>
      {message && (
        <div className={`mt-2 text-sm ${adding && message.includes("Added") ? "text-green-600" : "text-red-500"}`}>
          {message}
        </div>
      )}
    </div>
  );
}