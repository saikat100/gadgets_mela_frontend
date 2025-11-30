"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Product } from "../../../types/product";
import { Skeleton } from "../../../components/Skeleton";
import ReviewList from "../../../components/ReviewList";
import ReviewForm from "../../../components/ReviewForm";

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  // Review state
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState("");

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
      loadReviews(params.id as string);
      checkReviewEligibility(params.id as string);
    }
  }, [params.id]);

  async function loadProduct(id: string) {
    try {
      const res = await fetch(api(`/products/${id}`));
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }

  async function loadReviews(id: string) {
    try {
      const res = await fetch(api(`/reviews/product/${id}`));
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  }

  async function checkReviewEligibility(id: string) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(api(`/orders/can-review/${id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCanReview(data.canReview);
        if (data.orderId) setReviewOrderId(data.orderId);
      }
    } catch (err) {
      console.error("Failed to check review eligibility", err);
    }
  }

  function addToCart() {
    if (!product) return;

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = cart.find((item: any) => item._id === product._id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
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

  function calculateDiscountedPrice(price: number, discount: number = 0) {
    return price * (1 - discount / 100);
  }

  if (loading) {
    return (
      <section className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="w-full h-80 rounded" />
          <div>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-10 w-40 mt-6" />
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/products" className="text-primary hover:underline">
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  const finalPrice = calculateDiscountedPrice(product.price, product.discount || 0);

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={600}
            className="rounded-xl object-cover w-full h-auto"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="text-gray-500 line-through text-xl">${product.price.toFixed(2)}</span>
                <span className="text-2xl text-green-600 font-semibold">${finalPrice.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                  -{product.discount}% OFF
                </span>
              </>
            ) : (
              <span className="text-2xl text-green-600 font-semibold">${product.price.toFixed(2)}</span>
            )}
          </div>
          <p className="mt-5 text-gray-700 leading-relaxed">{product.description}</p>
          {product.stock !== undefined && (
            <p className="mt-3 text-sm text-gray-600">
              {product.stock > 0 ? `In Stock: ${product.stock} available` : "Out of Stock"}
            </p>
          )}
          <div className="mt-8 flex gap-4">
            <button
              onClick={addToCart}
              disabled={adding || (product.stock !== undefined && product.stock <= 0)}
              className={`px-5 py-3 rounded-md inline-flex items-center gap-2 ${adding || (product.stock !== undefined && product.stock <= 0)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary text-white hover:opacity-90"
                }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {adding ? "Adding..." : message || "Add to Cart"}
            </button>
            <Link
              href="/products"
              className="px-5 py-3 border rounded-md hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Products
            </Link>
          </div>
          {message && (
            <div className={`mt-4 text-sm ${message.includes("Added") ? "text-green-600" : "text-red-500"}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-12">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            {canReview ? (
              <ReviewForm
                productId={product._id}
                orderId={reviewOrderId}
                onReviewSubmitted={() => {
                  loadReviews(product._id);
                  setCanReview(false);
                }}
              />
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600 mb-2">
                  Have you purchased this product?
                </p>
                <p className="text-sm text-gray-500">
                  Log in and buy this item to leave a review after delivery.
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <ReviewList
              reviews={reviews}
              onReviewUpdated={() => loadReviews(product._id)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}