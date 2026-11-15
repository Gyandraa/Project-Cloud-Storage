import { z } from "zod"

export const registerInputValidation = z.object({
    name: z
        .string({ message: "Nama wajib diisi" })
        .trim()
        .min(1, "Nama tidak boleh kosong")
        .max(100, "Nama maksimal 100 karakter"),
    email: z
        .string({ message: "Email wajib diisi" })
        .trim()
        .toLowerCase()
        .email("Format email tidak valid"),
    password: z
        .string({ message: "Password wajib diisi" })
        .min(8, "Password minimal 8 karakter")
        .max(128, "Password maksimal 128 karakter"),
});

export const loginInputValidation = z.object({
    email: z
        .string({ message: "Email wajib diisi" })
        .trim()
        .toLowerCase()
        .email("Format email tidak valid"),
    password: z
        .string({ message: "Password wajib diisi" })
        .min(1, "Password tidak boleh kosong"),
})
