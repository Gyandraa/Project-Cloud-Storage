import { Router } from "express";
import { createSemesterValidation } from "../../middleware/inputValidation";
import { requireAuth, AuthRequest } from "../../middleware/requireAuth";
import { createSemester } from "./semester.service";
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

export default router