import { errors, defaultSettings, defaultCourses } from "@classes/constants"
import { Prisma, PrismaClient, User } from "@prisma"
import bcrypt from "bcrypt"
const prisma = new PrismaClient()

const userManager = {
    async findUser( query: Prisma.UserWhereUniqueInput, omits: Prisma.UserOmit = {} ): Promise<User | null> {
        const user = await prisma.user.findUnique({ 
            where: query,
            include: { settings: true, courseProgress: true },
            omit: omits
        })
        return user
    },

    async updateUser( query: Prisma.UserWhereUniqueInput, data: Object, omits: Prisma.UserOmit = {} ): Promise<User | null> {
        const user = await prisma.user.update({ 
            where: query,
            include: { settings: true, courseProgress: true },
            omit: omits,
            data: data
        })
        return user
    },

    async createUser( email: string, username: string, password: string ): Promise<User | false> {
        if (await this.findUser({ username: username })) return false
        if (await this.findUser({ email: email })) return false
        password = await bcrypt.hash(password,10)

        const newUser = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: password,
                settings: {
                    create: defaultSettings
                },
                courseProgress: {
                    create: defaultCourses
                }
            },
            include: { settings: true, courseProgress: true }
        })
        return newUser
    },

    async checkPassword( password: string, query: Prisma.UserWhereUniqueInput, sameCheck: boolean = false ): Promise<User | false> {
        const user = await this.findUser(query)
        if (!user) return false
        if (sameCheck && password == user.password) return user
        if (!sameCheck && await bcrypt.compare(password, user.password)) return user
        return false
    },

    async resetPassword( userId: string, oldPassword: string, newPassword: string ): Promise<User | false> {
        const user = await this.findUser({id: userId})
        if (!user) return false
        const ok = await bcrypt.compare(oldPassword, user.password)
        if (!ok) return false
        newPassword = await bcrypt.hash(newPassword,10)
        const newUser = await this.updateUser({ id: userId }, {
            password: newPassword
        })
        if (!newUser) return false
        return newUser
    },

    async setSkillLevel( userId: string, level: number ): Promise<User | false> {
        const user = await this.findUser({id: userId})
        if (!user) return false
        if (user.skillLevel != 0) return false
        const newUser = await this.updateUser({ id: userId }, {
            skillLevel: level
        })
        if (!newUser) return false
        return newUser
    },

    async setCourseProgress( userId: string, course: string, progress: number ): Promise<User | false> {
        if (course == "userId" || course == "user") return false
        const user = await this.findUser({id: userId})
        if (!user) return false
        // @ts-ignore
        if (!(course in user.courseProgress)) return false
        if (user.skillLevel == 0) return false
        const newUser = await this.updateUser({ id: userId }, {
            courseProgress: {
                update: {
                    [course]: progress
                }
            }
        })
        if (!newUser) return false
        return newUser
    },

    async changeTheme( userId: string, theme: number ): Promise<User | false> {
        const newUser = await this.updateUser( { id: userId }, {
            settings: {
                update: { theme: theme }
            }
        })
        if (!newUser) return false
        return newUser
    },

    async getTopUsers( ): Promise<Array<Object>> {
        const topUsers = await prisma.user.findMany({
            orderBy: [
                { elo: 'desc' },
                { win: 'desc' },
                { loss: 'asc'  }
            ],
            take: 10,
            select: {
                id: true,
                username: true,
                elo: true,
                win: true,
                loss: true
            }
        })
        return topUsers
    },

    async getUserRank( query: Prisma.UserWhereUniqueInput ): Promise<number | false> {
        const user = await prisma.user.findUnique({
            where: query,
            select: {
                elo: true,
                win: true,
                loss: true
            }
        })
        if (!user) return false
        const userCount = await prisma.user.count({
            where: {
                OR: [
                    { elo: { gt: user.elo } },
                    { elo: user.elo, win: { gt: user.win } },
                    { elo: user.elo, win: user.win, loss: { lt: user.loss } }
                ]
            }
        })
        return userCount + 1
    },

    async getUserElo( query: Prisma.UserWhereUniqueInput ): Promise<number | false> {
        const user = await this.findUser(query)
        if (!user) return false
        return user.elo
    }
}

export default userManager