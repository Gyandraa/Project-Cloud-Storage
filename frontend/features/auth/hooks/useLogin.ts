import { useState } from "react";
import { api } from "@/app/lib/api";
import { LoginUserType } from "../types/types";

export function useLogin() {
    const [loading, setLoading] = useState(false)
    const [isError, setIsError] = useState<string | null>(null)
    const [isSucces, setIsSucces] = useState(false)

    const login = async (data: LoginUserType) => {
        setLoading(true)
        setIsError(null)
        setIsSucces(false)

        try {
            const response = await api.post("/api/auth/login", data)
            setIsSucces(true)
            return response.data
        } catch (err: any) {
            const message =
                err.response?.data?.message || "Terjadi kesalahan saat login.";
            setIsError(message);
            throw err;
        } finally {
            setLoading(false)
        }
    }

    return {
        login,
        loading,
        isError
    }
}