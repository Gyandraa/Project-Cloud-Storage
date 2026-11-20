import { prisma } from "../../lib/prisma";


export async function findByName(userId: string, name: string) {
    return prisma.semester.findFirst({
        where: {
            userId,
            name,
            deletedAt: null
        }
    })
}
export async function createSemester(data: { userId: string, name: string }) {
    const existingSemester = await findByName(data.userId, data.name);
    if (existingSemester) {
        throw new Error("SEMESTER_ALREADY_EXIST")
    }
    try {
        const newSemester = await prisma.semester.create({
            data: {
                userId: data.userId,
                name: data.name
            },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        })
        return newSemester
    } catch (error: any) {
        throw error
    }
}