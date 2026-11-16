import { useState } from "react";
import { api } from "@/app/lib/api";
import { RegisterUserType } from "../types/types";

export function useRegister() {
    const [loading, setLoading] = useState(false)
    const [isError, setIsError] = useState<string | null>(null)
    const [isSucces, setIsSucces] = useState(false)

    const register = async (data: RegisterUserType) => {
        setLoading(true)
        setIsError(null)
        setIsSucces(false)

        try {
            const response = await api.post("/api/auth/register", data)
            setIsSucces(true)
            return response.data
        } catch (err: any) {
            const message =
                err.response?.data?.message || "Terjadi kesalahan saat pendaftaran.";
            setIsError(message);
            throw err;
        } finally {
            setLoading(false)
        }
    }

    return {
        register,
        loading,
        isError,
    }
}