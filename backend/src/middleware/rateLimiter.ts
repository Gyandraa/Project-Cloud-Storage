import { rateLimit } from "express-rate-limit"

export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Terlalu banyak percobaan pendaftaran akun. Silakan coba lagi nanti.",
    },
})

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Terlalu banyak percobaan login. Silakan coba lagi nanti.",
    },
});