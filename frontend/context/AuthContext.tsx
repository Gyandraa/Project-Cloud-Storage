"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { UserType } from "../features/auth/types/types";

interface AuthContextType {
    user: UserType | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const response = await api.get("/api/auth/me");
            setUser(response.data.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

