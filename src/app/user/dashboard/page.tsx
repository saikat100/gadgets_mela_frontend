"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";

interface OrderItem {
  product: any;
  quantity: number;
}

interface Order {
  _id: string;
  total: number;
  createdAt: string;
  products: OrderItem[];
  status?: string;
}

export default function UserDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to view your dashboard.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const meRes = await fetch(api('/users/me'), { headers: { Authorization: `Bearer ${token}` } });
        if (meRes.ok) setUser(await meRes.json());
        const res = await fetch(api('/orders/mine'), { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load orders");
        setOrders(await res.json());
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <section className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Dashboard</h1>
      {error && <div className="mb-4 bg-red-100 text-red-700 border border-red-300 px-4 py-3 rounded">{error}</div>}

      {user && (
        <div className="mb-6 p-4 border rounded bg-white">
          <div className="font-semibold">Welcome, {user.name}</div>
          <div className="text-gray-600 text-sm">{user.email}</div>
        </div>
      )}

      <div className="p-4 border rounded bg-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">My Orders</h2>
          <Link className="text-primary hover:underline" href="/products">Continue shopping</Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-gray-600">You have no orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Order</th>
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-left px-4 py-2">Items</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Payment</th>
                  <th className="text-right px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t">
                    <td className="px-4 py-2"><a className="text-primary hover:underline" href={`/user/orders/${o._id}`}>#{o._id.slice(-6)}</a></td>
                    <td className="px-4 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {o.products.map((p, idx) => (
                        <span key={idx} className="mr-2">{p.product?.name || 'Item'} x{p.quantity}</span>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${o.status === 'paid' ? 'bg-green-100 text-green-700' : o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {o.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {o.paymentId === 'COD' || !o.paymentId ? 'COD' : `$${o.total.toFixed(2)} paid`}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">${o.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}


