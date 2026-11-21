import { prisma } from "../../lib/prisma"

export async function findByName(userId: string, name: string, semesterId: string) {
    return prisma.course.findFirst({
        where: {
            userId,
            semesterId,
            name,
            deletedAt: null
        }
    })
}

export async function createCourses(data: { userId: string, semesterId: string, name: string }) {
    const semester = await prisma.semester.findFirst({
        where: {
            id: data.semesterId,
            userId: data.userId,
            deletedAt: null,
        },
    });

    if (!semester) {
        throw new Error("SEMESTER_NOT_FOUND");
    }

    const existingCourses = await findByName(data.userId, data.name, data.semesterId)

    if (existingCourses) {
        throw new Error("COURSES_ALREADY_EXIST")
    }
    try {
        const createdCourses = await prisma.course.create({
            data: {
                userId: data.userId,
                semesterId: data.semesterId,
                name: data.name
            }, select: {
                id: true,
                semesterId: true,
                name: true,
                createdAt: true
            }
        })
        return createdCourses
    } catch (error) {
        throw error
    }
}

export async function getCourses(userId: string, semesterId: string) {
    try {
        const getCoursess = await prisma.course.findMany({
            where: {
                userId,
                semesterId,
                deletedAt: null
            }, select: {
                id: true,
                semesterId: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        files: {
                            where: { deletedAt: null }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        })
        return getCoursess

    } catch (error) {
        throw error

    }
}

export async function deletedCourses(data: { id: string, userId: string }) {
    try {
        const courses = await prisma.course.findFirst({
            where: { id: data.id, userId: data.userId, deletedAt: null }
        })
        if (!courses) {
            throw new Error("COURSES_NOT_FOUND")
        }

        const deletedCouses = await prisma.course.update({
            where: {
                id_userId: { id: data.id, userId: data.userId }
            }, data: {
                deletedAt: new Date()
            }
        })

        return deletedCouses

    } catch (error) {
        throw error
    }
}