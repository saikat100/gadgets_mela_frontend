"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "STRIPE">("COD");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const parsed = JSON.parse(raw);
      setCart(parsed);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const me = await res.json();
        if (me?.name && !address.fullName) {
          setAddress((prev) => ({ ...prev, fullName: me.name }));
        }
      } catch {
        // ignore
      }
    })();
  }, [address.fullName]);

  const subtotal = cart.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);

  async function placeCodOrder() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(api('/orders'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products: cart.map((c) => ({ product: c.productId, quantity: c.quantity })),
          total: subtotal,
          paymentId: "COD",
          shippingAddress: address,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Order failed" }));
        throw new Error(data.message || "Order failed");
      }
      localStorage.removeItem("cart");
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      router.push("/checkout/success");
    } catch (e: any) {
      setError(e.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  async function payWithStripe() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(api('/payments/checkout-session'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({ name: c.name, price: c.price, quantity: c.quantity })),
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });
      if (!res.ok) throw new Error("Failed to start payment");
      const data = await res.json();
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Stripe checkout failed");
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }
    if (paymentMethod === "COD") await placeCodOrder();
    else await payWithStripe();
  }

  return (
    <section className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {error && (
        <div className="mb-4 bg-red-100 text-red-700 border border-red-300 px-4 py-3 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
              <input className="border rounded px-3 py-2" placeholder="Phone Number" required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Address Line" required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              <input className="border rounded px-3 py-2" placeholder="City" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <input className="border rounded px-3 py-2" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              <input className="border rounded px-3 py-2" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
              <input className="border rounded px-3 py-2" placeholder="Country" required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Payment Method</h2>
            <div className="flex gap-6">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <span>Cash on Delivery</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="payment" value="STRIPE" checked={paymentMethod === 'STRIPE'} onChange={() => setPaymentMethod('STRIPE')} />
                <span>Stripe</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
            <div className="space-y-2 max-h-64 overflow-auto">
              {cart.map((c, idx) => (
                <div key={`${c.productId}-${idx}`} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-gray-600">x{c.quantity}</div>
                  </div>
                  <div>${(c.price * c.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button disabled={submitting} type="submit" className="w-full mt-4 bg-primary text-white rounded px-4 py-2 hover:opacity-90 disabled:opacity-60">
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}


