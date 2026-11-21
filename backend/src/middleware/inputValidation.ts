import { z } from "zod";

export const nameSchema = z
    .string({ message: "Nama wajib diisi" })
    .trim()
    .min(1, "Nama tidak boleh kosong")
    .max(100, "Nama maksimal 100 karakter");

export const emailSchema = z
    .string({ message: "Email wajib diisi" })
    .trim()
    .toLowerCase()
    .email("Format email tidak valid");

export const idSchema = z
    .string({ message: "ID wajib diisi" })
    .uuid("Format ID tidak valid");

export const registerInputValidation = z.object({
    name: nameSchema,
    email: emailSchema,
    password: z
        .string({ message: "Password wajib diisi" })
        .min(8, "Password minimal 8 karakter")
        .max(128, "Password maksimal 128 karakter"),
});

export const loginInputValidation = z.object({
    email: emailSchema,
    password: z
        .string({ message: "Password wajib diisi" })
        .min(1, "Password tidak boleh kosong"),
});

export const inputSemesterValidation = z.object({
    name: nameSchema,
});

export const renameValidation = inputSemesterValidation;

export const createCourseValidation = z.object({
    name: nameSchema,
    semesterId: idSchema,
});

