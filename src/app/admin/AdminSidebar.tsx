import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
      <nav className="flex flex-col gap-4">
        <Link href="/admin/dashboard" className="hover:text-orange-400">Dashboard</Link>
        <Link href="/admin/products" className="hover:text-orange-400">Manage Products</Link>
        <Link href="/admin/orders" className="hover:text-orange-400">View Orders</Link>
        <Link href="/admin/users" className="hover:text-orange-400">Manage Users</Link>
      </nav>
    </aside>
  );
}