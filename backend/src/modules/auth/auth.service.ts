import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
import crypto from 'crypto';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
    });
}

export async function registerUser(data: { name: string; email: string; password: string }) {
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const hashedPassword = await hashPassword(data.password);

    try {
        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: hashedPassword,
                accountStatus: "ACTIVE"
            },
            select: {
                id: true,
                name: true,
                email: true,
                accountStatus: true,
                createdAt: true,
            },
        });

        return newUser;
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }
        throw error;
    }
}

export async function loginUser(data: { email: string, password: string }) {

    const user = await findUserByEmail(data.email)
    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    if (user.accountStatus !== "ACTIVE") {
        throw new Error("ACCOUNT_INACTIVE");
    }

    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            accountStatus: user.accountStatus,
        },
        rawToken,
    };
}

export async function getCurrentUser(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            accountStatus: true,
            baseQuotaBytes: true,
            usedBytes: true,
            reservedBytes: true,
            createdAt: true,
        }

    })
}

export async function logoutSession(sessionId: string) {
    try {
        await prisma.session.delete({
            where: { id: sessionId }
        })
    } catch {
    }
}
