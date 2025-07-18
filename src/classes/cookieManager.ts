import { errors, defaultSettings } from "@classes/constants"
import { User } from "@prisma"
import { jwt } from "@elysiajs/jwt"
import { CookieOptions } from "elysia"

export const cookieSettings: Omit<CookieOptions, "value"> = {
  httpOnly: true,
  maxAge: 30 * 86400,
  path: "/",
  sameSite: "none",
  secure: true,
  // domain: "keycoder.college"
}

const cookieManager = {
    async setCookie(jwt: any, user: User, auth: any) {
        const token = await jwt.sign({
            "id": user.id,
            "username": user.username,
            "password": user.password
        })
        auth.set({
            value: token,
            ...cookieSettings
        })
    },

    async resetCookie(auth: any) {
        auth.remove({
            value: "",
            ...cookieSettings
        })
    }
}

export default cookieManager