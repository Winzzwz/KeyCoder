import userManager from "@classes/userManager"
import cookieManager from "@classes/cookieManager"
import { handleError } from "@classes/requestHandler"
import { errors } from "@classes/constants"
import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"
import fs from "fs"
import path from "path"

const coursesController = new Elysia({
    prefix: "/courses"
})

coursesController.use(
    jwt({
        name: 'jwt',
        secret: Bun.env.SECRET!
    })
).derive(async ({ jwt, cookie: { auth } }) => {
    const identity = await jwt.verify(auth.value);
    return {identity}
}).guard({
    beforeHandle: async ({ identity, set, cookie: {auth} }) => {
        if (!identity) {
            return handleError(set, 401, errors.unauthorized)
        }
        // @ts-ignore
        const check = await userManager.checkPassword(identity.password, {id: identity.id}, true)
        if (!check) {
            await cookieManager.resetCookie(auth)
            return handleError(set, 401, errors.unauthorized)
        }
    }
}, (app) => {
    const privateDir = path.join(__dirname,"./courses/private")
    const privateApps = fs.readdirSync(privateDir)
    for (let appFile of privateApps) {
        const route = require(path.join(privateDir,appFile)).default
        route(app)
    }
    return app
}).group('', (app) => {
    const publicDir = path.join(__dirname,"./courses/public")
    const publicApps = fs.readdirSync(publicDir)
    for (let appFile of publicApps) {
        const route = require(path.join(publicDir,appFile)).default
        route(app)
    }
    return app
})

export default coursesController