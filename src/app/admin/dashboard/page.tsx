"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../../components/AdminSidebar";
// Optional: import other widgets

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Assume token stored in localStorage and you decode/verify JWT, or fetch /api/users/me
    async function checkAdmin() {
      const token = localStorage.getItem("token");
      if (!token) return setIsAdmin(false);
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return setIsAdmin(false);
      const data = await res.json();
      setIsAdmin(data.role === 'admin');
      if (data.role !== 'admin') router.replace("/"); // Redirect if not admin
    }
    checkAdmin();
  }, [router]);

  if (isAdmin === null) return <div>Loading...</div>;
  if (!isAdmin) return <div>Not authorized</div>;

  // Example dashboard content:
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Dashboard widgets: product count, user count, order count, etc */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold">Products</h2>
            {/* Fetch and show products count */}
          </div>
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold">Orders</h2>
            {/* Fetch and show orders count */}
          </div>
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-bold">Users</h2>
            {/* Fetch and show users count */}
          </div>
        </div>
      </main>
    </div>
  );
}