"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "../../../../components/Skeleton";
import { api } from "../../../../lib/api";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch(api(`/orders/${orderId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load order");
        setOrder(await res.json());
      } catch (e: any) {
        setError(e.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, router]);

  async function cancelOrder() {
    if (!order || order.status !== 'pending') return;
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(api(`/orders/${order._id}/cancel`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Failed to cancel order' }));
        throw new Error(data.message || 'Failed to cancel order');
      }
      const data = await res.json();
      setOrder((prev: any) => ({ ...prev, status: data.order?.status || 'cancelled' }));
    } catch (e: any) {
      setError(e.message || 'Failed to cancel order');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <section className="max-w-4xl mx-auto p-6">
      <Skeleton className="h-7 w-64 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded bg-white">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-3 w-40 mb-2" />
          <Skeleton className="h-3 w-48 mb-2" />
          <Skeleton className="h-3 w-36 mb-2" />
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="p-4 border rounded bg-white">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-3 w-56 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="p-4 border rounded bg-white">
        <Skeleton className="h-5 w-24 mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-t">
            <Skeleton className="w-12 h-12 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </section>
  );
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return null;

  return (
    <section className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order #{String(order._id).slice(-6)}</h1>
      <div className="mb-4 flex items-center gap-4">
        <div>Status: <span className="font-semibold capitalize">{order.status}</span></div>
        {order.status === 'pending' && (
          <button
            disabled={submitting}
            onClick={cancelOrder}
            className="text-red-600 hover:text-red-800 border border-red-300 rounded px-3 py-1 disabled:opacity-60"
          >
            {submitting ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded bg-white">
          <h2 className="font-semibold mb-2">Shipping</h2>
          <div className="text-sm text-gray-700">
            <div>{order.shippingAddress?.name}</div>
            <div>{order.shippingAddress?.phone}</div>
            <div>{order.shippingAddress?.address}</div>
            <div>{order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}</div>
            <div>{order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</div>
          </div>
        </div>
        <div className="p-4 border rounded bg-white">
          <h2 className="font-semibold mb-2">Payment</h2>
          {order.paymentId === 'COD' || !order.paymentId ? (
            <div className="text-sm text-gray-700">Payment: COD</div>
          ) : (
            <div className="text-sm text-gray-700">Paid Amount: ${order.total?.toFixed(2)}</div>
          )}
          <div className="text-sm text-gray-700 mt-1">Total: ${order.total?.toFixed(2)}</div>
        </div>
      </div>

      <div className="p-4 border rounded bg-white">
        <h2 className="font-semibold mb-3">Items</h2>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Image</th>
              <th className="text-left px-4 py-2">Product</th>
              <th className="text-left px-4 py-2">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.products.map((it: any, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">
                  {(it.product?.imageUrl || it.imageUrl) ? (
                    <img
                      src={it.product?.imageUrl || it.imageUrl}
                      alt={it.product?.name || it.name || 'Item'}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </td>
                <td className="px-4 py-2">{it.product?.name || it.name || 'Item'}</td>
                <td className="px-4 py-2">{it.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


