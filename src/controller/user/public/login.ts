import cookieManager from "@classes/cookieManager"
import userManager from "@classes/userManager"
import { errors } from "@classes/constants"
import { handleError } from "@classes/requestHandler"
import { Elysia, t } from "elysia"

export default (app: Elysia) => {
    // @ts-ignore
    app.post("/login", async ({ body, set, jwt, cookie: {auth} }) => {
        const response = await userManager.checkPassword(
            body.password,
            {username: body.username}
        )
        if (!response) return handleError(set, 422, errors.loginFailed)
        await cookieManager.setCookie(jwt, response, auth)
        return response
    }, {
        body: t.Object({
            username: t.String({
                minLength: 4,
                maxLength: 20,
                pattern: "^[A-Za-z0-9_]+$",
                error: errors.invalidRequest
            }),
            password: t.String({
                pattern: "^[A-Za-z0-9_]+$",
                error: errors.invalidRequest
            }),
        })
    })
}