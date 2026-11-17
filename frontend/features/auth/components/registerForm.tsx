"use client"

import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export function RegisterForm() {
    const router = useRouter()
    const { register, loading, isError } = useRegister()

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    })
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await register(form)
            toast.success("Registrasi Berhasil...")
            setTimeout(() => {
                router.push("/login")
            }, 1500)
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registrasi gagal!")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {isError && <p className="text-red-500 text-sm">{isError}</p>}

            <input type="text" placeholder="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="email" placeholder="Masukan Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Masukan Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <button type="submit" disabled={loading}>{loading ? "Mendaftar..." : "Daftar"}</button>
            <a href="/login">Sudah memiliki akun? Login sekarang!</a>
        </form>
    )
}