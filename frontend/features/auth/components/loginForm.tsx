"use client"

import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export function LoginForm() {
    const router = useRouter()
    const { login, loading, isError } = useLogin()
    const { refreshUser } = useAuth()
    const [form, setForm] = useState({
        email: "",
        password: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await login(form)
            await refreshUser()
            toast.success("Login Berhasil...")
            router.push("/dashboard")
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Login gagal")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {isError && <p className="text-red-500 text-sm">{isError}</p>}
            <input type="email" placeholder="Masukan Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Masukan Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <button type="submit" disabled={loading} >{loading ? "Masuk..." : "Login"}</button>
        </form>
    )
}