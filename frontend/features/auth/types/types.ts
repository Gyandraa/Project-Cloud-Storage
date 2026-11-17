export type UserType = {
    id: string
    name: string
    email: string
    accountStatus: string
    baseQuotaBytes?: string | number
    usedBytes?: string | number
    reservedBytes?: string | number
    createdAt?: string
}

export type RegisterUserType = {
    name: string
    email: string
    password: string
}

export type LoginUserType = {
    email: string
    password: string
}
