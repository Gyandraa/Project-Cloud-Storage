import { createCourseValidation } from "../../middleware/inputValidation";
import { Router } from "express";
import { AuthRequest, requireAuth } from "../../middleware/requireAuth";
import { createCourses, getCourses, deletedCourses } from "./courses.service";
const router = Router()

router.post("/", requireAuth, async (req: AuthRequest, res) => {
    try {
        const validationResult = createCourseValidation.safeParse(req.body)

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

        const newCourses = await createCourses({
            userId: req.user.id,
            semesterId: validationResult.data.semesterId,
            name: validationResult.data.name
        })

        return res.status(201).json({
            message: "Buat courses berhasil",
            data: newCourses
        })
    } catch (error: any) {
        if (error.message === "SEMESTER_NOT_FOUND") {
            return res.status(404).json({
                message: "Semester tidak ditemukan atau sudah dihapus",
            });
        }
        if (error.message === "COURSES_ALREADY_EXIST" || error.message === "COURSES_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Courses sudah ada",
            });
        }
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
})

router.get("/:semesterId", requireAuth, async (req: AuthRequest, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        const { semesterId } = req.params;
        if (!semesterId || typeof semesterId !== "string") {
            return res.status(400).json({
                message: "ID semester tidak valid",
            });
        }

        const getAllCourses = await getCourses(
            req.user.id,
            semesterId
        )

        return res.status(200).json({
            message: "Berhasil mengambil semua courses",
            data: getAllCourses

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

        if (!id || typeof id !== "string") {
            return res.status(400).json({
                message: "ID courses tidak valid"
            });
        }

        const deleteCourses = await deletedCourses({
            id,
            userId: req.user.id,
        })

        return res.status(200).json({
            message: "Berhasil menghapus courses",
            data: deleteCourses

        })
    } catch (error: any) {
        if (error.message === "COURSES_NOT_FOUND") {
            return res.status(404).json({
                message: "Courses tidak ditemukan atau sudah dihapus",
            });
        }
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
})

export default router