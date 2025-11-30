"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../AdminSidebar";
import { api } from "../../../lib/api";
import { Skeleton } from "../../../components/Skeleton";
import { User, Shield, ShieldCheck } from "lucide-react";

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkAdminAndLoadUsers();
    }, []);

    async function checkAdminAndLoadUsers() {
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

            await loadUsers(token);
        } catch (err) {
            setError("Failed to verify admin access");
            setIsAdmin(false);
        }
    }

    async function loadUsers(token: string) {
        try {
            const res = await fetch(api("/users"), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Failed to load users");
            }

            const data = await res.json();
            setUsers(data);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || "Failed to load users");
            setLoading(false);
        }
    }

    async function promoteToAdmin(userId: string) {
        if (!confirm("Are you sure you want to promote this user to admin?")) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        setUpdatingId(userId);
        setError("");

        try {
            const res = await fetch(api("/users/promote"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to promote user");
            }

            const data = await res.json();
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role: "admin" } : u))
            );
        } catch (err: any) {
            setError(err.message || "Failed to promote user");
        } finally {
            setUpdatingId(null);
        }
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
                                        {["Name", "Email", "Role", "Actions"].map((header) => (
                                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
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
                    <h1 className="text-3xl font-bold">Manage Users</h1>
                    <div className="text-sm text-gray-600">
                        Total Users: <span className="font-semibold">{users.length}</span>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                            <div>No users found</div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {user.role !== "admin" ? (
                                                    <button
                                                        onClick={() => promoteToAdmin(user._id)}
                                                        disabled={updatingId === user._id}
                                                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                        {updatingId === user._id ? "Promoting..." : "Promote to Admin"}
                                                    </button>
                                                ) : (
                                                    <div className="text-gray-400 flex items-center gap-1">
                                                        <ShieldCheck className="w-4 h-4" />
                                                        Admin
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
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
