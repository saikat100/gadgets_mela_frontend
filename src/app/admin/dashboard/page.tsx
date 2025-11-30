"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import AdminSidebar from "../AdminSidebar";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Plus,
  List,
  UserCog,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

interface RecentOrder {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const token = localStorage.getItem("token");
      if (!token) return setIsAdmin(false);

      try {
        const res = await fetch(api("/users/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return setIsAdmin(false);

        const data = await res.json();
        setIsAdmin(data.role === 'admin');

        if (data.role !== 'admin') {
          router.replace("/");
        } else {
          // Fetch dashboard data
          await fetchDashboardData(token);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [router]);

  async function fetchDashboardData(token: string) {
    try {
      // Fetch all data in parallel
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch(api("/orders/"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(api("/products/")),
        fetch(api("/users/"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Check if all responses are OK before parsing
      if (!ordersRes.ok || !productsRes.ok || !usersRes.ok) {
        console.error("API Error:", {
          orders: ordersRes.status,
          products: productsRes.status,
          users: usersRes.status
        });
        setLoading(false);
        return;
      }

      const orders = await ordersRes.json();
      const products = await productsRes.json();
      const users = await usersRes.json();

      // Calculate total revenue from delivered orders
      const totalRevenue = orders
        .filter((order: any) => order.status === 'delivered')
        .reduce((sum: number, order: any) => sum + order.total, 0);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
      });

      // Get 5 most recent orders
      const sortedOrders = orders
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentOrders(sortedOrders);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setLoading(false);
    }
  }

  if (isAdmin === null || loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h1>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const quickActions = [
    {
      title: "Add Product",
      href: "/admin/products",
      icon: Plus,
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      title: "View Orders",
      href: "/admin/orders",
      icon: List,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Manage Users",
      href: "/admin/users",
      icon: UserCog,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your store overview.</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">All Systems Operational</span>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`${action.color} text-white rounded-lg p-4 flex items-center gap-3 transition-colors`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="font-semibold">{action.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                          <div className="text-sm text-gray-500">{order.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'paid'
                                    ? 'bg-purple-100 text-purple-800'
                                    : order.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {recentOrders.length > 0 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Link
                  href="/admin/orders"
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                >
                  View All Orders →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}