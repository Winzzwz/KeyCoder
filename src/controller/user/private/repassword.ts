import cookieManager from "@classes/cookieManager"
import userManager from "@classes/userManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/re-password", async ({ body, set, identity, cookie: {auth} }) => {
        if (body.oldPassword == body.newPassword) return errors.invalidRequest
        const response = await userManager.resetPassword(identity.id, body.oldPassword, body.newPassword)
        if (!response) return handleError(set, 400, errors.repasswordFailed)
        await cookieManager.resetCookie(auth)
        return response
    }, {
        body: t.Object({
            oldPassword: t.String({
                pattern: "^[A-Za-z0-9_]+$",
                error: errors.invalidRequest
            }),
            newPassword: t.String({
                pattern: "^[A-Za-z0-9_]+$",
                error: errors.invalidRequest
            }),
        })
    })
}