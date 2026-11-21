import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        name: string;
        email: string;
        accountStatus: string;
    };
    sessionId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const sessionToken = req.cookies?.session_token;

        if (!sessionToken) {
            return res.status(401).json({ message: "Unauthorized: Silakan login terlebih dahulu." });
        }

        const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");

        const session = await prisma.session.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        accountStatus: true,
                    },
                },
            },
        });

        if (!session || session.expiresAt < new Date()) {
            res.clearCookie("session_token");
            return res.status(401).json({ message: "Sesi telah berakhir, silakan login kembali." });
        }

        if (session.user.accountStatus !== "ACTIVE") {
            return res.status(403).json({ message: "Akun Anda tidak aktif." });
        }

        req.user = session.user;
        req.sessionId = session.id;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan autentikasi." });
    }
};
