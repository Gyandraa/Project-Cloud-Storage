import { Router } from "express";
import { registerInputValidation } from "../../middleware/inputValidation";
import { logoutSession, registerUser } from "./auth.service";
import { loginLimiter, registerLimiter } from "../../middleware/rateLimiter";
import { loginInputValidation } from "../../middleware/inputValidation";
import { loginUser } from "./auth.service";
import { requireAuth, AuthRequest } from "../../middleware/requireAuth";
import { getCurrentUser } from "./auth.service";

const router = Router();

router.post("/register", registerLimiter, async (req, res) => {
    try {
        const validationResult = registerInputValidation.safeParse(req.body);

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0]?.message || "Input tidak valid";
            return res.status(400).json({
                message: firstError,
                errors: validationResult.error.flatten().fieldErrors,
            });
        }

        const newUser = await registerUser(validationResult.data)

        return res.status(201).json({
            message: "Register berhasil",
            data: newUser
        })
    } catch (error: any) {
        if (error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                message: "Email sudah terdaftar",
            });
        }

        console.error("Register Error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
});

router.post("/login", loginLimiter, async (req, res) => {
    try {
        const validationResult = loginInputValidation.safeParse(req.body)

        if (!validationResult.success) {
            const firstError = validationResult.error.issues[0]?.message || "Input tidak valid";
            return res.status(400).json({
                message: firstError,
                errors: validationResult.error.flatten().fieldErrors,
            });
        }

        const { user, rawToken } = await loginUser(validationResult.data)

        res.cookie("session_token", rawToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(200).json({
            message: "Login Success",
            data: user
        })

    } catch (error: any) {
        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                message: "Email atau kata sandi salah",
            });
        }
        if (error.message === "ACCOUNT_NOT_ACTIVE") {
            return res.status(403).json({
                message: "Akun Anda belum aktif atau ditangguhkan",
            });
        }
        console.error("Login Error:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan internal server",
        });
    }
})

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
    try {
        const user = await getCurrentUser(req.user!.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({
            message: "Success",
            data: user,
        });
    } catch (error) {
        console.error("Get Me Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal server" });
    }
})

router.post("/logout", requireAuth, async (req: AuthRequest, res) => {
    try {
        if (req.sessionId) {
            await logoutSession(req.sessionId)
        }
        res.clearCookie("session_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });
        return res.status(200).json({
            message: "Logout berhasil",
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan internal server" });
    }
}
)


export default router;
