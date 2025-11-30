"use client";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../AdminSidebar";
import { api } from "../../../lib/api";
import { Skeleton } from "../../../components/Skeleton";
import { ChevronDown, ChevronUp, Package } from "lucide-react";

interface OrderProduct {
    product?: {
        _id: string;
        name: string;
        imageUrl: string;
    };
    quantity: number;
    name?: string;
    imageUrl?: string;
}

interface Order {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    products: OrderProduct[];
    total: number;
    paymentId: string;
    status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    shippingAddress?: {
        name: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    createdAt: string;
    updatedAt: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkAdminAndLoadOrders();
    }, []);

    async function checkAdminAndLoadOrders() {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login");
            return;
        }

        try {
            const res = await fetch(api("/users/me"), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                router.replace("/login");
                return;
            }

            const userData = await res.json();
            setIsAdmin(userData.role === "admin");

            if (userData.role !== "admin") {
                router.replace("/");
                return;
            }

            await loadOrders(token);
        } catch (err) {
            setError("Failed to verify admin access");
            setIsAdmin(false);
        }
    }

    async function loadOrders(token: string) {
        try {
            const res = await fetch(api("/orders"), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Failed to load orders");
            }

            const data = await res.json();
            setOrders(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || "Failed to load orders");
            setLoading(false);
        }
    }

    async function updateOrderStatus(orderId: string, newStatus: string) {
        const token = localStorage.getItem("token");
        if (!token) return;

        setUpdatingStatus(orderId);
        setError("");

        try {
            const res = await fetch(api(`/orders/${orderId}/status`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to update order status");
            }

            const updatedOrder = await res.json();
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === orderId ? { ...order, status: updatedOrder.status } : order
                )
            );
        } catch (err: any) {
            setError(err.message || "Failed to update order status");
        } finally {
            setUpdatingStatus(null);
        }
    }

    function toggleOrderExpansion(orderId: string) {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    }

    function getStatusColor(status: string) {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "paid":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (isAdmin === null || loading) {
        return (
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <Skeleton className="h-8 w-48 mb-6" />
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Order ID", "Customer", "Date", "Total", "Status", "Items", "Actions"].map((header) => (
                                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Not authorized. Admin access required.
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Manage Orders</h1>
                    <div className="text-sm text-gray-600">
                        Total Orders: <span className="font-semibold">{orders.length}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                            <div>No orders found</div>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <Fragment key={order._id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-mono text-gray-900">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{order.user?.name || "N/A"}</div>
                                                    <div className="text-sm text-gray-500">{order.user?.email || ""}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    ${order.total.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.paymentId === "COD" || !order.paymentId ? "COD" : "Paid"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        disabled={updatingStatus === order._id}
                                                        className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${getStatusColor(
                                                            order.status
                                                        )} border-0 cursor-pointer disabled:opacity-50`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="paid">Paid</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.products.length}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => toggleOrderExpansion(order._id)}
                                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        {expandedOrderId === order._id ? (
                                                            <>
                                                                <ChevronUp className="w-4 h-4" /> Hide
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-4 h-4" /> Details
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedOrderId === order._id && (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-4 bg-gray-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Shipping Address */}
                                                            <div className="bg-white p-4 rounded border">
                                                                <h3 className="font-semibold mb-3 text-gray-900">Shipping Address</h3>
                                                                {order.shippingAddress ? (
                                                                    <div className="text-sm text-gray-700 space-y-1">
                                                                        <div><strong>Name:</strong> {order.shippingAddress.name}</div>
                                                                        <div><strong>Phone:</strong> {order.shippingAddress.phone}</div>
                                                                        <div><strong>Address:</strong> {order.shippingAddress.address}</div>
                                                                        <div>
                                                                            <strong>City:</strong> {order.shippingAddress.city}
                                                                            {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                                                                        </div>
                                                                        <div>
                                                                            <strong>Postal Code:</strong> {order.shippingAddress.postalCode}
                                                                        </div>
                                                                        <div><strong>Country:</strong> {order.shippingAddress.country}</div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm text-gray-500">No shipping address provided</div>
                                                                )}
                                                            </div>

                                                            {/* Order Items */}
                                                            <div className="bg-white p-4 rounded border">
                                                                <h3 className="font-semibold mb-3 text-gray-900">Order Items</h3>
                                                                <div className="space-y-3">
                                                                    {order.products.map((item, idx) => (
                                                                        <div key={idx} className="flex items-center gap-3 pb-2 border-b last:border-b-0">
                                                                            {(item.product?.imageUrl || item.imageUrl) ? (
                                                                                <img
                                                                                    src={item.product?.imageUrl || item.imageUrl}
                                                                                    alt={item.product?.name || item.name || "Product"}
                                                                                    className="w-12 h-12 rounded object-cover"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                                                    <Package className="w-6 h-6 text-gray-400" />
                                                                                </div>
                                                                            )}
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-medium text-gray-900">
                                                                                    {item.product?.name || item.name || "Product"}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
