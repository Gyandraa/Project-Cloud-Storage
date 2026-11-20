import { Router } from "express";
import { createSemesterValidation } from "../../middleware/inputValidation";
import { requireAuth, AuthRequest } from "../../middleware/requireAuth";
import { deletedSemester, getSemester, createSemester, updateSemester } from "./semester.service";
const router = Router()

router.post("/", requireAuth, async (req: AuthRequest, res) => {
    try {
        const validationResult = createSemesterValidation.safeParse(req.body)

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0]?.message || "Input tidak valid";
            return res.status(400).json({
                message: firstError,
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const newSemester = await createSemester({
            userId: req.user.id,
            name: validationResult.data.name,
        });

        return res.status(201).json({
            message: "Buat semester berhasil",
            data: newSemester
        })
    } catch (error: any) {
        if (error.message === "SEMESTER_ALREADY_EXIST" || error.message === "SEMESTER_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Semester sudah ada",
            });
        }
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
})

router.get("/", requireAuth, async (req: AuthRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const getAllSemester = await getSemester(req.user!.id)

        return res.status(200).json({
            message: "Berhasil mengambil semua semester",
            data: getAllSemester
        })
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
})

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const id = req.params.id;

        if (typeof id !== "string") {
            return res.status(400).json({
                message: "ID semester tidak valid"
            });
        }

        const deleteSemester = await deletedSemester(
            id,
            req.user.id
        )
        return res.status(200).json({
            message: "Berhasil menghapus semester",
            data: deleteSemester
        })
    } catch (error: any) {
        if (error.message === "SEMESTER_NOT_FOUND") {
            return res.status(404).json({ message: "Semester tidak ditemukan" });
        }
        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Semester tidak ditemukan atau sudah dihapus",
            });
        }
        console.error("Delete Semester Error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
})

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
        const validationResult = createSemesterValidation.safeParse(req.body)

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0]?.message || "Input tidak valid";
            return res.status(400).json({
                message: firstError,
                errors: validationResult.error.flatten().fieldErrors,
            });
        }

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const id = req.params.id;

        if (typeof id !== "string") {
            return res.status(400).json({
                message: "ID semester tidak valid"
            });
        }

        const update = await updateSemester({
            id,
            userId: req.user?.id,
            name: validationResult.data.name
        })

        return res.status(200).json({
            message: "Berhasil mengubah nama semester",
            data: update
        })

    } catch (error: any) {
        if (error.message === "SEMESTER_NOT_FOUND") {
            return res.status(404).json({ message: "Semester tidak ditemukan" });
        }
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
})

export default router