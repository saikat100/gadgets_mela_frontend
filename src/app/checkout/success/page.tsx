"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("Completing your order...");

  useEffect(() => {
    // If coming from Stripe, attempt to create the order now
    const sessionId = params.get("session_id");
    const cartRaw = localStorage.getItem("cart") || "[]";
    const cart = JSON.parse(cartRaw || "[]");
    if (cart.length === 0) {
      setMessage("Payment successful. No items in cart.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Payment successful. Please login to complete your order.");
      return;
    }
    (async () => {
      try {
        const total = cart.reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || 1), 0);
        const res = await fetch(api('/orders'), {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            products: cart.map((c: any) => ({ product: c.productId, quantity: c.quantity })),
            total,
            paymentId: sessionId || "STRIPE",
            shippingAddress: {},
          }),
        });
        if (!res.ok) throw new Error("Failed to create order");
        localStorage.removeItem("cart");
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        setMessage("Order placed successfully. Redirecting to your orders...");
        setTimeout(() => router.push("/user/dashboard"), 1500);
      } catch (e: any) {
        setMessage(e.message || "Order completion failed. Please contact support.");
      }
    })();
  }, [params, router]);

  return (
    <section className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Payment Successful</h1>
      <p>{message}</p>
    </section>
  );
}


