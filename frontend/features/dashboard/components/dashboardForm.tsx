"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardForm() {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return <p>Memuat data user...</p>;
    }

    return (
        <div className="p-4 border rounded">
            <h1>Dashboard section</h1>
            <p>Halo, <strong>{user?.name || "Pengguna"}</strong></p>
            <p className="text-sm text-gray-500">Status Akun: {user?.accountStatus}</p>

            <button
                onClick={logout}
                className="mt-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Keluar (Logout)
            </button>
        </div>
    );
}