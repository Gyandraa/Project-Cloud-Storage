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

export async function getSemester(userId: string) {
    try {
        const getSemester = await prisma.semester.findMany({
            where: {
                userId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        courses: {
                            where: { deletedAt: null },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return getSemester
    } catch (error) {
        throw error
    }
}

export async function deletedSemester(id: string, userId: string) {
    try {
        const semester = await prisma.semester.findFirst({
            where: { id, userId, deletedAt: null }
        })

        if (!semester) {
            throw new Error("SEMESTER_NOT_FOUND")
        }

        const deletedSemester = await prisma.semester.update({
            where: {
                id_userId: { id, userId }
            },
            data: {
                deletedAt: new Date()
            }
        })
        return deletedSemester
    } catch (error) {
        throw error
    }
}

export async function updateSemester(data: { id: string, userId: string, name: string }) {
    try {

        const checkSemester = await prisma.semester.findFirst({
            where: { id: data.id, userId: data.userId, deletedAt: null }
        })

        if (!checkSemester) {
            throw new Error("SEMESTER_NOT_FOUND")
        }

        const existingWithName = await findByName(data.userId, data.name);

        if (existingWithName && existingWithName.id !== data.id) {
            throw new Error("SEMESTER_ALREADY_EXIST");
        }

        const updatedSemester = await prisma.semester.update({
            where: {
                id_userId: {
                    id: data.id,
                    userId: data.userId,
                },
            },
            data: { name: data.name },
        });

        return updatedSemester

    } catch (error) {
        throw error
    }
}